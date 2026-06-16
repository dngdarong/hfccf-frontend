export const PLAYER_APPROVAL_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
})

export const PLAYER_ROSTER_STATUS = Object.freeze({
  ACTIVE: 'active',
  INJURED: 'injured',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive',
  RELEASED: 'released',
  GRADUATED: 'graduated',
  ARCHIVED: 'archived',
})

export const PLAYER_MEMBERSHIP_STATUS = Object.freeze({
  ACTIVE: 'active',
  LOANED: 'loaned',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  RELEASED: 'released',
  EXPIRED: 'expired',
})

export const PLAYER_APPROVAL_STATUSES = Object.freeze(Object.values(PLAYER_APPROVAL_STATUS))

export const PLAYER_ROSTER_STATUSES = Object.freeze(Object.values(PLAYER_ROSTER_STATUS))

export const PLAYER_MEMBERSHIP_STATUSES = Object.freeze(Object.values(PLAYER_MEMBERSHIP_STATUS))

export const PLAYER_LIFECYCLE_ACTIONS = Object.freeze({
  ACTIVE: 'active',
  INJURED: 'injured',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive',
  RELEASED: 'released',
  GRADUATED: 'graduated',
  ARCHIVED: 'archived',
})

export const PLAYER_LIFECYCLE_ACTION_LIST = Object.freeze(Object.values(PLAYER_LIFECYCLE_ACTIONS))

export const PLAYER_STATUS_TONES = Object.freeze({
  [PLAYER_ROSTER_STATUS.ACTIVE]: 'success',
  [PLAYER_APPROVAL_STATUS.APPROVED]: 'success',
  [PLAYER_APPROVAL_STATUS.PENDING]: 'warning',
  [PLAYER_ROSTER_STATUS.INJURED]: 'warning',
  [PLAYER_ROSTER_STATUS.SUSPENDED]: 'danger',
  [PLAYER_APPROVAL_STATUS.REJECTED]: 'danger',
  [PLAYER_ROSTER_STATUS.INACTIVE]: 'neutral',
  [PLAYER_ROSTER_STATUS.RELEASED]: 'neutral',
  [PLAYER_ROSTER_STATUS.GRADUATED]: 'info',
  [PLAYER_ROSTER_STATUS.ARCHIVED]: 'danger',
  [PLAYER_MEMBERSHIP_STATUS.LOANED]: 'info',
  [PLAYER_MEMBERSHIP_STATUS.EXPIRED]: 'neutral',
})

export function normalizePlayerStatus(value) {
  return String(value ?? '').trim().toLowerCase()
}

export function playerStatusTone(value) {
  return PLAYER_STATUS_TONES[normalizePlayerStatus(value)] || 'info'
}
