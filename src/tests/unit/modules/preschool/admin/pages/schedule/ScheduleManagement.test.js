import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import ScheduleManagement from '@/modules/preschool/admin/pages/schedule/ScheduleManagement.vue'

const schedulesRef = ref([
  {
    id: 'schedule-1',
    dayOfWeek: 1,
    activityLabel: 'Circle Time',
    className: 'Morning Nursery',
    teacherName: 'Teacher Sarah',
    startTime: '08:00',
    endTime: '09:00',
    status: 'active',
  },
])

const mockLoadSchedules = vi.fn(async () => undefined)
const mockLoadLookups = vi.fn(async () => undefined)
const mockFetchTodayAttendanceSessions = vi.fn(() =>
  Promise.resolve({
    items: [
      { id: 'broad-session', scheduleId: 'other-schedule', status: 'cancelled' },
    ],
  }),
)
const mockUsePreschoolSchedules = () => ({
  archiveSchedule: vi.fn(),
  classOptions: ref([]),
  conflicts: ref([]),
  errorMessage: ref(''),
  isTermLocked: ref(false),
  isReportPeriodLocked: ref(false),
  loadLookups: mockLoadLookups,
  loadSchedules: mockLoadSchedules,
  pagination: ref({ page: 1, perPage: 10, total: 1, totalPages: 1 }),
  saveSchedule: vi.fn(),
  schedules: schedulesRef,
  searchQuery: ref(''),
  selectedClassId: ref(''),
  selectedDayOfWeek: ref(''),
  selectedSchedule: ref(null),
  selectedStatus: ref(''),
  selectedTeacherId: ref(''),
  setSearchQuery: vi.fn(),
  setSelectedClassId: vi.fn(),
  setSelectedDayOfWeek: vi.fn(),
  setSelectedSchedule: vi.fn(),
  setSelectedStatus: vi.fn(),
  setSelectedTeacherId: vi.fn(),
  saving: ref(false),
  teacherOptions: ref([]),
  lockMessage: ref(''),
  loading: ref(false),
})

vi.mock('@/modules/preschool/composables/usePreschoolSchedules', () => ({
  usePreschoolSchedules: () => mockUsePreschoolSchedules(),
}))

vi.mock('@/modules/preschool/services/api/preschoolAttendanceSessionApi', () => ({
  fetchTodayAttendanceSessions: (...args) => mockFetchTodayAttendanceSessions(...args),
  generateAttendanceSessions: vi.fn(),
  openAttendanceSession: vi.fn(),
}))

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchTodayAttendanceSessions.mockResolvedValue({
    items: [
      {
        id: 'session-1',
        scheduleId: 'schedule-1',
        classId: 'class-1',
        status: 'open',
      },
    ],
  })
})

describe('ScheduleManagement', () => {
  it('uses schedule-specific today-session state for visible schedule cards', async () => {
    const wrapper = mountWithPlugins(ScheduleManagement, {
      messages: {
        en: enPreschool,
      },
      global: {
        stubs: {
          MainLayout: { template: '<div><slot /></div>' },
          HeaderSection: { props: ['title'], template: '<header><h1>{{ title }}</h1></header>' },
          Button: { template: '<button><slot /></button>' },
          Pagination: { template: '<div />' },
          Select: { inheritAttrs: false, template: '<div />' },
          InputText: { inheritAttrs: false, template: '<div />' },
          ScheduleDayTabs: { template: '<div />' },
          ScheduleConflictNotice: { template: '<div />' },
          ScheduleEntryForm: { template: '<div />' },
          ScheduleEntryCard: {
            props: ['entry', 'session'],
            template: '<article><span class="session-state">{{ session ? session.statusLabel : "no-session" }}</span></article>',
          },
        },
      },
    })

    await flushPromises()

    expect(mockFetchTodayAttendanceSessions).toHaveBeenCalledTimes(1)
    expect(mockFetchTodayAttendanceSessions).toHaveBeenCalledWith()
    expect(wrapper.find('.session-state').text()).toContain('Open')
    expect(wrapper.find('.session-state').text()).not.toContain('Cancelled')
  })
})
