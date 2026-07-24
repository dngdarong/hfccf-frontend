import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import en from '@/i18n/en/preschool'
import MyClasses from '@/modules/preschool/teacher/pages/MyClasses.vue'

const mockFetchMyPreschoolClasses = vi.fn()

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchMyPreschoolClasses: (...args) => mockFetchMyPreschoolClasses(...args),
}))

vi.mock('@/components/data-display/Pagination.vue', () => ({
  default: {
    props: ['modelValue', 'totalPages'],
    emits: ['update:modelValue'],
    template: '<div data-testid="pagination-stub"></div>',
  },
}))

function mountPage() {
  return mountWithPlugins(MyClasses, {
    messages: {
      en,
    },
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: {
          props: ['title', 'subtitle'],
          template: '<header></header>',
        },
        Button: true,
      },
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchMyPreschoolClasses.mockResolvedValue({
    items: [
      {
        id: '1',
        name: 'Kindergarten 1',
        code: 'KG1',
        studentsCount: 20,
        academic_year: '2025-2026',
        status: 'active',
        teacher_id: 'teacher-1',
      },
      {
        id: '2',
        name: 'Kindergarten 2',
        code: 'KG2',
        studentsCount: 18,
        academic_year: '2025-2026',
        status: 'active',
        teacher_id: 'teacher-1',
      },
    ],
    pagination: {
      page: 1,
      perPage: 10,
      total: 2,
      totalPages: 1,
    },
  })
})

describe('PreschoolTeacherMyClassesPage', () => {
  it('loads assigned classes on mount', async () => {
    const _wrapper = mountPage()
    await flushPromises()

    expect(mockFetchMyPreschoolClasses).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        perPage: 10,
      })
    )
  })

  it('displays empty state when no classes are assigned', async () => {
    mockFetchMyPreschoolClasses.mockResolvedValueOnce({
      items: [],
      pagination: {
        page: 1,
        perPage: 10,
        total: 0,
        totalPages: 0,
      },
    })

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('No classes are currently assigned to you')
  })

  it('renders table with class data', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Kindergarten 1')
    expect(wrapper.text()).toContain('KG1')
    expect(wrapper.text()).toContain('20')
    expect(wrapper.text()).toContain('2025-2026')
  })

  it('displays correct student counts for each class', async () => {
    const wrapper = mountPage()
    await flushPromises()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)

    // First class should show 20 students
    expect(rows[0].text()).toContain('20')

    // Second class should show 18 students
    expect(rows[1].text()).toContain('18')
  })

  it('displays zero when class has no students', async () => {
    mockFetchMyPreschoolClasses.mockResolvedValueOnce({
      items: [
        {
          id: '3',
          name: 'Empty Class',
          code: 'EC1',
          studentsCount: 0,
          academic_year: '2025-2026',
          status: 'active',
          teacher_id: 'teacher-1',
        },
      ],
      pagination: {
        page: 1,
        perPage: 10,
        total: 1,
        totalPages: 1,
      },
    })

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Empty Class')
    expect(wrapper.findAll('tbody tr')[0].text()).toContain('0')
  })

  it('filters classes by search term', async () => {
    const wrapper = mountPage()
    await flushPromises()

    const input = wrapper.find('input')
    await input.setValue('KG1')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Kindergarten 1')
  })

  it('handles load error gracefully', async () => {
    mockFetchMyPreschoolClasses.mockRejectedValueOnce(new Error('API error'))

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to load classes')
  })
})
