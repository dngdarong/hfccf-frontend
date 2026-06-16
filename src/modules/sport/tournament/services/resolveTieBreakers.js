function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeTeamId(team) {
  return String(team?.id ?? team?.teamId ?? team ?? '').trim()
}

function normalizeScoreValue(value) {
  if (value === null || value === undefined || value === '') return null

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

function createSummaryRow(team) {
  return {
    teamId: normalizeTeamId(team),
    teamName: normalizeText(team?.name ?? team?.teamName ?? team),
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  }
}

function updateSummaryRow(row, scoredFor = 0, scoredAgainst = 0, rules = {}) {
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

function isCountableFixture(fixture = {}) {
  const status = String(fixture?.status || '').trim().toLowerCase()
  if (status === 'cancelled' || status === 'postponed') return false

  const scoreSource = fixture?.eventScore?.hasScoringEvents ? fixture?.eventScore?.score : fixture?.score
  const homeScore = normalizeScoreValue(scoreSource?.home)
  const awayScore = normalizeScoreValue(scoreSource?.away)

  return homeScore !== null && awayScore !== null
}

function compareBaseStandingRows(left, right) {
  if (right.points !== left.points) return right.points - left.points
  if (right.goalDifference !== left.goalDifference) return right.goalDifference - left.goalDifference
  if (right.goalsFor !== left.goalsFor) return right.goalsFor - left.goalsFor
  return String(left.teamName || '').localeCompare(String(right.teamName || ''))
}

function createHeadToHeadSummary(teamIds = []) {
  const uniqueTeamIds = [...new Set((Array.isArray(teamIds) ? teamIds : []).map((teamId) => normalizeTeamId(teamId)).filter(Boolean))]
  const map = new Map()

  uniqueTeamIds.forEach((teamId) => {
    map.set(teamId, createSummaryRow({ id: teamId }))
  })

  return map
}

function updateHeadToHeadSummary(summaryMap = new Map(), teamId, scoredFor, scoredAgainst, rules = {}) {
  const normalizedTeamId = normalizeTeamId(teamId)
  if (!normalizedTeamId) return

  if (!summaryMap.has(normalizedTeamId)) {
    summaryMap.set(normalizedTeamId, createSummaryRow({ id: normalizedTeamId }))
  }

  updateSummaryRow(summaryMap.get(normalizedTeamId), scoredFor, scoredAgainst, rules)
}

function buildHeadToHeadTable({
  rows = [],
  fixtures = [],
  rules = {},
} = {}) {
  const rowTeamIds = new Set((Array.isArray(rows) ? rows : []).map((row) => normalizeTeamId(row?.teamId)).filter(Boolean))
  const summaryMap = createHeadToHeadSummary(rowTeamIds)

  if (summaryMap.size < 2) {
    return summaryMap
  }

  ;(Array.isArray(fixtures) ? fixtures : []).forEach((fixture) => {
    if (!isCountableFixture(fixture)) return

    const homeTeamId = normalizeTeamId(fixture?.homeTeamId)
    const awayTeamId = normalizeTeamId(fixture?.awayTeamId)

    if (!homeTeamId || !awayTeamId) return
    if (!rowTeamIds.has(homeTeamId) || !rowTeamIds.has(awayTeamId)) return

    const scoreSource = fixture?.eventScore?.hasScoringEvents ? fixture?.eventScore?.score : fixture?.score
    const homeScore = normalizeScoreValue(scoreSource?.home)
    const awayScore = normalizeScoreValue(scoreSource?.away)

    if (homeScore === null || awayScore === null) return

    updateHeadToHeadSummary(summaryMap, homeTeamId, homeScore, awayScore, rules)
    updateHeadToHeadSummary(summaryMap, awayTeamId, awayScore, homeScore, rules)
  })

  return summaryMap
}

function compareHeadToHeadRows(left, right, headToHeadByTeamId) {
  const leftHeadToHead = headToHeadByTeamId?.get(left.teamId)
  const rightHeadToHead = headToHeadByTeamId?.get(right.teamId)

  if (!leftHeadToHead || !rightHeadToHead) {
    return 0
  }

  if (rightHeadToHead.points !== leftHeadToHead.points) return rightHeadToHead.points - leftHeadToHead.points
  if (rightHeadToHead.goalDifference !== leftHeadToHead.goalDifference) return rightHeadToHead.goalDifference - leftHeadToHead.goalDifference
  if (rightHeadToHead.goalsFor !== leftHeadToHead.goalsFor) return rightHeadToHead.goalsFor - leftHeadToHead.goalsFor
  return String(left.teamName || '').localeCompare(String(right.teamName || ''))
}

function compareStandingRows(left, right, context = {}) {
  const baseComparison = compareBaseStandingRows(left, right)
  if (baseComparison !== 0) {
    return baseComparison
  }

  const headToHeadComparison = compareHeadToHeadRows(left, right, context.headToHeadByTeamId)
  if (headToHeadComparison !== 0) {
    return headToHeadComparison
  }

  return String(left.teamName || '').localeCompare(String(right.teamName || ''))
}

export {
  buildHeadToHeadTable,
  compareBaseStandingRows,
  compareHeadToHeadRows,
  compareStandingRows,
  createHeadToHeadSummary,
  createSummaryRow,
  isCountableFixture,
  normalizeScoreValue,
  normalizeTeamId,
  normalizeText,
  updateHeadToHeadSummary,
  updateSummaryRow,
}
