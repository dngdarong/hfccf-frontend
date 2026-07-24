import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import TeacherDashboard from '@/modules/preschool/teacher/pages/Dashboard.vue'

const mockFetchPreschoolDashboard = vi.fn()
const mockFetchTodayAttendanceSessions = vi.fn()
const mockOpenAttendanceSession = vi.fn()

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolDashboard: (...args) => mockFetchPreschoolDashboard(...args),
}))

vi.mock('@/modules/preschool/services/api/preschoolAttendanceSessionApi', () => ({
  fetchTodayAttendanceSessions: (...args) => mockFetchTodayAttendanceSessions(...args),
  openAttendanceSession: (...args) => mockOpenAttendanceSession(...args),
}))

function createRoute() {
  return {
    path: '/module/preschool-admin/dashboard',
    name: 'dashboard-preschool-teacher',
    component: { template: '<div />' },
  }
}

function createAttendanceRoute() {
  return {
    path: '/module/preschool-admin/teacher/attendance',
    name: 'dashboard-preschool-teacher-attendance',
    component: { template: '<div />' },
  }
}

function createDetailsRoute() {
  return {
    path: '/module/preschool-admin/teacher/attendance/sessions/:id',
    name: 'dashboard-preschool-teacher-attendance-session-details',
    component: { template: '<div />' },
  }
}

async function mountPage() {
  const wrapper = mountWithPlugins(TeacherDashboard, {
    messages: { en: enPreschool },
    routes: [createRoute(), createAttendanceRoute(), createDetailsRoute()],
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
        Button: { props: ['type', 'variant', 'size', 'loading'], emits: ['click'], template: '<button :disabled="loading" @click="$emit(\'click\')"><slot /></button>' },
        AppBadge: { props: ['label', 'variant', 'size'], template: '<span>{{ label }}</span>' },
        AppStatusChip: { props: ['status', 'label'], template: '<span>{{ label }}</span>' },
        PreschoolDashboardSpotlight: { props: ['title', 'text'], template: '<div />' },
        PreschoolDashboardActionList: { props: ['title', 'items'], template: '<div />' },
        PreschoolDashboardActivity: { props: ['items'], template: '<div />' },
      },
    },
  })

  await wrapper.vm.$router.push({ name: 'dashboard-preschool-teacher' })
  await flushPromises()
  await flushPromises()

  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()

  mockFetchPreschoolDashboard.mockResolvedValue({
    summary: {
      students: 20,
      classes: 2,
      teachers: 1,
      attendanceToday: 8,
      pendingPayments: 0,
      overduePayments: 0,
    },
    recentAttendance: [],
    upcomingClasses: [],
    paymentSummary: { paid: 0, pending: 0, overdue: 0, cancelled: 0 },
  })

  mockFetchTodayAttendanceSessions.mockResolvedValue({
    items: [
      {
        id: 'session-1',
        classId: 'class-1',
        className: 'Morning Stars',
        roomName: 'Room 1',
        attendanceDate: '2026-05-19',
        startTime: '08:00',
        endTime: '10:00',
        status: 'open',
        studentCount: 18,
        recordedStudents: 7,
        missingStudents: 11,
        completionRate: 38.89,
      },
    ],
  })

  mockOpenAttendanceSession.mockResolvedValue({
    id: 'session-1',
    classId: 'class-1',
    className: 'Morning Stars',
    attendanceDate: '2026-05-19',
    status: 'open',
  })
})

describe('TeacherDashboard', () => {
  it('renders assigned today sessions with progress and continues attendance', async () => {
    const wrapper = await mountPage()
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push')

    expect(wrapper.text()).toContain('Attendance Sessions')
    expect(wrapper.text()).toContain('Morning Stars')
    expect(wrapper.text()).toContain('Room 1')
    expect(wrapper.text()).toContain('7 of 18 marked')
    expect(wrapper.text()).toContain('Continue Attendance')
    expect(wrapper.text()).toContain('Attendance Today')

    const continueButton = wrapper.findAll('button').find((button) => button.text().includes('Continue Attendance'))
    if (continueButton) {
      await continueButton.trigger('click')
    }
    await flushPromises()

    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          attendance_session_id: 'session-1',
          sessionId: 'session-1',
        }),
      }),
    )
  })

  it('renders the empty state and opens Attendance when no session is scheduled', async () => {
    mockFetchTodayAttendanceSessions.mockResolvedValueOnce({ items: [] })

    const wrapper = await mountPage()
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push')

    expect(wrapper.text()).toContain('No attendance session is scheduled for today.')
    expect(wrapper.text()).toContain('Open Attendance')

    const emptyButton = wrapper.findAll('button').find((button) => button.text().includes('Open Attendance'))
    if (emptyButton) {
      await emptyButton.trigger('click')
    }
    await flushPromises()

    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'dashboard-preschool-teacher-attendance',
        query: expect.objectContaining({
          date: expect.any(String),
        }),
      }),
    )
  })

  it('renders completed sessions with a view details action', async () => {
    mockFetchTodayAttendanceSessions.mockResolvedValueOnce({
      items: [
        {
          id: 'session-2',
          classId: 'class-2',
          className: 'Sunrise Class',
          attendanceDate: '2026-05-19',
          status: 'completed',
          studentCount: 12,
          recordedStudents: 12,
          missingStudents: 0,
          completionRate: 100,
        },
      ],
    })

    const wrapper = await mountPage()
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push')

    expect(wrapper.text()).toContain('Completed')
    expect(wrapper.text()).toContain('12 of 12 marked')
    expect(wrapper.text()).toContain('View Details')

    const detailsButton = wrapper.findAll('button').find((button) => button.text().includes('View Details'))
    if (detailsButton) {
      await detailsButton.trigger('click')
    }
    await flushPromises()

    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'dashboard-preschool-teacher-attendance-session-details',
        params: expect.objectContaining({
          id: 'session-2',
        }),
      }),
    )
  })

  it('opens a scheduled session before routing into Attendance', async () => {
    mockFetchTodayAttendanceSessions.mockResolvedValueOnce({
      items: [
        {
          id: 'session-3',
          classId: 'class-3',
          className: 'Sunbeam Class',
          attendanceDate: '2026-05-19',
          status: 'scheduled',
          studentCount: 10,
          recordedStudents: 0,
          missingStudents: 10,
          completionRate: 0,
        },
      ],
    })
    mockOpenAttendanceSession.mockResolvedValueOnce({
      id: 'session-3',
      classId: 'class-3',
      attendanceDate: '2026-05-19',
      status: 'open',
    })

    const wrapper = await mountPage()
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push')

    const recordButton = wrapper.findAll('button').find((button) => button.text().includes('Record Attendance'))
    if (recordButton) {
      await recordButton.trigger('click')
    }
    await flushPromises()

    expect(mockOpenAttendanceSession).toHaveBeenCalledWith('session-3')
    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'dashboard-preschool-teacher-attendance',
        query: expect.objectContaining({
          attendance_session_id: 'session-3',
          sessionId: 'session-3',
        }),
      }),
    )
  })

  it('shows an error state when today sessions fail to load', async () => {
    mockFetchTodayAttendanceSessions.mockRejectedValueOnce(new Error('Network down'))

    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('Failed to load today’s attendance sessions.')
    expect(wrapper.text()).toContain('Open Attendance')
  })
})
