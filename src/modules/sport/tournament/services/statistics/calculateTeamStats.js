import { normalizeScoreValue } from '../calculateStandings'
import { normalizeEventType, normalizeText } from '../normalizeMatchEvents'
import {
  getDisciplinePoints,
  resolveEventTeamId,
} from './eventStatRules'
import { normalizeStatisticsInput, resolveStatisticsFixtureScore } from './normalizeStatisticsInput'

function createEmptyTeamRow(team = {}, index = 0) {
  return {
    teamId: normalizeText(team.id || team.teamId || `team-${String(index + 1).padStart(2, '0')}`),
    teamName: normalizeText(team.name || team.teamName || team.id || team.teamId || `Team ${index + 1}`),
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    cleanSheets: 0,
    yellowCards: 0,
    redCards: 0,
    cards: 0,
    fairPlayPoints: 0,
    points: 0,
  }
}

function ensureTeamRow(rows = new Map(), team = {}, index = 0) {
  const teamId = normalizeText(team.id || team.teamId)
  if (!teamId) return null

  if (!rows.has(teamId)) {
    rows.set(teamId, createEmptyTeamRow(team, index))
  }

  const row = rows.get(teamId)
  if (!row.teamName) {
    row.teamName = normalizeText(team.name || team.teamName || teamId)
  }

  return row
}

function updateTeamResult(row = {}, scoredFor = 0, scoredAgainst = 0, rules = {}) {
  const pointsWin = Number(rules.pointsWin ?? 3)
  const pointsDraw = Number(rules.pointsDraw ?? 1)
  const pointsLoss = Number(rules.pointsLoss ?? 0)

  row.played += 1
  row.goalsFor += scoredFor
  row.goalsAgainst += scoredAgainst
  row.goalDifference = row.goalsFor - row.goalsAgainst

  if (scoredAgainst === 0) {
    row.cleanSheets += 1
  }

  if (scoredFor > scoredAgainst) {
    row.wins += 1
    row.points += pointsWin
    return
  }

  if (scoredFor < scoredAgainst) {
    row.losses += 1
    row.points += pointsLoss
    return
  }

  row.draws += 1
  row.points += pointsDraw
}

function applyTeamDiscipline(row = {}, event = {}) {
  const type = normalizeEventType(event.type)
  if (type !== 'yellow_card' && type !== 'red_card') {
    return
  }

  row.cards += 1
  if (type === 'yellow_card') {
    row.yellowCards += 1
  }
  if (type === 'red_card') {
    row.redCards += 1
  }
  row.fairPlayPoints += getDisciplinePoints(type)
}

function resolveTeamForEvent(event = {}, fixture = {}) {
  return resolveEventTeamId(event, fixture)
}

export function calculateTeamStats({
  tournament = {},
  fixtures = [],
  teams = [],
} = {}) {
  const normalized = normalizeStatisticsInput(tournament)
  const sourceFixtures = Array.isArray(fixtures) && fixtures.length ? fixtures : normalized.fixtures
  const sourceTeams = Array.isArray(teams) && teams.length ? teams : normalized.teams
  const rows = new Map()

  sourceTeams.forEach((team, index) => {
    ensureTeamRow(rows, team, index)
  })

  sourceFixtures.forEach((fixture) => {
    const status = String(fixture.status || '').trim().toLowerCase()
    if (status === 'cancelled' || status === 'postponed') {
      return
    }

    const homeRow = ensureTeamRow(rows, {
      id: fixture.homeTeamId,
      name: fixture.homeTeamName,
    })
    const awayRow = ensureTeamRow(rows, {
      id: fixture.awayTeamId,
      name: fixture.awayTeamName,
    })

    if (!homeRow || !awayRow) {
      return
    }

    const score = resolveStatisticsFixtureScore(fixture)
    const homeScore = normalizeScoreValue(score.home)
    const awayScore = normalizeScoreValue(score.away)

    if (homeScore !== null && awayScore !== null) {
      updateTeamResult(homeRow, homeScore, awayScore, normalized.rules)
      updateTeamResult(awayRow, awayScore, homeScore, normalized.rules)
    }

    ;(Array.isArray(fixture.events) ? fixture.events : []).forEach((event) => {
      const teamId = resolveTeamForEvent(event, fixture)
      if (!teamId) return

      const teamRow = rows.get(teamId)
      if (!teamRow) return

      applyTeamDiscipline(teamRow, event)
    })
  })

  return [...rows.values()].sort((left, right) =>
    normalizeText(left.teamName).localeCompare(normalizeText(right.teamName)),
  )
}

export {
  applyTeamDiscipline,
  createEmptyTeamRow,
  ensureTeamRow,
  resolveTeamForEvent,
  updateTeamResult,
}
