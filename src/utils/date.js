/**
 * Shared date/datetime formatting utilities.
 * All functions accept any value parseable by `new Date()` — ISO strings,
 * timestamps, or Date objects — and return a human-readable string.
 * Returns '—' for null, undefined, empty string, or invalid input.
 */

/**
 * Format a date-only value as "30 May 2026".
 * Use for fields that contain a plain date without a time component
 * (e.g. date_of_birth, due_date, assessment_date).
 *
 * @param {string|Date|null|undefined} value
 * @returns {string}
 */
export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Normalize a date/datetime value for <input type="date">.
 * Returns a YYYY-MM-DD string or an empty string for invalid input.
 *
 * @param {string|Date|null|undefined} value
 * @returns {string}
 */
export function normalizeDateForInput(value) {
  if (!value) return ''

  const d = new Date(value)
  if (isNaN(d.getTime())) return ''

  return d.toISOString().slice(0, 10)
}

/**
 * Format a datetime value as "30 May 2026, 12:14 PM".
 * Use for ISO timestamp fields (createdAt, updatedAt, generatedAt, recordedAt).
 * Converts from UTC to the browser's local timezone automatically.
 *
 * @param {string|Date|null|undefined} value
 * @returns {string}
 */
export function formatDatetime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return String(value)
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a datetime as a compact relative-style label for badges and table cells.
 * Returns "Today, 12:14 PM", "Yesterday, 9:00 AM", or "30 May, 12:14 PM" (no year
 * when same year). Falls back to full datetime for older dates.
 *
 * @param {string|Date|null|undefined} value
 * @returns {string}
 */
export function formatDatetimeShort(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return String(value)

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })

  if (d >= todayStart) return `Today, ${time}`
  if (d >= yesterdayStart) return `Yesterday, ${time}`

  // Same year: omit the year to keep it compact
  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}
