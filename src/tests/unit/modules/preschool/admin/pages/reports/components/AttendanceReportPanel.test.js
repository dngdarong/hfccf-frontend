import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({ sheets: [] })),
    aoa_to_sheet: vi.fn(rows => ({ rows })),
    encode_col: vi.fn(index => {
      let column = ''
      let value = index
      do {
        column = String.fromCharCode((value % 26) + 65) + column
        value = Math.floor(value / 26) - 1
      } while (value >= 0)
      return column
    }),
    book_append_sheet: vi.fn((workbook, sheet, name) => {
      workbook.sheets.push({ sheet, name })
    }),
  },
  writeFile: vi.fn(),
}))

import { mountWithPlugins } from '@/tests/helpers/mount'
import AttendanceReportPanel from '@/modules/preschool/admin/pages/reports/components/AttendanceReportPanel.vue'
import * as preschoolApi from '@/modules/preschool/services/preschoolApi'
import * as lifecycleApi from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'
import * as reportsApi from '@/modules/preschool/services/api/preschoolReportsApi'
import * as XLSX from 'xlsx'

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolClasses: vi.fn(),
  fetchPreschoolStudents: vi.fn(),
  fetchPreschoolAttendance: vi.fn(),
}))

vi.mock('@/modules/preschool/services/api/preschoolAcademicLifecycleApi', () => ({
  fetchAcademicLifecycle: vi.fn(),
}))

vi.mock('@/modules/preschool/services/api/preschoolReportsApi', () => ({
  downloadMonthlyAttendanceReportPdf: vi.fn(),
  fetchMonthlyAttendanceReport: vi.fn(),
}))

function stubs() {
  return {
    Button: {
      emits: ['click'],
      template: '<button type="button" @click="$emit(\'click\')"><slot /></button>',
    },
    Select: {
      props: ['modelValue', 'options'],
      emits: ['update:modelValue'],
      template: '<select @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
    },
    MonthlyAttendanceReport: { template: '<div data-testid="monthly-report"></div>' },
    YearlyAttendanceReport: { template: '<div data-testid="yearly-report"></div>' },
    FilterSummary: { template: '<div data-testid="filter-summary"></div>' },
    ExportMenu: { template: '<div data-testid="export-menu"></div>' },
    ReportStatistics: { template: '<div data-testid="report-statistics"></div>' },
  }
}

function mountPanel() {
  return mountWithPlugins(AttendanceReportPanel, {
    global: { stubs: stubs() },
  })
}

