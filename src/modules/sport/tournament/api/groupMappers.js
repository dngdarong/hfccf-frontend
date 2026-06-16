import { createTournamentGroupDrawDraft, normalizeTournamentGroupDraw } from '../mocks/tournaments.mock'

function deepClone(value) {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch {
      return JSON.parse(JSON.stringify(value))
    }
  }

  return JSON.parse(JSON.stringify(value))
}

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function createGroupCode(index) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const safeIndex = Number(index) || 0

  if (safeIndex < letters.length) {
    return letters[safeIndex]
  }

  return String(safeIndex + 1)
}

function normalizeGroupTeamAssignment(team, fallbackGroup = null) {
  const source = team && typeof team === 'object' ? team : {}
  const nestedTeam = source.team && typeof source.team === 'object' ? source.team : {}

  return {
    id: normalizeText(source.id || `${source.groupId || fallbackGroup?.id || 'group'}-${source.teamId || nestedTeam.id || 'team'}`),
    tournamentId: normalizeText(source.tournamentId || source.tournament_id || fallbackGroup?.tournamentId || ''),
    groupId: normalizeText(source.groupId || source.group_id || fallbackGroup?.id || ''),
    teamId: normalizeText(source.teamId || source.team_id || nestedTeam.id || ''),
    seed: source.seed === null || source.seed === undefined || source.seed === '' ? null : normalizeNumber(source.seed, null),
    pot: source.pot === null || source.pot === undefined || source.pot === '' ? null : normalizeNumber(source.pot, null),
    position: normalizeNumber(source.position, 0),
    status: normalizeText(source.status || 'assigned'),
    metadata: deepClone(source.metadata || {}),
    team: {
      id: normalizeText(nestedTeam.id || source.teamId || ''),
      teamCode: normalizeText(nestedTeam.teamCode || nestedTeam.team_code),
      name: normalizeText(nestedTeam.name || source.teamName || source.name || source.team_id || source.teamId),
      shortName: normalizeText(nestedTeam.shortName || nestedTeam.short_name),
      logo: normalizeText(nestedTeam.logo || ''),
      status: normalizeText(nestedTeam.status || source.teamStatus || ''),
    },
  }
}

function normalizeGroupRecord(group = {}, fallbackTournament = null, index = 0) {
  const source = group && typeof group === 'object' ? group : {}
  const fallbackSettings = fallbackTournament?.groupDraw?.settings || createTournamentGroupDrawDraft().settings
  const assignments = Array.isArray(source.teams) ? source.teams.map((team) => normalizeGroupTeamAssignment(team, source)) : []
  const teamIds = assignments.map((item) => item.teamId).filter(Boolean)
  const qualificationSlots = normalizeNumber(
    source.qualificationSlots ?? source.qualification_slots ?? fallbackSettings.qualificationCount ?? 1,
    1,
  )

  return {
    id: normalizeText(source.id || `group-${String(index + 1).padStart(2, '0')}`),
    tournamentId: normalizeText(source.tournamentId || source.tournament_id || fallbackTournament?.id || ''),
    name: normalizeText(source.name || `Group ${createGroupCode(index)}`),
    code: normalizeText(source.code || createGroupCode(index)),
    position: normalizeNumber(source.position, index + 1),
    qualificationSlots,
    status: normalizeText(source.status || 'draft'),
    locked: normalizeText(source.status || '') === 'finalized',
    finalizedAt: normalizeText(source.finalizedAt || source.finalized_at || ''),
    metadata: deepClone(source.metadata || {}),
    teamIds,
    teams: assignments,
    assignedCount: assignments.length,
    capacity: normalizeNumber(fallbackSettings.teamsPerGroup, assignments.length),
    remainingSlots: Math.max(0, normalizeNumber(fallbackSettings.teamsPerGroup, assignments.length) - assignments.length),
    isFull: assignments.length >= normalizeNumber(fallbackSettings.teamsPerGroup, assignments.length),
    isEmpty: assignments.length === 0,
  }
}

