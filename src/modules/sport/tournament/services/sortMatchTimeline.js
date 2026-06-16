import { normalizeMatchEvents, normalizeNumber, normalizeText } from './normalizeMatchEvents'

function compareMatchTimelineEvents(left = {}, right = {}) {
  const leftMinute = normalizeNumber(left.minute, 0)
  const rightMinute = normalizeNumber(right.minute, 0)

  if (leftMinute !== rightMinute) {
    return leftMinute - rightMinute
  }

  const leftStoppage = normalizeNumber(left.stoppageMinute, 0)
  const rightStoppage = normalizeNumber(right.stoppageMinute, 0)

  if (leftStoppage !== rightStoppage) {
    return leftStoppage - rightStoppage
  }

  const leftCreatedAt = normalizeText(left.createdAt)
  const rightCreatedAt = normalizeText(right.createdAt)

  if (leftCreatedAt !== rightCreatedAt) {
    return leftCreatedAt.localeCompare(rightCreatedAt)
  }

  const leftOrder = Number(left.order ?? 0) || 0
  const rightOrder = Number(right.order ?? 0) || 0

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder
  }

  return normalizeText(left.id).localeCompare(normalizeText(right.id))
}

function formatMatchEventMinute(event = {}) {
  const minute = normalizeNumber(event.minute, 0)
  const stoppageMinute = normalizeNumber(event.stoppageMinute, 0)

  if (minute === 0 && stoppageMinute === 0) {
    return `0'`
  }

  if (stoppageMinute > 0) {
    return `${minute}+${stoppageMinute}'`
  }

  return `${minute}'`
}

function sortMatchTimeline(events = [], context = {}) {
  return normalizeMatchEvents(events, context).sort(compareMatchTimelineEvents)
}

export {
  compareMatchTimelineEvents,
  formatMatchEventMinute,
  sortMatchTimeline,
}
