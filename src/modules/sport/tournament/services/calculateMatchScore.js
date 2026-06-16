import { isScoringEventType, normalizeMatchEvents, normalizeText } from './normalizeMatchEvents'

function resolveEventSide(event = {}, match = {}) {
  const side = normalizeText(event.side).toLowerCase()
  if (side === 'home' || side === 'away') {
    return side
  }

  const homeTeamId = normalizeText(match.homeTeamId)
  const awayTeamId = normalizeText(match.awayTeamId)
  const teamId = normalizeText(event.teamId)

  if (teamId && homeTeamId && teamId === homeTeamId) return 'home'
  if (teamId && awayTeamId && teamId === awayTeamId) return 'away'

  return 'home'
}

export function calculateMatchScore({
  match = {},
  events = [],
} = {}) {
  const normalizedEvents = normalizeMatchEvents(events, match)

  const score = normalizedEvents.reduce((carry, event) => {
    if (!isScoringEventType(event.type) && String(event.type || '').toLowerCase() !== 'own_goal') {
      return carry
    }

    const side = resolveEventSide(event, match)
    const scoringSide = String(event.type || '').toLowerCase() === 'own_goal'
      ? (side === 'home' ? 'away' : 'home')
      : side

    if (scoringSide === 'away') {
      carry.away += 1
    } else {
      carry.home += 1
    }

    return carry
  }, { home: 0, away: 0 })

  const scoringEventCount = normalizedEvents.filter((event) =>
    isScoringEventType(event.type) || String(event.type || '').toLowerCase() === 'own_goal',
  ).length

  return {
    score,
    hasEvents: normalizedEvents.length > 0,
    hasScoringEvents: scoringEventCount > 0,
    scoringEventCount,
    events: normalizedEvents,
  }
}

export { resolveEventSide }
