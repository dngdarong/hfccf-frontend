import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as XLSX from 'xlsx'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import StudentSummaryReportPanel from '@/modules/preschool/admin/pages/reports/components/StudentSummaryReportPanel.vue'
import * as preschoolApi from '@/modules/preschool/services/preschoolApi'
import * as lifecycleApi from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'
import * as reportsApi from '@/modules/preschool/services/api/preschoolReportsApi'

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolClasses: vi.fn(),
  fetchPreschoolStudents: vi.fn(),
  fetchPreschoolStudent: vi.fn(),
  fetchPreschoolAttendance: vi.fn(),
}))

vi.mock('@/modules/preschool/services/api/preschoolAcademicLifecycleApi', () => ({
  fetchAcademicLifecycle: vi.fn(),
}))

vi.mock('@/modules/preschool/services/api/preschoolReportsApi', () => ({
  downloadStudentSummaryReportPdf: vi.fn(),
}))

vi.mock('xlsx', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    writeFile: vi.fn(),
  }
})

function createWrapper() {
  return mountWithPlugins(StudentSummaryReportPanel, {
    messages: { en: enPreschool },
    attachTo: document.body,
    global: {
      stubs: {
        Button: {
          emits: ['click'],
          template: '<button type="button" @click="$emit(\'click\')"><slot /></button>',
        },
        StudentIdentityCard: { template: '<div data-testid="student-identity-card" />' },
        StudentAttendanceSummary: { template: '<div data-testid="student-attendance-summary" />' },
        ClassSummaryTable: { template: '<div data-testid="class-summary-table" />' },
      },
    },
  })
}

async function prepareIndividualReport(wrapper) {
  wrapper.vm.scopeType = 'individual'
  wrapper.vm.academicYearId = 1
  wrapper.vm.classId = 'class-1'
  wrapper.vm.studentId = 'student-1'
  wrapper.vm.reportGenerated = true
  wrapper.vm.reportData = {
    student: {
      id: 'student-1',
      fullName: 'Sokha Chan',
      firstName: 'Sokha',
      lastName: 'Chan',
      studentCode: 'P001',
      publicId: 'P001',
      classes: [
        {
          id: 'class-1',
          name: 'Preschool-A',
          academicYear: 'Academic Year 2026',
          enrolledAt: '2026-07-20T04:50:44.000000Z',
        },
      ],
      status: 'active',
      gender: 'Female',
      dateOfBirth: '2020-01-02',
      nationality: 'Cambodian',
      ethnicity: 'ខ្មែរ',
      placeOfBirth: 'ភ្នំពេញ',
      address: 'ភូមិ១ សង្កាត់២ ខណ្ឌ៣ រាជធានីភ្នំពេញ',
      guardianName: 'Chan Dara',
      guardianPhone: '012345678',
    },
    attendance: {
      items: [{ status: 'present' }],
      total: 1,
    },
    classStudents: [],
  }

  await wrapper.vm.$nextTick()
  await flushPromises()
}

async function prepareClassReport(wrapper) {
  wrapper.vm.scopeType = 'class'
  wrapper.vm.academicYearId = 1
  wrapper.vm.classId = 'class-1'
  wrapper.vm.studentId = 'student-1'
  wrapper.vm.reportGenerated = true
  wrapper.vm.reportData = {
    student: null,
    attendance: null,
    classStudents: [
      {
        student: {
          id: 'student-1',
          fullName: 'Sokha Chan',
          firstName: 'Sokha',
          studentCode: 'P001',
          publicId: 'P001',
          classes: [{ id: 'class-1', name: 'Preschool-A', academicYear: 'Academic Year 2026' }],
          status: 'active',
          gender: 'Female',
          dateOfBirth: '2020-01-02',
          nationality: 'Cambodian',
          guardianName: 'Chan Dara',
          guardianPhone: '012345678',
        },
        attendancePercentage: 100,
      },
    ],
  }

  await wrapper.vm.$nextTick()
  await flushPromises()
}

