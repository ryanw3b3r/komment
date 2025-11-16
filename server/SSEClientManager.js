/**
 * SSEClientManager - Manages Server-Sent Events clients
 * Handles client registration, broadcasting, and cleanup
 */
export class SSEClientManager {
  constructor() {
    // Map of pageUrl -> array of response objects
    this.clients = new Map();
  }

  /**
   * Register a new SSE client for a specific page
   * @param {string} pageUrl - The page URL to subscribe to
   * @param {Response} res - Express response object
   * @param {Request} req - Express request object
   */
  register(pageUrl, res, req) {
    if (!this.clients.has(pageUrl)) {
      this.clients.set(pageUrl, []);
    }

    const clientList = this.clients.get(pageUrl);
    clientList.push(res);

    // Send initial connection confirmation
    this.sendToClient(res, 'connected', { message: 'Connected' });

    // Handle client disconnect
    req.on('close', () => {
      this.unregister(pageUrl, res);
    });
  }

  /**
   * Unregister a client
   * @param {string} pageUrl - The page URL
   * @param {Response} res - Express response object
   */
  unregister(pageUrl, res) {
    const clientList = this.clients.get(pageUrl);
    if (!clientList) return;

    const index = clientList.indexOf(res);
    if (index !== -1) {
      clientList.splice(index, 1);
    }

    // Clean up empty page client lists
    if (clientList.length === 0) {
      this.clients.delete(pageUrl);
    }
  }

  /**
   * Send a message to a specific client
   * @param {Response} res - Express response object
   * @param {string} event - Event name
   * @param {Object} data - Data to send
   */
  sendToClient(res, event, data) {
    try {
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      res.write(message);
    } catch (error) {
      console.error('Error sending SSE message to client:', error);
    }
  }

  /**
   * Broadcast an update to all clients watching a specific page
   * @param {string} pageUrl - The page URL
   * @param {string} event - Event name (comment-added, comment-updated, comment-deleted)
   * @param {Object} data - Data to broadcast
   */
  broadcast(pageUrl, event, data) {
    const clientList = this.clients.get(pageUrl);
    if (!clientList) return;

    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    clientList.forEach((client) => {
      try {
        client.write(message);
      } catch (error) {
        console.error('Error broadcasting SSE update:', error);
      }
    });
  }

  /**
   * Get the number of clients for a specific page
   * @param {string} pageUrl - The page URL
   * @returns {number} Number of connected clients
   */
  getClientCount(pageUrl) {
    const clientList = this.clients.get(pageUrl);
    return clientList ? clientList.length : 0;
  }

  /**
   * Get total number of connected clients across all pages
   * @returns {number} Total number of clients
   */
  getTotalClientCount() {
    let total = 0;
    for (const clientList of this.clients.values()) {
      total += clientList.length;
    }
    return total;
  }

  /**
   * Close all connections (for graceful shutdown)
   */
  closeAll() {
    for (const clientList of this.clients.values()) {
      clientList.forEach(client => {
        try {
          client.end();
        } catch (error) {
          console.error('Error closing SSE connection:', error);
        }
      });
    }
    this.clients.clear();
  }
}
