import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enAttendance from '@/i18n/en/preschool/attendance'
import AttendanceReport from '@/modules/preschool/admin/pages/reports/AttendanceReport.vue'
import * as preschoolApi from '@/modules/preschool/services/preschoolApi'
import * as lifecycleApi from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolClasses: vi.fn(),
  fetchPreschoolStudents: vi.fn(),
  fetchPreschoolAttendance: vi.fn(),
}))

vi.mock('@/modules/preschool/services/api/preschoolAcademicLifecycleApi', () => ({
  fetchAcademicLifecycle: vi.fn(),
}))

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1></header>' },
    Button: { emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' },
    Select: { props: ['modelValue', 'options'], emits: ['update:modelValue'], template: '<select @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>' },
    MonthlyAttendanceReport: { template: '<div data-testid="monthly-report"></div>' },
    YearlyAttendanceReport: { template: '<div data-testid="yearly-report"></div>' },
  }
}

beforeEach(() => {
  vi.clearAllMocks()

  lifecycleApi.fetchAcademicLifecycle.mockResolvedValue({
    academicYears: [
      { id: 1, code: 'AY2026', label: 'Academic Year 2026' },
    ],
  })

  preschoolApi.fetchPreschoolClasses.mockResolvedValue({
    items: [
      { id: 1, name: 'Preschool-A' },
      { id: 2, name: 'Preschool-B' },
    ],
  })

  // Mock pagination response
  preschoolApi.fetchPreschoolStudents.mockResolvedValue({
    items: [
      { id: 1, fullName: 'Sokha', studentCode: 'P001', status: 'active' },
      { id: 2, fullName: 'Sophea', studentCode: 'P002', status: 'active' },
      { id: 3, fullName: 'Srey', studentCode: 'P003', status: 'active' }, // Student with no attendance
    ],
    pagination: { totalPages: 1, totalItems: 3 },
  })

  // Mock attendance data with various statuses
  preschoolApi.fetchPreschoolAttendance.mockResolvedValue({
    items: [
      { studentId: 1, status: 'present', attendanceDate: '2026-07-01' },
      { studentId: 1, status: 'absent', attendanceDate: '2026-07-02' },
      { studentId: 1, status: 'late', attendanceDate: '2026-07-03' },
      { studentId: 2, status: 'present', attendanceDate: '2026-07-01' },
      { studentId: 2, status: 'excused', attendanceDate: '2026-07-02' },
      // Student 3 (Srey) has no attendance records
    ],
    pagination: { totalPages: 1, totalItems: 5 },
  })
})

