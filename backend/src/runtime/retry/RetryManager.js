export class RetryManager {
  static MAX_RETRIES = 3;
  static INITIAL_DELAY_MS = 1000;

  static async executeWithRetry(operation, maxRetries = this.MAX_RETRIES) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation(attempt);
      } catch (err) {
        lastError = err;
        console.warn(`[RetryManager]: Attempt ${attempt}/${maxRetries} failed: ${err.message}`);
        if (attempt < maxRetries) {
          const delay = this.INITIAL_DELAY_MS * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }
}