beforeEach(() => {
  vi.clearAllMocks()

  lifecycleApi.fetchAcademicLifecycle.mockResolvedValue({
    academicYears: [{ id: 7, code: 'AY2026', label: 'Academic Year 2026' }],
  })

  preschoolApi.fetchPreschoolClasses.mockResolvedValue({
    items: [{ id: 3, name: 'Lotus' }],
  })

  preschoolApi.fetchPreschoolStudents.mockResolvedValue({
    items: [{ id: 1, fullName: 'Sokha', studentCode: 'P001', status: 'active' }],
    pagination: { totalPages: 1 },
  })

  preschoolApi.fetchPreschoolAttendance.mockResolvedValue({
    items: [{ studentId: 1, status: 'present', attendanceDate: '2026-07-01' }],
    pagination: { totalPages: 1 },
  })

  reportsApi.fetchMonthlyAttendanceReport.mockResolvedValue({
    classInfo: { id: 3, name: 'Lotus' },
    students: [{ id: 1, fullName: 'Sokha', studentCode: 'P001', status: 'active' }],
    attendanceRecords: [{ studentId: 1, status: 'present', attendanceDate: '2026-07-01' }],
    summary: { totalStudents: 1, totalRecords: 1, present: 1, absent: 0, late: 0, excused: 0 },
  })

  reportsApi.downloadMonthlyAttendanceReportPdf.mockResolvedValue({
    blob: new Blob(['%PDF-1.4'], { type: 'application/pdf' }),
    filename: 'AttendanceReport_Monthly_2026-07_2026-07-24.pdf',
    mimeType: 'application/pdf',
  })

  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:http://localhost/attendance-pdf')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  vi.spyOn(window, 'print').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('AttendanceReportPanel monthly PDF export', () => {
  it('shows a loading data state while the monthly report request is pending', async () => {
    let resolveMonthlyReport
    reportsApi.fetchMonthlyAttendanceReport.mockReturnValue(new Promise(resolve => {
      resolveMonthlyReport = resolve
    }))

    const wrapper = mountPanel()

    await flushPromises()

    wrapper.vm.selectedMonth = 7
    wrapper.vm.selectedYear = 2026
    const reportPromise = wrapper.vm.generateReport()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('preschoolReportsPage.loadingData')
    expect(wrapper.find('[data-testid="monthly-report"]').exists()).toBe(false)

    resolveMonthlyReport({
      classInfo: { id: 3, name: 'Lotus' },
      students: [{ id: 1, fullName: 'Sokha', studentCode: 'P001', status: 'active' }],
      attendanceRecords: [{ studentId: 1, status: 'present', attendanceDate: '2026-07-01' }],
      summary: { totalStudents: 1, totalRecords: 1, present: 1, absent: 0, late: 0, excused: 0 },
    })
    await reportPromise
    await flushPromises()

    expect(wrapper.text()).not.toContain('preschoolReportsPage.loadingData')
    expect(wrapper.find('[data-testid="monthly-report"]').exists()).toBe(true)
  })

  it('downloads monthly attendance PDF through the backend blob endpoint without printing', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const wrapper = mountPanel()

    await flushPromises()

    wrapper.vm.selectedMonth = 7
    wrapper.vm.selectedYear = 2026
    await wrapper.vm.generateReport()
    await flushPromises()
    await wrapper.vm.exportReport('pdf')
    await flushPromises()

    expect(reportsApi.fetchMonthlyAttendanceReport).toHaveBeenCalledWith({
      academicYearId: 7,
      classId: 3,
      month: 7,
      year: 2026,
      dateFrom: '2026-07-01',
      dateTo: '2026-07-31',
    })
    expect(reportsApi.downloadMonthlyAttendanceReportPdf).toHaveBeenCalledWith({
      academicYearId: 7,
      classId: 3,
      month: 7,
      year: 2026,
      dateFrom: '2026-07-01',
      dateTo: '2026-07-31',
      filename: expect.stringMatching(/^AttendanceReport_Monthly_\d{4}-\d{2}-\d{2}\.pdf$/),
    })
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(clickSpy).toHaveBeenCalled()
    expect(window.print).not.toHaveBeenCalled()
    expect(document.querySelector('a[download="AttendanceReport_Monthly_2026-07_2026-07-24.pdf"]')).toBeNull()
  })

  it('exports monthly attendance Excel as one formal Khmer register worksheet', async () => {
    const wrapper = mountPanel()

    await flushPromises()

    wrapper.vm.selectedMonth = 7
    wrapper.vm.selectedYear = 2026
    await wrapper.vm.generateReport()
    await flushPromises()
    await wrapper.vm.exportReport('excel')
    await flushPromises()

    const monthlyRows = XLSX.utils.aoa_to_sheet.mock.calls[0][0]
    const workbook = XLSX.writeFile.mock.calls[0][0]
    const sheet = workbook.sheets[0].sheet

    expect(Array.isArray(monthlyRows)).toBe(true)
    expect(monthlyRows.every(row => Array.isArray(row))).toBe(true)
    expect(monthlyRows[0]).toEqual(['ព្រះរាជាណាចក្រកម្ពុជា'])
    expect(monthlyRows[1]).toEqual(['ជាតិ សាសនា ព្រះមហាក្សត្រ'])
    expect(monthlyRows[3]).toEqual(['បញ្ជីវត្តមានសិស្សប្រចាំខែ'])
    expect(monthlyRows[4].slice(0, 12)).toEqual([
      'ថ្នាក់៖ Lotus',
      '',
      'ឆ្នាំសិក្សា៖ Academic Year 2026',
      '',
      'ខែ៖ preschoolAttendanceReportPage.months.july',
      '',
      '',
      '',
      'ឆ្នាំ៖ 2026',
      '',
      '',
      '',
    ])
    expect(monthlyRows[5]).toEqual([])
    expect(monthlyRows[6]).toEqual([
      'ល.រ',
      'គោត្តនាម-នាម',
      'ភេទ',
      'ថ្ងៃខែឆ្នាំកំណើត',
      ...Array.from({ length: 31 }, (_, index) => index + 1),
    ])
    expect(monthlyRows[7]).toEqual([
      1,
      'Sokha',
      '—',
      '—',
      'P',
      ...Array.from({ length: 30 }, () => ''),
    ])
    expect(monthlyRows[9][0]).toBe('សង្ខេប')
    expect(monthlyRows[10].slice(0, 14)).toEqual(['សិស្សសរុប', 1, '', 'វត្តមាន', 1, '', 'អវត្តមាន', 0, '', 'មកយឺត', 0, '', 'មានច្បាប់', 0])
    expect(monthlyRows[12].slice(0, 11)).toEqual(['សម្គាល់', 'P = វត្តមាន', '', '', 'A = អវត្តមាន', '', '', 'L = មកយឺត', '', '', 'E = មានច្បាប់'])
    expect(monthlyRows[14]).toContain('ពុទ្ធសករាជ ២៥៧')
    expect(monthlyRows[15]).toContain('បាត់ដំបង ថ្ងៃទី')
    expect(monthlyRows[17]).toContain('ហត្ថលេខា')
    expect(monthlyRows[19]).toContain('________________')
    expect(monthlyRows.some(row => row.includes('Report Info'))).toBe(false)
    expect(monthlyRows.some(row => row.includes('Students'))).toBe(false)
    expect(workbook.sheets.map(item => item.name)).toEqual(['បញ្ជីវត្តមានប្រចាំខែ'])
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(1)
    expect(sheet['!merges'].length).toBeGreaterThan(0)
    expect(sheet['!cols'][0]).toEqual({ wch: 6 })
    expect(sheet['!cols'][1]).toEqual({ wch: 34 })
    expect(sheet['!freeze']).toEqual({ xSplit: 0, ySplit: 7 })
    expect(sheet['!autofilter']).toBeUndefined()
    expect(XLSX.writeFile).toHaveBeenCalledWith(expect.any(Object), expect.stringMatching(/^AttendanceReport_Monthly_\d{4}-\d{2}-\d{2}\.xlsx$/))
  })

  it('limits monthly attendance Excel day columns to the selected month length', async () => {
    const wrapper = mountPanel()

    await flushPromises()

    wrapper.vm.selectedMonth = 2
    wrapper.vm.selectedYear = 2026
    await wrapper.vm.generateReport()
    await flushPromises()
    await wrapper.vm.exportReport('excel')
    await flushPromises()

    const monthlyRows = XLSX.utils.aoa_to_sheet.mock.calls[0][0]
    const sheet = XLSX.writeFile.mock.calls[0][0].sheets[0].sheet

    expect(monthlyRows[6]).toEqual([
      'ល.រ',
      'គោត្តនាម-នាម',
      'ភេទ',
      'ថ្ងៃខែឆ្នាំកំណើត',
      ...Array.from({ length: 28 }, (_, index) => index + 1),
    ])
    expect(monthlyRows[6]).not.toContain(29)
    expect(sheet['!cols']).toHaveLength(32)
  })

  it('keeps yearly PDF out of scope and does not call the monthly endpoint', async () => {
    const wrapper = mountPanel()

    await flushPromises()

    wrapper.vm.reportPeriod = 'yearly'
    await wrapper.vm.exportReport('pdf')
    await flushPromises()

    expect(reportsApi.downloadMonthlyAttendanceReportPdf).not.toHaveBeenCalled()
    expect(window.print).not.toHaveBeenCalled()
    expect(wrapper.vm.errorMessage).toBe('Failed to export report')
  })
})
