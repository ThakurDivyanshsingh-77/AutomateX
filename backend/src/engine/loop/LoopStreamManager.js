/**
 * Memory-Optimized Batch Stream Manager for Arrays up to 100,000+ items.
 * Normalizes JSON Arrays, MongoDB Docs, SQL Rows, CSV Rows, Google Sheets, Airtable records, etc.
 */
export class LoopStreamManager {
  /**
   * Normalize input into a standard array or iterable stream.
   * @param {any} rawInput - Collection input resolved from context
   * @returns {Array} Normalized array
   */
  static normalizeCollection(rawInput) {
    if (!rawInput) return [];

    // Already an array
    if (Array.isArray(rawInput)) return rawInput;

    // Handle database documents/rows wrapper objects
    if (typeof rawInput === 'object') {
      if (Array.isArray(rawInput.documents)) return rawInput.documents;
      if (Array.isArray(rawInput.rows)) return rawInput.rows;
      if (Array.isArray(rawInput.records)) return rawInput.records;
      if (Array.isArray(rawInput.data)) return rawInput.data;
      if (Array.isArray(rawInput.items)) return rawInput.items;
      if (Array.isArray(rawInput.results)) return rawInput.results;

      // Handle JSON string payload
      if (typeof rawInput.body === 'string') {
        try {
          const parsed = JSON.parse(rawInput.body);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // ignore
        }
      }

      // Single object fallback -> wrap in 1-element array
      return [rawInput];
    }

    // JSON string array string parsing
    if (typeof rawInput === 'string') {
      try {
        const parsed = JSON.parse(rawInput);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // String splitting by newline fallback (CSV/Lines)
        return rawInput.split('\n').filter((line) => line.trim().length > 0);
      }
    }

    return [rawInput];
  }

  /**
   * Generator function yielding batches of items lazily.
   * Prevents cloning massive arrays in RAM.
   * @param {Array} collection - Full normalized collection
   * @param {number} batchSize - Number of items per batch (default 1)
   */
  static *createBatchIterator(collection, batchSize = 1) {
    const size = Math.max(1, parseInt(batchSize || 1, 10));
    const total = collection.length;

    for (let i = 0; i < total; i += size) {
      const batchItems = collection.slice(i, Math.min(i + size, total));
      const batchIndices = Array.from({ length: batchItems.length }, (_, k) => i + k);
      yield {
        batchItems,
        batchIndices,
        startIndex: i,
        endIndex: Math.min(i + size, total),
        total,
      };
    }
  }
}
