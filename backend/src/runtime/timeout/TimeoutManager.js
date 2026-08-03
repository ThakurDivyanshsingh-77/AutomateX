export class TimeoutManager {
  static DEFAULT_TIMEOUT_MS = 30000; // 30 Seconds Execution Cap

  static async runWithTimeout(promise, timeoutMs = this.DEFAULT_TIMEOUT_MS) {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`Workflow execution timed out after ${timeoutMs / 1000} seconds`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      return result;
    } finally {
      clearTimeout(timer);
    }
  }
}
