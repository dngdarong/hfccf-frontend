import { computed, reactive, ref, watch } from 'vue'
function normalizeTournamentGroupDraw(value = {}, fallback = {}) {
  const source = value && typeof value === 'object' ? value : {}
  const base = fallback?.groupDraw || { settings: {}, groups: [], locked: false, mode: 'automatic', lastGeneratedAt: '' }
  return { ...base, ...source, settings: { ...base.settings, ...source.settings }, groups: Array.isArray(source.groups) ? source.groups : (base.groups || []) }
}
import {
  assignTournamentTeamToGroup,
  createTournamentGroupOptions,
  createTournamentGroupSkeletons,
  generateTournamentGroupPreview,
  removeTournamentTeamFromGroups,
  resolveTournamentGroupCards,
} from './useTournamentGroupGeneration'
import {
  canFinalizeTournamentGroupDraw,
  isTournamentGroupDrawEditable,
  normalizeTournamentGroupSettings,
  validateTournamentGroupDrawDraft,
} from './useTournamentGroupValidation'

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

function createEmptySnapshot(tournament) {
  const normalized = normalizeTournamentGroupDraw(tournament?.groupDraw, tournament)

  return {
    mode: normalized.mode,
    locked: normalized.locked,
    lastGeneratedAt: normalized.lastGeneratedAt,
    settings: normalized.settings,
    groups: normalized.groups,
  }
}

function buildGroupDrawPayload({ settings, groups, mode, locked, lastGeneratedAt }) {
  return {
    mode,
    locked,
    lastGeneratedAt,
    settings: deepClone(settings),
    groups: deepClone(groups),
  }
}

