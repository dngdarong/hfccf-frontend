import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { createTestI18n, createTestRouter } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'
import TeacherClassroomResources from '@/modules/preschool/teacher/pages/TeacherClassroomResources.vue'

const mockFetchClassroomResources = vi.fn()

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchClassroomResources: (...args) => mockFetchClassroomResources(...args),
}))

function mountPage(locale = 'en') {
  const i18n = createTestI18n({ en: enPreschool, kh: khPreschool })
  i18n.global.locale.value = locale
  const router = createTestRouter()
  const pinia = createPinia()

  return mount(TeacherClassroomResources, {
    global: {
      plugins: [i18n, pinia, router, PrimeVue],
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
        Table: { props: ['rows', 'columns', 'loading', 'emptyText'], template: '<div class="table-stub">{{ loading ? "loading" : (rows?.[0]?.name || emptyText) }}</div>' },
        Pagination: { props: ['modelValue', 'totalPages'], template: '<div class="pagination-stub">{{ totalPages }}</div>' },
      },
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TeacherClassroomResources', () => {
  it('shows a loading state before classroom resources resolve', async () => {
    mockFetchClassroomResources.mockReturnValue(new Promise(() => {}))

    const wrapper = mountPage('en')
    await flushPromises()

    expect(wrapper.text()).toContain('loading')
  })

  it('renders classroom resources in EN and KH and stays read-only', async () => {
    mockFetchClassroomResources.mockResolvedValue({
      items: [
        {
          id: 1,
          name: 'Picture Books',
          category: 'books',
          quantity: 12,
          condition: 'good',
          notes: 'Teacher shelf',
        },
      ],
      pagination: { page: 1, perPage: 20, total: 1, totalPages: 1 },
    })

    const wrapper = mountPage('en')
    await flushPromises()

    expect(mockFetchClassroomResources).toHaveBeenCalledWith({
      page: 1,
      perPage: 20,
      search: '',
      category: '',
      condition: '',
    })
    expect(wrapper.text()).toContain('Classroom Resources')
    expect(wrapper.text()).toContain('Picture Books')
    expect(wrapper.text()).toContain('Good')
    expect(wrapper.findAll('button')).toHaveLength(0)

    const khWrapper = mountPage('kh')
    await flushPromises()

    expect(khWrapper.text()).toContain('ធនធានថ្នាក់រៀន')
  })

  it('renders the empty state and api error state safely', async () => {
    mockFetchClassroomResources.mockResolvedValueOnce({
      items: [],
      pagination: { page: 1, perPage: 20, total: 0, totalPages: 1 },
    })

    const wrapper = mountPage('en')
    await flushPromises()

    expect(wrapper.text()).toContain('No classroom resources have been added yet.')
  })

  it('renders the api error state safely', async () => {
    mockFetchClassroomResources.mockRejectedValueOnce(new Error('Network down'))

    const wrapper = mountPage('en')
    await flushPromises()

    expect(wrapper.text()).toContain('Network down')
  })
})