describe('StudentSummaryReportPanel PDF export', () => {
  let realCreateElement
  let createElementSpy
  let clickedDownloads
  let createObjectURLMock
  let revokeObjectURLMock

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    vi.useFakeTimers()
    clickedDownloads = []
    createObjectURLMock = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:student-summary-pdf')
    revokeObjectURLMock = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    realCreateElement = document.createElement.bind(document)
    createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      const element = realCreateElement(tagName, options)
      if (String(tagName).toLowerCase() === 'a') {
        vi.spyOn(element, 'click').mockImplementation(() => {
          clickedDownloads.push({
            href: element.href,
            download: element.download,
            isConnected: element.isConnected,
          })
        })
      }
      return element
    })

    lifecycleApi.fetchAcademicLifecycle.mockResolvedValue({
      academicYears: [{ id: 1, code: 'AY2026', label: 'Academic Year 2026' }],
    })
    preschoolApi.fetchPreschoolClasses.mockResolvedValue({
      items: [{ id: 'class-1', name: 'Preschool-A' }],
    })
    preschoolApi.fetchPreschoolStudents.mockResolvedValue({
      items: [{ id: 'student-1', fullName: 'Sokha Chan', studentCode: 'P001', publicId: 'P001' }],
    })
    preschoolApi.fetchPreschoolStudent.mockResolvedValue({
      id: 'student-1',
      fullName: 'Sokha Chan',
      firstName: 'Sokha',
      lastName: 'Chan',
      studentCode: 'P001',
      publicId: 'P001',
      classes: [
        {
          id: 'class-1',
          name: 'Preschool-A',
          academicYear: 'Academic Year 2026',
          enrolledAt: '2026-07-20T04:50:44.000000Z',
        },
      ],
      status: 'active',
      gender: 'Female',
      dateOfBirth: '2020-01-02',
      nationality: 'Cambodian',
      ethnicity: 'ខ្មែរ',
      placeOfBirth: 'ភ្នំពេញ',
      address: 'ភូមិ១ សង្កាត់២ ខណ្ឌ៣ រាជធានីភ្នំពេញ',
      guardianName: 'Chan Dara',
      guardianPhone: '012345678',
    })
    preschoolApi.fetchPreschoolAttendance.mockResolvedValue({
      items: [{ status: 'present' }],
      total: 1,
    })
    reportsApi.downloadStudentSummaryReportPdf.mockResolvedValue({
      blob: new Blob(['student-summary-pdf'], { type: 'application/pdf' }),
      filename: 'StudentSummaryReport_Individual_2026-07-24.pdf',
      mimeType: 'application/pdf',
    })
    document.body.innerHTML = ''
  })

  afterEach(() => {
    createElementSpy?.mockRestore()
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('downloads the individual summary from the backend PDF endpoint without mutating the live DOM', async () => {
    window.print = vi.fn()

    const wrapper = createWrapper()
    await flushPromises()
    await prepareIndividualReport(wrapper)

    const liveRoot = document.querySelector('.preschool-student-summary-report-content')
    expect(liveRoot).not.toBeNull()
    const liveRootHtmlBefore = liveRoot.outerHTML

    const pdfButton = wrapper.findAll('button').find(button => button.text().includes('PDF'))
    await pdfButton.trigger('click')
    await flushPromises()

    expect(window.print).not.toHaveBeenCalled()
    expect(reportsApi.downloadStudentSummaryReportPdf).toHaveBeenCalledWith({
      mode: 'individual',
      academicYearId: 1,
      classId: 'class-1',
      studentId: 'student-1',
      filename: expect.stringMatching(/^StudentSummaryReport_Individual_\d{4}-\d{2}-\d{2}\.pdf$/),
    })
    expect(createObjectURLMock).toHaveBeenCalledWith(expect.any(Blob))
    expect(clickedDownloads).toEqual([
      {
        href: 'blob:student-summary-pdf',
        download: 'StudentSummaryReport_Individual_2026-07-24.pdf',
        isConnected: true,
      },
    ])
    expect(document.querySelector('a[download]')).toBeNull()
    expect(document.querySelector('iframe[aria-hidden="true"]')).toBeNull()
    vi.runOnlyPendingTimers()
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:student-summary-pdf')
    expect(liveRoot.isConnected).toBe(true)
    expect(liveRoot.outerHTML).toBe(liveRootHtmlBefore)
  })

  it('downloads the class summary without sending an individual student id', async () => {
    window.print = vi.fn()
    reportsApi.downloadStudentSummaryReportPdf.mockResolvedValueOnce({
      blob: new Blob(['student-summary-class-pdf'], { type: 'application/pdf' }),
      filename: 'StudentSummaryReport_Class_2026-07-24.pdf',
      mimeType: 'application/pdf',
    })

    const wrapper = createWrapper()
    await flushPromises()
    await prepareClassReport(wrapper)

    const pdfButton = wrapper.findAll('button').find(button => button.text().includes('PDF'))
    await pdfButton.trigger('click')
    await flushPromises()

    expect(window.print).not.toHaveBeenCalled()
    expect(reportsApi.downloadStudentSummaryReportPdf).toHaveBeenCalledWith({
      mode: 'class',
      academicYearId: 1,
      classId: 'class-1',
      studentId: 'student-1',
      filename: expect.stringMatching(/^StudentSummaryReport_Class_\d{4}-\d{2}-\d{2}\.pdf$/),
    })
    expect(clickedDownloads[0].download).toBe('StudentSummaryReport_Class_2026-07-24.pdf')
    expect(document.querySelector('iframe[aria-hidden="true"]')).toBeNull()
  })

  it('reports a controlled error when the backend returns an empty PDF blob', async () => {
    window.print = vi.fn()
    reportsApi.downloadStudentSummaryReportPdf.mockResolvedValueOnce({
      blob: new Blob([], { type: 'application/pdf' }),
      filename: 'StudentSummaryReport_Individual_2026-07-24.pdf',
      mimeType: 'application/pdf',
    })

    const wrapper = createWrapper()
    await flushPromises()
    await prepareIndividualReport(wrapper)

    const pdfButton = wrapper.findAll('button').find(button => button.text().includes('PDF'))
    await pdfButton.trigger('click')
    await flushPromises()

    expect(window.print).not.toHaveBeenCalled()
    expect(createObjectURLMock).not.toHaveBeenCalled()
    expect(clickedDownloads).toEqual([])
    expect(document.querySelector('a[download]')).toBeNull()
    expect(document.querySelector('iframe[aria-hidden="true"]')).toBeNull()
    expect(wrapper.vm.errorMessage).toBe('Failed to export report')
  })

  it('opens the backend Student Profile PDF for print without printing or mutating the live DOM', async () => {
    window.print = vi.fn()
    window.open = vi.fn(() => ({ closed: false }))

    const wrapper = createWrapper()
    await flushPromises()
    await prepareIndividualReport(wrapper)

    const liveRoot = document.querySelector('.preschool-student-summary-report-content')
    const liveRootHtmlBefore = liveRoot.outerHTML

    const printButton = wrapper.findAll('button').find((button) => button.text().includes('Print'))
    await printButton.trigger('click')
    await flushPromises()

    expect(window.print).not.toHaveBeenCalled()
    expect(reportsApi.downloadStudentSummaryReportPdf).toHaveBeenCalledWith({
      mode: 'individual',
      academicYearId: 1,
      classId: 'class-1',
      studentId: 'student-1',
      filename: expect.stringMatching(/^StudentSummaryReport_Individual_\d{4}-\d{2}-\d{2}\.pdf$/),
    })
    expect(window.open).toHaveBeenCalledWith(
      'blob:student-summary-pdf',
      '_blank',
      'noopener,noreferrer',
    )
    expect(clickedDownloads).toEqual([])
    expect(liveRoot.outerHTML).toBe(liveRootHtmlBefore)
  })

  it('exports individual Excel as a Khmer Student Profile workbook without Attendance data', async () => {
    window.print = vi.fn()
    const wrapper = createWrapper()
    await flushPromises()
    await prepareIndividualReport(wrapper)

    const excelButton = wrapper.findAll('button').find((button) => button.text().includes('Excel'))
    await excelButton.trigger('click')
    await flushPromises()

    expect(XLSX.writeFile).toHaveBeenCalledWith(
      expect.objectContaining({
        SheetNames: ['ប្រវត្តិរូបសិស្ស'],
      }),
      expect.stringMatching(/^StudentSummaryReport_Individual_\d{4}-\d{2}-\d{2}\.xlsx$/),
    )

    const workbook = XLSX.writeFile.mock.calls[0][0]
    const sheet = workbook.Sheets['ប្រវត្តិរូបសិស្ស']
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
    })

    expect(rows[0][0]).toBe('ប្រវត្តិរូបសិស្ស')
    expect(rows[1][0]).toMatch(/^កាលបរិច្ឆេទនាំចេញ៖ \d{4}-\d{2}-\d{2}$/)
    expect(rows[4][0]).toBe('ព័ត៌មានផ្ទាល់ខ្លួនសិស្ស')
    expect(rows[5]).toEqual(['គោត្តនាម-នាម', 'Sokha Chan', 'ភេទ', 'ស្រី'])
    expect(rows[6]).toEqual(['ឈ្មោះជាឡាតាំង', '—', 'ថ្ងៃខែឆ្នាំកំណើត', '2020-01-02'])
    expect(rows[7]).toEqual(['អត្តលេខសិស្ស', 'P001', 'សញ្ជាតិ', 'Cambodian'])
    expect(rows[9][0]).toBe('ទីកន្លែងកំណើត')
    expect(rows[9][1]).toBe('ភ្នំពេញ')
    expect(rows[10][0]).toBe('អាសយដ្ឋាន')
    expect(rows[10][1]).toBe('ភូមិ១ សង្កាត់២ ខណ្ឌ៣ រាជធានីភ្នំពេញ')
    expect(rows[11]).toEqual([
      'ឆ្នាំសិក្សា',
      'Academic Year 2026',
      'កាលបរិច្ឆេទចុះឈ្មោះ',
      '2026-07-20',
    ])
    expect(rows[12]).toEqual(['ស្ថានភាព', 'សកម្ម', '', ''])
    expect(rows[14][0]).toBe('ព័ត៌មានអាណាព្យាបាល')
    expect(rows[15][1]).toBe('Chan Dara')
    expect(rows[17][1]).toBe('012345678')
    expect(sheet.B8.t).toBe('s')
    expect(sheet.B8.z).toBe('@')
    expect(sheet.B18.t).toBe('s')
    expect(sheet.B18.z).toBe('@')
    expect(sheet['!cols']).toEqual([{ wch: 26 }, { wch: 36 }, { wch: 26 }, { wch: 34 }])
    expect(sheet['!rows'][0]).toEqual({ hpt: 32 })
    expect(sheet['!merges'].map(formatMergeRange)).toEqual(
      expect.arrayContaining(['A1:D1', 'A5:D5', 'B10:D10', 'B11:D11', 'A15:D15', 'A20:D20']),
    )
    expect(JSON.stringify(rows)).not.toContain('Attendance')
    expect(JSON.stringify(rows)).not.toContain('Present')
    expect(JSON.stringify(rows)).not.toContain('Absent')
  })

  it('exports class Excel as a Khmer student list without attendance columns', async () => {
    window.print = vi.fn()
    const wrapper = createWrapper()
    await flushPromises()
    await prepareClassReport(wrapper)

    const excelButton = wrapper.findAll('button').find((button) => button.text().includes('Excel'))
    await excelButton.trigger('click')
    await flushPromises()

    expect(XLSX.writeFile).toHaveBeenCalledWith(
      expect.objectContaining({
        SheetNames: ['បញ្ជីសិស្ស'],
      }),
      expect.stringMatching(/^StudentSummaryReport_Class_\d{4}-\d{2}-\d{2}\.xlsx$/),
    )

    const workbook = XLSX.writeFile.mock.calls[0][0]
    const sheet = workbook.Sheets['បញ្ជីសិស្ស']
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
    })

    expect(rows[0][0]).toBe('បញ្ជីសិស្ស')
    expect(rows[1][0]).toBe('កម្រិតសិក្សា៖ Preschool-A')
    expect(rows[1][3]).toBe('ឆ្នាំសិក្សា៖ Academic Year 2026')
    expect(rows[4]).toEqual([
      'ល.រ',
      'អត្តលេខសិស្ស',
      'គោត្តនាម-នាម',
      'ឈ្មោះជាឡាតាំង',
      'ភេទ',
      'ថ្ងៃខែឆ្នាំកំណើត',
      'សញ្ជាតិ',
      'កម្រិតសិក្សា',
      'ឆ្នាំសិក្សា',
      'ស្ថានភាព',
      'ឈ្មោះអាណាព្យាបាល',
      'លេខទំនាក់ទំនង',
    ])
    expect(sheet.B6.t).toBe('s')
    expect(sheet.B6.z).toBe('@')
    expect(sheet.L6.t).toBe('s')
    expect(sheet.L6.z).toBe('@')
    expect(sheet['!freeze']).toEqual({ xSplit: 0, ySplit: 5 })
    expect(sheet['!autofilter']).toEqual({ ref: 'A5:L6' })
    expect(sheet['!merges'].map(formatMergeRange)).toEqual(
      expect.arrayContaining(['A1:L1', 'A2:C2', 'D2:L2', 'A3:L3']),
    )
    expect(JSON.stringify(rows)).not.toContain('Attendance')
    expect(JSON.stringify(rows)).not.toContain('អត្រាវត្តមាន')
    expect(JSON.stringify(rows)).not.toContain('វត្តមាន')
    expect(rows[5]).toContain('012345678')
  })
})

function formatMergeRange(range) {
  return XLSX.utils.encode_range(range)
}
