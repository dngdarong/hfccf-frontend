import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { flushPromises } from '@vue/test-utils'
import { createTestI18n, createTestRouter } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'
import AttendanceStudents from '@/modules/preschool/admin/pages/attendance/AttendanceStudents.vue'

const mockFetchAttendanceSession = vi.fn()
const mockFetchAttendanceSessions = vi.fn()
const mockFetchMyPreschoolClasses = vi.fn()
const mockFetchMyPreschoolStudents = vi.fn()
const mockFetchPreschoolClasses = vi.fn()
const mockFetchPreschoolStudents = vi.fn()
const mockFetchPreschoolAttendance = vi.fn()
const mockSavePreschoolAttendance = vi.fn()
const mockSaveAttendanceSessionRecords = vi.fn()

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
  }),
}))

vi.mock('@/modules/preschool/services/api/preschoolAttendanceSessionApi', () => ({
  fetchAttendanceSession: (...args) => mockFetchAttendanceSession(...args),
  fetchAttendanceSessions: (...args) => mockFetchAttendanceSessions(...args),
  openAttendanceSession: vi.fn(() => Promise.resolve({ id: 'session-1' })),
  completeAttendanceSession: vi.fn(() => Promise.resolve({ id: 'session-1', status: 'completed' })),
  saveAttendanceSessionRecords: (...args) => mockSaveAttendanceSessionRecords(...args),
}))

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchMyPreschoolClasses: (...args) => mockFetchMyPreschoolClasses(...args),
  fetchMyPreschoolStudents: (...args) => mockFetchMyPreschoolStudents(...args),
  fetchPreschoolClasses: (...args) => mockFetchPreschoolClasses(...args),
  fetchPreschoolStudents: (...args) => mockFetchPreschoolStudents(...args),
  fetchPreschoolAttendance: (...args) => mockFetchPreschoolAttendance(...args),
  savePreschoolAttendance: (...args) => mockSavePreschoolAttendance(...args),
}))

function createRoute(query = {}) {
  return {
    path: '/module/preschool-admin/attendance/students',
    name: 'dashboard-preschool-admin-attendance-students',
    component: { template: '<div />' },
    query,
  }
}

function createTeacherRoute(query = {}) {
  return {
    path: '/module/preschool-admin/teacher/attendance',
    name: 'dashboard-preschool-teacher-attendance',
    component: { template: '<div />' },
    query,
  }
}

async function mountPage(routeQuery = {}) {
  return mountPageWithLocale(routeQuery, 'en')
}

async function mountPageWithLocale(routeQuery = {}, locale = 'en') {
  const i18n = createTestI18n({ en: enPreschool, kh: khPreschool })
  i18n.global.locale.value = locale
  const router = createTestRouter([createRoute(routeQuery)])
  const pinia = createPinia()

  const wrapper = mount(AttendanceStudents, {
    global: {
      plugins: [i18n, pinia, router, PrimeVue],
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
        Button: { props: ['type', 'variant', 'size', 'loading', 'disabled'], emits: ['click'], template: '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>' },
        Select: { props: ['modelValue', 'options', 'placeholder', 'disabled'], emits: ['update:modelValue'], template: '<select :disabled="disabled"><option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option></select>' },
        Toast: { template: '<div />' },
      },
    },
  })

  await router.push({
    name: 'dashboard-preschool-admin-attendance-students',
    query: routeQuery,
  })
  await flushPromises()
  await flushPromises()

  return wrapper
}

async function mountTeacherPage(routeQuery = {}) {
  return mountTeacherPageWithLocale(routeQuery, 'en')
}

