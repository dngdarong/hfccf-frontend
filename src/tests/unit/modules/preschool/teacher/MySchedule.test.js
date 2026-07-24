import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import MySchedule from '@/modules/preschool/teacher/pages/MySchedule.vue'

const schedulesRef = ref([
  {
    id: 'schedule-1',
    dayOfWeek: 1,
    activityLabel: 'Circle Time',
    className: 'Morning Nursery',
    teacherName: 'Teacher Sarah',
    startTime: '08:00',
    endTime: '09:00',
  },
  {
    id: 'schedule-2',
    dayOfWeek: 2,
    activityLabel: 'Reading',
    className: 'Morning Nursery',
    teacherName: 'Teacher Sarah',
    startTime: '09:00',
    endTime: '10:00',
  },
])

const mockLoadMySchedule = vi.fn(async () => undefined)
const mockFetchTodayAttendanceSessions = vi.fn(async () => ({
  items: [
    {
      id: 'session-1',
      scheduleId: 'schedule-1',
      classId: 'class-1',
      status: 'scheduled',
    },
  ],
}))

vi.mock('@/modules/preschool/composables/usePreschoolTeacherSchedule', () => ({
  usePreschoolTeacherSchedule: () => ({
    errorMessage: ref(''),
    isTermLocked: ref(false),
    isReportPeriodLocked: ref(false),
    loadMySchedule: mockLoadMySchedule,
    loading: ref(false),
    lockMessage: ref(''),
    schedules: schedulesRef,
    teacherSummary: ref({ name: 'Teacher Sarah' }),
  }),
}))

vi.mock('@/modules/preschool/services/api/preschoolAttendanceSessionApi', () => ({
  fetchTodayAttendanceSessions: (...args) => mockFetchTodayAttendanceSessions(...args),
  openAttendanceSession: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MySchedule', () => {
  it('renders only teacher-scoped sessions and suppresses unrelated sessions', async () => {
    const wrapper = mountWithPlugins(MySchedule, {
      messages: {
        en: enPreschool,
      },
      global: {
        stubs: {
          MainLayout: { template: '<div><slot /></div>' },
          HeaderSection: { props: ['title'], template: '<header><h1>{{ title }}</h1></header>' },
          Button: { template: '<button><slot /></button>' },
          ScheduleDayTabs: { template: '<div />' },
          WeeklyTimetableGrid: {
            props: ['entries'],
            template: '<div><article v-for="entry in entries" :key="entry.id"><span class="activity">{{ entry.activityLabel }}</span><span class="session">{{ entry.session ? entry.session.statusLabel : "no-session" }}</span></article></div>',
          },
        },
      },
    })

    await flushPromises()

    expect(mockLoadMySchedule).toHaveBeenCalled()
    expect(mockFetchTodayAttendanceSessions).toHaveBeenCalledTimes(1)
    expect(mockFetchTodayAttendanceSessions).toHaveBeenCalledWith()
    expect(wrapper.text()).toContain('Circle Time')
    expect(wrapper.text()).toContain('Reading')
    expect(wrapper.text()).toContain('Scheduled')
    expect(wrapper.text()).toContain('no-session')
    expect(wrapper.text()).not.toContain('Cancelled')
  })
})
