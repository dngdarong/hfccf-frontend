import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import AttendanceSessionDetails from '@/modules/preschool/admin/pages/attendance/AttendanceSessionDetails.vue'

const mockFetchAttendanceSession = vi.fn()
const mockFetchPreschoolAttendance = vi.fn()
const mockFetchPreschoolAttendanceAlerts = vi.fn()
const mockCompleteAttendanceSession = vi.fn()
const mockOpenAttendanceSession = vi.fn()
const mockLockAttendanceSession = vi.fn()
const mockReopenAttendanceSession = vi.fn()
const mockCancelAttendanceSession = vi.fn()

vi.mock('@/modules/preschool/services/api/preschoolAttendanceSessionApi', () => ({
  fetchAttendanceSession: (...args) => mockFetchAttendanceSession(...args),
  completeAttendanceSession: (...args) => mockCompleteAttendanceSession(...args),
  openAttendanceSession: (...args) => mockOpenAttendanceSession(...args),
  lockAttendanceSession: (...args) => mockLockAttendanceSession(...args),
  reopenAttendanceSession: (...args) => mockReopenAttendanceSession(...args),
  cancelAttendanceSession: (...args) => mockCancelAttendanceSession(...args),
}))

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolAttendance: (...args) => mockFetchPreschoolAttendance(...args),
}))

vi.mock('@/modules/preschool/services/api/preschoolAttendanceAlertApi', () => ({
  fetchPreschoolAttendanceAlerts: (...args) => mockFetchPreschoolAttendanceAlerts(...args),
}))

function createRoutes() {
  return [
    {
    path: '/module/preschool-admin/attendance/sessions/:id',
    name: 'dashboard-preschool-admin-attendance-session-details',
    component: { template: '<div />' },
    },
    {
      path: '/module/preschool-admin/teacher/attendance/sessions/:id',
      name: 'dashboard-preschool-teacher-attendance-session-details',
      component: { template: '<div />' },
    },
  ]
}

async function mountPage(routeName = 'dashboard-preschool-admin-attendance-session-details') {
  const wrapper = mountWithPlugins(AttendanceSessionDetails, {
    messages: { en: enPreschool },
    routes: createRoutes(),
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
        Button: { props: ['type', 'variant', 'size', 'loading', 'disabled'], emits: ['click'], template: '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>' },
        AppBadge: { props: ['variant', 'size', 'label'], template: '<span>{{ label }}<slot /></span>' },
        AppStatusChip: { props: ['status', 'label'], template: '<span>{{ label }}</span>' },
      },
    },
  })

  await wrapper.vm.$router.push({
    name: routeName,
    params: { id: 'session-1' },
  })
  await flushPromises()
  await flushPromises()

  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()

  mockFetchAttendanceSession.mockResolvedValue({
    id: 'session-1',
    classId: 'class-1',
    className: 'Morning Stars',
    teacherName: 'Teacher One',
    roomName: 'Room 1',
    scheduleLabel: 'Mon-Fri 08:00-10:00',
    attendanceDate: '2026-05-19',
    startTime: '08:00',
    endTime: '10:00',
    status: 'open',
    generatedFromSchedule: true,
    openedAt: '2026-05-19T01:00:00Z',
    createdAt: '2026-05-18T23:00:00Z',
    guardianContactLogs: [
      {
        id: 'contact-1',
        guardianName: 'Guardian One',
        followUpStatus: 'completed',
        createdAt: '2026-05-19T02:00:00Z',
        note: 'Followed up by phone.',
      },
    ],
  })

  mockFetchPreschoolAttendance.mockResolvedValue({
    items: [
      { id: 'att-1', studentId: 'student-1', studentName: 'Alice Student', status: 'present', note: 'On time', raw: {} },
      { id: 'att-2', studentId: 'student-2', studentName: 'Bopha Student', status: 'absent', note: 'Sick', raw: {} },
    ],
  })

  mockFetchPreschoolAttendanceAlerts.mockResolvedValue({
    items: [
      {
        id: 'alert-1',
        studentId: 'student-2',
        studentName: 'Bopha Student',
        className: 'Morning Stars',
        guardianName: 'Guardian Two',
        alertLabel: 'Repeated Absence',
        message: 'Repeated absence follow-up',
        createdAt: '2026-05-19T03:00:00Z',
      },
    ],
  })
})

describe('AttendanceSessionDetails', () => {
  it('renders the session header, summary, records, alerts, and timeline', async () => {
    const wrapper = await mountPage()

    expect(mockFetchAttendanceSession).toHaveBeenCalledWith('session-1')
    expect(wrapper.text()).toContain('Attendance Session Details')
    expect(wrapper.text()).toContain('Morning Stars')
    expect(wrapper.text()).toContain('Teacher One')
    expect(wrapper.text()).toContain('Room 1')
    expect(wrapper.text()).toContain('Attendance Records')
    expect(wrapper.text()).toContain('Related Attendance Alerts')
    expect(wrapper.text()).toContain('Related Guardian Contact Logs')
    expect(wrapper.text()).toContain('Session Timeline')
    expect(wrapper.text()).toContain('Alice Student')
    expect(wrapper.text()).toContain('Bopha Student')
    expect(wrapper.text()).toContain('Repeated Absence')
    expect(wrapper.text()).toContain('Guardian One')
  })

  it('shows the teacher route without admin-only action text when mounted as teacher', async () => {
    mockFetchAttendanceSession.mockResolvedValueOnce({
      id: 'session-1',
      classId: 'class-1',
      className: 'Morning Stars',
      teacherName: 'Teacher One',
      roomName: 'Room 1',
      scheduleLabel: 'Mon-Fri 08:00-10:00',
      attendanceDate: '2026-05-19',
      startTime: '08:00',
      endTime: '10:00',
      status: 'locked',
      generatedFromSchedule: true,
    })

    const wrapper = await mountPage('dashboard-preschool-teacher-attendance-session-details')

    expect(wrapper.text()).toContain('View Session')
    expect(wrapper.text()).not.toContain('Lock Session')
    expect(wrapper.text()).not.toContain('Cancel Session')
  })
})
