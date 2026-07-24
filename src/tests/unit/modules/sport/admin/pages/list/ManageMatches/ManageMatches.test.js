import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ManageMatches from '@/modules/sport/admin/pages/list/ManageMatches/ManageMatches.vue'

const fetchSportMatches = vi.fn()
const deleteSportMatch = vi.fn()
const push = vi.fn()
const t = vi.fn((key, params = {}) => {
  if (key === 'sportMatchesManagement.visibleRange') {
    return `Showing ${params.start}–${params.end} of ${params.total} matches`
  }
  return key
})

vi.mock('@/modules/sport/services/sportApi', () => ({
  fetchSportMatches: (...args) => fetchSportMatches(...args),
  deleteSportMatch: (...args) => deleteSportMatch(...args),
}))

vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({
    t,
    language: { value: 'en' },
  }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}))

const commonStubs = {
  MainLayout: { template: '<div><slot /></div>' },
  HeaderSection: { template: '<div data-test="header"><slot /></div>' },
  AlertSuccess: { props: ['show', 'message'], template: '<div v-if="show" data-test="delete-success">{{ message }}</div>' },
  AlertError: { props: ['show', 'message'], template: '<div v-if="show" data-test="alert-error">{{ message }}</div>' },
  AlertQuestion: {
    props: ['show'],
    template: '<div v-if="show" data-test="delete-confirm"><button data-test="confirm" @click="$emit(\'confirm\')">confirm</button><button data-test="cancel" @click="$emit(\'cancel\')">cancel</button></div>',
  },
  MatchesSearchFilterBar: {
    props: ['searchQuery'],
    template: '<div data-test="filters"><input data-test="search-input" :value="searchQuery" @input="$emit(\'update:searchQuery\', $event.target.value)" /><button data-test="clear-filters" @click="$emit(\'update:searchQuery\', \'\'); $emit(\'update:competition\', \'\'); $emit(\'update:tournament\', \'\'); $emit(\'update:matchDateInput\', \'\'); $emit(\'clear\')">clear</button></div>',
  },
  MatchesSummaryCards: { template: '<div data-test="summary" />' },
  PlayerInfoToolbar: { props: ['title', 'text'], template: '<div>{{ title }} {{ text }}<slot name="actions" /></div>' },
  Pagination: { props: ['totalPages'], template: '<div data-test="pagination" :data-total-pages="totalPages"><button data-test="next-page" @click="$emit(\'update:modelValue\', 2)">next</button></div>' },
  Button: { template: '<button><slot /></button>' },
  MatchesTable: {
    props: ['matches'],
    template: '<div><span data-test="matches-count">{{ matches.length }}</span><span data-test="row-numbers">{{ matches.map((match) => match.rowNumber).join(\',\') }}</span><button data-test="delete-row" @click="$emit(\'delete\', matches[0])">delete</button></div>',
  },
}

describe('ManageMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchSportMatches.mockResolvedValue({
      items: [{ id: 'm1', homeTeam: 'Home FC', awayTeam: 'Away FC', schedule: '2026-05-14T15:00:00.000Z' }],
    })
  })

  it('does not show a false success when delete fails', async () => {
    deleteSportMatch.mockRejectedValueOnce(new Error('Delete failed'))

    const wrapper = mount(ManageMatches, {
      global: {
        stubs: commonStubs,
      },
    })

    await flushPromises()

    expect(wrapper.find('[data-test="matches-count"]').text()).toBe('1')

    await wrapper.find('[data-test="delete-row"]').trigger('click')
    await wrapper.find('[data-test="confirm"]').trigger('click')
    await flushPromises()

    expect(deleteSportMatch).toHaveBeenCalledWith('m1')
    expect(wrapper.find('[data-test="matches-count"]').text()).toBe('1')
    expect(wrapper.find('[data-test="delete-success"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="alert-error"]').exists()).toBe(true)
  })

  it('shows a load error when the matches endpoint fails', async () => {
    fetchSportMatches.mockRejectedValueOnce(new Error('Load failed'))

    const wrapper = mount(ManageMatches, {
      global: {
        stubs: commonStubs,
      },
    })

    await flushPromises()

    expect(wrapper.find('[data-test="matches-count"]').text()).toBe('0')
    expect(wrapper.find('[data-test="alert-error"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="delete-success"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="filters"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('common.errorTryAgain')
  })

  it('shows a filtered page range and pagination only beyond five records', async () => {
    fetchSportMatches.mockResolvedValueOnce({
      items: Array.from({ length: 6 }, (_, index) => ({
        id: `m${index + 1}`,
        homeTeam: `Home ${index + 1}`,
        awayTeam: `Away ${index + 1}`,
      })),
    })

    const wrapper = mount(ManageMatches, { global: { stubs: commonStubs } })
    await flushPromises()

    expect(wrapper.find('[data-test="matches-count"]').text()).toBe('5')
    expect(wrapper.find('[data-test="row-numbers"]').text()).toBe('1,2,3,4,5')
    expect(wrapper.find('[data-test="pagination"]').attributes('data-total-pages')).toBe('2')
    expect(wrapper.text()).toContain('Showing 1–5 of 6 matches')

    await wrapper.find('[data-test="next-page"]').trigger('click')
    expect(wrapper.find('[data-test="row-numbers"]').text()).toBe('6')

    await wrapper.find('[data-test="search-input"]').setValue('Home 6')
    await flushPromises()

    expect(wrapper.find('[data-test="matches-count"]').text()).toBe('1')
    expect(wrapper.find('[data-test="row-numbers"]').text()).toBe('1')
    expect(wrapper.find('[data-test="pagination"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Showing 1–1 of 1 matches')
  })

  it('resets the current page when filters are cleared', async () => {
    fetchSportMatches.mockResolvedValueOnce({
      items: Array.from({ length: 6 }, (_, index) => ({
        id: `m${index + 1}`,
        homeTeam: `Home ${index + 1}`,
        awayTeam: `Away ${index + 1}`,
      })),
    })

    const wrapper = mount(ManageMatches, { global: { stubs: commonStubs } })
    await flushPromises()
    await wrapper.find('[data-test="search-input"]').setValue('Home 6')
    await wrapper.find('[data-test="clear-filters"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-test="matches-count"]').text()).toBe('5')
    expect(wrapper.find('[data-test="row-numbers"]').text()).toBe('1,2,3,4,5')
    expect(wrapper.text()).toContain('Showing 1–5 of 6 matches')
    expect(wrapper.find('[data-test="pagination"]').exists()).toBe(true)
  })

  it('hides pagination and numbers exactly five records from one', async () => {
    fetchSportMatches.mockResolvedValueOnce({
      items: Array.from({ length: 5 }, (_, index) => ({
        id: `backend-${index + 1}`,
        homeTeam: `Home ${index + 1}`,
        awayTeam: `Away ${index + 1}`,
      })),
    })

    const wrapper = mount(ManageMatches, { global: { stubs: commonStubs } })
    await flushPromises()

    expect(wrapper.find('[data-test="row-numbers"]').text()).toBe('1,2,3,4,5')
    expect(wrapper.find('[data-test="pagination"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Showing 1–5 of 5 matches')
  })
})
