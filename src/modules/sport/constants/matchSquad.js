export const MATCH_SQUAD_STATUS = Object.freeze({
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  LOCKED: 'locked',
})

export const MATCH_SQUAD_PLAYER_ROLE = Object.freeze({
  STARTER: 'starter',
  SUBSTITUTE: 'substitute',
  RESERVE: 'reserve',
  UNAVAILABLE: 'unavailable',
})

export const MATCH_ELIGIBILITY_STATUS = Object.freeze({
  ELIGIBLE: 'eligible',
  PENDING: 'pending',
  INJURED: 'injured',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive',
  RELEASED: 'released',
  ARCHIVED: 'archived',
  NOT_MEMBER: 'not_member',
})

export const MATCH_SQUAD_STATUSES = Object.freeze(Object.values(MATCH_SQUAD_STATUS))

export const MATCH_SQUAD_PLAYER_ROLES = Object.freeze(Object.values(MATCH_SQUAD_PLAYER_ROLE))

export const MATCH_ELIGIBILITY_STATUSES = Object.freeze(Object.values(MATCH_ELIGIBILITY_STATUS))

export const MATCH_SQUAD_STATUS_TONES = Object.freeze({
  [MATCH_SQUAD_STATUS.DRAFT]: 'info',
  [MATCH_SQUAD_STATUS.SUBMITTED]: 'warning',
  [MATCH_SQUAD_STATUS.APPROVED]: 'success',
  [MATCH_SQUAD_STATUS.LOCKED]: 'danger',
})

export const MATCH_ELIGIBILITY_TONES = Object.freeze({
  [MATCH_ELIGIBILITY_STATUS.ELIGIBLE]: 'success',
  [MATCH_ELIGIBILITY_STATUS.PENDING]: 'warning',
  [MATCH_ELIGIBILITY_STATUS.INJURED]: 'warning',
  [MATCH_ELIGIBILITY_STATUS.SUSPENDED]: 'danger',
  [MATCH_ELIGIBILITY_STATUS.INACTIVE]: 'neutral',
  [MATCH_ELIGIBILITY_STATUS.RELEASED]: 'neutral',
  [MATCH_ELIGIBILITY_STATUS.ARCHIVED]: 'danger',
  [MATCH_ELIGIBILITY_STATUS.NOT_MEMBER]: 'neutral',
})

export function normalizeMatchSquadStatus(value) {
  return String(value ?? '').trim().toLowerCase()
}

export function normalizeMatchSquadRole(value) {
  return String(value ?? '').trim().toLowerCase()
}

export function normalizeMatchEligibilityStatus(value) {
  return String(value ?? '').trim().toLowerCase()
}

export function matchSquadStatusTone(value) {
  return MATCH_SQUAD_STATUS_TONES[normalizeMatchSquadStatus(value)] || 'info'
}

export function matchEligibilityTone(value) {
  return MATCH_ELIGIBILITY_TONES[normalizeMatchEligibilityStatus(value)] || 'info'
}
