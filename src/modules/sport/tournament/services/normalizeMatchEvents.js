const MATCH_EVENT_TYPES = [
  'goal',
  'assist',
  'yellow_card',
  'red_card',
  'own_goal',
  'penalty_goal',
  'penalty_miss',
  'substitution',
  'injury',
  'var_review',
  'note',
]

function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeNumber(value, fallback = null) {
  if (value === null || value === undefined || value === '') return fallback

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function normalizeEventType(value) {
  const type = normalizeText(value).toLowerCase()
  if (!type) return 'note'
  if (type === 'penalty') return 'penalty_goal'
  if (type === 'penalty_missed' || type === 'penalty_miss') return 'penalty_miss'
  if (type === 'yellow card') return 'yellow_card'
  if (type === 'red card') return 'red_card'
  if (type === 'own goal') return 'own_goal'
  if (type === 'var review') return 'var_review'
  return type
}

function normalizeEventSide(value, context = {}) {
  const side = normalizeText(value).toLowerCase()
  if (side === 'home' || side === 'away') return side

  const teamId = normalizeText(context.teamId)
  const homeTeamId = normalizeText(context.homeTeamId)
  const awayTeamId = normalizeText(context.awayTeamId)

  if (teamId && homeTeamId && teamId === homeTeamId) return 'home'
  if (teamId && awayTeamId && teamId === awayTeamId) return 'away'

  return ''
}

function createMatchEventId(index = 0) {
  return `event-${String(index + 1).padStart(2, '0')}`
}

function createMatchEventDraft(source = {}, context = {}) {
  const normalized = normalizeMatchEvent(source, 0, context)

  return {
    id: normalized.id,
    matchId: normalized.matchId,
    teamId: normalized.teamId,
    playerId: normalized.playerId,
    playerName: normalized.playerName,
    assistPlayerId: normalized.assistPlayerId,
    assistPlayerName: normalized.assistPlayerName,
    playerOutId: normalized.playerOutId,
    playerOutName: normalized.playerOutName,
    playerInId: normalized.playerInId,
    playerInName: normalized.playerInName,
    minute: normalized.minute,
    stoppageMinute: normalized.stoppageMinute,
    type: normalized.type,
    side: normalized.side,
    description: normalized.description,
    createdAt: normalized.createdAt,
  }
}

function normalizeMatchEvent(event = {}, index = 0, context = {}) {
  const minute = normalizeNumber(event.minute, null)
  const stoppageMinute = normalizeNumber(event.stoppageMinute, 0)

  return {
    id: normalizeText(event.id) || createMatchEventId(index),
    matchId: normalizeText(event.matchId || context.matchId),
    teamId: normalizeText(event.teamId),
    teamName: normalizeText(event.teamName),
    playerId: normalizeText(event.playerId),
    playerName: normalizeText(event.playerName),
    assistPlayerId: normalizeText(event.assistPlayerId),
    assistPlayerName: normalizeText(event.assistPlayerName),
    playerOutId: normalizeText(event.playerOutId),
    playerOutName: normalizeText(event.playerOutName),
    playerInId: normalizeText(event.playerInId),
    playerInName: normalizeText(event.playerInName),
    minute: minute === null ? null : Math.max(0, Math.min(120, minute)),
    stoppageMinute: stoppageMinute === null ? 0 : Math.max(0, stoppageMinute),
    type: normalizeEventType(event.type),
    side: normalizeEventSide(event.side, {
      ...context,
      teamId: event.teamId,
    }),
    description: normalizeText(event.description || event.notes),
    createdAt: normalizeText(event.createdAt) || new Date().toISOString(),
    order: Number(event.order ?? index) || index,
  }
}

function normalizeMatchEvents(events = [], context = {}) {
  return (Array.isArray(events) ? events : []).map((event, index) => normalizeMatchEvent(event, index, context))
}

function getMatchEventTypeMeta(eventType = '') {
  const value = normalizeEventType(eventType)

  return {
    type: value,
    isAllowed: MATCH_EVENT_TYPES.includes(value),
  }
}

function isScoringEventType(type = '') {
  const value = normalizeEventType(type)
  return value === 'goal' || value === 'penalty_goal'
}

function isDisciplinaryEventType(type = '') {
  const value = normalizeEventType(type)
  return value === 'yellow_card' || value === 'red_card'
}

export {
  MATCH_EVENT_TYPES,
  createMatchEventDraft,
  createMatchEventId,
  getMatchEventTypeMeta,
  isDisciplinaryEventType,
  isScoringEventType,
  normalizeEventSide,
  normalizeEventType,
  normalizeMatchEvent,
  normalizeMatchEvents,
  normalizeNumber,
  normalizeText,
}
