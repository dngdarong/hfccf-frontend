import { calculateMatchScore } from '../calculateMatchScore'
import { normalizeMatchEvents, normalizeText } from '../normalizeMatchEvents'
import { normalizeScoreValue } from '../calculateStandings'

function clone(value) {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch {
      return JSON.parse(JSON.stringify(value))
    }
  }

  return JSON.parse(JSON.stringify(value))
}

function normalizeMatchStatus(value) {
  const status = normalizeText(value).toLowerCase()
  return ['scheduled', 'live', 'completed', 'postponed', 'cancelled'].includes(status) ? status : 'scheduled'
}

function normalizeTeamRecord(team = {}, index = 0) {
  return {
    id: normalizeText(team.id || team.teamId || `team-${String(index + 1).padStart(2, '0')}`),
    name: normalizeText(team.name || team.teamName || team.id || team.teamId || `Team ${index + 1}`),
    ...clone(team),
  }
}

function normalizeFixtureScore(score = {}) {
  return {
    home: normalizeScoreValue(score?.home),
    away: normalizeScoreValue(score?.away),
  }
}

function normalizeFixtureRecord(fixture = {}, index = 0) {
  const normalizedEvents = normalizeMatchEvents(Array.isArray(fixture.events) ? fixture.events : [], fixture)
  const eventScore = calculateMatchScore({
    match: fixture,
    events: normalizedEvents,
  })
  const resolvedScore = eventScore.hasScoringEvents
    ? eventScore.score
    : normalizeFixtureScore(fixture.score)

  return {
    ...clone(fixture),
    id: normalizeText(fixture.id || `fixture-${String(index + 1).padStart(2, '0')}`),
    status: normalizeMatchStatus(fixture.status),
    score: normalizeFixtureScore(fixture.score),
    resolvedScore,
    eventScore,
    events: normalizedEvents,
    groupId: normalizeText(fixture.groupId),
    groupName: normalizeText(fixture.groupName),
    roundKey: normalizeText(fixture.roundKey),
    roundLabelKey: normalizeText(fixture.roundLabelKey),
    matchday: Number(fixture.matchday || 0) || 0,
    venue: normalizeText(fixture.venue),
    dateTime: normalizeText(fixture.dateTime),
  }
}

function normalizeStatisticsInput(tournament = {}) {
  const source = tournament && typeof tournament === 'object' ? tournament : {}

  return {
    tournamentId: normalizeText(source.id),
    tournamentName: normalizeText(source.name),
    rules: clone(source.rules || {}),
    teams: Array.isArray(source.teams) ? source.teams.map((team, index) => normalizeTeamRecord(team, index)) : [],
    fixtures: Array.isArray(source.fixtures) ? source.fixtures.map((fixture, index) => normalizeFixtureRecord(fixture, index)) : [],
    standings: Array.isArray(source.standings) ? clone(source.standings) : [],
    groupDraw: clone(source.groupDraw || {}),
    statistics: clone(source.statistics || {}),
  }
}

function resolveStatisticsFixtureScore(fixture = {}) {
  if (fixture?.eventScore?.hasScoringEvents) {
    return {
      home: normalizeScoreValue(fixture.eventScore.score?.home),
      away: normalizeScoreValue(fixture.eventScore.score?.away),
    }
  }

  if (fixture?.resolvedScore) {
    return {
      home: normalizeScoreValue(fixture.resolvedScore.home),
      away: normalizeScoreValue(fixture.resolvedScore.away),
    }
  }

  return normalizeFixtureScore(fixture?.score)
}

export {
  clone,
  normalizeFixtureRecord,
  normalizeFixtureScore,
  normalizeMatchStatus,
  normalizeStatisticsInput,
  normalizeTeamRecord,
  resolveStatisticsFixtureScore,
}
