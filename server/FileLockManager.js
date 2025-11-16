/**
 * FileLockManager - Manages file locking to prevent race conditions
 * Uses an in-memory queue to ensure thread-safe file operations
 */
export class FileLockManager {
  constructor() {
    this.isLocked = false;
    this.queue = [];
  }

  /**
   * Acquire a lock before performing file operations
   * @returns {Promise<void>} Resolves when lock is acquired
   */
  async acquire() {
    return new Promise((resolve) => {
      if (!this.isLocked) {
        this.isLocked = true;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  /**
   * Release the lock and process next in queue
   */
  release() {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next();
    } else {
      this.isLocked = false;
    }
  }

  /**
   * Execute an operation with automatic lock management
   * @param {Function} operation - Async function to execute
   * @returns {Promise<any>} Result of the operation
   */
  async withLock(operation) {
    await this.acquire();
    try {
      return await operation();
    } finally {
      this.release();
    }
  }
}
