function normalizeTeamId(team) {
  return String(team?.id ?? team ?? '').trim()
}

function normalizeTeamRecord(team) {
  const id = normalizeTeamId(team)

  if (!id) return null

  return {
    id,
    name: String(team?.name || id).trim(),
    status: String(team?.status || 'active').trim(),
    seeded: Boolean(team?.seeded),
    seedRank: team?.seedRank === null || team?.seedRank === undefined || team?.seedRank === ''
      ? null
      : Number(team.seedRank) || null,
  }
}

function createGroupName(index) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const safeIndex = Number(index) || 0

  if (safeIndex < letters.length) {
    return `Group ${letters[safeIndex]}`
  }

  return `Group ${safeIndex + 1}`
}

export function createTournamentGroupSkeleton(index, qualificationSlots = 2) {
  return {
    id: `group-${String(Number(index) + 1).padStart(2, '0')}`,
    name: createGroupName(index),
    teamIds: [],
    qualificationSlots: Math.max(1, Number(qualificationSlots) || 1),
    locked: false,
  }
}

export function createTournamentGroupSkeletons(groupCount = 1, qualificationSlots = 2) {
  return Array.from({ length: Math.max(1, Number(groupCount) || 1) }, (_, index) =>
    createTournamentGroupSkeleton(index, qualificationSlots),
  )
}

export function createTournamentGroupOptions(groupCount = 1) {
  return Array.from({ length: Math.max(1, Number(groupCount) || 1) }, (_, index) => ({
    label: createGroupName(index),
    value: `group-${String(index + 1).padStart(2, '0')}`,
  }))
}

export function resolveTournamentGroupTeams(group, teams = []) {
  const teamMap = new Map((Array.isArray(teams) ? teams : []).map((team) => [normalizeTeamId(team), normalizeTeamRecord(team)]))

  return (Array.isArray(group?.teamIds) ? group.teamIds : [])
    .map((teamId) => teamMap.get(normalizeTeamId(teamId)))
    .filter(Boolean)
}

export function resolveTournamentGroupCards(groups = [], teams = [], teamsPerGroup = 0) {
  const safeTeamsPerGroup = Math.max(1, Number(teamsPerGroup) || 1)

  return (Array.isArray(groups) ? groups : []).map((group, index) => {
    const resolvedTeams = resolveTournamentGroupTeams(group, teams)
    const assignedCount = resolvedTeams.length

    return {
      id: String(group?.id || `group-${String(index + 1).padStart(2, '0')}`),
      name: String(group?.name || createGroupName(index)),
      locked: Boolean(group?.locked),
      qualificationSlots: Math.max(1, Number(group?.qualificationSlots ?? 2) || 1),
      teamIds: Array.isArray(group?.teamIds) ? [...new Set(group.teamIds.map(normalizeTeamId).filter(Boolean))] : [],
      teams: resolvedTeams,
      assignedCount,
      capacity: safeTeamsPerGroup,
      remainingSlots: Math.max(0, safeTeamsPerGroup - assignedCount),
      isFull: assignedCount >= safeTeamsPerGroup,
      isEmpty: assignedCount === 0,
    }
  })
}

function shuffleList(items = []) {
  const list = [...items]

  for (let index = list.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = list[index]
    list[index] = list[randomIndex]
    list[randomIndex] = current
  }

  return list
}

function compareSeededTeams(left, right) {
  const leftRank = left?.seedRank === null || left?.seedRank === undefined ? Number.POSITIVE_INFINITY : Number(left.seedRank)
  const rightRank = right?.seedRank === null || right?.seedRank === undefined ? Number.POSITIVE_INFINITY : Number(right.seedRank)

  if (leftRank !== rightRank) {
    return leftRank - rightRank
  }

  return String(left?.name || '').localeCompare(String(right?.name || ''))
}

