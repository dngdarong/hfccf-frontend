import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  fetchClassroomReport,
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
            fromDate: '2026-05-01',
            toDate: '2026-05-15',
            assessmentCount: 3,
            studentCount: 2,
            classCount: 1,
          },
        ],
      }),
    )

    const periods = await fetchReportPeriods({ studentId: 12 })

    expect(http.get).toHaveBeenCalledWith('/preschool/report-periods', {
      params: expect.any(Object),
      signal: undefined,
    })
    expect(periods[0]).toMatchObject({ label: 'Term 1', assessmentCount: 3 })

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

    const bundle = await fetchStudentReports(12)

    expect(http.get).toHaveBeenCalledWith('/preschool/students/12/reports', { signal: undefined })
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

    await fetchStudentReportPeriod(12, 'Term 1')
    expect(http.get).toHaveBeenCalledWith('/preschool/students/12/reports/Term%201', { signal: undefined })
  })

  it('loads classroom reports from the latest and period-specific endpoints', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        class: { id: 22, code: 'PS-22', name: 'Morning Stars' },
        periods: [{ label: 'Term 2' }],
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

    const bundle = await fetchClassroomReport(22)

    expect(http.get).toHaveBeenCalledWith('/preschool/classes/22/reports', { signal: undefined })
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

    await fetchClassroomReport(22, 'Term 2')
    expect(http.get).toHaveBeenCalledWith('/preschool/classes/22/reports/Term%202', { signal: undefined })
  })
})
