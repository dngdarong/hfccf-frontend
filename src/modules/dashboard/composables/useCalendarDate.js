export function formatDate(dateValue) {
  const year = dateValue.getFullYear()
  const month = String(dateValue.getMonth() + 1).padStart(2, '0')
  const day = String(dateValue.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(dateValue, amount) {
  const next = new Date(dateValue)
  next.setDate(next.getDate() + amount)
  return next
}

export function addMonths(dateValue, amount) {
  return new Date(dateValue.getFullYear(), dateValue.getMonth() + amount, 1)
}

export function startOfWeek(dateValue) {
  const next = new Date(dateValue)
  const day = next.getDay()
  const diff = day === 0 ? -6 : 1 - day
  next.setDate(next.getDate() + diff)
  next.setHours(0, 0, 0, 0)
  return next
}

export function sameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

export function sameMonth(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth()
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}
