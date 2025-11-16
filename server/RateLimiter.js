/**
 * Simple in-memory rate limiter middleware
 * Tracks requests per IP address with configurable limits
 */
export class RateLimiter {
  /**
   * @param {number} windowMs - Time window in milliseconds
   * @param {number} maxRequests - Maximum requests per window
   * @param {string} message - Error message when limit exceeded
   */
  constructor(windowMs = 60000, maxRequests = 100, message = 'Too many requests') {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message;
    // Map of IP -> array of timestamps
    this.requests = new Map();

    // Cleanup old entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Express middleware function
   */
  middleware() {
    return (req, res, next) => {
      const ip = this.getClientIp(req);
      const now = Date.now();

      // Get existing requests for this IP
      if (!this.requests.has(ip)) {
        this.requests.set(ip, []);
      }

      const timestamps = this.requests.get(ip);

      // Remove timestamps outside the current window
      const validTimestamps = timestamps.filter(
        timestamp => now - timestamp < this.windowMs
      );

      // Check if limit exceeded
      if (validTimestamps.length >= this.maxRequests) {
        return res.status(429).json({
          success: false,
          error: this.message,
          retryAfter: Math.ceil(this.windowMs / 1000)
        });
      }

      // Add current request timestamp
      validTimestamps.push(now);
      this.requests.set(ip, validTimestamps);

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', this.maxRequests - validTimestamps.length);
      res.setHeader('X-RateLimit-Reset', new Date(now + this.windowMs).toISOString());

      next();
    };
  }

  /**
   * Get client IP address from request
   */
  getClientIp(req) {
    return req.ip ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           'unknown';
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  cleanup() {
    const now = Date.now();
    for (const [ip, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        timestamp => now - timestamp < this.windowMs
      );

      if (validTimestamps.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, validTimestamps);
      }
    }
  }

  /**
   * Stop cleanup interval (for graceful shutdown)
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      totalIPs: this.requests.size,
      windowMs: this.windowMs,
      maxRequests: this.maxRequests
    };
  }
}