async function mountTeacherPageWithLocale(routeQuery = {}, locale = 'en') {
  const i18n = createTestI18n({ en: enPreschool, kh: khPreschool })
  i18n.global.locale.value = locale
  const router = createTestRouter([createTeacherRoute(routeQuery)])
  const pinia = createPinia()

  const wrapper = mount(AttendanceStudents, {
    global: {
      plugins: [i18n, pinia, router, PrimeVue],
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
        Button: { props: ['type', 'variant', 'size', 'loading', 'disabled'], emits: ['click'], template: '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>' },
        Select: { props: ['modelValue', 'options', 'placeholder', 'disabled'], emits: ['update:modelValue'], template: '<select :disabled="disabled"><option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option></select>' },
        Toast: { template: '<div />' },
      },
    },
  })

  await router.push({
    name: 'dashboard-preschool-teacher-attendance',
    query: routeQuery,
  })
  await flushPromises()
  await flushPromises()

  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()

  mockFetchMyPreschoolClasses.mockResolvedValue({
    items: [{ id: 'class-1', name: 'Morning Stars' }],
  })

  mockFetchMyPreschoolStudents.mockResolvedValue({
    items: [
      { id: 'student-1', fullName: 'Alice Student', studentCode: 'S-1', classes: [{ id: 'class-1', name: 'Morning Stars' }] },
      { id: 'student-2', fullName: 'Bob Student', studentCode: 'S-2', classes: [{ id: 'class-2', name: 'Other Class' }] },
    ],
  })

  mockFetchPreschoolClasses.mockResolvedValue({
    items: [{ id: 'class-1', name: 'Morning Stars' }],
  })

  mockFetchPreschoolStudents.mockResolvedValue({
    items: [
      { id: 'student-1', fullName: 'Alice Student', studentCode: 'S-1' },
      { id: 'student-2', fullName: 'Bopha Student', studentCode: 'S-2' },
    ],
  })

  mockFetchPreschoolAttendance.mockResolvedValue({
    items: [
      { id: 'att-1', studentId: 'student-1', status: 'present', note: 'On time' },
    ],
  })

  mockFetchAttendanceSessions.mockResolvedValue({
    items: [
      {
        id: 'session-1',
        classId: 'class-1',
        className: 'Morning Stars',
        attendanceDate: '2026-05-19',
        status: 'open',
        startTime: '08:00',
        endTime: '10:00',
      },
    ],
  })

  mockFetchAttendanceSession.mockResolvedValue({
    id: 'session-1',
    classId: 'class-1',
    className: 'Morning Stars',
    attendanceDate: '2026-05-19',
    status: 'open',
    teacherName: 'Teacher One',
    roomName: 'Room 1',
    studentCount: 2,
    generatedFromSchedule: true,
  })
})