export function generateTournamentGroupPreview({
  teams = [],
  groupCount = 4,
  teamsPerGroup = 4,
  qualificationCount = 2,
  seededMode = true,
  seedTeamIds = [],
} = {}) {
  const normalizedTeams = (Array.isArray(teams) ? teams : [])
    .map(normalizeTeamRecord)
    .filter(Boolean)

  const safeGroupCount = Math.max(1, Number(groupCount) || 1)
  const safeTeamsPerGroup = Math.max(1, Number(teamsPerGroup) || 1)
  const safeQualificationCount = Math.max(1, Math.min(Number(qualificationCount) || 1, safeTeamsPerGroup))
  const groups = createTournamentGroupSkeletons(safeGroupCount, safeQualificationCount)
  const assignedTeamIds = new Set()
  const explicitSeedIds = new Set((Array.isArray(seedTeamIds) ? seedTeamIds : []).map(normalizeTeamId).filter(Boolean))

  const seededTeams = normalizedTeams
    .filter((team) => seededMode && (team.seeded || team.seedRank !== null || explicitSeedIds.has(team.id)))
    .sort(compareSeededTeams)

  seededTeams.forEach((team) => {
    if (assignedTeamIds.has(team.id)) {
      return
    }

    const availableGroups = groups.filter((group) => group.teamIds.length < safeTeamsPerGroup)
    if (!availableGroups.length) {
      return
    }

    const minSize = Math.min(...availableGroups.map((group) => group.teamIds.length))
    const targetCandidates = availableGroups.filter((group) => group.teamIds.length === minSize)
    const target = targetCandidates[Math.floor(Math.random() * targetCandidates.length)]

    if (!target) return

    target.teamIds.push(team.id)
    assignedTeamIds.add(team.id)
  })

  const shuffledTeams = shuffleList(
    normalizedTeams.filter((team) => !assignedTeamIds.has(team.id)),
  )

  shuffledTeams.forEach((team) => {
    const availableGroups = groups.filter((group) => group.teamIds.length < safeTeamsPerGroup)

    if (!availableGroups.length) {
      return
    }

    const minSize = Math.min(...availableGroups.map((group) => group.teamIds.length))
    const targetCandidates = availableGroups.filter((group) => group.teamIds.length === minSize)
    const target = targetCandidates[Math.floor(Math.random() * targetCandidates.length)]

    target.teamIds.push(team.id)
    assignedTeamIds.add(team.id)
  })

  const unassignedTeams = normalizedTeams.filter((team) => !assignedTeamIds.has(team.id))
  const totalCapacity = safeGroupCount * safeTeamsPerGroup
  const assignedCount = assignedTeamIds.size
  const groupSizes = groups.map((group) => group.teamIds.length)
  const minGroupSize = groupSizes.length ? Math.min(...groupSizes) : 0
  const maxGroupSize = groupSizes.length ? Math.max(...groupSizes) : 0
  const warnings = []

  if (unassignedTeams.length) {
    warnings.push({
      type: 'overflow',
      messageKey: 'sportTournament.groups.validation.overCapacity',
      count: unassignedTeams.length,
    })
  }

  if (groups.some((group) => group.teamIds.length === 0)) {
    warnings.push({
      type: 'emptyGroup',
      messageKey: 'sportTournament.groups.validation.emptyGroup',
      count: groups.filter((group) => group.teamIds.length === 0).length,
    })
  }

  if (maxGroupSize - minGroupSize > 1) {
    warnings.push({
      type: 'balance',
      messageKey: 'sportTournament.groups.validation.unbalancedGroups',
      count: maxGroupSize - minGroupSize,
    })
  }

  return {
    groups,
    summary: {
      groupCount: safeGroupCount,
      teamsPerGroup: safeTeamsPerGroup,
      qualificationCount: safeQualificationCount,
      capacity: totalCapacity,
      assignedCount,
      unassignedCount: unassignedTeams.length,
      seededCount: seededTeams.length,
      fillRate: totalCapacity ? Math.round((assignedCount / totalCapacity) * 100) : 0,
    },
    seedTeams: seededTeams,
    unassignedTeams,
    warnings,
  }
}

export function assignTournamentTeamToGroup(groups = [], teamId = '', groupId = '', teamsPerGroup = 0) {
  const normalizedTeamId = normalizeTeamId(teamId)
  const normalizedGroupId = String(groupId || '').trim()
  const safeTeamsPerGroup = Math.max(1, Number(teamsPerGroup) || 1)

  if (!normalizedTeamId || !normalizedGroupId) {
    return groups
  }

  const nextGroups = (Array.isArray(groups) ? groups : []).map((group) => ({
    ...group,
    teamIds: Array.isArray(group?.teamIds) ? group.teamIds.map(normalizeTeamId).filter(Boolean) : [],
  }))

  nextGroups.forEach((group) => {
    group.teamIds = group.teamIds.filter((currentTeamId) => currentTeamId !== normalizedTeamId)
  })

  const target = nextGroups.find((group) => String(group.id || '').trim() === normalizedGroupId)
  if (!target || target.teamIds.length >= safeTeamsPerGroup) {
    return nextGroups
  }

  target.teamIds.push(normalizedTeamId)
  return nextGroups
}

export function removeTournamentTeamFromGroups(groups = [], teamId = '') {
  const normalizedTeamId = normalizeTeamId(teamId)

  if (!normalizedTeamId) {
    return groups
  }

  return (Array.isArray(groups) ? groups : []).map((group) => ({
    ...group,
    teamIds: Array.isArray(group?.teamIds)
      ? group.teamIds.map(normalizeTeamId).filter((currentTeamId) => currentTeamId && currentTeamId !== normalizedTeamId)
      : [],
  }))
}
