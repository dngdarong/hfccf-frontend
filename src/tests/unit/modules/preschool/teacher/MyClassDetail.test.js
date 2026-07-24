import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import enCommon from '@/i18n/en/common'
import MyClassDetail from '@/modules/preschool/teacher/pages/MyClassDetail.vue'

const mockFetchMyPreschoolClass = vi.fn()
const mockFetchPreschoolStudents = vi.fn()
const mockFetchPreschoolClass = vi.fn()
const mockPush = vi.fn()

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchMyPreschoolClass: (...args) => mockFetchMyPreschoolClass(...args),
  fetchPreschoolStudents: (...args) => mockFetchPreschoolStudents(...args),
  // Admin endpoint — must never be called from the teacher detail page.
  fetchPreschoolClass: (...args) => mockFetchPreschoolClass(...args),
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRoute: () => ({ params: { classId: '4' } }),
    useRouter: () => ({ push: mockPush }),
  }
})

function mountPage() {
  return mountWithPlugins(MyClassDetail, {
    messages: { en: { ...enPreschool, common: enCommon } },
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: {
          props: ['title', 'subtitle'],
          template: '<header><h1>{{ title }}</h1></header>',
        },
        Button: {
          props: ['label'],
          template: '<button @click="$emit(\'click\')">{{ label }}<slot /></button>',
        },
      },
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchMyPreschoolClass.mockResolvedValue({
    id: '4',
    name: 'Room113',
    code: 'PS-NUM-003',
    status: 'active',
    studentsCount: 5,
  })
  mockFetchPreschoolStudents.mockResolvedValue({ items: [] })
})

describe('PreschoolTeacherMyClassDetailPage', () => {
  it('calls the teacher-safe endpoint with the route class id', async () => {
    mountPage()
    await flushPromises()

    expect(mockFetchMyPreschoolClass).toHaveBeenCalledWith('4')
  })

  it('does not call the admin /preschool/classes/{id} endpoint', async () => {
    mountPage()
    await flushPromises()

    expect(mockFetchPreschoolClass).not.toHaveBeenCalled()
  })

  it('renders assigned class detail', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Room113')
    expect(wrapper.text()).toContain('PS-NUM-003')
  })

  it('renders a safe error state on 403', async () => {
    mockFetchMyPreschoolClass.mockRejectedValueOnce({ response: { status: 403 } })

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to load class details')
  })

  it('renders a safe error state on 404', async () => {
    mockFetchMyPreschoolClass.mockRejectedValueOnce({ response: { status: 404 } })

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Class not found')
  })

  it('navigates back to My Classes on back action', async () => {
    const wrapper = mountPage()
    await flushPromises()

    const backButton = wrapper.findAll('button').find((b) => b.text().includes('Back'))
    await backButton.trigger('click')

    expect(mockPush).toHaveBeenCalledWith({ name: 'dashboard-preschool-teacher-classes' })
  })
})
