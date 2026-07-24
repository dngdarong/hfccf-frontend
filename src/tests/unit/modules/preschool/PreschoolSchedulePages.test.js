// Keep the real timetable pages mount-tested so the new scheduling entry
// points stay stable across EN/KH switching and do not regress into runtime
// warnings when shared dashboard copy changes later.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enCommon from '@/i18n/en/common'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'
import ScheduleManagement from '@/modules/preschool/admin/pages/schedule/ScheduleManagement.vue'
import ClassSchedule from '@/modules/preschool/admin/pages/classes/ClassSchedule.vue'
import TeacherSchedule from '@/modules/preschool/admin/pages/teachers/TeacherSchedule.vue'
import MySchedule from '@/modules/preschool/teacher/pages/MySchedule.vue'

const mockToastAdd = vi.fn()
const mockLoadLookups = vi.fn(() => Promise.resolve())
const mockLoadSchedules = vi.fn(() => Promise.resolve())
const mockLoadClassOptions = vi.fn(() => Promise.resolve())
const mockLoadClassSchedule = vi.fn(() => Promise.resolve())
const mockLoadTeacherOptions = vi.fn(() => Promise.resolve())
const mockLoadTeacherSchedule = vi.fn(() => Promise.resolve())
const mockLoadMySchedule = vi.fn(() => Promise.resolve())
const mockFetchTodayAttendanceSessions = vi.fn(() => Promise.resolve({ items: [] }))
const mockGenerateAttendanceSessions = vi.fn(() => Promise.resolve([]))
const mockOpenAttendanceSession = vi.fn(() => Promise.resolve({}))

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: mockToastAdd,
  }),
}))

vi.mock('@/modules/preschool/composables/usePreschoolSchedules', () => ({
  usePreschoolSchedules: () => ({
    archiveSchedule: vi.fn(),
    classOptions: { value: [{ label: 'PS-3 - Morning Class', value: 3 }] },
    conflicts: { value: [] },
    errorMessage: { value: '' },
    isReportPeriodLocked: { value: false },
    isTermLocked: { value: false },
    loadLookups: mockLoadLookups,
    loadSchedules: mockLoadSchedules,
    loading: { value: false },
    pagination: { value: { page: 1, perPage: 10, total: 0, totalPages: 1 } },
    saveSchedule: vi.fn(),
    schedules: { value: [] },
    searchQuery: { value: '' },
    selectedClassId: { value: '' },
    selectedDayOfWeek: { value: '' },
    selectedSchedule: { value: null },
    selectedStatus: { value: '' },
    selectedTeacherId: { value: '' },
    setSearchQuery: vi.fn(),
    setSelectedClassId: vi.fn(),
    setSelectedDayOfWeek: vi.fn(),
    setSelectedSchedule: vi.fn(),
    setSelectedStatus: vi.fn(),
    setSelectedTeacherId: vi.fn(),
    saving: { value: false },
    teacherOptions: { value: [{ label: 'Teacher One (teacher1)', value: 'usr_teacher' }] },
    lockMessage: { value: '' },
  }),
}))

vi.mock('@/modules/preschool/composables/usePreschoolClassSchedule', () => ({
  usePreschoolClassSchedule: () => ({
    classOptions: { value: [{ label: 'PS-3 - Morning Class', value: 3 }] },
    classSummary: { value: { id: 3, code: 'PS-3', name: 'Morning Class', teacherName: 'Teacher One' } },
    errorMessage: { value: '' },
    loadClassOptions: mockLoadClassOptions,
    loadClassSchedule: mockLoadClassSchedule,
    loading: { value: false },
    schedules: { value: [{ id: 11, dayOfWeek: 1, activityLabel: 'Circle Time' }] },
    selectedClassId: { value: '3' },
    setSelectedClassId: vi.fn(),
  }),
}))

vi.mock('@/modules/preschool/composables/usePreschoolTeacherSchedule', () => ({
  usePreschoolTeacherSchedule: () => ({
    errorMessage: { value: '' },
    loadMySchedule: mockLoadMySchedule,
    loadTeacherOptions: mockLoadTeacherOptions,
    loadTeacherSchedule: mockLoadTeacherSchedule,
    loading: { value: false },
    schedules: { value: [{ id: 21, dayOfWeek: 2, activityLabel: 'Reading' }] },
    selectedTeacherId: { value: 'usr_teacher' },
    setSelectedTeacherId: vi.fn(),
    teacherOptions: { value: [{ label: 'Teacher One (teacher1)', value: 'usr_teacher' }] },
    teacherSummary: { value: { id: 'usr_teacher', name: 'Teacher One', username: 'teacher1', email: 'teacher1@hfccf.org' } },
  }),
}))

vi.mock('@/modules/preschool/services/api/preschoolAttendanceSessionApi', () => ({
  fetchTodayAttendanceSessions: (...args) => mockFetchTodayAttendanceSessions(...args),
  generateAttendanceSessions: (...args) => mockGenerateAttendanceSessions(...args),
  openAttendanceSession: (...args) => mockOpenAttendanceSession(...args),
}))

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    Button: { template: '<button><slot /></button>' },
    Dropdown: { template: '<div class="dropdown-stub" />' },
    InputText: { template: '<div class="input-stub" />' },
    Pagination: { template: '<div class="pagination-stub" />' },
    ScheduleDayTabs: { template: '<div class="day-tabs-stub" />' },
    ScheduleEntryCard: { template: '<div class="entry-card-stub" />' },
    ScheduleEntryForm: { template: '<div class="entry-form-stub" />' },
    ScheduleConflictNotice: { template: '<div class="conflict-stub" />' },
    WeeklyTimetableGrid: { template: '<div class="grid-stub" />' },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockToastAdd.mockClear()
})

describe('Preschool schedule pages', () => {
  it('mounts the admin timetable page and loads lookup data', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountWithPlugins(ScheduleManagement, {
      messages: {
        en: { common: enCommon, ...enPreschool },
        kh: { common: enCommon, ...khPreschool },
      },
      global: {
        stubs: stubs(),
      },
    })

    await flushPromises()

    expect(mockLoadLookups).toHaveBeenCalled()
    expect(mockLoadSchedules).toHaveBeenCalled()
    expect(mockFetchTodayAttendanceSessions).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Schedule management')
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('mounts the read-only teacher schedule pages without runtime warnings', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const classWrapper = mountWithPlugins(ClassSchedule, {
      messages: {
        en: { common: enCommon, ...enPreschool },
        kh: { common: enCommon, ...khPreschool },
      },
      global: {
        stubs: stubs(),
      },
    })

    const teacherWrapper = mountWithPlugins(TeacherSchedule, {
      messages: {
        en: { common: enCommon, ...enPreschool },
        kh: { common: enCommon, ...khPreschool },
      },
      global: {
        stubs: stubs(),
      },
    })

    const selfWrapper = mountWithPlugins(MySchedule, {
      messages: {
        en: { common: enCommon, ...enPreschool },
        kh: { common: enCommon, ...khPreschool },
      },
      global: {
        stubs: stubs(),
      },
    })

    await flushPromises()

    expect(mockLoadClassOptions).toHaveBeenCalled()
    expect(mockLoadTeacherOptions).toHaveBeenCalled()
    expect(mockLoadMySchedule).toHaveBeenCalled()
    expect(mockFetchTodayAttendanceSessions).toHaveBeenCalled()
    expect(classWrapper.text()).toContain('Class timetable')
    expect(teacherWrapper.text()).toContain('Teacher timetable')
    expect(selfWrapper.text()).toContain('My schedule')
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })
})
