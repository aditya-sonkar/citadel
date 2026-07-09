/**
 * Converts a wildcard pattern to a RegExp and tests the value against it.
 *
 * Supported patterns:
 *   "*"          → matches everything
 *   "reports:*"  → matches reports:List, reports:Read, reports:Create, etc.
 *   "reports:List" → exact match only
 */
const regexCache = new Map<string, RegExp>();

const matchPattern = (value: string, pattern: string): boolean => {
  let regex = regexCache.get(pattern);
  if (!regex) {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    regex = new RegExp(`^${escaped}$`, 'i');
    regexCache.set(pattern, regex);
  }
  return regex.test(value);
};

/**
 * Returns true if the action matches any pattern in the list.
 */
export const matchAction = (action: string, patterns: string[]): boolean => {
  return patterns.some((pattern) => matchPattern(action, pattern));
};

/**
 * Returns true if the resource matches any pattern in the list.
 */
export const matchResource = (resource: string, patterns: string[]): boolean => {
  return patterns.some((pattern) => matchPattern(resource, pattern));
};
