export const MATCH_EVENT_TYPES = {
  GOAL: 'goal',
  ASSIST: 'assist',
  YELLOW_CARD: 'yellow_card',
  RED_CARD: 'red_card',
  SUBSTITUTION_IN: 'substitution_in',
  SUBSTITUTION_OUT: 'substitution_out',
  INJURY: 'injury',
  PENALTY_GOAL: 'penalty_goal',
  PENALTY_MISS: 'penalty_miss',
  OWN_GOAL: 'own_goal',
  EXTRA_TIME_GOAL: 'extra_time_goal',
}

export const MATCH_EVENT_PERIODS = {
  FIRST_HALF: 'first_half',
  HALFTIME: 'halftime',
  SECOND_HALF: 'second_half',
  EXTRA_TIME: 'extra_time',
  PENALTY_SHOOTOUT: 'penalty_shootout',
  FINAL: 'final',
}

export const MATCH_EVENT_SORT_ORDER = [
  MATCH_EVENT_PERIODS.FIRST_HALF,
  MATCH_EVENT_PERIODS.HALFTIME,
  MATCH_EVENT_PERIODS.SECOND_HALF,
  MATCH_EVENT_PERIODS.EXTRA_TIME,
  MATCH_EVENT_PERIODS.PENALTY_SHOOTOUT,
  MATCH_EVENT_PERIODS.FINAL,
]

export const MATCH_EVENT_TYPE_TONES = {
  [MATCH_EVENT_TYPES.GOAL]: 'success',
  [MATCH_EVENT_TYPES.ASSIST]: 'info',
  [MATCH_EVENT_TYPES.YELLOW_CARD]: 'warn',
  [MATCH_EVENT_TYPES.RED_CARD]: 'danger',
  [MATCH_EVENT_TYPES.SUBSTITUTION_IN]: 'info',
  [MATCH_EVENT_TYPES.SUBSTITUTION_OUT]: 'info',
  [MATCH_EVENT_TYPES.INJURY]: 'secondary',
  [MATCH_EVENT_TYPES.PENALTY_GOAL]: 'success',
  [MATCH_EVENT_TYPES.PENALTY_MISS]: 'secondary',
  [MATCH_EVENT_TYPES.OWN_GOAL]: 'warning',
  [MATCH_EVENT_TYPES.EXTRA_TIME_GOAL]: 'success',
}

export function normalizeMatchEventType(value) {
  const type = String(value || '').toLowerCase()

  if (type === 'substitution') return MATCH_EVENT_TYPES.SUBSTITUTION_OUT
  if (type === 'penalty_missed') return MATCH_EVENT_TYPES.PENALTY_MISS

  return type || MATCH_EVENT_TYPES.GOAL
}

export function normalizeMatchEventPeriod(value) {
  const period = String(value || '').toLowerCase()

  if (MATCH_EVENT_SORT_ORDER.includes(period)) return period

  return MATCH_EVENT_PERIODS.FIRST_HALF
}