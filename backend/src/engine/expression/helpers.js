/**
 * Safely extracts a value from a nested object/array using dot notation and array index syntax.
 * Examples:
 * - getValueByPath(data, "user.address.city")
 * - getValueByPath(data, "items[0].name")
 * - getValueByPath(data, "users[1].roles[0]")
 */
export function getValueByPath(target, path) {
  if (target === undefined || target === null || !path) {
    return undefined;
  }

  // Normalize array syntax: "items[0].name" -> "items.0.name"
  const normalizedPath = String(path).replace(/\[(\d+)\]/g, '.$1');
  const segments = normalizedPath.split('.').filter(Boolean);

  let current = target;
  for (const segment of segments) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[segment];
  }

  return current;
}

/**
 * Checks if a value is a plain object.
 */
export function isPlainObject(val) {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}
