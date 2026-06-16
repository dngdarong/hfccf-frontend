import { calculateTournamentStandings } from './calculateStandings'

export const TOURNAMENT_KNOCKOUT_BRACKET_SIZES = [4, 8, 16]

function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeNumber(value, fallback = 0) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function qualificationPriority(role) {
  if (role === 'winner') return 0
  if (role === 'runner_up') return 1
  if (role === 'third_place') return 2
  if (role === 'best_third_place') return 3
  return 4
}

function normalizeQualificationRole(position = 0) {
  if (position === 1) return 'winner'
  if (position === 2) return 'runner_up'
  if (position === 3) return 'third_place'
  return 'qualified'
}

function compareQualificationRows(left, right) {
  if (right.points !== left.points) return right.points - left.points
  if (right.goalDifference !== left.goalDifference) return right.goalDifference - left.goalDifference
  if (right.goalsFor !== left.goalsFor) return right.goalsFor - left.goalsFor
  if (left.position !== right.position) return left.position - right.position
  return String(left.teamName || '').localeCompare(String(right.teamName || ''))
}

function compareQualifierSeed(left, right) {
  if (left.seedPriority !== right.seedPriority) return left.seedPriority - right.seedPriority
  if (left.groupOrder !== right.groupOrder) return left.groupOrder - right.groupOrder
  if (left.position !== right.position) return left.position - right.position
  return compareQualificationRows(left, right)
}

function createQualificationRow(row = {}, group = {}, fallbackRole = 'qualified', groupOrder = 0) {
  const position = normalizeNumber(row.position, 0)
  const role = fallbackRole || normalizeQualificationRole(position)

  return {
    teamId: normalizeText(row.teamId),
    teamName: normalizeText(row.teamName) || normalizeText(row.teamId),
    groupId: normalizeText(group.groupId),
    groupName: normalizeText(group.groupName),
    groupOrder,
    position,
    points: normalizeNumber(row.points, 0),
    goalDifference: normalizeNumber(row.goalDifference, 0),
    goalsFor: normalizeNumber(row.goalsFor, 0),
    goalsAgainst: normalizeNumber(row.goalsAgainst, 0),
    qualificationSlots: normalizeNumber(group.qualificationSlots, 0),
    role,
    seedPriority: qualificationPriority(role),
    qualified: true,
  }
}

function createGroupQualification(group = {}, groupOrder = 0) {
  const rows = Array.isArray(group.rows) ? group.rows : []
  const qualificationSlots = Math.max(1, normalizeNumber(group.qualificationSlots, 2) || 2)
  const qualifiedRows = rows
    .slice(0, qualificationSlots)
    .map((row) => createQualificationRow(row, {
      groupId: group.groupId,
      groupName: group.groupName,
      qualificationSlots,
    }, normalizeQualificationRole(row.position), groupOrder))

  const thirdPlaceRow = rows[2]
    ? createQualificationRow(rows[2], {
      groupId: group.groupId,
      groupName: group.groupName,
      qualificationSlots,
    }, 'third_place', groupOrder)
    : null

  return {
    groupId: normalizeText(group.groupId),
    groupName: normalizeText(group.groupName),
    qualificationSlots,
    rows,
    qualifiedRows,
    thirdPlaceRow,
  }
}

export function createKnockoutSettingsSnapshot(source = {}) {
  return {
    qualificationSlots: Math.max(1, normalizeNumber(source.qualificationSlots, 2) || 2),
    includeThirdPlaceTeams: Boolean(source.includeThirdPlaceTeams),
    bestThirdPlaceTeams: Math.max(0, normalizeNumber(source.bestThirdPlaceTeams, 0) || 0),
    thirdPlaceMatchEnabled: Boolean(source.thirdPlaceMatchEnabled),
    extraTimeEnabled: Boolean(source.extraTimeEnabled),
    penaltyEnabled: Boolean(source.penaltyEnabled),
    seededMode: Boolean(source.seededMode ?? true),
    autoGenerateBracket: Boolean(source.autoGenerateBracket ?? true),
  }
}

export function selectTournamentQualifiers({
  tournament = {},
  settings = {},
} = {}) {
  const standings = Array.isArray(tournament?.standings) && tournament.standings.length
    ? tournament.standings
    : calculateTournamentStandings({ tournament }).groups
  const knockoutSettings = createKnockoutSettingsSnapshot({
    ...settings,
    qualificationSlots: settings.qualificationSlots ?? standings?.[0]?.qualificationSlots ?? 2,
  })

  const groupQualifications = standings.map((group, index) => createGroupQualification({
    ...group,
    qualificationSlots: group?.qualificationSlots ?? knockoutSettings.qualificationSlots,
  }, index))

  const qualifiers = []
  const seenTeamIds = new Set()

  groupQualifications.forEach((group, groupOrder) => {
    group.qualifiedRows.forEach((row, index) => {
      const teamId = normalizeText(row.teamId)
      if (!teamId || seenTeamIds.has(teamId)) return

      seenTeamIds.add(teamId)
      qualifiers.push({
        ...row,
        groupOrder,
        groupIndex: groupOrder,
        seedPriority: qualificationPriority(row.role),
        seedRank: qualifiers.length + 1,
        slotIndex: index + 1,
      })
    })
  })

  const thirdPlacePool = groupQualifications
    .map((group) => group.thirdPlaceRow)
    .filter(Boolean)
    .filter((row) => !seenTeamIds.has(row.teamId))
    .sort(compareQualificationRows)

  if (knockoutSettings.includeThirdPlaceTeams && knockoutSettings.bestThirdPlaceTeams > 0) {
    thirdPlacePool.slice(0, knockoutSettings.bestThirdPlaceTeams).forEach((row) => {
      const teamId = normalizeText(row.teamId)
      if (!teamId || seenTeamIds.has(teamId)) return

      seenTeamIds.add(teamId)
      qualifiers.push({
        ...row,
        role: 'best_third_place',
        seedPriority: qualificationPriority('best_third_place'),
        seedRank: qualifiers.length + 1,
        slotIndex: 3,
      })
    })
  }

  const orderedQualifiers = qualifiers
    .map((qualifier, index) => ({
      ...qualifier,
      seedOrder: index + 1,
    }))
    .sort(compareQualifierSeed)
    .map((qualifier, index) => ({
      ...qualifier,
      bracketSeed: index + 1,
    }))

  const bracketSize = TOURNAMENT_KNOCKOUT_BRACKET_SIZES.includes(orderedQualifiers.length)
    ? orderedQualifiers.length
    : 0

  const issues = []
  if (!standings.length) {
    issues.push({ code: 'missingStandings' })
  }
  if (!bracketSize) {
    issues.push({ code: 'invalidBracketSize', value: orderedQualifiers.length })
  }

  return {
    standings,
    knockoutSettings,
    groupQualifications,
    qualifiers: orderedQualifiers,
    bracketSize,
    issues,
    ready: issues.length === 0,
  }
}

export function validateKnockoutReadiness(result = {}) {
  const issues = Array.isArray(result.issues) ? result.issues : []
  return {
    ready: Boolean(result.ready) && issues.length === 0,
    issues,
  }
}

export {
  compareQualificationRows,
  compareQualifierSeed,
  createGroupQualification,
  normalizeQualificationRole,
  normalizeNumber,
  normalizeText,
  qualificationPriority,
}
