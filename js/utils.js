/**
 * Parse a form value as a number at or above 0. Empty or non-numeric input is ignored.
 *
 * @param {string} value
 * @returns {number | null}
 */
export function parseNonNegative(value) {
  const n = Number.parseFloat(value)
  if (!Number.isFinite(n)) return null
  return Math.max(0, n)
}
