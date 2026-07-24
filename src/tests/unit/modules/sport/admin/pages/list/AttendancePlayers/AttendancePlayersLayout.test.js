import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { createTestI18n, createTestRouter } from '@/tests/helpers/mount'
import enCommon from '@/i18n/en/common'
import enDashboardNav from '@/i18n/en/dashboard/nav'
import enSport from '@/i18n/en/sport'
import khCommon from '@/i18n/kh/common'
import khDashboardNav from '@/i18n/kh/dashboard/nav'
import khSport from '@/i18n/kh/sport'
import AttendancePlayers from '@/modules/sport/admin/pages/list/AttendancePlayers/AttendancePlayers.vue'

const mockFetchCoachTeams = vi.fn()
const mockFetchSportTeams = vi.fn()
const mockFetchSportAttendance = vi.fn()
const mockFetchTeamRoster = vi.fn()

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
  }),
}))

vi.mock('@/modules/sport/services/sportApi', () => ({
  fetchCoachTeams: (...args) => mockFetchCoachTeams(...args),
  fetchSportAttendance: (...args) => mockFetchSportAttendance(...args),
  fetchSportTeams: (...args) => mockFetchSportTeams(...args),
  saveSportPlayerAttendance: vi.fn(),
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

async function mountPage({
  locale = 'en',
  routeName = 'dashboard-sport-coach-attendance',
  coachTeams = [],
  rosters = {},
} = {}) {
  const i18n = createTestI18n(createMessages())
  i18n.global.locale.value = locale

  const router = createTestRouter([createRoute(routeName)])
  const pinia = createPinia()

  await router.push({ name: routeName })
  await router.isReady()

  mockFetchCoachTeams.mockResolvedValue({
    items: coachTeams,
    pagination: { page: 1, perPage: 100, total: coachTeams.length, totalPages: 1 },
  })
  mockFetchSportTeams.mockResolvedValue({ items: [], pagination: { page: 1, perPage: 100, total: 0, totalPages: 1 } })
  mockFetchTeamRoster.mockImplementation((teamId) => Promise.resolve({ players: rosters[teamId] || [] }))
  mockFetchSportAttendance.mockImplementation(() => Promise.resolve({ items: [] }))

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
        AttendanceToolbar: { props: ['showBack'], template: '<section data-testid="toolbar" />' },
        AttendanceTable: { template: '<section data-testid="table" />' },
      },
    },
  })

  await flushPromises()
  await flushPromises()

  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-07-14T00:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('AttendancePlayers layout', () => {
  it('renders the coach page title once and formats the summary date in English', async () => {
    const wrapper = await mountPage({
      locale: 'en',
      coachTeams: [{ id: 'team-1', name: 'Lions FC' }],
      rosters: {
        'team-1': [{ id: 'player-1', name: 'Player One' }],
      },
    })

    expect(wrapper.find('[data-testid="header"] h1').text()).toBe('Player Attendance')
    expect(wrapper.find('.hero-title').exists()).toBe(false)
    expect(wrapper.findAll('.att-stat__value')[1].text()).toBe('14 Jul 2026')
  })

  it('renders the coach page title once and formats the summary date in Khmer', async () => {
    const wrapper = await mountPage({
      locale: 'kh',
      coachTeams: [{ id: 'team-1', name: 'Lions FC' }],
      rosters: {
        'team-1': [{ id: 'player-1', name: 'Player One' }],
      },
    })

    expect(wrapper.find('[data-testid="header"] h1').text()).toBe('វត្តមានកីឡាករ')
    expect(wrapper.find('.hero-title').exists()).toBe(false)
    expect(wrapper.findAll('.att-stat__value')[1].text()).not.toBe('2026-07-14')
    expect(wrapper.findAll('.att-stat__value')[1].text()).not.toContain('\n')
  })
})