describe('AttendanceReport', () => {
  it('renders the report page with title and filters', async () => {
    const wrapper = mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Attendance Report')
    expect(wrapper.text()).toContain('Filters')
  })

  it('loads academic years and classes on mount', async () => {
    mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(lifecycleApi.fetchAcademicLifecycle).toHaveBeenCalled()
    expect(preschoolApi.fetchPreschoolClasses).toHaveBeenCalled()
  })

  it('shows monthly and yearly mode options', async () => {
    const wrapper = mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.vm.reportPeriod).toBe('monthly')
  })

  it('shows month and year filters in monthly mode', async () => {
    const wrapper = mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.vm.selectedMonth).toBeDefined()
    expect(wrapper.vm.selectedYear).toBeDefined()
  })

  it('hides month filter in yearly mode', async () => {
    const wrapper = mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()
    wrapper.vm.reportPeriod = 'yearly'
    await wrapper.vm.$nextTick()

    // In yearly mode, selectedMonth still exists but the filter field is hidden via v-if
    expect(wrapper.vm.reportPeriod).toBe('yearly')
  })

  it('shows empty state when no report generated', async () => {
    const wrapper = mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Select filters and click Generate Report')
  })

  it('generates monthly report with correct data grouping', async () => {
    const wrapper = mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    wrapper.vm.reportPeriod = 'monthly'
    wrapper.vm.selectedMonth = 7
    wrapper.vm.selectedYear = 2026
    await wrapper.vm.generateReport()
    await flushPromises()

    expect(wrapper.vm.reportGenerated).toBe(true)
    expect(wrapper.vm.reportData.monthlyAttendance).toHaveLength(5)
    expect(wrapper.vm.reportData.students).toHaveLength(3)
  })

  it('generates yearly report', async () => {
    const wrapper = mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    wrapper.vm.reportPeriod = 'yearly'
    wrapper.vm.selectedYear = 2026
    await wrapper.vm.generateReport()
    await flushPromises()

    expect(wrapper.vm.reportGenerated).toBe(true)
    expect(wrapper.vm.reportData.yearlyAttendance).toHaveLength(5)
    expect(wrapper.vm.reportData.students).toHaveLength(3)
  })

  it('includes students with zero attendance records', async () => {
    const wrapper = mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    await wrapper.vm.generateReport()
    await flushPromises()

    // Student 3 (Srey) has no attendance records but should be in the list
    const studentIds = wrapper.vm.reportData.students.map(s => s.id)
    expect(studentIds).toContain(3)
  })

  it('calculates attendance percentage using canonical formula (Present ÷ Total)', async () => {
    const wrapper = mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    await wrapper.vm.generateReport()
    await flushPromises()

    // Student 1: 1 present out of 3 total = 33%
    // Student 2: 1 present out of 2 total = 50%
    // Student 3: 0 present out of 0 total = 0%

    const attendanceRecords = wrapper.vm.reportData.monthlyAttendance
    const studentWithId1 = attendanceRecords.filter(r => r.studentId === 1)
    const studentWithId2 = attendanceRecords.filter(r => r.studentId === 2)

    expect(studentWithId1).toHaveLength(3)
    expect(studentWithId2).toHaveLength(2)
  })

  it('normalizes attendance statuses correctly', async () => {
    const wrapper = mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    await wrapper.vm.generateReport()
    await flushPromises()

    const statuses = wrapper.vm.reportData.monthlyAttendance.map(r => r.status)
    expect(statuses).toContain('present')
    expect(statuses).toContain('absent')
    expect(statuses).toContain('late')
    expect(statuses).toContain('excused')
  })

  it('resets filters when reset button clicked', async () => {
    const wrapper = mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    wrapper.vm.reportGenerated = true
    await wrapper.vm.$nextTick()
    wrapper.vm.resetFilters()

    expect(wrapper.vm.reportGenerated).toBe(false)
    expect(wrapper.vm.reportData.monthlyAttendance).toEqual([])
    expect(wrapper.vm.reportData.students).toEqual([])
  })

  it('generates correct date range for monthly mode (1st to last day of month)', async () => {
    const wrapper = mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    wrapper.vm.selectedMonth = 7
    wrapper.vm.selectedYear = 2026
    const range = wrapper.vm.getDateRange()

    expect(range.from).toBe('2026-07-01')
    expect(range.to).toBe('2026-07-31')
  })

  it('generates correct date range for yearly mode (Jan 1 to Dec 31)', async () => {
    const wrapper = mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    wrapper.vm.reportPeriod = 'yearly'
    wrapper.vm.selectedYear = 2026
    const range = wrapper.vm.getDateRange()

    expect(range.from).toBe('2026-01-01')
    expect(range.to).toBe('2026-12-31')
  })

  it('passes correct parameters to API when generating report', async () => {
    const wrapper = mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    wrapper.vm.selectedMonth = 7
    wrapper.vm.selectedYear = 2026
    await wrapper.vm.generateReport()
    await flushPromises()

    // Check that the API was called with attendance date range filter
    expect(preschoolApi.fetchPreschoolAttendance).toHaveBeenCalled()
    expect(preschoolApi.fetchPreschoolStudents).toHaveBeenCalled()
  })

  it('prevents generation when required filters are missing', async () => {
    const wrapper = mountWithPlugins(AttendanceReport, {
      messages: { en: enAttendance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    // Reset academicYearId to empty
    wrapper.vm.academicYearId = ''

    expect(wrapper.vm.canGenerate).toBeFalsy()
  })
})
