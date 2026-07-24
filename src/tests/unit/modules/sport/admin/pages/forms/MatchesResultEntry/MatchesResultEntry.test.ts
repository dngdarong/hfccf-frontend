import { flushPromises, mount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MatchesResultEntry from '@/modules/sport/admin/pages/forms/MatchesResultEntry/MatchesResultEntry.vue'

let routeState: any
let pushMock: ReturnType<typeof vi.fn>
let tMock: ReturnType<typeof vi.fn>
let matchRecord: any
let matchEvents: any
let squads: any
let matchLoading: any
let eventsLoading: any
let saveLoading: any
let loadMatch: ReturnType<typeof vi.fn>
let loadMatchSquads: ReturnType<typeof vi.fn>
let loadEvents: ReturnType<typeof vi.fn>
let createEvent: ReturnType<typeof vi.fn>
let updateEvent: ReturnType<typeof vi.fn>
let removeEvent: ReturnType<typeof vi.fn>
let saveResult: ReturnType<typeof vi.fn>

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({
    t: tMock,
    language: { value: 'en' },
  }),
}))

vi.mock('@/modules/sport/match-squads/composables/useMatchSquad', () => ({
  useMatchSquad: () => ({
    loading: matchLoading,
    loadMatch,
    loadMatchSquads,
    squads,
    match: matchRecord,
  }),
}))

vi.mock('@/modules/sport/match-events/composables/useMatchEvents', () => ({
  useMatchEvents: () => ({
    items: matchEvents,
    loading: eventsLoading,
    loadEvents,
    createEvent,
    updateEvent,
    removeEvent,
  }),
}))

vi.mock('@/modules/sport/admin/composables/useMatchResultEntry', () => ({
  useMatchResultEntry: () => ({
    loading: saveLoading,
    saveResult,
  }),
}))

const stubs = {
  MainLayout: {
    template: '<div data-test="layout"><slot /></div>',
  },
  HeaderSection: {
    props: ['title', 'subtitle'],
    template: '<header data-test="header"><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>',
  },
  FixtureSummaryCard: {
    props: ['homeTeam', 'awayTeam', 'homeScore', 'awayScore', 'matchDate', 'matchTime', 'venue', 'competition'],
    template: `
      <section data-test="fixture-summary">
        <span data-test="fixture-home">{{ homeTeam }}</span>
        <span data-test="fixture-away">{{ awayTeam }}</span>
        <span data-test="fixture-score">{{ homeScore }}-{{ awayScore }}</span>
        <span data-test="fixture-date">{{ matchDate }}</span>
        <span data-test="fixture-time">{{ matchTime }}</span>
        <span data-test="fixture-venue">{{ venue }}</span>
        <span data-test="fixture-competition">{{ competition }}</span>
      </section>
    `,
  },
  ResultEntryPanel: {
    props: ['modelValue', 'readonly', 'loading', 'showGoalEditors', 'statusOptions'],
    template: `
      <section data-test="result-entry-panel">
        <span data-test="result-home-team">{{ modelValue.homeTeam }}</span>
        <span data-test="result-away-team">{{ modelValue.awayTeam }}</span>
        <span data-test="result-home-score">{{ modelValue.homeScore }}</span>
        <span data-test="result-away-score">{{ modelValue.awayScore }}</span>
        <span data-test="result-status">{{ modelValue.status }}</span>
        <span data-test="result-report">{{ modelValue.report }}</span>
      </section>
    `,
  },
  MatchEventForm: {
    template: '<div data-test="match-event-form" />',
  },
  MatchTimeline: {
    props: ['events', 'homeTeam', 'awayTeam'],
    template: `
      <section data-test="match-timeline">
        <span data-test="timeline-home">{{ homeTeam }}</span>
        <span data-test="timeline-away">{{ awayTeam }}</span>
        <span data-test="timeline-count">{{ events.length }}</span>
      </section>
    `,
  },
  AlertSuccess: {
    props: ['show', 'message'],
    template: '<div v-if="show" data-test="alert-success">{{ message }}</div>',
  },
  AlertError: {
    props: ['show', 'message'],
    template: '<div v-if="show" data-test="alert-error">{{ message }}</div>',
  },
  AlertQuestion: {
    props: ['show'],
    template: '<div v-if="show" data-test="alert-question" />',
  },
}

function createMatch(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    homeTeam: 'Home FC',
    awayTeam: 'Away FC',
    homeTeamId: 'home-1',
    awayTeamId: 'away-1',
    status: 'live',
    notes: 'Initial report',
    homeScore: 0,
    awayScore: 0,
    schedule: '2026-05-14T15:00:00.000Z',
    venue: 'Main Stadium',
    tournament: { name: 'Foundation Cup' },
    ...overrides,
  }
}

