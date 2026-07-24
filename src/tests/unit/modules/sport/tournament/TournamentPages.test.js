import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { createTestI18n, createTestRouter } from '@/tests/helpers/mount'
import tournamentMessages from '@/i18n/en/sport/tournament'
import TournamentListPage from '@/modules/sport/tournament/pages/TournamentListPage.vue'
import TournamentCreatePage from '@/modules/sport/tournament/pages/TournamentCreatePage.vue'
import TournamentDetailPage from '@/modules/sport/tournament/pages/TournamentDetailPage.vue'

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
const createTournament = vi.fn().mockResolvedValue({ ...tournamentRecord, id: 'tournament-002', name: 'Created Cup' })
const updateTournament = vi.fn().mockResolvedValue({ ...tournamentRecord, name: 'Updated Cup' })
const transitionTournament = vi.fn().mockImplementation((id, nextState) => ({ ...tournamentRecord, id, state: nextState }))
const deleteTournament = vi.fn().mockResolvedValue(true)
const getTournamentById = vi.fn((id) => (String(id) === tournamentRecord.id ? tournamentRecord : null))
const resetTournamentCrudCatalog = vi.fn().mockImplementation(() => {
  tournamentsState.value = [tournamentRecord]
})

vi.mock('@/modules/sport/tournament/composables/useTournamentCrudCatalog', () => ({
  useTournamentCrudCatalog: () => ({
    tournaments: tournamentsState,
    getTournamentById,
    loadTournaments,
    loadTournament,
    createTournament,
    updateTournament,
    deleteTournament,
    archiveTournament: deleteTournament,
    transitionTournament,
    isLoading: ref(false),
    isSaving: ref(false),
    error: ref(''),
    mode: ref('remote'),
    resetTournamentCrudCatalog,
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
  HeaderSection: { props: ['title', 'subtitle'], template: '<header><span>{{ title }}</span><span>{{ subtitle }}</span></header>' },
  Form: {
    props: ['title', 'description', 'showCancel'],
    emits: ['submit'],
    template: '<form><slot /><slot name="header" /><slot name="actions" /></form>',
  },
  AlertError: {
    props: ['show', 'title', 'message', 'buttonText'],
    template: '<div v-if="show" data-testid="alert-error" />',
  },
  AlertSuccess: {
    props: ['show', 'title', 'message', 'buttonText'],
    template: '<div v-if="show" data-testid="alert-success" />',
  },
  StatsCards: { props: ['cards', 'compact'], template: '<div data-testid="stats-cards" />' },
  TournamentListFilters: {
    props: ['searchQuery', 'seasonFilter', 'stateFilter'],
    template: '<div data-testid="tournament-filters"><input data-testid="search" :value="searchQuery" @input="$emit(\'update:searchQuery\', $event.target.value)" /></div>',
  },
  TournamentTable: {
    props: ['tournaments', 'loading', 'emptyText'],
    template: '<div data-testid="tournament-table"><span data-testid="row-numbers">{{ tournaments.map((item) => item.rowNumber).join(\',\') }}</span><span data-testid="tournament-ids">{{ tournaments.map((item) => item.id).join(\',\') }}</span></div>',
  },
  Pagination: { props: ['totalPages'], template: '<div data-testid="pagination" :data-total-pages="totalPages"><button data-testid="next-page" @click="$emit(\'update:modelValue\', 2)">next</button></div>' },
  TournamentFormSection: { props: ['title', 'subtitle'], template: '<section><slot /></section>' },
  TournamentMediaField: {
    props: ['title', 'subtitle', 'preview', 'disabled', 'accept'],
    emits: ['change', 'remove'],
    template: '<div />',
  },
  TournamentStatusBadge: { props: ['state', 'label', 'size'], template: '<span />' },
  TournamentQuickActions: { props: ['title', 'subtitle', 'actions'], emits: ['action'], template: '<div />' },
  TournamentStateTimeline: { props: ['state'], template: '<div />' },
  TournamentSettingsSummary: { props: ['tournament'], template: '<div />' },
  InputText: { props: ['modelValue', 'disabled'], template: '<input />' },
  InputNumber: { props: ['modelValue', 'disabled'], template: '<input />' },
  Select: { props: ['modelValue', 'disabled'], template: '<select />' },
  Textarea: { props: ['modelValue', 'disabled'], template: '<textarea />' },
}

function mountPage(component, routeName, routePath, params = {}) {
  const i18n = createTestI18n(messages)
  const pinia = createPinia()
  const router = createTestRouter([
    {
      path: routePath,
      name: routeName,
      component: { template: '<div />' },
    },
  ])

  return (async () => {
    await router.push({ name: routeName, params })
    await router.isReady()

    return mount(component, {
      global: {
        plugins: [i18n, pinia, router],
        stubs,
      },
    })
  })()
}

describe('Tournament pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetTournamentCrudCatalog()
  })

  it('loads the tournament list through the CRUD composable without invalid rounded prop warnings', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = await mountPage(
      TournamentListPage,
      'dashboard-sport-admin-tournaments',
      '/module/sport-admin/tournaments',
    )

    await nextTick()

    const combined = [...warnSpy.mock.calls, ...errorSpy.mock.calls].flat().join(' ')
    expect(combined).not.toContain('Invalid prop: type check failed for prop "rounded"')
    expect(loadTournaments).toHaveBeenCalled()
    expect(wrapper.find('.sport-tournament-page').exists()).toBe(true)
    expect(wrapper.text().match(/Tournament management/g)).toHaveLength(1)
    expect(wrapper.findComponent(stubs.StatsCards).exists()).toBe(true)

    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('numbers tournament rows by page while preserving real tournament IDs', async () => {
    tournamentsState.value = Array.from({ length: 8 }, (_, index) => ({
      ...tournamentRecord,
      id: `backend-${index + 1}`,
      name: `Tournament ${index + 1}`,
    }))

    const wrapper = await mountPage(
      TournamentListPage,
      'dashboard-sport-admin-tournaments',
      '/module/sport-admin/tournaments',
    )

    await nextTick()

    expect(wrapper.find('[data-testid="row-numbers"]').text()).toBe('1,2,3,4,5')
    expect(wrapper.find('[data-testid="tournament-ids"]').text()).toBe('backend-1,backend-2,backend-3,backend-4,backend-5')
    expect(wrapper.find('[data-testid="pagination"]').attributes('data-total-pages')).toBe('2')
    expect(wrapper.text()).toContain('Showing 1–5 of 8 tournaments')

    await wrapper.find('[data-testid="next-page"]').trigger('click')

    expect(wrapper.find('[data-testid="row-numbers"]').text()).toBe('6,7,8')
    expect(wrapper.find('[data-testid="tournament-ids"]').text()).toBe('backend-6,backend-7,backend-8')
    expect(wrapper.text()).toContain('Showing 6–8 of 8 tournaments')
  })

  it('hides pagination when exactly five tournaments are available', async () => {
    tournamentsState.value = Array.from({ length: 5 }, (_, index) => ({
      ...tournamentRecord,
      id: `backend-${index + 1}`,
    }))

    const wrapper = await mountPage(
      TournamentListPage,
      'dashboard-sport-admin-tournaments',
      '/module/sport-admin/tournaments',
    )

    await nextTick()

    expect(wrapper.find('[data-testid="row-numbers"]').text()).toBe('1,2,3,4,5')
    expect(wrapper.find('[data-testid="pagination"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Showing 1–5 of 5 tournaments')
  })

  it('mounts the create page without invalid rounded prop warnings', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = await mountPage(
      TournamentCreatePage,
      'dashboard-sport-admin-tournaments-create',
      '/module/sport-admin/tournaments/create',
    )

    await nextTick()

    const combined = [...warnSpy.mock.calls, ...errorSpy.mock.calls].flat().join(' ')
    expect(combined).not.toContain('Invalid prop: type check failed for prop "rounded"')
    expect(wrapper.find('.sport-tournament-form').exists()).toBe(true)
    expect(wrapper.text()).toContain(tournamentMessages.sportTournament.create.heroEyebrow)
    expect(wrapper.text()).toContain(tournamentMessages.sportTournament.create.title)

    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('loads the tournament into the create page when editing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = await mountPage(
      TournamentCreatePage,
      'dashboard-sport-admin-tournaments-edit',
      '/module/sport-admin/tournaments/:id/edit',
      { id: 'tournament-001' },
    )

    await nextTick()

    const combined = [...warnSpy.mock.calls, ...errorSpy.mock.calls].flat().join(' ')
    expect(combined).not.toContain('Invalid prop: type check failed for prop "rounded"')
    expect(loadTournament).toHaveBeenCalledWith('tournament-001')
    expect(wrapper.find('.sport-tournament-form').exists()).toBe(true)

    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('mounts the detail page and loads the record through the CRUD composable without invalid rounded prop warnings', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = await mountPage(
      TournamentDetailPage,
      'dashboard-sport-admin-tournaments-detail',
      '/module/sport-admin/tournaments/:id',
      { id: 'tournament-001' },
    )

    await nextTick()

    const combined = [...warnSpy.mock.calls, ...errorSpy.mock.calls].flat().join(' ')
    expect(combined).not.toContain('Invalid prop: type check failed for prop "rounded"')
    expect(loadTournament).toHaveBeenCalledWith('tournament-001')
    expect(wrapper.find('.sport-tournament-detail').exists()).toBe(true)

    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })
})
