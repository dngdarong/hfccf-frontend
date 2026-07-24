import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import ScheduleDetails from '@/modules/preschool/admin/pages/schedule/ScheduleDetails.vue'

const mockHistory = vi.fn(() =>
  Promise.resolve({
    schedule: {
      id: 'schedule-1',
      classId: 'class-1',
      className: 'Morning Nursery',
      teacherName: 'Teacher Sarah',
      room: 'Room A',
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '10:00',
      activityLabel: 'Circle Time',
    },
    todaySession: {
      id: 'today-session-1',
      scheduleId: 'schedule-1',
      classId: 'class-1',
      className: 'Morning Nursery',
      teacherName: 'Teacher Sarah',
      roomName: 'Room A',
      attendanceDate: '2026-07-02',
      status: 'open',
      openedAt: '2026-07-02T08:00:00+07:00',
      completedAt: '',
      lockedAt: '',
      cancelledAt: '',
      generatedFromSchedule: true,
    },
    recentSessions: [
      { id: 'recent-1', scheduleId: 'schedule-1', attendanceDate: '2026-07-01', status: 'completed', roomName: 'Room A' },
    ],
    summary: {
      completionRate: 90,
      attendanceRate: 85,
      totalSessions: 12,
    },
    alerts: [
      { id: 'alert-1', studentName: 'Ben', alertLabel: 'Repeated Absence', message: 'Follow up required' },
    ],
    guardianContacts: [
      { id: 'contact-1', guardianName: 'Guardian One', followUpStatus: 'completed', note: 'Called guardian', createdAt: '2026-07-02T10:00:00+07:00' },
    ],
  }),
)

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  const push = vi.fn()
  const back = vi.fn()

  return {
    ...actual,
    useRoute: () => ({ name: 'dashboard-preschool-admin-schedule-details', params: { id: 'schedule-1' } }),
    useRouter: () => ({ push, back }),
  }
})

vi.mock('@/modules/preschool/services/api/preschoolScheduleApi', () => ({
  fetchScheduleSessionHistory: (...args) => mockHistory(...args),
}))

vi.mock('@/modules/preschool/admin/pages/attendance/sessionUi', () => ({
  buildSessionTimeline: () => [
    { key: 'created', label: 'Schedule created', createdAt: '2026-07-01T07:30:00+07:00' },
    { key: 'opened', label: 'Session opened', createdAt: '2026-07-02T08:00:00+07:00' },
    { key: 'alertCreated', label: 'Alert created', createdAt: '2026-07-02T09:00:00+07:00' },
  ],
  getSessionStatusKey: (status) => String(status || ''),
  getSessionStatusTone: (status) => (String(status || '').toLowerCase() === 'open' ? 'warning' : 'info'),
  normalizeSessionStatus: (status) => String(status || '').toLowerCase(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ScheduleDetails', () => {
  it('loads schedule history and renders history sections', async () => {
    const wrapper = mountWithPlugins(ScheduleDetails, {
      messages: {
        en: enPreschool,
      },
      global: {
        stubs: {
          MainLayout: { template: '<div><slot /></div>' },
          HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1></header>' },
          Button: { template: '<button><slot /></button>' },
          AppStatusChip: { props: ['label'], template: '<span>{{ label }}</span>' },
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    })

    await flushPromises()

    expect(mockHistory).toHaveBeenCalledWith('schedule-1')
    expect(wrapper.text()).toContain('Schedule Session History')
    expect(wrapper.text()).toContain('Morning Nursery')
    expect(wrapper.text()).toContain('Completion Rate')
    expect(wrapper.text()).toContain('Attendance Rate')
    expect(wrapper.text()).toContain('Recent Sessions')
    expect(wrapper.text()).toContain('Repeated Absence')
    expect(wrapper.text()).toContain('Related Attendance Alerts')
    expect(wrapper.text()).toContain('Related Guardian Contacts')
    expect(wrapper.text()).toContain('Schedule created')
    expect(wrapper.text()).toContain('Session opened')
  })
})
