import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { createTestI18n, createTestRouter } from '@/tests/helpers/mount'
import enCommon from '@/i18n/en/common'
import enDashboardNav from '@/i18n/en/dashboard/nav'
import khCommon from '@/i18n/kh/common'
import khDashboardNav from '@/i18n/kh/dashboard/nav'
import enSport from '@/i18n/en/sport'
import khSport from '@/i18n/kh/sport'
import AttendancePlayers from '@/modules/sport/admin/pages/list/AttendancePlayers/AttendancePlayers.vue'

const mockFetchCoachTeams = vi.fn()
const mockFetchSportTeams = vi.fn()
const mockFetchSportAttendance = vi.fn()
const mockFetchTeamRoster = vi.fn()
const mockSaveSportPlayerAttendance = vi.fn()
const mockToastAdd = vi.fn()

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: mockToastAdd,
  }),
}))

vi.mock('@/modules/sport/services/sportApi', () => ({
  fetchCoachTeams: (...args) => mockFetchCoachTeams(...args),
  fetchSportAttendance: (...args) => mockFetchSportAttendance(...args),
  fetchSportTeams: (...args) => mockFetchSportTeams(...args),
  saveSportPlayerAttendance: (...args) => mockSaveSportPlayerAttendance(...args),
}))

vi.mock('@/modules/sport/services/api/teamRosterApi', () => ({
  fetchTeamRoster: (...args) => mockFetchTeamRoster(...args),
}))

function createRoute(routeName, query = {}) {
  return {
    path: routeName === 'dashboard-sport-coach-attendance'
      ? '/module/sport-coach/attendance'
      : '/module/sport-admin/attendance/players',
    name: routeName,
    component: { template: '<div />' },
    query,
  }
}

function createMessages() {
  return {
    en: { ...enCommon, nav: enDashboardNav, ...enSport },
    kh: { ...khCommon, nav: khDashboardNav, ...khSport },
  }
}

function buildRosters(rosters = {}) {
  return (teamId) => Promise.resolve({ players: rosters[teamId] || [] })
}

function buildAttendance(itemsByTeam = {}) {
  return ({ teamId }) => Promise.resolve({ items: itemsByTeam[teamId] || [] })
}

async function mountPage({
  routeName,
  query = {},
  locale = 'en',
  coachTeams = [],
  sportTeams = [],
  rosters = {},
  attendance = {},
  fetchCoachTeamsImpl,
  fetchSportTeamsImpl,
  fetchTeamRosterImpl,
  fetchSportAttendanceImpl,
} = {}) {
  const i18n = createTestI18n(createMessages())
  i18n.global.locale.value = locale

  const router = createTestRouter([createRoute(routeName, query)])
  const pinia = createPinia()

  await router.push({ name: routeName, query })
  await router.isReady()

  mockFetchCoachTeams.mockImplementation(fetchCoachTeamsImpl || (() => Promise.resolve({
    items: coachTeams,
    pagination: { page: 1, perPage: 100, total: coachTeams.length, totalPages: 1 },
  })))
  mockFetchSportTeams.mockImplementation(fetchSportTeamsImpl || (() => Promise.resolve({
    items: sportTeams,
    pagination: { page: 1, perPage: 100, total: sportTeams.length, totalPages: 1 },
  })))
  mockFetchTeamRoster.mockImplementation(fetchTeamRosterImpl || buildRosters(rosters))
  mockFetchSportAttendance.mockImplementation(fetchSportAttendanceImpl || buildAttendance(attendance))

  const wrapper = mount(AttendancePlayers, {
    global: {
      plugins: [i18n, pinia, router, PrimeVue],
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: {
          props: ['title', 'subtitle'],
          template: '<header data-testid="header"><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>',
        },
        Toast: { template: '<div data-testid="toast" />' },
        AttendanceHero: {
          props: ['stats'],
          template: '<section data-testid="hero"><slot name="copy" /></section>',
        },
        AttendanceToolbar: {
          props: ['teamId', 'teamOptions', 'loading', 'teamsLoading', 'showBack'],
          emits: ['update:team-id', 'update:date', 'shift-date', 'go-today', 'go-back'],
          template:
            '<section data-testid="toolbar">' +
            '<span data-testid="team-count">{{ teamOptions.length }}</span>' +
            '<span data-testid="selected-team">{{ teamId }}</span>' +
            '<button v-if="teamOptions[0]" data-testid="team-1" @click="$emit(\'update:team-id\', teamOptions[0].value)">Team 1</button>' +
            '<button v-if="teamOptions[1]" data-testid="team-2" @click="$emit(\'update:team-id\', teamOptions[1].value)">Team 2</button>' +
            '</section>',
        },
        AttendanceTable: {
          props: ['players', 'summary', 'markedCount', 'loading', 'saving'],
          emits: ['toggle-status', 'update-note', 'mark-all', 'clear-all', 'save'],
          template:
            '<section data-testid="attendance-table">' +
            '<span data-testid="players-length">{{ players.length }}</span>' +
            '<span data-testid="summary">{{ summary }}</span>' +
            '</section>',
        },
      },
    },
  })
  await flushPromises()
  await flushPromises()

  return { wrapper, router }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSaveSportPlayerAttendance.mockResolvedValue({})
})

