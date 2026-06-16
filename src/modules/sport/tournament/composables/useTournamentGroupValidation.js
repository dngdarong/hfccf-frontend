import { normalizeTournamentState } from './useTournamentStateMachine'

function normalizeTeamId(team) {
  return String(team?.id ?? team ?? '').trim()
}

export function isTournamentGroupDrawEditable(state) {
  return normalizeTournamentState(state) === 'registration_closed'
}

export function normalizeTournamentGroupSettings(settings = {}, fallback = {}) {
  const source = settings && typeof settings === 'object' ? settings : {}
  const base = fallback && typeof fallback === 'object' ? fallback : {}
  const groupCount = Math.max(1, Number(source.groupCount ?? base.groupCount ?? 1) || 1)
  const teamsPerGroup = Math.max(1, Number(source.teamsPerGroup ?? base.teamsPerGroup ?? 1) || 1)
  const qualificationCount = Math.max(
    1,
    Math.min(Number(source.qualificationCount ?? base.qualificationCount ?? 1) || 1, teamsPerGroup),
  )

  return {
    groupCount,
    teamsPerGroup,
    qualificationCount,
    seededMode: Boolean(source.seededMode ?? base.seededMode ?? true),
    autoFixtureGeneration: Boolean(source.autoFixtureGeneration ?? base.autoFixtureGeneration ?? true),
  }
}

export function validateTournamentGroupDrawDraft({
  groups = [],
  teams = [],
  settings = {},
} = {}) {
  const normalizedSettings = normalizeTournamentGroupSettings(settings)
  const normalizedGroups = Array.isArray(groups) ? groups : []
  const normalizedTeams = Array.isArray(teams) ? teams : []
  const teamIds = new Set(normalizedTeams.map(normalizeTeamId).filter(Boolean))
  const assignedIds = new Set()
  const duplicateIds = new Set()
  const issues = []

  normalizedGroups.forEach((group, index) => {
    const groupTeamIds = Array.isArray(group?.teamIds) ? group.teamIds.map(normalizeTeamId).filter(Boolean) : []
    const seen = new Set()

    groupTeamIds.forEach((teamId) => {
      if (seen.has(teamId) || assignedIds.has(teamId)) {
        duplicateIds.add(teamId)
      }

      seen.add(teamId)
      assignedIds.add(teamId)
    })

    if (groupTeamIds.length === 0) {
      issues.push({
        type: 'emptyGroup',
        blocking: true,
        messageKey: 'sportTournament.groups.validation.emptyGroup',
        count: 1,
        groupId: String(group?.id || `group-${index + 1}`),
      })
    }

    if (groupTeamIds.length > normalizedSettings.teamsPerGroup) {
      issues.push({
        type: 'groupOverflow',
        blocking: true,
        messageKey: 'sportTournament.groups.validation.groupOverflow',
        count: groupTeamIds.length - normalizedSettings.teamsPerGroup,
        groupId: String(group?.id || `group-${index + 1}`),
      })
    }
  })

  if (normalizedGroups.length !== normalizedSettings.groupCount) {
    issues.push({
      type: 'groupCountMismatch',
      blocking: true,
      messageKey: 'sportTournament.groups.validation.groupCountMismatch',
      count: Math.abs(normalizedGroups.length - normalizedSettings.groupCount),
    })
  }

  const missingTeams = [...assignedIds].filter((teamId) => !teamIds.has(teamId))
  if (missingTeams.length) {
    issues.push({
      type: 'unknownTeams',
      blocking: true,
      messageKey: 'sportTournament.groups.validation.unknownTeams',
      teamIds: missingTeams,
      count: missingTeams.length,
    })
  }

  const duplicateTeamIds = [...duplicateIds]
  if (duplicateTeamIds.length) {
    issues.push({
      type: 'duplicateTeams',
      blocking: true,
      messageKey: 'sportTournament.groups.validation.duplicateTeams',
      teamIds: duplicateTeamIds,
      count: duplicateTeamIds.length,
    })
  }

  const totalCapacity = normalizedSettings.groupCount * normalizedSettings.teamsPerGroup
  const assignedCount = assignedIds.size

  if (assignedCount > totalCapacity) {
    issues.push({
      type: 'overCapacity',
      blocking: true,
      messageKey: 'sportTournament.groups.validation.overCapacity',
      count: assignedCount - totalCapacity,
    })
  }

  const sizes = normalizedGroups.map((group) => (Array.isArray(group?.teamIds) ? group.teamIds.length : 0))
  if (sizes.length && Math.max(...sizes) - Math.min(...sizes) > 1) {
    issues.push({
      type: 'unbalancedGroups',
      blocking: false,
      messageKey: 'sportTournament.groups.validation.unbalancedGroups',
      count: Math.max(...sizes) - Math.min(...sizes),
    })
  }

  return issues
}

export function canFinalizeTournamentGroupDraw({
  state,
  groups = [],
  teams = [],
  settings = {},
} = {}) {
  if (!isTournamentGroupDrawEditable(state)) {
    return false
  }

  const issues = validateTournamentGroupDrawDraft({ groups, teams, settings })
  return !issues.some((issue) => issue.blocking)
}

export function calculateGroupQualificationSlots(group = {}, settings = {}) {
  const teamCount = Array.isArray(group?.teamIds) ? group.teamIds.length : 0
  const source = settings && typeof settings === 'object' ? settings : {}
  const qualificationCount = Math.max(1, Number(source.qualificationCount ?? 1) || 1)

  return Math.min(qualificationCount, teamCount)
}
