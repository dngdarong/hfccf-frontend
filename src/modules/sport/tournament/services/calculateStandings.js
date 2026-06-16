import { buildHeadToHeadTable, compareStandingRows, isCountableFixture, normalizeScoreValue, normalizeTeamId, normalizeText } from './resolveTieBreakers'

function createEmptyStandingRow(team, qualificationSlots = 0) {
  return {
    teamId: normalizeText(team?.id),
    teamName: normalizeText(team?.name) || normalizeText(team?.id),
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    qualificationSlots,
    qualified: false,
  }
}

function updateStandingRow(row, scoredFor = 0, scoredAgainst = 0, rules = {}) {
  const pointsWin = Number(rules.pointsWin ?? 3)
  const pointsDraw = Number(rules.pointsDraw ?? 1)
  const pointsLoss = Number(rules.pointsLoss ?? 0)

  row.played += 1
  row.goalsFor += scoredFor
  row.goalsAgainst += scoredAgainst
  row.goalDifference = row.goalsFor - row.goalsAgainst

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

function resolveFixtureScore(fixture = {}) {
  const eventScore = fixture?.eventScore?.hasScoringEvents ? fixture?.eventScore?.score : null

  return {
    home: normalizeScoreValue(eventScore?.home ?? fixture?.score?.home),
    away: normalizeScoreValue(eventScore?.away ?? fixture?.score?.away),
  }
}

function collectGroupTeamRecords(group = {}, teams = []) {
  const teamIds = Array.isArray(group?.teamIds) ? group.teamIds : []
  return teamIds
    .map((teamId) => {
      const normalizedTeamId = normalizeTeamId(teamId)
      const record = (Array.isArray(teams) ? teams : []).find((team) => normalizeTeamId(team) === normalizedTeamId)

      return record || {
        id: normalizedTeamId,
        name: normalizedTeamId,
      }
    })
    .filter((team) => normalizeTeamId(team))
}

function sortRowsWithTieBreakers(rows = [], fixtures = [], rules = {}) {
  const baseGroups = []
  const orderedRows = [...(Array.isArray(rows) ? rows : [])].sort(compareStandingRows)

  for (const row of orderedRows) {
    const lastGroup = baseGroups[baseGroups.length - 1]
    const lastRow = lastGroup?.rows?.[0]

    if (
      lastGroup &&
      lastRow &&
      lastRow.points === row.points &&
      lastRow.goalDifference === row.goalDifference &&
      lastRow.goalsFor === row.goalsFor
    ) {
      lastGroup.rows.push(row)
      continue
    }

    baseGroups.push({
      signature: `${row.points}:${row.goalDifference}:${row.goalsFor}`,
      rows: [row],
    })
  }

  return baseGroups.flatMap((group) => {
    if (group.rows.length < 2) {
      return group.rows
    }

    const headToHeadByTeamId = buildHeadToHeadTable({
      rows: group.rows,
      fixtures,
      rules,
    })

    return [...group.rows].sort((left, right) => compareStandingRows(left, right, { headToHeadByTeamId }))
  })
}

export function calculateTournamentGroupStandings({
  group = {},
  teams = [],
  fixtures = [],
  rules = {},
} = {}) {
  const qualificationSlots = Math.max(1, Number(group?.qualificationSlots ?? rules?.qualificationSlots ?? 2) || 1)
  const groupId = normalizeText(group?.id)
  const groupTeams = collectGroupTeamRecords(group, teams)
  const rows = groupTeams.map((team) => createEmptyStandingRow(team, qualificationSlots))
  const rowMap = new Map(rows.map((row) => [row.teamId, row]))
  const groupFixtures = (Array.isArray(fixtures) ? fixtures : []).filter((fixture) => normalizeText(fixture?.groupId) === groupId)

  groupFixtures.forEach((fixture) => {
    if (!isCountableFixture(fixture)) {
      return
    }

    const homeRow = rowMap.get(normalizeTeamId(fixture?.homeTeamId))
    const awayRow = rowMap.get(normalizeTeamId(fixture?.awayTeamId))

    if (!homeRow || !awayRow) {
      return
    }

    const score = resolveFixtureScore(fixture)
    updateStandingRow(homeRow, score.home, score.away, rules)
    updateStandingRow(awayRow, score.away, score.home, rules)
  })

  const sortedRows = sortRowsWithTieBreakers(
    rows.map((row) => ({
      ...row,
      goalDifference: row.goalsFor - row.goalsAgainst,
    })),
    groupFixtures,
    rules,
  ).map((row, index) => ({
    ...row,
    position: index + 1,
    qualified: index < qualificationSlots,
  }))

  return {
    groupId,
    groupName: normalizeText(group?.name),
    qualificationSlots,
    rows: sortedRows,
    completedMatches: groupFixtures.filter((fixture) => String(fixture?.status || '').trim().toLowerCase() === 'completed').length,
    totalMatches: groupFixtures.length,
  }
}

export function calculateTournamentStandings({
  tournament = {},
} = {}) {
  const groups = Array.isArray(tournament?.groupDraw?.groups) ? tournament.groupDraw.groups : []
  const teams = Array.isArray(tournament?.teams) ? tournament.teams : []
  const fixtures = Array.isArray(tournament?.fixtures) ? tournament.fixtures : []
  const rules = tournament?.rules || {}

  const groupStandings = groups.map((group) =>
    calculateTournamentGroupStandings({
      group,
      teams,
      fixtures,
      rules,
    }),
  )

  return {
    groups: groupStandings,
    totalMatches: fixtures.length,
    completedMatches: fixtures.filter((fixture) => String(fixture?.status || '').trim().toLowerCase() === 'completed').length,
  }
}

export {
  collectGroupTeamRecords,
  createEmptyStandingRow,
  isCountableFixture,
  resolveFixtureScore,
  sortRowsWithTieBreakers,
  updateStandingRow,
  normalizeScoreValue,
  normalizeTeamId,
  normalizeText,
}
