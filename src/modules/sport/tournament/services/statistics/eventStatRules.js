const EVENT_SCORING_TYPES = new Set(['goal', 'penalty_goal', 'own_goal'])
const EVENT_ASSIST_TYPES = new Set(['goal', 'penalty_goal', 'assist'])
const DISCIPLINE_POINTS = {
  yellow_card: 1,
  red_card: 3,
}

function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeEventType(value) {
  return normalizeText(value).toLowerCase()
}

function createPlayerStatKey(event = {}, role = 'player') {
  const primaryId = role === 'assist'
    ? normalizeText(event.assistPlayerId)
    : normalizeText(event.playerId)

  const primaryName = role === 'assist'
    ? normalizeText(event.assistPlayerName)
    : normalizeText(event.playerName)

  const teamId = normalizeText(event.teamId)

  return [primaryId || primaryName, teamId].filter(Boolean).join('::')
}

function createPlayerStatName(event = {}, role = 'player') {
  const fallback = role === 'assist'
    ? normalizeText(event.assistPlayerName || event.playerName || event.description)
    : normalizeText(event.playerName || event.assistPlayerName || event.description)

  return fallback
}

function resolveEventTeamId(event = {}, fixture = {}) {
  const teamId = normalizeText(event.teamId)
  if (teamId) return teamId

  const side = normalizeText(event.side).toLowerCase()
  if (side === 'home') return normalizeText(fixture.homeTeamId)
  if (side === 'away') return normalizeText(fixture.awayTeamId)

  return ''
}

function isScoringEventType(type = '') {
  const value = normalizeEventType(type)
  return EVENT_SCORING_TYPES.has(value)
}

function isAssistEventType(type = '') {
  const value = normalizeEventType(type)
  return EVENT_ASSIST_TYPES.has(value)
}

function isDisciplineEventType(type = '') {
  const value = normalizeEventType(type)
  return value === 'yellow_card' || value === 'red_card'
}

function getDisciplinePoints(type = '') {
  return DISCIPLINE_POINTS[normalizeEventType(type)] || 0
}

export {
  DISCIPLINE_POINTS,
  EVENT_ASSIST_TYPES,
  EVENT_SCORING_TYPES,
  createPlayerStatKey,
  createPlayerStatName,
  getDisciplinePoints,
  isAssistEventType,
  isDisciplineEventType,
  isScoringEventType,
  normalizeEventType,
  normalizeText,
  resolveEventTeamId,
}
