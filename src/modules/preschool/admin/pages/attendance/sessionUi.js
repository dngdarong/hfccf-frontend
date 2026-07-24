function normalizeSessionStatus(value) {
  const status = String(value || '').trim().toLowerCase()

  if (['scheduled', 'open', 'completed', 'locked', 'cancelled', 'missing'].includes(status)) {
    return status
  }

  if (['closed', 'complete', 'done'].includes(status)) {
    return 'completed'
  }

  return status || 'open'
}

function getSessionStatusTone(status) {
  const normalized = normalizeSessionStatus(status)

  if (normalized === 'scheduled') return 'info'
  if (normalized === 'open') return 'warning'
  if (normalized === 'completed') return 'success'
  if (normalized === 'locked') return 'neutral'
  if (normalized === 'cancelled') return 'danger'
  if (normalized === 'missing') return 'danger'

  return 'neutral'
}

function getSessionStatusKey(status) {
  return normalizeSessionStatus(status)
}

function getSessionActionKey(status, context = 'admin') {
  const normalized = normalizeSessionStatus(status)

  if (normalized === 'scheduled') {
    return context === 'teacher' ? 'takeAttendance' : 'openSession'
  }

  if (normalized === 'open') {
    return 'continueAttendance'
  }

  if (normalized === 'completed') {
    return 'viewSession'
  }

  if (normalized === 'locked') {
    return context === 'teacher' ? 'viewSession' : 'view'
  }

  if (normalized === 'cancelled') {
    return 'viewDetails'
  }

  return 'viewSession'
}

function getSessionActionTone(status) {
  const normalized = normalizeSessionStatus(status)

  if (normalized === 'scheduled') return 'info'
  if (normalized === 'open') return 'warning'
  if (normalized === 'completed') return 'success'
  if (normalized === 'locked') return 'neutral'
  if (normalized === 'cancelled') return 'danger'
  if (normalized === 'missing') return 'danger'

  return 'neutral'
}

function buildSessionTimeline(session = {}, records = [], alerts = [], guardianContacts = []) {
  const items = []

  const add = (key, label, createdAt) => {
    if (!createdAt) return
    items.push({
      key,
      label,
      createdAt,
    })
  }

  add('created', 'created', session.createdAt || session.created_at)
  add('generated', 'generated', session.generatedFromSchedule ? session.createdAt || session.created_at : '')
  add('opened', 'opened', session.openedAt || session.opened_at)
  add('submitted', 'submitted', records.length ? session.completedAt || session.completed_at || session.closedAt || session.closed_at : '')
  add('completed', 'completed', session.completedAt || session.completed_at)
  add('locked', 'locked', session.lockedAt || session.locked_at)
  add('cancelled', 'cancelled', session.cancelledAt || session.cancelled_at)

  const alert = alerts.find((item) => item.createdAt || item.created_at)
  add('alertCreated', 'alertCreated', alert?.createdAt || alert?.created_at)

  const guardianContact = guardianContacts.find((item) => item.createdAt || item.created_at)
  add('guardianContactCreated', 'guardianContactCreated', guardianContact?.createdAt || guardianContact?.created_at)

  return items
}

function resolveSessionProgress(session = {}, records = []) {
  const total = Number(session.studentCount ?? session.student_count ?? records.length ?? 0) || 0
  const marked = Number(session.recordsCount ?? session.records_count ?? records.filter((record) => record.status).length) || 0
  const pending = Number(session.pendingCount ?? session.pending_count ?? Math.max(total - marked, 0)) || 0

  return {
    total,
    marked,
    pending,
  }
}

export {
  buildSessionTimeline,
  getSessionActionKey,
  getSessionActionTone,
  getSessionStatusKey,
  getSessionStatusTone,
  normalizeSessionStatus,
  resolveSessionProgress,
}
