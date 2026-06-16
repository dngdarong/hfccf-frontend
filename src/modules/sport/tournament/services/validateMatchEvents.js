import {
  MATCH_EVENT_TYPES,
  normalizeEventType,
  normalizeMatchEvents,
  normalizeNumber,
  normalizeText,
} from './normalizeMatchEvents'

function createEventIssue(code, message, path = []) {
  return {
    code,
    message,
    path,
  }
}

function validateMatchEvent(event = {}, context = {}, rawEvent = event) {
  const issues = []
  const type = normalizeEventType(event.type)
  const minute = normalizeNumber(rawEvent?.minute, null)
  const stoppageMinute = normalizeNumber(rawEvent?.stoppageMinute, 0)
  const teamId = normalizeText(event.teamId)
  const playerId = normalizeText(event.playerId)
  const playerName = normalizeText(event.playerName)
  const assistPlayerId = normalizeText(event.assistPlayerId)
  const assistPlayerName = normalizeText(event.assistPlayerName)
  const playerOutId = normalizeText(event.playerOutId)
  const playerOutName = normalizeText(event.playerOutName)
  const playerInId = normalizeText(event.playerInId)
  const playerInName = normalizeText(event.playerInName)
  const side = normalizeText(event.side).toLowerCase()
  const matchHomeTeamId = normalizeText(context.match?.homeTeamId)
  const matchAwayTeamId = normalizeText(context.match?.awayTeamId)

  if (!MATCH_EVENT_TYPES.includes(type)) {
    issues.push(createEventIssue('unknownEventType', 'Unknown event type', ['type']))
  }

  if (minute === null || minute < 0 || minute > 120) {
    issues.push(createEventIssue('minuteOutOfRange', 'Minute must be between 0 and 120', ['minute']))
  }

  if (stoppageMinute !== null && stoppageMinute < 0) {
    issues.push(createEventIssue('stoppageMinuteNegative', 'Stoppage minute cannot be negative', ['stoppageMinute']))
  }

  const requiresPlayer = ['goal', 'penalty_goal', 'own_goal', 'yellow_card', 'red_card']
  if (requiresPlayer.includes(type) && !playerId && !playerName) {
    issues.push(createEventIssue('eventRequiresPlayer', 'This event requires a player', ['playerName']))
  }

  if (['goal', 'penalty_goal', 'own_goal'].includes(type) && !teamId) {
    issues.push(createEventIssue('eventRequiresTeam', 'This event requires a team', ['teamId']))
  }

  if ((type === 'yellow_card' || type === 'red_card') && !playerId && !playerName) {
    issues.push(createEventIssue(`${type}RequiresPlayer`, 'This card event requires a player', ['playerName']))
  }

  if (assistPlayerId && (assistPlayerId === playerId || assistPlayerName === playerName)) {
    issues.push(createEventIssue('assistCannotMatchScorer', 'Assist player cannot match the scorer', ['assistPlayerName']))
  }

  if (type === 'substitution') {
    if (!playerOutId && !playerOutName && !playerInId && !playerInName) {
      issues.push(createEventIssue('substitutionRequiresPlayers', 'Substitution requires at least one player in or out', ['playerOutName']))
    }
  }

  if (type === 'own_goal' && !teamId) {
    issues.push(createEventIssue('ownGoalRequiresTeam', 'Own goal requires a team', ['teamId']))
  }

  if (type === 'own_goal' && matchHomeTeamId && matchAwayTeamId && teamId && teamId !== matchHomeTeamId && teamId !== matchAwayTeamId) {
    issues.push(createEventIssue('ownGoalRequiresOpponent', 'Own goal team must belong to the match', ['teamId']))
  }

  if (side && side !== 'home' && side !== 'away') {
    issues.push(createEventIssue('invalidSide', 'Event side must be home or away', ['side']))
  }

  if (side === 'home' && matchHomeTeamId && teamId && teamId !== matchHomeTeamId) {
    issues.push(createEventIssue('invalidSide', 'Event side must match the selected team', ['side']))
  }

  if (side === 'away' && matchAwayTeamId && teamId && teamId !== matchAwayTeamId) {
    issues.push(createEventIssue('invalidSide', 'Event side must match the selected team', ['side']))
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

function validateMatchEvents({
  events = [],
  context = {},
} = {}) {
  const sourceEvents = Array.isArray(events) ? events : []
  const normalizedEvents = normalizeMatchEvents(sourceEvents, context.match || {})
  const eventIssues = normalizedEvents.map((event, index) => ({
    eventId: event.id,
    ...validateMatchEvent(event, context, sourceEvents[index] || event),
  }))

  const issues = eventIssues.flatMap((entry) =>
    entry.issues.map((issue) => ({
      ...issue,
      eventId: entry.eventId,
    })),
  )

  return {
    valid: issues.length === 0,
    issues,
    eventIssues,
    events: normalizedEvents,
  }
}

export {
  createEventIssue,
  validateMatchEvent,
  validateMatchEvents,
}