describe('AttendancePlayers coach route', () => {
  it('loads assigned teams without auto-selecting when multiple teams are available', async () => {
    const { wrapper, router } = await mountPage({
      routeName: 'dashboard-sport-coach-attendance',
      coachTeams: [
        { id: 'team-1', name: 'Lions FC' },
        { id: 'team-2', name: 'Tigers FC' },
      ],
    })

    expect(mockFetchCoachTeams).toHaveBeenCalled()
    expect(mockFetchSportTeams).not.toHaveBeenCalled()
    expect(mockFetchTeamRoster).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Choose one of your assigned teams and mark each player for the selected date.')
    expect(wrapper.find('[data-testid="team-count"]').text()).toBe('2')
    expect(wrapper.find('[data-testid="selected-team"]').text()).toBe('')
    expect(router.currentRoute.value.query.teamId).toBeUndefined()
  })

  it('auto-selects a single assigned team and preserves the query on refresh', async () => {
    const { wrapper, router } = await mountPage({
      routeName: 'dashboard-sport-coach-attendance',
      coachTeams: [{ id: 'team-1', name: 'Lions FC' }],
      rosters: {
        'team-1': [{ id: 'player-1', name: 'Player One' }],
      },
    })

    expect(wrapper.text()).toContain('Player Attendance')
    expect(wrapper.find('[data-testid="team-count"]').text()).toBe('1')
    expect(wrapper.find('[data-testid="selected-team"]').text()).toBe('team-1')
    expect(router.currentRoute.value.query.teamId).toBe('team-1')
    expect(mockFetchTeamRoster).toHaveBeenCalledWith('team-1')
    expect(mockFetchSportAttendance).toHaveBeenCalledWith(expect.objectContaining({ teamId: 'team-1' }))
    expect(wrapper.find('[data-testid="players-length"]').text()).toBe('1')
  })

  it('keeps a valid teamId query and lets the coach switch between assigned teams', async () => {
    const { wrapper, router } = await mountPage({
      routeName: 'dashboard-sport-coach-attendance',
      query: { teamId: 'team-2' },
      coachTeams: [
        { id: 'team-1', name: 'Lions FC' },
        { id: 'team-2', name: 'Tigers FC' },
      ],
      rosters: {
        'team-1': [{ id: 'player-1', name: 'Player One' }],
        'team-2': [{ id: 'player-2', name: 'Player Two' }],
      },
    })

    expect(router.currentRoute.value.query.teamId).toBe('team-2')
    expect(wrapper.find('[data-testid="selected-team"]').text()).toBe('team-2')
    expect(mockFetchTeamRoster).toHaveBeenCalledWith('team-2')

    await wrapper.find('[data-testid="team-1"]').trigger('click')
    await flushPromises()
    await flushPromises()

    expect(router.currentRoute.value.query.teamId).toBe('team-1')
    expect(wrapper.find('[data-testid="selected-team"]').text()).toBe('team-1')
    expect(mockFetchTeamRoster).toHaveBeenLastCalledWith('team-1')
  })

  it('shows a safe error when the coach opens an unauthorized teamId', async () => {
    const unauthorizedRoster = (teamId) => {
      if (teamId === 'team-999') {
        return Promise.reject(new Error('Forbidden team'))
      }

      return Promise.resolve({ players: [{ id: 'player-1', name: 'Player One' }] })
    }

    const unauthorizedAttendance = ({ teamId }) => {
      if (teamId === 'team-999') {
        return Promise.reject(new Error('Forbidden attendance'))
      }

      return Promise.resolve({ items: [] })
    }

    const { wrapper } = await mountPage({
      routeName: 'dashboard-sport-coach-attendance',
      query: { teamId: 'team-999' },
      coachTeams: [{ id: 'team-1', name: 'Lions FC' }],
      fetchTeamRosterImpl: unauthorizedRoster,
      fetchSportAttendanceImpl: unauthorizedAttendance,
    })

    expect(wrapper.text()).toContain('Forbidden team')
    expect(mockFetchCoachTeams).toHaveBeenCalled()
    expect(mockFetchSportTeams).not.toHaveBeenCalled()
  })

  it('shows a clear empty state when no coach teams are assigned', async () => {
    const { wrapper } = await mountPage({
      routeName: 'dashboard-sport-coach-attendance',
      coachTeams: [],
    })

    expect(wrapper.text()).toContain('No active team assignments were found for your account.')
    expect(mockFetchTeamRoster).not.toHaveBeenCalled()
    expect(mockFetchSportAttendance).not.toHaveBeenCalled()
  })
})

describe('AttendancePlayers admin route', () => {
  it('keeps the admin route on the sport team lookup path', async () => {
    const { wrapper } = await mountPage({
      routeName: 'dashboard-sport-admin-attendance-players',
      sportTeams: [{ id: 'team-1', name: 'Admin FC' }],
      rosters: {
        'team-1': [{ id: 'player-1', name: 'Player One' }],
      },
    })

    expect(wrapper.text()).toContain('Player Attendance')
    expect(mockFetchSportTeams).toHaveBeenCalled()
    expect(mockFetchCoachTeams).not.toHaveBeenCalled()
    expect(mockFetchTeamRoster).toHaveBeenCalledWith('team-1')
  })
})
