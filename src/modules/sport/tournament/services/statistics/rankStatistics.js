function normalizeText(value) {
  return String(value || '').trim()
}

function compareLabel(left = {}, right = {}, key = 'name') {
  return normalizeText(left?.[key]).localeCompare(normalizeText(right?.[key]))
}

function compareTopScorers(left = {}, right = {}) {
  if (right.goals !== left.goals) return right.goals - left.goals
  if (right.assists !== left.assists) return right.assists - left.assists
  return compareLabel(left, right, 'playerName')
}

function compareAssistProviders(left = {}, right = {}) {
  if (right.assists !== left.assists) return right.assists - left.assists
  if (right.goals !== left.goals) return right.goals - left.goals
  return compareLabel(left, right, 'playerName')
}

function compareFairPlayRows(left = {}, right = {}) {
  if (left.fairPlayPoints !== right.fairPlayPoints) return left.fairPlayPoints - right.fairPlayPoints
  if (left.redCards !== right.redCards) return left.redCards - right.redCards
  if (left.yellowCards !== right.yellowCards) return left.yellowCards - right.yellowCards
  return compareLabel(left, right, 'teamName')
}

function compareBestAttackRows(left = {}, right = {}) {
  if (right.goalsFor !== left.goalsFor) return right.goalsFor - left.goalsFor
  if (right.goalDifference !== left.goalDifference) return right.goalDifference - left.goalDifference
  return compareLabel(left, right, 'teamName')
}

function compareBestDefenseRows(left = {}, right = {}) {
  if (left.goalsAgainst !== right.goalsAgainst) return left.goalsAgainst - right.goalsAgainst
  if (right.cleanSheets !== left.cleanSheets) return right.cleanSheets - left.cleanSheets
  return compareLabel(left, right, 'teamName')
}

function comparePlayerDisciplineRows(left = {}, right = {}) {
  if (left.disciplinePoints !== right.disciplinePoints) return left.disciplinePoints - right.disciplinePoints
  if (left.redCards !== right.redCards) return left.redCards - right.redCards
  if (left.yellowCards !== right.yellowCards) return left.yellowCards - right.yellowCards
  return compareLabel(left, right, 'playerName')
}

function rankStatistics(rows = [], comparator = compareLabel, limit = 10) {
  return [...(Array.isArray(rows) ? rows : [])]
    .sort(comparator)
    .slice(0, Math.max(0, Number(limit) || 0) || undefined)
}

export {
  compareAssistProviders,
  compareBestAttackRows,
  compareBestDefenseRows,
  compareFairPlayRows,
  compareLabel,
  comparePlayerDisciplineRows,
  compareTopScorers,
  rankStatistics,
}
