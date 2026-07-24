import { computed, ref, watch } from 'vue'
import { createRoundRobinFixtures, sortRoundRobinFixtures } from './useTournamentRoundRobin'
import { normalizeTournamentState } from './useTournamentStateMachine'
import { generateTournamentFixtures, updateTournamentResult } from '../api/tournamentApi'

function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeStatus(value) {
  const status = normalizeText(value).toLowerCase()
  return ['scheduled', 'live', 'completed', 'postponed', 'cancelled'].includes(status) ? status : 'scheduled'
}

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

function buildFixtureBlueprint(group, teams, settings) {
  return createRoundRobinFixtures({
    group,
    teams,
    roundRobinMode: settings.roundRobinMode,
    homeAwayEnabled: settings.homeAwayEnabled,
    matchdayStart: 1,
    matchdaySpacingDays: settings.matchdaySpacingDays,
    baseDate: settings.baseDate,
    venue: settings.venue,
  }).fixtures
}

function createSettingsSnapshot(source = {}) {
  return {
    roundRobinMode: normalizeText(source.roundRobinMode) === 'double' ? 'double' : 'single',
    homeAwayEnabled: Boolean(source.homeAwayEnabled),
    matchdaySpacingDays: Math.max(1, Number(source.matchdaySpacingDays ?? 7) || 7),
    baseDate: normalizeText(source.baseDate),
    venue: normalizeText(source.venue),
  }
}

