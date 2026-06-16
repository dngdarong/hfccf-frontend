import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { createTestI18n, createTestRouter } from '@/tests/helpers/mount'
import tournamentMessages from '@/i18n/en/sport/tournament'
import TournamentGroupsPage from '@/modules/sport/tournament/pages/TournamentGroupsPage.vue'

const tournamentRecord = {
  id: 'tournament-001',
  name: 'Foundation Cup',
  season: '2026',
  sportType: 'football',
  description: 'A mock tournament used for page tests',
  location: 'National Stadium',
  organizer: 'HFCCF Sports',
  state: 'registration_closed',
  registrationStatus: 'closed',
  visibility: 'public',
  rules: {
    groupCount: 4,
    teamsPerGroup: 4,
    knockoutEnabled: true,
  },
  settings: {
    doubleRoundRobin: false,
  },
  statistics: {
    registeredTeams: 8,
    totalTeams: 8,
    groupsCompleted: 0,
    fixturesGenerated: 0,
    matches: 0,
    completedMatches: 0,
  },
  teams: [],
  groupDraw: {
    mode: 'automatic',
    locked: false,
    lastGeneratedAt: '2026-05-18T09:00:00.000Z',
    settings: {
      groupCount: 4,
      teamsPerGroup: 4,
      qualificationCount: 2,
      seededMode: true,
      autoFixtureGeneration: true,
    },
    groups: [],
  },
  fixtures: [],
  results: [],
  standings: [],
  knockout: {
    settings: {},
    qualifiers: [],
    bracket: null,
    champion: null,
  },
  logoPath: 'tournaments/logo.png',
  logo: 'https://pub.example.test/tournaments/logo.png',
  bannerPath: 'tournaments/banner.png',
  banner: 'https://pub.example.test/tournaments/banner.png',
}

const tournamentsState = ref([tournamentRecord])
const loadTournaments = vi.fn().mockResolvedValue({ items: tournamentsState.value, pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 } })
const loadTournament = vi.fn().mockResolvedValue(tournamentRecord)
const getTournamentById = vi.fn((id) => (String(id) === tournamentRecord.id ? tournamentRecord : null))
const transitionTournament = vi.fn().mockImplementation((id, nextState) => ({ ...tournamentRecord, id, state: nextState }))

const loadGroups = vi.fn().mockResolvedValue({
  id: 'tournament-001',
  groupDraw: tournamentRecord.groupDraw,
})
const saveDraft = vi.fn()
const finalizeGroups = vi.fn()
const previewAutomaticDraw = vi.fn()
const applyPreview = vi.fn()
const updateSettings = vi.fn()
const rebuildGroups = vi.fn()
const assignTeamToGroup = vi.fn()
const removeTeamFromGroup = vi.fn()
const resetDraft = vi.fn()

vi.mock('@/modules/sport/tournament/composables/useTournamentCrudCatalog', () => ({
  useTournamentCrudCatalog: () => ({
    tournaments: tournamentsState,
    getTournamentById,
    loadTournaments,
    loadTournament,
    createTournament: vi.fn(),
    updateTournament: vi.fn(),
    deleteTournament: vi.fn(),
    archiveTournament: vi.fn(),
    transitionTournament,
    isLoading: ref(false),
    isSaving: ref(false),
    error: ref(''),
    mode: ref('remote'),
    resetTournamentCrudCatalog: vi.fn(),
  }),
}))

vi.mock('@/modules/sport/tournament/composables/useTournamentGroups', () => ({
  useTournamentGroups: () => ({
    mode: ref('automatic'),
    settings: ref({
      groupCount: 4,
      teamsPerGroup: 4,
      qualificationCount: 2,
      seededMode: true,
      autoFixtureGeneration: true,
    }),
    previewVisible: ref(false),
    previewSummary: ref(null),
    previewWarnings: ref([]),
    resolvedGroups: ref([]),
    resolvedPreviewGroups: ref([]),
    groupOptions: ref([]),
    seedTeams: ref([]),
    unassignedTeams: ref([]),
    summary: ref({ groupCount: 4 }),
    issues: ref([]),
    canEdit: ref(true),
    canFinalize: ref(true),
    updateSettings,
    rebuildGroups,
    previewAutomaticDraw,
    applyPreview,
    loadGroups,
    assignTeamToGroup,
    removeTeamFromGroup,
    resetDraft,
    saveDraft,
    finalizeGroups,
    lastGeneratedAt: ref('2026-05-18T09:00:00.000Z'),
    isLoading: ref(false),
    isSaving: ref(false),
    error: ref(''),
  }),
}))

const messages = {
  en: {
    common: {
      cancel: 'Cancel',
      close: 'Close',
      errorOccurred: 'Error occurred',
      loading: 'Loading',
    },
    ...tournamentMessages,
  },
}

const stubs = {
  MainLayout: { template: '<slot />' },
  HeaderSection: { props: ['title', 'subtitle'], template: '<header />' },
  AlertError: {
    props: ['show', 'title', 'message', 'buttonText'],
    template: '<div v-if="show" data-testid="alert-error" />',
  },
  AlertSuccess: {
    props: ['show', 'title', 'message', 'buttonText'],
    template: '<div v-if="show" data-testid="alert-success" />',
  },
  TournamentStatusBadge: { props: ['state', 'label', 'size'], template: '<span />' },
  TournamentStateTimeline: { props: ['state'], template: '<div />' },
  TournamentGroupAssignmentPanel: { props: ['teams', 'groupOptions', 'disabled'], emits: ['assign'], template: '<div />' },
  TournamentGroupDrawControls: { props: ['mode', 'canEdit', 'canFinalize', 'locked'], emits: ['update:mode', 'preview', 'save', 'finalize', 'reset'], template: '<div />' },
  TournamentDrawPreviewDialog: { props: ['visible', 'title', 'subtitle', 'groups', 'summary', 'warnings', 'canApply'], emits: ['close', 'apply'], template: '<div />' },
  TournamentGroupGrid: { props: ['groups', 'editable'], emits: ['remove-team'], template: '<div />' },
  TournamentGroupSeedPanel: { props: ['teams', 'seededMode'], template: '<div />' },
  TournamentGroupSettings: { props: ['modelValue', 'disabled'], emits: ['update:modelValue'], template: '<div />' },
  TournamentGroupStats: { props: ['summary'], template: '<div />' },
  Button: { props: ['label'], template: '<button />' },
}

function mountPage() {
  const i18n = createTestI18n(messages)
  const pinia = createPinia()
  const router = createTestRouter([
    {
      path: '/module/sport-admin/tournaments/:id/groups',
      name: 'dashboard-sport-admin-tournaments-groups',
      component: { template: '<div />' },
    },
  ])

  return (async () => {
    await router.push({ name: 'dashboard-sport-admin-tournaments-groups', params: { id: 'tournament-001' } })
    await router.isReady()

    return mount(TournamentGroupsPage, {
      global: {
        plugins: [i18n, pinia, router],
        stubs,
      },
    })
  })()
}

describe('TournamentGroupsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads the tournament groups through the composable without invalid rounded prop warnings', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = await mountPage()
    await nextTick()
    await flushPromises()

    const combined = [...warnSpy.mock.calls, ...errorSpy.mock.calls].flat().join(' ')
    expect(combined).not.toContain('Invalid prop: type check failed for prop "rounded"')
    expect(loadTournament).toHaveBeenCalledWith('tournament-001')
    expect(loadGroups).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.sport-tournament-groups').exists()).toBe(true)

    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })
})
