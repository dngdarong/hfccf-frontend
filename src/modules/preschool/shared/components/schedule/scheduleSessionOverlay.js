// UI-only helper for presenting already-fetched schedule/session data.
// It must not be treated as a canonical source of truth.
function normalizeText(value) {
  return String(value ?? '').trim()
}

export function normalizeScheduleSessionStatus(status) {
  const normalized = normalizeText(status).toLowerCase()

  if (['scheduled', 'open', 'completed', 'locked', 'cancelled'].includes(normalized)) {
    return normalized
  }

  return normalized || 'scheduled'
}

export function getScheduleSessionStatusTone(status) {
  const normalized = normalizeScheduleSessionStatus(status)

  if (normalized === 'scheduled') return 'info'
  if (normalized === 'open') return 'warning'
  if (normalized === 'completed') return 'success'
  if (normalized === 'locked') return 'neutral'
  if (normalized === 'cancelled') return 'danger'

  return 'neutral'
}

export function getScheduleSessionActionKey(status) {
  const normalized = normalizeScheduleSessionStatus(status)

  if (normalized === 'scheduled') return 'openSession'
  if (normalized === 'open') return 'continueAttendance'
  if (['completed', 'locked', 'cancelled'].includes(normalized)) return 'viewSession'

  return 'viewSession'
}

export function getScheduleSessionActionTone(status) {
  const normalized = normalizeScheduleSessionStatus(status)

  if (normalized === 'scheduled' || normalized === 'open') {
    return 'primary'
  }

  if (normalized === 'cancelled') {
    return 'ghost'
  }

  return 'ghost'
}

export function buildScheduleSessionIndex(sessions = []) {
  const index = new Map()

  for (const session of Array.isArray(sessions) ? sessions : []) {
    const scheduleId = normalizeText(session?.scheduleId || session?.schedule_id)
    const classId = normalizeText(session?.classId || session?.class_id)
    const attendanceDate = normalizeText(session?.attendanceDate || session?.attendance_date)

    if (scheduleId) {
      index.set(`schedule:${scheduleId}`, session)
    }

    if (classId && attendanceDate) {
      index.set(`class-date:${classId}:${attendanceDate}`, session)
    }
  }

  return index
}

export function resolveScheduleSession(entry = {}, sessionIndex = new Map(), referenceDate = '') {
  // Handle cases where sessionIndex is not a Map (e.g., empty object)
  const index = sessionIndex instanceof Map ? sessionIndex : new Map()

  const scheduleId = normalizeText(entry?.id || entry?.scheduleId)
  if (scheduleId && index.has(`schedule:${scheduleId}`)) {
    return index.get(`schedule:${scheduleId}`)
  }

  const classId = normalizeText(entry?.classId)
  const attendanceDate = normalizeText(referenceDate)
  if (classId && attendanceDate && index.has(`class-date:${classId}:${attendanceDate}`)) {
    return index.get(`class-date:${classId}:${attendanceDate}`)
  }

  return null
}
