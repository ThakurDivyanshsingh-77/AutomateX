/**
 * Canonical File ID Normalization Function for AutomateX Platform.
 * Ensures file IDs are consistently extracted and normalized.
 * Guaranteed to deduplicate duplicated IDs (e.g. "file_ABC123file_ABC123" -> "file_ABC123").
 *
 * Rules:
 * Input: "file_ABC123" -> Output: "file_ABC123"
 * Input: { id: "file_ABC123" } -> Output: "file_ABC123"
 * Output MUST NEVER be: "file_ABC123file_ABC123"
 */
export function normalizeFileId(input) {
  if (input === null || input === undefined) {
    return '';
  }

  let strId = '';

  // 1. Extract string from Object if passed as an object
  if (typeof input === 'object' && input !== null) {
    strId =
      input.id ||
      input.fileId ||
      input.file?.id ||
      input.file?.fileId ||
      '';
  } else if (typeof input === 'string') {
    strId = input.trim();
    // Parse stringified JSON object if needed
    if (strId.startsWith('{') && (strId.includes('"id"') || strId.includes('"fileId"'))) {
      try {
        const parsed = JSON.parse(strId);
        strId = parsed.id || parsed.file?.id || parsed.fileId || strId;
      } catch (e) {
        // Fallback to raw string
      }
    }
  } else {
    strId = String(input).trim();
  }

  if (typeof strId !== 'string') {
    strId = String(strId || '').trim();
  }

  strId = strId.trim();

  // 2. Fix duplicated prefix e.g. "file_file_ABC123" -> "file_ABC123"
  while (strId.startsWith('file_file_')) {
    strId = strId.replace(/^file_/, '');
  }

  // 3. Fix duplicated string e.g. "file_ABC123file_ABC123" -> "file_ABC123"
  if (strId.length > 0 && strId.length % 2 === 0) {
    const halfLen = strId.length / 2;
    const firstHalf = strId.slice(0, halfLen);
    const secondHalf = strId.slice(halfLen);
    if (firstHalf === secondHalf) {
      strId = firstHalf;
    }
  }

  // 4. Repeated pattern deduplication (e.g. regex for repeated file_... segments)
  const repeatedMatch = strId.match(/^(file_[a-f0-9]+)\1+$/i);
  if (repeatedMatch) {
    strId = repeatedMatch[1];
  }

  return strId;
}