export function useTournamentGroupDraw(tournament, actions = {}) {
  const settings = reactive({
    groupCount: 4,
    teamsPerGroup: 4,
    qualificationCount: 2,
    seededMode: true,
    autoFixtureGeneration: true,
  })
  const mode = ref('automatic')
  const groups = ref(createTournamentGroupSkeletons(settings.groupCount, settings.qualificationCount))
  const previewVisible = ref(false)
  const previewGroups = ref([])
  const previewSummary = ref(null)
  const previewWarnings = ref([])
  const lastGeneratedAt = ref('')
  const initialSnapshot = ref(createEmptySnapshot(tournament?.value))

  const teams = computed(() => (Array.isArray(tournament?.value?.teams) ? tournament.value.teams : []))
  const state = computed(() => String(tournament?.value?.state || 'draft'))
  const groupOptions = computed(() => createTournamentGroupOptions(settings.groupCount))
  const resolvedGroups = computed(() => resolveTournamentGroupCards(groups.value, teams.value, settings.teamsPerGroup))
  const resolvedPreviewGroups = computed(() =>
    resolveTournamentGroupCards(previewGroups.value, teams.value, settings.teamsPerGroup),
  )
  const seedTeams = computed(() =>
    [...teams.value]
      .filter((team) => Boolean(team?.seeded) || (team?.seedRank !== null && team?.seedRank !== undefined))
      .sort((left, right) => {
        const leftRank = left?.seedRank === null || left?.seedRank === undefined ? Number.POSITIVE_INFINITY : Number(left.seedRank)
        const rightRank = right?.seedRank === null || right?.seedRank === undefined ? Number.POSITIVE_INFINITY : Number(right.seedRank)

        if (leftRank !== rightRank) return leftRank - rightRank
        return String(left?.name || '').localeCompare(String(right?.name || ''))
      }),
  )
  const unassignedTeams = computed(() => {
    const assignedIds = new Set(
      groups.value.flatMap((group) => (Array.isArray(group?.teamIds) ? group.teamIds : []).map((teamId) => String(teamId).trim()).filter(Boolean)),
    )

    return teams.value.filter((team) => !assignedIds.has(String(team?.id || '').trim()))
  })
  const summary = computed(() => {
    const capacity = settings.groupCount * settings.teamsPerGroup
    const assignedCount = groups.value.reduce(
      (sum, group) => sum + (Array.isArray(group?.teamIds) ? group.teamIds.length : 0),
      0,
    )

    return {
      groupCount: settings.groupCount,
      teamsPerGroup: settings.teamsPerGroup,
      qualificationCount: settings.qualificationCount,
      capacity,
      assignedCount,
      unassignedCount: Math.max(0, teams.value.length - assignedCount),
      seededCount: seedTeams.value.length,
      fillRate: capacity ? Math.round((assignedCount / capacity) * 100) : 0,
    }
  })
  const issues = computed(() =>
    validateTournamentGroupDrawDraft({
      groups: groups.value,
      teams: teams.value,
      settings,
    }),
  )
  const canEdit = computed(() => isTournamentGroupDrawEditable(state.value) && !tournament?.value?.groupDraw?.locked)
  const canFinalize = computed(() =>
    canFinalizeTournamentGroupDraw({
      state: state.value,
      groups: groups.value,
      teams: teams.value,
      settings,
    }),
  )

  watch(
    () => tournament?.value,
    (nextTournament) => {
      const snapshot = createEmptySnapshot(nextTournament)

      settings.groupCount = snapshot.settings.groupCount
      settings.teamsPerGroup = snapshot.settings.teamsPerGroup
      settings.qualificationCount = snapshot.settings.qualificationCount
      settings.seededMode = snapshot.settings.seededMode
      settings.autoFixtureGeneration = snapshot.settings.autoFixtureGeneration
      mode.value = snapshot.mode
      groups.value = deepClone(snapshot.groups)
      previewVisible.value = false
      previewGroups.value = []
      previewSummary.value = null
      previewWarnings.value = []
      lastGeneratedAt.value = snapshot.lastGeneratedAt
      initialSnapshot.value = deepClone(snapshot)
    },
    { immediate: true },
  )

  function updateSettings(nextSettings = {}) {
    const normalized = normalizeTournamentGroupSettings(nextSettings, settings)
    const structureChanged =
      normalized.groupCount !== settings.groupCount || normalized.teamsPerGroup !== settings.teamsPerGroup

    settings.groupCount = normalized.groupCount
    settings.teamsPerGroup = normalized.teamsPerGroup
    settings.qualificationCount = normalized.qualificationCount
    settings.seededMode = normalized.seededMode
    settings.autoFixtureGeneration = normalized.autoFixtureGeneration

    if (structureChanged) {
      groups.value = createTournamentGroupSkeletons(settings.groupCount, settings.qualificationCount)
    }

    return structureChanged
  }

  function rebuildGroups() {
    groups.value = createTournamentGroupSkeletons(settings.groupCount, settings.qualificationCount)
  }

  function previewAutomaticDraw() {
    const preview = generateTournamentGroupPreview({
      teams: teams.value,
      groupCount: settings.groupCount,
      teamsPerGroup: settings.teamsPerGroup,
      qualificationCount: settings.qualificationCount,
      seededMode: settings.seededMode,
      seedTeamIds: seedTeams.value.map((team) => team.id),
    })

    previewGroups.value = preview.groups
    previewSummary.value = preview.summary
    previewWarnings.value = preview.warnings
    previewVisible.value = true

    return preview
  }

  function applyPreview() {
    if (!previewGroups.value.length) return false

    groups.value = deepClone(previewGroups.value)
    previewVisible.value = false
    lastGeneratedAt.value = new Date().toISOString()
    return true
  }

  function assignTeamToGroup(teamId, groupId) {
    if (!canEdit.value) return groups.value

    groups.value = assignTournamentTeamToGroup(groups.value, teamId, groupId, settings.teamsPerGroup)
    return groups.value
  }

  function removeTeamFromGroup(teamId) {
    if (!canEdit.value) return groups.value

    groups.value = removeTournamentTeamFromGroups(groups.value, teamId)
    return groups.value
  }

  function resetDraft() {
    const snapshot = deepClone(initialSnapshot.value)

    settings.groupCount = snapshot.settings.groupCount
    settings.teamsPerGroup = snapshot.settings.teamsPerGroup
    settings.qualificationCount = snapshot.settings.qualificationCount
    settings.seededMode = snapshot.settings.seededMode
    settings.autoFixtureGeneration = snapshot.settings.autoFixtureGeneration
    mode.value = snapshot.mode
    groups.value = deepClone(snapshot.groups)
    previewVisible.value = false
    previewGroups.value = []
    previewSummary.value = null
    previewWarnings.value = []
    lastGeneratedAt.value = snapshot.lastGeneratedAt
  }

  function saveDraft() {
    const updateTournament = actions.updateTournament
    if (typeof updateTournament !== 'function' || !tournament?.value?.id) return null

    const payload = buildGroupDrawPayload({
      settings,
      groups: groups.value,
      mode: mode.value,
      locked: false,
      lastGeneratedAt: lastGeneratedAt.value || new Date().toISOString(),
    })

    const updated = updateTournament(tournament.value.id, {
      groupDraw: payload,
      statistics: {
        ...tournament.value.statistics,
        groupsCompleted: 0,
      },
    })

    if (updated?.id) {
      lastGeneratedAt.value = payload.lastGeneratedAt
    }

    return updated
  }

  function finalizeGroups() {
    if (!canFinalize.value) return null

    const updateTournament = actions.updateTournament
    const transitionTournament = actions.transitionTournament
    if (typeof updateTournament !== 'function' || typeof transitionTournament !== 'function' || !tournament?.value?.id) {
      return null
    }

    const payload = buildGroupDrawPayload({
      settings,
      groups: groups.value,
      mode: mode.value,
      locked: true,
      lastGeneratedAt: lastGeneratedAt.value || new Date().toISOString(),
    })

    const updated = updateTournament(tournament.value.id, {
      groupDraw: payload,
      statistics: {
        ...tournament.value.statistics,
        groupsCompleted: groups.value.length,
      },
    })

    if (!updated?.id) {
      return null
    }

    const transitioned = transitionTournament(updated.id, 'group_draw_completed')
    if (transitioned?.id) {
      lastGeneratedAt.value = payload.lastGeneratedAt
      return transitioned
    }

    return updated
  }

  return {
    settings,
    mode,
    groups,
    previewVisible,
    previewGroups,
    previewSummary,
    previewWarnings,
    lastGeneratedAt,
    initialSnapshot,
    teams,
    state,
    groupOptions,
    resolvedGroups,
    resolvedPreviewGroups,
    seedTeams,
    unassignedTeams,
    summary,
    issues,
    canEdit,
    canFinalize,
    updateSettings,
    rebuildGroups,
    previewAutomaticDraw,
    applyPreview,
    assignTeamToGroup,
    removeTeamFromGroup,
    resetDraft,
    saveDraft,
    finalizeGroups,
  }
}