beforeEach(async () => {
  routeState = reactive({ params: { id: 'match-1' } })
  pushMock = vi.fn()
  tMock = vi.fn((key) => key)

  const vue = await import('vue')
  matchRecord = vue.ref(null)
  matchEvents = vue.ref([])
  squads = vue.ref([])
  matchLoading = vue.ref(false)
  eventsLoading = vue.ref(false)
  saveLoading = vue.ref(false)
  loadMatch = vi.fn()
  loadMatchSquads = vi.fn()
  loadEvents = vi.fn()
  createEvent = vi.fn()
  updateEvent = vi.fn()
  removeEvent = vi.fn()
  saveResult = vi.fn()

  matchRecord.value = createMatch('match-1', {
    status: 'completed',
    notes: 'Backend report',
    homeScore: 3,
    awayScore: 1,
  })
  matchEvents.value = [{ id: 'event-1', eventType: 'yellow_card', teamId: 'home-1', minute: 12 }]
  squads.value = [{ id: 'squad-1', teamId: 'home-1', name: 'Home squad' }]

  loadMatch.mockImplementation(async (matchId) => {
    if (matchId === 'match-2') {
      matchRecord.value = createMatch('match-2', {
        homeTeam: 'New Home FC',
        awayTeam: 'New Away FC',
        status: 'completed',
        notes: 'Second backend report',
        homeScore: 4,
        awayScore: 2,
        schedule: '2026-06-01T18:30:00.000Z',
        venue: 'Secondary Stadium',
        tournament: { name: 'Championship Cup' },
      })
      return matchRecord.value
    }

    matchRecord.value = createMatch('match-1', {
      status: 'completed',
      notes: 'Backend report',
      homeScore: 3,
      awayScore: 1,
    })
    return matchRecord.value
  })
  loadMatchSquads.mockImplementation(async (matchId) => {
    squads.value =
      matchId === 'match-2'
        ? [{ id: 'squad-2', teamId: 'home-2', name: 'New Home squad' }]
        : [{ id: 'squad-1', teamId: 'home-1', name: 'Home squad' }]
    return { items: squads.value }
  })
  loadEvents.mockImplementation(async (matchId) => {
    matchEvents.value =
      matchId === 'match-2'
        ? [{ id: 'event-2', eventType: 'goal', teamId: 'away-2', minute: 22 }]
        : [{ id: 'event-1', eventType: 'yellow_card', teamId: 'home-1', minute: 12 }]
    return { items: matchEvents.value }
  })
  createEvent.mockResolvedValue({ id: 'event-created' })
  updateEvent.mockResolvedValue({ id: 'event-updated' })
  removeEvent.mockResolvedValue({ ok: true })
  saveResult.mockResolvedValue({ ok: true })
})

describe('MatchesResultEntry', () => {
  it('hydrates the completed-match score from the backend record', async () => {
    const unhandledRejections: unknown[] = []
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      unhandledRejections.push(event.reason)
    }

    window.addEventListener('unhandledrejection', onUnhandledRejection)

    const wrapper = mount(MatchesResultEntry, {
      global: {
        stubs,
      },
    })

    await flushPromises()

    expect(wrapper.find('[data-test="header"]').text()).toContain('sportMatchesManagement.resultsEntry.matchSubtitle')
    expect(wrapper.find('[data-test="fixture-home"]').text()).toBe('Home FC')
    expect(wrapper.find('[data-test="fixture-away"]').text()).toBe('Away FC')
    expect(wrapper.find('[data-test="fixture-score"]').text()).toBe('3-1')
    expect(wrapper.find('[data-test="result-home-team"]').text()).toBe('Home FC')
    expect(wrapper.find('[data-test="result-away-team"]').text()).toBe('Away FC')
    expect(wrapper.find('[data-test="result-home-score"]').text()).toBe('3')
    expect(wrapper.find('[data-test="result-away-score"]').text()).toBe('1')
    expect(wrapper.find('[data-test="result-status"]').text()).toBe('completed')
    expect(wrapper.find('[data-test="result-report"]').text()).toBe('Backend report')
    expect(loadMatch).toHaveBeenCalledWith('match-1')
    expect(unhandledRejections).toEqual([])

    window.removeEventListener('unhandledrejection', onUnhandledRejection)
    wrapper.unmount()
  })

  it('reloads when the route match id changes without a full page reload', async () => {
    const wrapper = mount(MatchesResultEntry, {
      global: {
        stubs,
      },
    })

    await flushPromises()

    expect(wrapper.find('[data-test="fixture-score"]').text()).toBe('3-1')

    routeState.params.id = 'match-2'
    await nextTick()
    await flushPromises()

    expect(wrapper.find('[data-test="fixture-home"]').text()).toBe('New Home FC')
    expect(wrapper.find('[data-test="fixture-away"]').text()).toBe('New Away FC')
    expect(wrapper.find('[data-test="fixture-score"]').text()).toBe('4-2')
    expect(wrapper.find('[data-test="result-home-team"]').text()).toBe('New Home FC')
    expect(wrapper.find('[data-test="result-away-team"]').text()).toBe('New Away FC')
    expect(wrapper.find('[data-test="result-status"]').text()).toBe('completed')
    expect(wrapper.find('[data-test="result-report"]').text()).toBe('Second backend report')
    expect(loadMatch).toHaveBeenLastCalledWith('match-2')
    expect(loadMatch).toHaveBeenCalledTimes(2)

    expect(() => wrapper.unmount()).not.toThrow()
  })
})
