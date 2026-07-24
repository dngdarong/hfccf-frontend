import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  downloadMonthlyAttendanceReportPdf,
  downloadStudentSummaryReportPdf,
  fetchClassroomReport,
  fetchMonthlyAttendanceReport,
  fetchReportPeriods,
  fetchStudentReportPeriod,
  fetchStudentReports,
} from '@/modules/preschool/services/api/preschoolReportsApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('preschool reports api', () => {
  it('loads report periods and student report bundles from the expected endpoints', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        periods: [
          {
            label: 'Term 1',
            periodType: 'term',
            fromDate: '2026-05-01',
            toDate: '2026-05-15',
            assessmentCount: 3,
            studentCount: 2,
            classCount: 1,
          },
        ],
      }),
    )

    const periods = await fetchReportPeriods({ studentId: 12, periodType: 'term', academicYearId: 77 })

    expect(http.get).toHaveBeenCalledWith('/preschool/report-periods', {
      params: expect.objectContaining({
        student_id: 12,
        period_type: 'term',
        academic_year_id: 77,
      }),
      signal: undefined,
    })
    expect(periods[0]).toMatchObject({ label: 'Term 1', assessmentCount: 3, periodType: 'term' })

    http.get.mockResolvedValueOnce(
      stubResponse({
        student: { id: 12, studentCode: 'PS-12', fullName: 'Lina Chan' },
        periods: [{ label: 'Term 1' }],
        period: { label: 'Term 1' },
        report: {
          summary: { finalizedAssessments: 2 },
          attendanceSummary: { attendanceCount: 2 },
          categorySummaries: [],
          observations: [],
          assessments: [],
        },
      }),
    )

    const bundle = await fetchStudentReports(12, { periodType: 'monthly', reportPeriodId: 55 })

    expect(http.get).toHaveBeenCalledWith('/preschool/students/12/reports', {
      params: expect.objectContaining({
        period_type: 'monthly',
        report_period_id: 55,
      }),
      signal: undefined,
    })
    expect(bundle.student).toMatchObject({ id: 12, studentCode: 'PS-12' })
    expect(bundle.report.summary).toMatchObject({ finalizedAssessments: 2 })

    http.get.mockResolvedValueOnce(
      stubResponse({
        student: { id: 12, studentCode: 'PS-12', fullName: 'Lina Chan' },
        periods: [{ label: 'Term 1' }],
        period: { label: 'Term 1' },
        report: { summary: { finalizedAssessments: 1 }, attendanceSummary: {}, categorySummaries: [], observations: [], assessments: [] },
      }),
    )

    await fetchStudentReportPeriod(12, 'Term 1', { periodType: 'annual', academicYearId: 2026 })
    expect(http.get).toHaveBeenCalledWith('/preschool/students/12/reports/Term%201', {
      params: expect.objectContaining({
        period_type: 'annual',
        academic_year_id: 2026,
      }),
      signal: undefined,
    })
  })

  it('loads classroom reports from the latest and period-specific endpoints', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        class: { id: 22, code: 'PS-22', name: 'Morning Stars' },
        periods: [{ label: 'Term 2', periodType: 'term' }],
        period: { label: 'Term 2' },
        report: {
          summary: { finalizedAssessments: 4 },
          attendanceSummary: { attendanceCount: 4 },
          categorySummaries: [],
          studentSummaries: [],
          observations: [],
          assessments: [],
        },
      }),
    )

    const bundle = await fetchClassroomReport(22, '', { periodType: 'term', termId: 9 })

    expect(http.get).toHaveBeenCalledWith('/preschool/classes/22/reports', {
      params: expect.objectContaining({
        period_type: 'term',
        term_id: 9,
      }),
      signal: undefined,
    })
    expect(bundle.class).toMatchObject({ id: 22, code: 'PS-22' })
    expect(bundle.report.summary).toMatchObject({ finalizedAssessments: 4 })

    http.get.mockResolvedValueOnce(
      stubResponse({
        class: { id: 22, code: 'PS-22', name: 'Morning Stars' },
        periods: [{ label: 'Term 2' }],
        period: { label: 'Term 2' },
        report: { summary: { finalizedAssessments: 4 }, attendanceSummary: {}, categorySummaries: [], studentSummaries: [], observations: [], assessments: [] },
      }),
    )

    await fetchClassroomReport(22, 'Term 2', { periodType: 'monthly', reportPeriodId: 12 })
    expect(http.get).toHaveBeenCalledWith('/preschool/classes/22/reports/Term%202', {
      params: expect.objectContaining({
        period_type: 'monthly',
        report_period_id: 12,
      }),
      signal: undefined,
    })
  })

  it('downloads Student Summary PDFs as a backend Blob attachment', async () => {
    http.get.mockResolvedValueOnce({
      data: new Blob(['pdf'], { type: 'application/pdf' }),
      headers: {
        'content-disposition': 'attachment; filename="StudentSummaryReport_Individual_2026-07-24.pdf"',
        'content-type': 'application/pdf',
      },
    })

    await expect(
      downloadStudentSummaryReportPdf({
        mode: 'individual',
        academicYearId: 1,
        classId: 2,
        studentId: 3,
        filename: 'StudentSummaryReport_Individual_2026-07-24.pdf',
      }),
    ).resolves.toMatchObject({
      filename: 'StudentSummaryReport_Individual_2026-07-24.pdf',
      mimeType: 'application/pdf',
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/reports/student-summary/download', {
      params: expect.objectContaining({
        mode: 'individual',
        academic_year_id: 1,
        class_id: 2,
        student_id: 3,
      }),
      responseType: 'blob',
      signal: undefined,
    })
  })

  it('downloads Monthly Attendance PDFs as a backend Blob attachment', async () => {
    http.get.mockResolvedValueOnce({
      data: new Blob(['pdf'], { type: 'application/pdf' }),
      headers: {
        'content-disposition': 'attachment; filename="AttendanceReport_Monthly_2026-07_2026-07-24.pdf"',
        'content-type': 'application/pdf',
      },
    })

    await expect(
      downloadMonthlyAttendanceReportPdf({
        academicYearId: 7,
        classId: 3,
        month: 7,
        year: 2026,
        dateFrom: '2026-07-01',
        dateTo: '2026-07-31',
        filename: 'AttendanceReport_Monthly_2026-07-24.pdf',
      }),
    ).resolves.toMatchObject({
      filename: 'AttendanceReport_Monthly_2026-07_2026-07-24.pdf',
      mimeType: 'application/pdf',
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/reports/attendance/monthly/download', {
      params: expect.objectContaining({
        academic_year_id: 7,
        class_id: 3,
        month: 7,
        year: 2026,
        date_from: '2026-07-01',
        date_to: '2026-07-31',
      }),
      responseType: 'blob',
      signal: undefined,
    })
  })

  it('fetches canonical Monthly Attendance report data with the same filters as the PDF export', async () => {
    http.get.mockResolvedValueOnce({
      data: {
        data: {
          class: { id: 3, name: 'Lotus' },
          academicYear: { id: 7, label: 'Academic Year 2026' },
          month: 7,
          year: 2026,
          dateFrom: '2026-07-01',
          dateTo: '2026-07-31',
          dayCount: 31,
          students: [{ id: 1, fullName: 'Sokha' }],
          attendanceRecords: [{ studentId: 1, status: 'present' }],
          summary: { totalStudents: 1, totalRecords: 1, present: 1 },
          compatibility: { includes_null_academic_year_attendance_records: true },
        },
      },
    })

    await expect(
      fetchMonthlyAttendanceReport({
        academicYearId: 7,
        classId: 3,
        month: 7,
        year: 2026,
        dateFrom: '2026-07-01',
        dateTo: '2026-07-31',
      }),
    ).resolves.toMatchObject({
      classInfo: { id: 3, name: 'Lotus' },
      dateFrom: '2026-07-01',
      dateTo: '2026-07-31',
      students: [{ id: 1, fullName: 'Sokha' }],
      attendanceRecords: [{ studentId: 1, status: 'present' }],
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/reports/attendance/monthly', {
      params: expect.objectContaining({
        academic_year_id: 7,
        class_id: 3,
        month: 7,
        year: 2026,
        date_from: '2026-07-01',
        date_to: '2026-07-31',
      }),
      signal: undefined,
    })
  })
})