function normalizeGroupSettings(groups = [], fallbackTournament = null) {
  const fallbackSettings = normalizeTournamentGroupDraw(fallbackTournament?.groupDraw, fallbackTournament).settings
  const safeGroups = Array.isArray(groups) ? groups : []

  return {
    groupCount: safeGroups.length || normalizeNumber(fallbackSettings.groupCount, 1),
    teamsPerGroup: normalizeNumber(fallbackSettings.teamsPerGroup, 1),
    qualificationCount: normalizeNumber(
      safeGroups[0]?.qualificationSlots ?? fallbackSettings.qualificationCount ?? 1,
      1,
    ),
    seededMode: Boolean(fallbackSettings.seededMode ?? true),
    autoFixtureGeneration: Boolean(fallbackSettings.autoFixtureGeneration ?? true),
  }
}

function buildAssignments(groups = []) {
  return (Array.isArray(groups) ? groups : []).reduce((assignments, group, index) => {
    const groupCode = normalizeText(group?.code || group?.id || createGroupCode(index))

    ;(Array.isArray(group?.teamIds) ? group.teamIds : []).forEach((teamId) => {
      const normalizedTeamId = normalizeText(teamId)
      if (!normalizedTeamId) return

      // The backend draw service accepts either a code or an ID. Code is more stable
      // for the frontend because it stays human-readable across repeated draws.
      assignments[normalizedTeamId] = groupCode
    })

    return assignments
  }, {})
}

function buildGroupDrawSnapshot(groups = [], fallbackTournament = null) {
  const normalizedGroups = (Array.isArray(groups) ? groups : []).map((group, index) =>
    normalizeGroupRecord(group, fallbackTournament, index),
  )
  const baseSnapshot = normalizeTournamentGroupDraw(fallbackTournament?.groupDraw, fallbackTournament)

  return {
    ...baseSnapshot,
    settings: normalizeGroupSettings(normalizedGroups, fallbackTournament),
    locked: normalizedGroups.length ? normalizedGroups.every((group) => group.locked) : Boolean(baseSnapshot.locked),
    groups: normalizedGroups.length ? normalizedGroups : baseSnapshot.groups,
  }
}

export function normalizeTournamentGroupsResponse(response, fallbackTournament = null) {
  const payload = response?.data?.data ?? response?.data ?? {}
  const groups = Array.isArray(payload.groups) ? payload.groups : []
  const groupDraw = buildGroupDrawSnapshot(groups, fallbackTournament)
  const groupStandings = Array.isArray(payload.groupStandings) ? deepClone(payload.groupStandings) : []
  const standings = Array.isArray(payload.standings) ? deepClone(payload.standings) : []

  return {
    tournamentId: normalizeText(payload.tournamentId || payload.tournament_id || fallbackTournament?.id || ''),
    groupDraw: {
      ...groupDraw,
      mode: normalizeText(fallbackTournament?.groupDraw?.mode || groupDraw.mode || 'automatic'),
      lastGeneratedAt: normalizeText(fallbackTournament?.groupDraw?.lastGeneratedAt || groupDraw.lastGeneratedAt || ''),
    },
    groupStandings,
    standings,
    raw: payload,
  }
}

export function buildTournamentGroupsDrawPayload({ settings = {}, groups = [], reset = true } = {}) {
  const safeSettings = settings && typeof settings === 'object' ? settings : {}
  const safeGroups = Array.isArray(groups) ? groups : []

  return {
    group_count: Math.max(1, normalizeNumber(safeSettings.groupCount, safeGroups.length || 1)),
    qualification_slots: Math.max(1, normalizeNumber(safeSettings.qualificationCount, 1)),
    assignments: buildAssignments(safeGroups),
    reset: Boolean(reset),
  }
}

export function mergeTournamentGroupSnapshot(tournament = null, groupDraw = null) {
  const base = deepClone(tournament || {})
  const normalizedGroupDraw = groupDraw && typeof groupDraw === 'object'
    ? deepClone(groupDraw)
    : createTournamentGroupDrawDraft()

  return {
    ...base,
    groupDraw: normalizedGroupDraw,
  }
}

