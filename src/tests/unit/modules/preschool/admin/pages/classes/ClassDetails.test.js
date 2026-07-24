import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import { preschoolRoutes } from '@/modules/preschool/routes'
import ClassDetails from '@/modules/preschool/admin/pages/classes/ClassDetails.vue'

const mockFetchClass = vi.fn()
const mockFetchTeacher = vi.fn()
const mockFetchStudent = vi.fn()

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolClass: (...args) => mockFetchClass(...args),
  fetchPreschoolTeacher: (...args) => mockFetchTeacher(...args),
  fetchPreschoolStudent: (...args) => mockFetchStudent(...args),
}))

function createClassDetailsRoute() {
  return {
    path: '/module/preschool-admin/classes/:id',
    name: 'dashboard-preschool-admin-class-details',
    component: { template: '<div />' },
  }
}

function mountPage() {
  return mountWithPlugins(ClassDetails, {
    messages: {
      en: enPreschool,
    },
    routes: [createClassDetailsRoute()],
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: {
          props: ['title', 'subtitle'],
          template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>',
        },
        Button: {
          props: ['disabled', 'loading'],
          emits: ['click'],
          template: '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
        },
        StatusBadge: {
          props: ['status', 'label'],
          template: '<span class="status-badge-stub">{{ label || status }}</span>',
        },
        Avatar: {
          props: ['image', 'label'],
          template: '<div class="avatar-stub">{{ label }}</div>',
        },
        RouterLink: {
          props: ['to'],
          template: '<a class="router-link-stub"><slot /></a>',
        },
      },
    },
  })
}

function mockClassDetailData(overrides = {}) {
  mockFetchClass.mockResolvedValue({
    id: 'class-1',
    code: 'PS-NUR-01',
    name: 'Morning Nursery Blue',
    teacherUserId: 'teacher-1',
    teacherDisplayName: 'Teacher Alpha',
    level: 'Nursery',
    schedule: 'Monday, Tuesday, Wednesday, Thursday, Friday, 08:00–11:00',
    studentsCount: 2,
    studentAssignments: [
      {
        id: 'student-1',
        studentCode: 'STU-HFCCF-0001',
        fullName: 'Alice Student',
        status: 'active',
      },
      {
        id: 'student-2',
        studentCode: 'STU-HFCCF-0002',
        fullName: 'Bob Student',
        status: 'inactive',
      },
    ],
    activeStudentAssignments: [
      {
        id: 'student-1',
        studentCode: 'STU-HFCCF-0001',
        fullName: 'Alice Student',
        status: 'active',
      },
    ],
    teacherAssignments: [
      {
        id: 'teacher-assignment-1',
        teacherUserId: 'teacher-1',
        teacherDisplayName: 'Teacher Alpha',
        status: 'active',
      },
    ],
    status: 'active',
    room: 'Room A1',
    notes: 'Bring crayons.\nKeep water ready.',
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-10T08:00:00Z',
    ...overrides,
  })

  mockFetchTeacher.mockResolvedValue({
    id: 'teacher-1',
    fullName: 'Teacher Alpha',
    email: 'teacher@example.com',
    phone: '012345678',
    status: 'active',
    avatarUrl: '',
  })

  mockFetchStudent.mockImplementation((id) => {
    if (String(id) === 'student-1') {
      return Promise.resolve({
        id: 'student-1',
        fullName: 'Alice Student',
        publicId: 'STU-HFCCF-0001',
        guardianPhone: '011111111',
        avatarUrl: '',
        status: 'active',
      })
    }

    return Promise.resolve({
      id: 'student-2',
      fullName: 'Bob Student',
      publicId: 'STU-HFCCF-0002',
      guardianPhone: '022222222',
      avatarUrl: '',
      status: 'inactive',
    })
  })
}

async function mountClassDetailsPage(classId = 'class-1') {
  const wrapper = mountPage()

  await wrapper.vm.$router.push({
    name: 'dashboard-preschool-admin-class-details',
    params: { id: classId },
  })
  await flushPromises()

  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  mockClassDetailData()
})

