export function coachDisplayName(row = {}) {
  const coach = row?.coach || {}
  return (
    [coach.firstName, coach.lastName].filter(Boolean).join(' ').trim() ||
    String(coach.username || '').trim() ||
    String(coach.email || '').trim()
  )
}

export function teamDisplayName(row = {}) {
  return String(row?.team?.name || '').trim()
}

export function resolveAssignmentErrorMessage(exception, t) {
  return exception?.message || t('sportCoachTeamManagement.common.loadError')
}
