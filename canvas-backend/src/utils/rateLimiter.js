const logger = require('./logger');

class RateLimiter {
  constructor() {
    this.requestsPerSecond = parseInt(process.env.CANVAS_RATE_LIMIT_PER_SECOND) || 10;
    this.burstLimit = parseInt(process.env.CANVAS_RATE_LIMIT_BURST) || 50;
    this.tokens = this.burstLimit;
    this.lastRefill = Date.now();
    this.queue = [];
  }

  async waitForSlot() {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  processQueue() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / 1000) * this.requestsPerSecond;
    
    this.tokens = Math.min(this.burstLimit, this.tokens + tokensToAdd);
    this.lastRefill = now;

    while (this.queue.length > 0 && this.tokens > 0) {
      this.tokens--;
      const resolve = this.queue.shift();
      resolve();
    }

    if (this.queue.length > 0) {
      // Schedule next processing
      const nextRefill = 1000 / this.requestsPerSecond;
      setTimeout(() => this.processQueue(), nextRefill);
    }
  }

  getStatus() {
    return {
      availableTokens: this.tokens,
      queueLength: this.queue.length,
      requestsPerSecond: this.requestsPerSecond,
      burstLimit: this.burstLimit
    };
  }
}

module.exports = RateLimiter;