describe('ClassDetails', () => {
  it('registers the class details route', () => {
    expect(
      preschoolRoutes.some(
        (route) => route.name === 'dashboard-preschool-admin-class-details'
          && route.path === '/module/preschool-admin/classes/:id',
      ),
    ).toBe(true)
  })

  it('mounts the page and renders the class detail sections', async () => {
    const wrapper = await mountClassDetailsPage()

    expect(mockFetchClass).toHaveBeenCalledWith('class-1')
    expect(mockFetchTeacher).toHaveBeenCalledWith('teacher-1')
    expect(mockFetchStudent).toHaveBeenCalledTimes(2)

    expect(wrapper.text()).toContain('Class Details')
    expect(wrapper.text()).toContain('Back to Classes')
    expect(wrapper.text()).toContain('Edit Class')
    expect(wrapper.text()).toContain('Attendance')
    expect(wrapper.text()).toContain('Schedule')
    expect(wrapper.text()).toContain('Morning Nursery Blue')
    expect(wrapper.text()).toContain('PS-NUR-01')
    expect(wrapper.text()).toContain('Class Summary')
    expect(wrapper.text()).toContain('Class Schedule')
    expect(wrapper.text()).toContain('Teacher')
    expect(wrapper.text()).toContain('Student Roster')
    expect(wrapper.text()).toContain('Room & Capacity')
    expect(wrapper.text()).toContain('Notes')
    expect(wrapper.text()).toContain('Monday, Tuesday, Wednesday, Thursday, Friday · 08:00–11:00')
    expect(wrapper.text()).toContain('Teacher Alpha')
    expect(wrapper.text()).toContain('teacher@example.com')
    expect(wrapper.text()).toContain('012345678')
    expect(wrapper.text()).toContain('Alice Student')
    expect(wrapper.text()).toContain('Bob Student')
    expect(wrapper.text()).toContain('STU-HFCCF-0001')
    expect(wrapper.text()).toContain('View Student Profile')
    expect(wrapper.text()).toContain('Created')
    expect(wrapper.text()).toContain('Updated')
  })

  it('renders a loading state while the class request is pending', async () => {
    let resolveClass
    mockFetchClass.mockReturnValue(new Promise((resolve) => {
      resolveClass = resolve
    }))

    const wrapper = mountPage()
    await wrapper.vm.$router.push({
      name: 'dashboard-preschool-admin-class-details',
      params: { id: 'class-1' },
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Loading class details...')

    resolveClass({
      id: 'class-1',
      code: 'PS-NUR-01',
      name: 'Morning Nursery Blue',
      teacherUserId: 'teacher-1',
      teacherDisplayName: 'Teacher Alpha',
      level: 'Nursery',
      schedule: 'Monday, Tuesday, Wednesday, Thursday, Friday, 08:00–11:00',
      studentsCount: 0,
      studentAssignments: [],
      activeStudentAssignments: [],
      teacherAssignments: [],
      status: 'active',
      room: 'Room A1',
      notes: '',
      createdAt: '2026-06-01T08:00:00Z',
      updatedAt: '2026-06-10T08:00:00Z',
    })

    await flushPromises()
    expect(wrapper.text()).not.toContain('Loading class details...')
  })

  it('renders a not-found state when the class does not exist', async () => {
    mockFetchClass.mockResolvedValue(null)

    const wrapper = await mountClassDetailsPage()

    expect(wrapper.text()).toContain('Class not found.')
  })

  it('renders an error state when the class request fails', async () => {
    mockFetchClass.mockRejectedValue(new Error('Request failed'))

    const wrapper = await mountClassDetailsPage()

    expect(wrapper.text()).toContain('Request failed')
  })

  it('renders empty teacher, schedule, roster, and notes states when data is missing', async () => {
    mockClassDetailData({
      teacherUserId: '',
      teacherDisplayName: '',
      schedule: '',
      studentAssignments: [],
      activeStudentAssignments: [],
      studentsCount: 0,
      notes: '',
      createdAt: '',
      updatedAt: '',
    })

    const wrapper = await mountClassDetailsPage()

    expect(wrapper.text()).toContain('No students assigned')
    expect(wrapper.text()).toContain('No teacher assigned')
    expect(wrapper.text()).toContain('Schedule unavailable')
    expect(wrapper.text()).toContain('No class notes added.')
  })
})