export function useTournamentFixtures(tournament, actions = {}) {
  const selectedGroupId = ref('')
  const selectedMatchday = ref('all')
  const selectedStatus = ref('all')
  const previewVisible = ref(false)
  const previewFixtures = ref([])
  const previewSummary = ref(null)
  const isGenerating = ref(false)
  const isUpdating = ref(false)
  const initialSnapshot = ref(null)
  const settings = ref(createSettingsSnapshot(tournament?.value?.fixturesSettings || {}))

  const teams = computed(() => (Array.isArray(tournament?.value?.teams) ? tournament.value.teams : []))
  const groups = computed(() => (Array.isArray(tournament?.value?.groupDraw?.groups) ? tournament.value.groupDraw.groups : []))
  const state = computed(() => normalizeTournamentState(tournament?.value?.state))
  const fixtures = computed(() => {
    const source = Array.isArray(tournament?.value?.fixtures) ? tournament.value.fixtures : []

    return sortRoundRobinFixtures(
      source.map((fixture) => ({
        ...fixture,
        status: normalizeStatus(fixture?.status),
      })),
    )
  })
  const fixturesSettings = computed(() => createSettingsSnapshot(tournament?.value?.fixturesSettings || settings.value))
  const canGenerateFixtures = computed(() => ['group_draw_completed', 'fixtures_generated'].includes(state.value))
  const canEditFixtureStatus = computed(() => ['fixtures_generated', 'active'].includes(state.value))
  const groupOptions = computed(() =>
    groups.value.map((group, index) => ({
      label: String(group?.name || `Group ${index + 1}`),
      value: String(group?.id || `group-${String(index + 1).padStart(2, '0')}`),
    })),
  )
  const selectedGroup = computed(() => groups.value.find((group) => String(group?.id || '') === selectedGroupId.value) || groups.value[0] || null)
  const selectedGroupFixtures = computed(() =>
    fixtures.value.filter((fixture) => {
      const sameGroup = !selectedGroupId.value || selectedGroupId.value === 'all' ? true : String(fixture?.groupId || '') === selectedGroupId.value
      const sameMatchday =
        selectedMatchday.value === 'all' ? true : Number(fixture?.matchday || 0) === Number(selectedMatchday.value || 0)
      const sameStatus = selectedStatus.value === 'all' ? true : String(fixture?.status || '') === selectedStatus.value
      return sameGroup && sameMatchday && sameStatus
    }),
  )
  const previewGroupFixtures = computed(() =>
    previewFixtures.value.filter((fixture) => !selectedGroupId.value || selectedGroupId.value === 'all' || String(fixture?.groupId || '') === selectedGroupId.value),
  )
  const stats = computed(() => {
    const totalFixtures = fixtures.value.length
    const completedMatches = fixtures.value.filter((fixture) => fixture.status === 'completed').length
    const scheduledMatches = fixtures.value.filter((fixture) => fixture.status === 'scheduled').length
    const liveMatches = fixtures.value.filter((fixture) => fixture.status === 'live').length
    const matchdays = new Set(fixtures.value.map((fixture) => fixture.matchday).filter(Boolean))

    return {
      totalFixtures,
      completedMatches,
      scheduledMatches,
      liveMatches,
      matchdays: matchdays.size,
    }
  })
  const matchdayOptions = computed(() => {
    const matchdays = [...new Set(fixtures.value.map((fixture) => Number(fixture?.matchday || 0)).filter(Boolean))]

    return matchdays.map((matchday) => ({
      label: String(matchday),
      value: matchday,
    }))
  })
  const standings = computed(() => Array.isArray(tournament?.value?.standings) ? tournament.value.standings : [])

  watch(
    groups,
    (nextGroups) => {
      if (!nextGroups.length) {
        selectedGroupId.value = ''
        return
      }

      if (!selectedGroupId.value || !nextGroups.some((group) => String(group?.id || '') === selectedGroupId.value)) {
        selectedGroupId.value = String(nextGroups[0].id || '')
      }
    },
    { immediate: true },
  )

  watch(
    matchdayOptions,
    (nextOptions) => {
      if (!nextOptions.length) {
        selectedMatchday.value = 'all'
        return
      }

      if (selectedMatchday.value === 'all') return

      const currentExists = nextOptions.some((option) => String(option.value) === String(selectedMatchday.value))
      if (!currentExists) {
        selectedMatchday.value = 'all'
      }
    },
    { immediate: true },
  )

  watch(
    () => tournament?.value?.fixturesSettings,
    (nextSettings) => {
      settings.value = createSettingsSnapshot(nextSettings || {})
      initialSnapshot.value = {
        fixtures: clone(Array.isArray(tournament?.value?.fixtures) ? tournament.value.fixtures : []),
        standings: clone(Array.isArray(tournament?.value?.standings) ? tournament.value.standings : []),
        fixturesSettings: createSettingsSnapshot(nextSettings || {}),
      }
    },
    { immediate: true, deep: true },
  )

  function updateSettings(patch = {}) {
    settings.value = {
      ...settings.value,
      ...patch,
      roundRobinMode: normalizeText(patch.roundRobinMode || settings.value.roundRobinMode) === 'double' ? 'double' : 'single',
      homeAwayEnabled: Boolean(patch.homeAwayEnabled ?? settings.value.homeAwayEnabled),
      matchdaySpacingDays: Math.max(1, Number(patch.matchdaySpacingDays ?? settings.value.matchdaySpacingDays) || 7),
      baseDate: normalizeText(patch.baseDate ?? settings.value.baseDate),
      venue: normalizeText(patch.venue ?? settings.value.venue),
    }
  }

  function buildGeneratedFixtures() {
    const generated = groups.value.flatMap((group, index) =>
      buildFixtureBlueprint(
        {
          ...group,
          groupIndex: index,
        },
        teams.value.filter((team) => (Array.isArray(group?.teamIds) ? group.teamIds.includes(team.id) : false)),
        settings.value,
      ),
    )

    return sortRoundRobinFixtures(generated)
  }

  function generatePreview() {
    const generated = buildGeneratedFixtures()
    previewFixtures.value = generated
    previewSummary.value = {
      fixtures: generated.length,
      matchdays: new Set(generated.map((fixture) => fixture.matchday).filter(Boolean)).size,
      groups: groups.value.length,
    }
    previewVisible.value = true
    return generated
  }

  async function applyPreview() {
    if (isGenerating.value) return null
    if (!tournament?.value?.id || !previewFixtures.value.length || typeof actions.reloadTournament !== 'function') {
      return null
    }
    isGenerating.value = true
    try {
      await generateTournamentFixtures(tournament.value.id, {
        double_round_robin: settings.value.roundRobinMode === 'double' || settings.value.homeAwayEnabled,
        replace: true,
      })
      await actions.reloadTournament()
    } finally {
      isGenerating.value = false
    }

    previewVisible.value = false
    initialSnapshot.value = {
      fixtures: clone(tournament.value.fixtures || []),
      standings: clone(tournament.value.standings || []),
      fixturesSettings: clone(settings.value),
    }

    return { id: tournament.value.id }
  }

  function resetFixtures() {
    if (!initialSnapshot.value) return false

    return false
  }

  async function updateFixtureStatus(fixtureId, nextStatus) {
    if (isUpdating.value) return null
    if (!canEditFixtureStatus.value || !tournament?.value?.id) {
      return null
    }

    const normalizedId = normalizeText(fixtureId)
    if (!normalizedId) return null

    if (typeof actions.reloadTournament !== 'function') {
      return null
    }
    const fixture = fixtures.value.find((item) => item.id === normalizedId)
    if (!fixture) return null
    isUpdating.value = true
    try {
      await updateTournamentResult(tournament.value.id, normalizedId, { status: normalizeStatus(nextStatus) })
      await actions.reloadTournament()
      return { id: tournament.value.id }
    } finally {
      isUpdating.value = false
    }
  }

  return {
    settings,
    fixturesSettings,
    selectedGroupId,
    selectedMatchday,
    selectedStatus,
    previewVisible,
    previewFixtures,
    previewSummary,
    fixtures,
    groupOptions,
    matchdayOptions,
    selectedGroup,
    selectedGroupFixtures,
    previewGroupFixtures,
    stats,
    standings,
    canGenerateFixtures,
    canEditFixtureStatus,
    updateSettings,
    generatePreview,
    applyPreview,
    resetFixtures,
    updateFixtureStatus,
    isGenerating,
    isUpdating,
  }
}

export {
  buildFixtureBlueprint,
  createSettingsSnapshot,
  normalizeStatus,
}
