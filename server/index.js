import express from "express";
import cors from "cors";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createReadStream } from "fs";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data storage
const DATA_DIR = join(__dirname, "data");
const COMMENTS_FILE = join(DATA_DIR, "comments.json");

// SSE clients storage
const sseClients = new Map();

// Ensure data directory exists
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  if (!existsSync(COMMENTS_FILE)) {
    await writeFile(COMMENTS_FILE, JSON.stringify([]), "utf-8");
  }
}

// File locking mechanism (simple in-memory lock)
let fileLock = false;
const lockQueue = [];

async function acquireLock() {
  return new Promise((resolve) => {
    if (!fileLock) {
      fileLock = true;
      resolve();
    } else {
      lockQueue.push(resolve);
    }
  });
}

function releaseLock() {
  if (lockQueue.length > 0) {
    const next = lockQueue.shift();
    next();
  } else {
    fileLock = false;
  }
}

// Read comments from file
async function readComments() {
  try {
    const data = await readFile(COMMENTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading comments:", error);
    return [];
  }
}

// Write comments to file (with locking)
async function writeComments(comments) {
  await acquireLock();
  try {
    await writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2), "utf-8");
  } finally {
    releaseLock();
  }
}

// Send SSE update to all clients for a specific page
function broadcastUpdate(pageUrl, event, data) {
  const clients = sseClients.get(pageUrl) || [];
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

  clients.forEach((client) => {
    try {
      client.write(message);
    } catch (error) {
      console.error("Error sending SSE update:", error);
    }
  });
}

// Routes

// Get all comments for a specific page
app.get("/api/comments", async (req, res) => {
  try {
    const { pageUrl } = req.query;
    const allComments = await readComments();

    let filteredComments = allComments;
    if (pageUrl) {
      filteredComments = allComments.filter((c) => c.pageUrl === pageUrl);
    }

    res.json({
      success: true,
      data: filteredComments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch comments",
    });
  }
});

// Create a new comment
app.post("/api/comments", async (req, res) => {
  try {
    const { x, y, text, author, pageUrl } = req.body;

    if (!text || x === undefined || y === undefined || !pageUrl) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: x, y, text, pageUrl",
      });
    }

    const newComment = {
      id: randomUUID(),
      x,
      y,
      text,
      author: author || "Anonymous",
      timestamp: Date.now(),
      pageUrl,
    };

    const comments = await readComments();
    comments.push(newComment);
    await writeComments(comments);

    // Broadcast to SSE clients
    broadcastUpdate(pageUrl, "comment-added", newComment);

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

// Update a comment
app.put("/api/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: text",
      });
    }

    const comments = await readComments();
    const commentIndex = comments.findIndex((c) => c.id === id);

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    comments[commentIndex].text = text;
    comments[commentIndex].updatedAt = Date.now();
    await writeComments(comments);

    const updatedComment = comments[commentIndex];

    // Broadcast to SSE clients
    broadcastUpdate(updatedComment.pageUrl, "comment-updated", updatedComment);

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

// Delete a comment
app.delete("/api/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await readComments();
    const commentIndex = comments.findIndex((c) => c.id === id);

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    const deletedComment = comments[commentIndex];
    comments.splice(commentIndex, 1);
    await writeComments(comments);

    // Broadcast to SSE clients
    broadcastUpdate(deletedComment.pageUrl, "comment-deleted", { id });

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

  // Add client to the list for this page
  if (!sseClients.has(pageUrl)) {
    sseClients.set(pageUrl, []);
  }
  sseClients.get(pageUrl).push(res);

  // Send initial connection message
  res.write(
    `event: connected\ndata: ${JSON.stringify({ message: "Connected" })}\n\n`
  );

  // Handle client disconnect
  req.on("close", () => {
    const clients = sseClients.get(pageUrl);
    if (clients) {
      const index = clients.indexOf(res);
      if (index !== -1) {
        clients.splice(index, 1);
      }
      // Clean up empty page client lists
      if (clients.length === 0) {
        sseClients.delete(pageUrl);
      }
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
async function start() {
  await ensureDataDir();
  app.listen(PORT, () => {
    console.log(`Komment server running on http://localhost:${PORT}`);
    console.log(`SSE endpoint: http://localhost:${PORT}/api/comments/stream`);
  });
}

start().catch(console.error);
