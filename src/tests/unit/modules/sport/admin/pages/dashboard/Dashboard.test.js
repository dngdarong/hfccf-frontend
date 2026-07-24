import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Dashboard from '@/modules/sport/admin/pages/dashboard/Dashboard.vue'
import enCommon from '@/i18n/en/common.js'
import enSport from '@/i18n/en/sport/index.js'
import khCommon from '@/i18n/kh/common.js'
import khSport from '@/i18n/kh/sport/index.js'

const { fetchSportDashboard, fetchTournamentStandings } = vi.hoisted(() => ({
  fetchSportDashboard: vi.fn(),
  fetchTournamentStandings: vi.fn(),
}))

vi.mock('@/modules/sport/services/sportApi', () => ({
  fetchSportDashboard,
  fetchTournamentStandings,
}))

const StatsCardsStub = {
  name: 'StatsCardsStub',
  props: ['cards'],
  template: '<div data-test="stats-cards" />',
}

const baseStubs = {
  MainLayout: { template: '<div><slot /></div>' },
  HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
  StatsCards: StatsCardsStub,
  TournamentBanner: { template: '<div data-test="banner" />' },
  TournamentList: { template: '<div data-test="tournament-list" />' },
  StandingsPanel: { template: '<div data-test="standings-panel" />' },
}

function mountDashboard(locale = 'en') {
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages: {
      en: { ...enCommon, ...enSport },
      kh: { ...khCommon, ...khSport },
    },
    missingWarn: false,
    fallbackWarn: false,
  })

  return mount(Dashboard, {
    global: {
      plugins: [i18n, createPinia()],
      stubs: baseStubs,
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()

  fetchSportDashboard.mockResolvedValue({
    summary: {
      teams: 12,
      players: 44,
      scheduledMatches: 3,
      lowStockItems: 7,
      coaches: 5,
      completedMatches: 99,
      matches: 4,
    },
    tournaments: [],
    standings: [],
    featuredTournament: null,
  })

  fetchTournamentStandings.mockResolvedValue({ items: [] })
})

describe('Sport dashboard', () => {
  it('reads the low-stock KPI from the equipment summary contract', async () => {
    const wrapper = mountDashboard('en')
    await flushPromises()

    const statsCards = wrapper.findComponent(StatsCardsStub)
    const cards = statsCards.props('cards')
    const lowStockCard = cards.find((card) => card.title === 'Low Stock Items')

    expect(fetchSportDashboard).toHaveBeenCalled()
    expect(fetchTournamentStandings).not.toHaveBeenCalled()
    expect(lowStockCard.value).toBe(7)
    expect(cards.find((card) => card.title === 'Coach Requests')).toBeUndefined()
    expect(wrapper.find('[data-test="banner"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Sport Program Dashboard')
  })

  it('uses dashboard-provided standings without a duplicate standings request', async () => {
    fetchSportDashboard.mockResolvedValueOnce({
      summary: { teams: 1, players: 1, scheduledMatches: 0, lowStockItems: 0, coaches: 1 },
      tournaments: [{ id: 'tournament-1', name: 'Active Cup', status: 'active', matchesCount: 2 }],
      featuredTournament: { id: 'tournament-1', name: 'Active Cup', status: 'active', matchesCount: 2 },
      standings: [{ rankPosition: 1, team: { name: 'Team A' }, points: 3 }],
    })

    const wrapper = mountDashboard('en')
    await flushPromises()

    expect(fetchTournamentStandings).not.toHaveBeenCalled()
    expect(wrapper.find('[data-test="banner"]').exists()).toBe(true)
  })

  it('keeps Khmer labels available for the dashboard shell', async () => {
    const wrapper = mountDashboard('kh')
    await flushPromises()

    expect(wrapper.text()).toContain('ផ្ទាំងគ្រប់គ្រងកម្មវិធីកីឡា')
  })
})