describe('AttendanceStudents', () => {
  it('uses the session API when a session id exists', async () => {
    const wrapper = await mountPage({
      classId: 'class-1',
      date: '2026-05-19',
      attendance_session_id: 'session-1',
    })

    const saveButtons = wrapper.findAll('button').filter((button) => button.text().includes('Save Attendance'))
    const completeButtons = wrapper.findAll('button').filter((button) => button.text().includes('Complete Session'))

    expect(saveButtons).toHaveLength(1)
    expect(completeButtons).toHaveLength(1)
    expect(mockFetchAttendanceSession).toHaveBeenCalledWith('session-1')
    expect(mockSaveAttendanceSessionRecords).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Morning Stars')
    expect(wrapper.text()).toContain('Teacher One')
    expect(wrapper.text()).toContain('Room 1')
    expect(wrapper.text()).toContain('Save Attendance')
  })

  it('uses the legacy API when no session is selected', async () => {
    const wrapper = await mountPage({
      classId: 'class-1',
      date: '2026-05-19',
    })

    const saveButtons = wrapper.findAll('button').filter((button) => button.text().includes('Save Attendance'))
    const completeButtons = wrapper.findAll('button').filter((button) => button.text().includes('Complete Session'))

    expect(saveButtons).toHaveLength(1)
    expect(completeButtons).toHaveLength(1)

    wrapper.vm.attendanceMap['student-1'].status = 'present'
    await flushPromises()

    const saveButton = wrapper.findAll('button').find((button) => button.text().includes('Save Attendance'))
    if (saveButton) {
      await saveButton.trigger('click')
    }
    await flushPromises()

    expect(mockFetchAttendanceSession).not.toHaveBeenCalled()
    expect(mockSavePreschoolAttendance).toHaveBeenCalled()
    expect(mockSavePreschoolAttendance).toHaveBeenCalledTimes(1)
    expect(mockSaveAttendanceSessionRecords).not.toHaveBeenCalled()
  })

  it('uses teacher-scoped class and student endpoints in the teacher workspace', async () => {
    const wrapper = await mountTeacherPage({
      date: '2026-05-19',
    })

    expect(mockFetchMyPreschoolClasses).toHaveBeenCalledWith({ page: 1, perPage: 100 })
    expect(mockFetchMyPreschoolStudents).toHaveBeenCalledWith({ page: 1, perPage: 200 })
    expect(wrapper.text()).toContain('Morning Stars')
    expect(wrapper.text()).toContain('Alice Student')
    expect(wrapper.text()).not.toContain('Bob Student')
    expect(wrapper.text()).toContain('Preschool Attendance')
    expect(wrapper.text()).toContain('Save Attendance')
  })

  it('renders teacher attendance filters in EN and KH without missing translation warnings', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const enWrapper = await mountTeacherPageWithLocale({
      date: '2026-05-19',
    }, 'en')
    expect(enWrapper.text()).toContain('Class')

    const khWrapper = await mountTeacherPageWithLocale({
      date: '2026-05-19',
    }, 'kh')
    expect(khWrapper.text()).toContain('ថ្នាក់')

    const warnings = warnSpy.mock.calls.flat().join(' ')
    expect(warnings).not.toContain('preschoolTeacherAttendancePage.filters.class')
    warnSpy.mockRestore()
  })

  it('backfills missing attendance rows before rendering note inputs', async () => {
    const wrapper = await mountPage({
      classId: 'class-1',
      date: '2026-05-19',
    })

    wrapper.vm.attendanceMap = {
      'student-1': { status: 'present', note: 'On time', existingId: 'att-1' },
    }
    wrapper.vm.students = [
      { id: 'student-1', fullName: 'Alice Student', studentCode: 'S-1' },
      { id: 'student-2', fullName: 'Bopha Student', studentCode: 'S-2' },
    ]

    await flushPromises()

    expect(wrapper.findAll('input').length).toBeGreaterThanOrEqual(2)
    expect(wrapper.text()).toContain('Bopha Student')
  })

  it('shows a teacher empty state when no assigned classes are returned', async () => {
    mockFetchMyPreschoolClasses.mockResolvedValueOnce({ items: [] })

    const wrapper = await mountTeacherPage({ date: '2026-05-19' })

    expect(wrapper.text()).toContain('No assigned classes are available.')
  })

  it('shows a safe validation error when save returns 422', async () => {
    mockSavePreschoolAttendance.mockRejectedValueOnce({ status: 422, message: 'Validation failed' })

    const wrapper = await mountTeacherPage({
      date: '2026-05-19',
    })

    wrapper.vm.attendanceMap['student-1'].status = 'present'
    await flushPromises()

    const saveButton = wrapper.findAll('button').find((button) => button.text().includes('Save Attendance'))
    if (saveButton) {
      await saveButton.trigger('click')
    }
    await flushPromises()

    expect(wrapper.text()).toContain('Please fix the highlighted attendance entries and try again.')
  })

  it.each([
    ['scheduled', 'Open Session'],
    ['completed', 'View Session'],
    ['locked', 'View Session'],
    ['cancelled', 'View Session'],
  ])('renders %s sessions without a note crash', async (status, expectedAction) => {
    mockFetchAttendanceSession.mockResolvedValueOnce({
      id: `session-${status}`,
      classId: 'class-1',
      className: 'Morning Stars',
      attendanceDate: '2026-05-19',
      status,
      teacherName: 'Teacher One',
      roomName: 'Room 1',
      studentCount: 2,
    })

    const wrapper = await mountPage({
      classId: 'class-1',
      date: '2026-05-19',
      attendance_session_id: `session-${status}`,
    })

    expect(wrapper.text()).toContain('Morning Stars')
    expect(wrapper.text()).toContain(expectedAction)
    expect(wrapper.findAll('input').length).toBeGreaterThan(0)
  })

  it('shows a safe forbidden error when save returns 403', async () => {
    mockSavePreschoolAttendance.mockRejectedValueOnce({ status: 403, message: 'Forbidden' })

    const wrapper = await mountTeacherPage({
      date: '2026-05-19',
    })

    wrapper.vm.attendanceMap['student-1'].status = 'present'
    await flushPromises()

    const saveButton = wrapper.findAll('button').find((button) => button.text().includes('Save Attendance'))
    if (saveButton) {
      await saveButton.trigger('click')
    }
    await flushPromises()

    expect(wrapper.text()).toContain('You can only record attendance for assigned classes.')
  })

  it('disables edit actions for locked sessions', async () => {
    mockFetchAttendanceSession.mockResolvedValueOnce({
      id: 'session-locked',
      classId: 'class-1',
      className: 'Morning Stars',
      attendanceDate: '2026-05-19',
      status: 'locked',
      teacherName: 'Teacher One',
      roomName: 'Room 1',
      studentCount: 2,
    })

    const wrapper = await mountPage({
      classId: 'class-1',
      date: '2026-05-19',
      attendance_session_id: 'session-locked',
    })

    const shortButtons = wrapper.findAll('button').filter((button) => ['P', 'A', 'L', 'E'].includes(button.text()))
    expect(shortButtons.length).toBeGreaterThan(0)
    expect(shortButtons[0].attributes('disabled')).toBeDefined()
  })
})
