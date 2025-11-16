import express from "express";
import cors from "cors";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { FileLockManager } from "./FileLockManager.js";
import { SSEClientManager } from "./SSEClientManager.js";
import { CommentRepository } from "./CommentRepository.js";
import { RateLimiter } from "./RateLimiter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize managers
const lockManager = new FileLockManager();
const sseManager = new SSEClientManager();
const DATA_DIR = join(__dirname, "data");
const COMMENTS_FILE = join(DATA_DIR, "comments.json");
const commentRepository = new CommentRepository(COMMENTS_FILE, lockManager);

// Rate limiting configuration
const generalLimiter = new RateLimiter(60000, 60, 'Too many requests, please try again later');
const strictLimiter = new RateLimiter(60000, 20, 'Too many write requests, please slow down');

// Apply general rate limiting to all routes
app.use('/api', generalLimiter.middleware());

/**
 * Sanitize user input to prevent XSS attacks
 * Escapes HTML special characters
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize comment payload
 */
function validateCommentPayload(payload) {
  const errors = [];

  if (!payload.text || typeof payload.text !== 'string') {
    errors.push('text is required and must be a string');
  }

  if (payload.x === undefined || typeof payload.x !== 'number') {
    errors.push('x is required and must be a number');
  }

  if (payload.y === undefined || typeof payload.y !== 'number') {
    errors.push('y is required and must be a number');
  }

  if (!payload.pageUrl || typeof payload.pageUrl !== 'string') {
    errors.push('pageUrl is required and must be a string');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Sanitize string inputs
  return {
    valid: true,
    sanitized: {
      ...payload,
      text: sanitizeInput(payload.text.trim()),
      author: payload.author ? sanitizeInput(payload.author.trim()) : 'Anonymous',
      pageUrl: payload.pageUrl.trim(),
    }
  };
}


// Routes

// Get all comments for a specific page
app.get("/api/comments", async (req, res) => {
  try {
    const { pageUrl } = req.query;
    const comments = await commentRepository.findByPageUrl(pageUrl);

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch comments",
    });
  }
});

// Create a new comment (with strict rate limiting)
app.post("/api/comments", strictLimiter.middleware(), async (req, res) => {
  try {
    const validation = validateCommentPayload(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`,
      });
    }

    const { text, author, pageUrl, x, y, elementSelector, elementOffset } = validation.sanitized;

    const newComment = {
      id: randomUUID(),
      x,
      y,
      text,
      author,
      timestamp: Date.now(),
      pageUrl,
      ...(elementSelector && { elementSelector: sanitizeInput(elementSelector) }),
      ...(elementOffset && { elementOffset }),
    };

    await commentRepository.create(newComment);

    // Broadcast to SSE clients
    sseManager.broadcast(pageUrl, "comment-added", newComment);

    res.json({
      success: true,
      data: newComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create comment",
    });
  }
});

// Update a comment (with strict rate limiting)
app.put("/api/comments/:id", strictLimiter.middleware(), async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Missing required field: text (must be a string)",
      });
    }

    const updatedComment = await commentRepository.update(id, {
      text: sanitizeInput(text.trim()),
      updatedAt: Date.now(),
    });

    if (!updatedComment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    // Broadcast to SSE clients
    sseManager.broadcast(updatedComment.pageUrl, "comment-updated", updatedComment);

    res.json({
      success: true,
      data: updatedComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update comment",
    });
  }
});

// Delete a comment (with strict rate limiting)
app.delete("/api/comments/:id", strictLimiter.middleware(), async (req, res) => {
  try {
    const { id } = req.params;
    const deletedComment = await commentRepository.delete(id);

    if (!deletedComment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    // Broadcast to SSE clients
    sseManager.broadcast(deletedComment.pageUrl, "comment-deleted", { id });

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete comment",
    });
  }
});

// SSE endpoint for live updates
app.get("/api/comments/stream", (req, res) => {
  const { pageUrl } = req.query;

  if (!pageUrl) {
    return res.status(400).json({
      success: false,
      error: "pageUrl query parameter is required",
    });
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Register client with SSE manager
  sseManager.register(pageUrl, res, req);
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
async function start() {
  await commentRepository.initialize();

  const server = app.listen(PORT, () => {
    console.log(`Komment server running on http://localhost:${PORT}`);
    console.log(`SSE endpoint: http://localhost:${PORT}/api/comments/stream`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server gracefully...');
    sseManager.closeAll();
    generalLimiter.destroy();
    strictLimiter.destroy();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

start().catch(console.error);
