import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

/**
 * CommentRepository - Handles all comment data persistence
 * Provides CRUD operations with file locking support
 */
export class CommentRepository {
  /**
   * @param {string} filePath - Path to the comments JSON file
   * @param {FileLockManager} lockManager - File lock manager instance
   */
  constructor(filePath, lockManager) {
    this.filePath = filePath;
    this.lockManager = lockManager;
  }

  /**
   * Ensure the data directory and file exist
   */
  async initialize() {
    const dir = this.filePath.substring(0, this.filePath.lastIndexOf('/'));

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    if (!existsSync(this.filePath)) {
      await writeFile(this.filePath, JSON.stringify([]), "utf-8");
    }
  }

  /**
   * Read all comments from file
   * @returns {Promise<Array>} Array of comments
   */
  async readAll() {
    try {
      const data = await readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading comments:", error);
      return [];
    }
  }

  /**
   * Write comments to file with locking
   * @param {Array} comments - Array of comments to write
   * @returns {Promise<void>}
   */
  async writeAll(comments) {
    return this.lockManager.withLock(async () => {
      await writeFile(this.filePath, JSON.stringify(comments, null, 2), "utf-8");
    });
  }

  /**
   * Find comments by page URL
   * @param {string} pageUrl - The page URL to filter by
   * @returns {Promise<Array>} Filtered comments
   */
  async findByPageUrl(pageUrl) {
    const allComments = await this.readAll();
    return pageUrl ? allComments.filter((c) => c.pageUrl === pageUrl) : allComments;
  }

  /**
   * Find a single comment by ID
   * @param {string} id - Comment ID
   * @returns {Promise<Object|null>} Comment object or null if not found
   */
  async findById(id) {
    const comments = await this.readAll();
    return comments.find((c) => c.id === id) || null;
  }

  /**
   * Create a new comment
   * @param {Object} comment - Comment object to create
   * @returns {Promise<Object>} Created comment
   */
  async create(comment) {
    const comments = await this.readAll();
    comments.push(comment);
    await this.writeAll(comments);
    return comment;
  }

  /**
   * Update an existing comment
   * @param {string} id - Comment ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated comment or null if not found
   */
  async update(id, updates) {
    const comments = await this.readAll();
    const index = comments.findIndex((c) => c.id === id);

    if (index === -1) {
      return null;
    }

    comments[index] = { ...comments[index], ...updates };
    await this.writeAll(comments);
    return comments[index];
  }

  /**
   * Delete a comment
   * @param {string} id - Comment ID
   * @returns {Promise<Object|null>} Deleted comment or null if not found
   */
  async delete(id) {
    const comments = await this.readAll();
    const index = comments.findIndex((c) => c.id === id);

    if (index === -1) {
      return null;
    }

    const [deletedComment] = comments.splice(index, 1);
    await this.writeAll(comments);
    return deletedComment;
  }

  /**
   * Get statistics about comments
   * @returns {Promise<Object>} Statistics object
   */
  async getStats() {
    const comments = await this.readAll();
    const pageUrls = new Set(comments.map(c => c.pageUrl));

    return {
      total: comments.length,
      pages: pageUrls.size,
      byPage: Array.from(pageUrls).reduce((acc, url) => {
        acc[url] = comments.filter(c => c.pageUrl === url).length;
        return acc;
      }, {})
    };
  }
}
