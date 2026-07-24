import { describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enSport from '@/i18n/en/sport'
import DivisionManagement from '@/modules/sport/admin/pages/list/DivisionManagement/DivisionManagement.vue'
import PlayingStyleManagement from '@/modules/sport/admin/pages/list/PlayingStyleManagement/PlayingStyleManagement.vue'
import {
  fetchSportDivisions,
  fetchSportPlayingStyles,
} from '@/modules/sport/services/sportApi'

vi.mock('@/modules/sport/services/sportApi', () => ({
  deleteSportDivision: vi.fn(),
  deleteSportPlayingStyle: vi.fn(),
  fetchSportDivisions: vi.fn(),
  fetchSportPlayingStyles: vi.fn(),
}))

const pageCases = [
  {
    name: 'DivisionManagement',
    component: DivisionManagement,
    fetch: fetchSportDivisions,
    emptyText: 'No divisions yet. Create one to get started.',
    row: { id: 'division-1', name: 'Junior', status: 'active', teamsCount: 2 },
  },
  {
    name: 'PlayingStyleManagement',
    component: PlayingStyleManagement,
    fetch: fetchSportPlayingStyles,
    emptyText: 'No playing styles yet. Create one to get started.',
    row: { id: 'style-1', name: 'Balanced', status: 'active', teamsCount: 2 },
  },
]

function mountPage(component) {
  return mountWithPlugins(component, {
    messages: { en: { ...enSport } },
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: { template: '<header><slot /></header>' },
        Pagination: { template: '<div data-testid="pagination" />' },
        Loading: { template: '<div data-testid="loading" role="status">Loading</div>' },
        StatusBadge: {
          props: ['status'],
          template: '<span data-testid="status-badge">{{ status }}</span>',
        },
      },
    },
  })
}

describe.each(pageCases)('$name', ({ component, fetch, emptyText, row }) => {
  it('gates the empty state behind the shared loading state', async () => {
    let resolveFetch
    fetch.mockReturnValueOnce(new Promise((resolve) => { resolveFetch = resolve }))

    const wrapper = mountPage(component)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain(emptyText)

    resolveFetch({ items: [], pagination: { total: 0 } })
    await flushPromises()

    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false)
    expect(wrapper.text()).toContain(emptyText)
  })

  it('renders localized table content and shared status badges', async () => {
    fetch.mockResolvedValueOnce({ items: [row], pagination: { total: 1 } })

    const wrapper = mountPage(component)
    await flushPromises()

    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('[data-testid="status-badge"]').text()).toBe('active')
    expect(wrapper.findAll('button[type="button"]').length).toBeGreaterThan(0)
  })
})
