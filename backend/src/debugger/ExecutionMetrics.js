/**
 * ExecutionMetrics
 * Performance metrics calculator for workflow step execution.
 */
export class ExecutionMetrics {
  /**
   * Get memory usage snapshot
   */
  static getMemorySnapshot() {
    const mem = process.memoryUsage();
    return {
      heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
      rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
    };
  }

  /**
   * Calculate step latency metrics and execution statistics
   * @param {Array} stepLogs
   */
  static calculateMetrics(stepLogs = [], totalDuration = 0) {
    if (!stepLogs || stepLogs.length === 0) {
      return {
        totalDurationMs: totalDuration,
        stepCount: 0,
        averageStepDurationMs: 0,
        slowestStep: null,
        fastestStep: null,
        memorySnapshot: this.getMemorySnapshot(),
      };
    }

    let minDur = Infinity;
    let maxDur = -1;
    let slowest = null;
    let fastest = null;
    let sumDur = 0;

    stepLogs.forEach((log) => {
      const dur = log.duration || 0;
      sumDur += dur;

      if (dur > maxDur) {
        maxDur = dur;
        slowest = { nodeId: log.nodeId, nodeName: log.nodeName || log.nodeType, durationMs: dur };
      }
      if (dur < minDur) {
        minDur = dur;
        fastest = { nodeId: log.nodeId, nodeName: log.nodeName || log.nodeType, durationMs: dur };
      }
    });

    return {
      totalDurationMs: totalDuration || sumDur,
      stepCount: stepLogs.length,
      averageStepDurationMs: Math.round(sumDur / stepLogs.length),
      slowestStep: slowest,
      fastestStep: fastest,
      memorySnapshot: this.getMemorySnapshot(),
    };
  }
}
