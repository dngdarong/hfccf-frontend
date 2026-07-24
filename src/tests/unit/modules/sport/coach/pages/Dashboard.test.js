import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CoachDashboard from '@/modules/sport/coach/pages/Dashboard.vue'
import enCommon from '@/i18n/en/common.js'
import enSport from '@/i18n/en/sport/index.js'
import khCommon from '@/i18n/kh/common.js'
import khSport from '@/i18n/kh/sport/index.js'

const fetchCoachDashboard = vi.hoisted(() => vi.fn())
const fetchSportTrainingSessions = vi.hoisted(() => vi.fn())
const routerPush = vi.hoisted(() => vi.fn())

vi.mock('@/modules/sport/services/sportApi', () => ({
  fetchCoachDashboard,
}))

vi.mock('@/modules/sport/services/api/sportTrainingSessionsApi', () => ({
  fetchSportTrainingSessions,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush }),
}))

const RoleDashboardLayoutStub = {
  props: ['title', 'subtitle', 'cards', 'spotlightTitle', 'spotlightText', 'actions'],
  template: `
    <main>
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
      <div v-for="card in cards" :key="card.title">{{ card.title }}: {{ card.value }}</div>
      <section v-if="spotlightTitle || spotlightText || actions?.length">{{ spotlightTitle }}{{ spotlightText }}{{ actions?.join(',') }}</section>
      <slot />
    </main>
  `,
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

  return mount(CoachDashboard, {
    global: {
      plugins: [i18n, createPinia()],
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        RoleDashboardLayout: RoleDashboardLayoutStub,
      },
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  fetchCoachDashboard.mockResolvedValue({
    summary: { teams: 2, matches: 5, liveMatches: 1 },
    teams: [{ id: 1, name: 'Falcons', playersCount: 8, activePlayersCount: 6 }],
    matches: [{ id: 2, homeTeamId: 1, homeTeam: 'Falcons', awayTeam: 'Tigers' }],
  })
  fetchSportTrainingSessions.mockResolvedValue({
    items: [{ id: 3, title: 'Technical session', team: 'Falcons', startsAt: '2099-01-01T09:00:00Z', endsAt: '2099-01-01T10:00:00Z', date: '2099-01-01', startTime: '09:00', endTime: '10:00', venue: 'Main pitch' }],
  })
})

describe('Sport coach dashboard', () => {
  it('renders only API-backed summary cards', async () => {
    const wrapper = mountDashboard()
    await flushPromises()

    expect(fetchCoachDashboard).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain('Teams: 2')
    expect(wrapper.text()).toContain('Matches: 5')
    expect(wrapper.text()).toContain('Live matches: 1')
    expect(wrapper.text()).toContain('Next training session')
    expect(wrapper.text()).toContain('Technical session')
    expect(wrapper.text()).toContain('My team overview')
    expect(wrapper.text()).toContain('Quick actions')
    expect(wrapper.text()).toContain('Falcons')
    expect(wrapper.text()).not.toContain('Athlete readiness')
    expect(wrapper.text()).not.toContain('Finalize training intensity plans')
  })

  it('shows an empty state when no upcoming training session exists', async () => {
    fetchSportTrainingSessions.mockResolvedValueOnce({ items: [] })

    const wrapper = mountDashboard()
    await flushPromises()

    expect(wrapper.text()).toContain('No upcoming training session.')
  })

  it('shows a localized dashboard section in Khmer', async () => {
    const wrapper = mountDashboard('kh')
    await flushPromises()

    expect(wrapper.text()).toContain('វគ្គហ្វឹកហ្វឺនបន្ទាប់')
    expect(wrapper.text()).toContain('សកម្មភាពរហ័ស')
  })

  it('exposes only Coach navigation actions', async () => {
    const wrapper = mountDashboard()
    await flushPromises()

    const actions = wrapper.findAll('button')
    const attendanceButton = actions.find((button) => button.text() === 'Mark attendance')
    const teamsButton = actions.find((button) => button.text() === 'Open my teams')

    await attendanceButton.trigger('click')
    await teamsButton.trigger('click')

    expect(routerPush).toHaveBeenCalledWith({ name: 'dashboard-sport-coach-attendance' })
    expect(routerPush).toHaveBeenCalledWith({ name: 'dashboard-sport-coach-teams' })
    expect(wrapper.text()).not.toContain('Admin')
  })

  it('keeps the localized coach dashboard shell', async () => {
    const wrapper = mountDashboard('kh')
    await flushPromises()

    expect(wrapper.text()).toContain('ក្រុមដែលបានចាត់តាំង និងសកម្មភាពការប្រកួតថ្មីៗ។')
  })
})
