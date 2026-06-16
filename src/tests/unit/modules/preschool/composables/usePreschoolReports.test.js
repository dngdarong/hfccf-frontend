import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePreschoolReports } from '@/modules/preschool/composables/usePreschoolReports'

const mockGetCurrentUser = vi.fn()
const mockFetchMyPreschoolStudents = vi.fn()
const mockFetchPreschoolStudents = vi.fn()
const mockFetchReportPeriods = vi.fn()
const mockFetchStudentReports = vi.fn()
const mockFetchStudentReportPeriod = vi.fn()

vi.mock('@/services/auth', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}))

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchMyPreschoolStudents: (...args) => mockFetchMyPreschoolStudents(...args),
  fetchPreschoolStudents: (...args) => mockFetchPreschoolStudents(...args),
}))

vi.mock('@/modules/preschool/services/api/preschoolReportsApi', () => ({
  fetchReportPeriods: (...args) => mockFetchReportPeriods(...args),
  fetchStudentReports: (...args) => mockFetchStudentReports(...args),
  fetchStudentReportPeriod: (...args) => mockFetchStudentReportPeriod(...args),
}))

// Keep the Preschool student reporting composable covered so finalised-period
// loading stays scoped to the current role and does not drift back to direct HTTP calls.
beforeEach(() => {
  vi.clearAllMocks()

  mockFetchMyPreschoolStudents.mockResolvedValue({
    items: [{ id: 7, fullName: 'Teacher Student', studentCode: 'S-007' }],
    pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
  })
  mockFetchPreschoolStudents.mockResolvedValue({
    items: [{ id: 8, fullName: 'Admin Student', studentCode: 'S-008' }],
    pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
  })
  mockFetchReportPeriods.mockResolvedValue([{ label: 'Term 1', assessmentCount: 2 }])
  mockFetchStudentReports.mockResolvedValue({
    student: { id: 7, fullName: 'Teacher Student', studentCode: 'S-007' },
    periods: [{ label: 'Term 1' }],
    period: { label: 'Term 1' },
    report: { summary: { finalizedAssessments: 2 }, attendanceSummary: {}, categorySummaries: [], observations: [], assessments: [] },
  })
  mockFetchStudentReportPeriod.mockResolvedValue({
    student: { id: 7, fullName: 'Teacher Student', studentCode: 'S-007' },
    periods: [{ label: 'Term 1' }],
    period: { label: 'Term 1' },
    report: { summary: { finalizedAssessments: 2 }, attendanceSummary: {}, categorySummaries: [], observations: [], assessments: [] },
  })
})

describe('usePreschoolReports', () => {
  it('loads teacher lookup data and student report bundles', async () => {
    mockGetCurrentUser.mockReturnValue({ role: 'teacher-preschool' })

    const reports = usePreschoolReports()
    await reports.loadLookupData()
    await reports.loadReportPeriodOptions(7)
    await reports.loadStudentReport(7)

    expect(mockFetchMyPreschoolStudents).toHaveBeenCalledWith({ page: 1, perPage: 100 })
    expect(mockFetchReportPeriods).toHaveBeenCalledWith({ studentId: '7' })
    expect(mockFetchStudentReportPeriod).toHaveBeenCalledWith('7', 'Term 1')
    expect(reports.selectedStudentId.value).toBe('7')
    expect(reports.reportBundle.value.report.summary.finalizedAssessments).toBe(2)
    expect(reports.reportPeriods.value[0]).toMatchObject({ label: 'Term 1' })
  })

  it('loads a period-specific student report without breaking empty selections', async () => {
    mockGetCurrentUser.mockReturnValue({ role: 'adminpreschool' })

    const reports = usePreschoolReports()
    await reports.loadLookupData()
    await reports.loadStudentReport(8, 'Term 1')

    expect(mockFetchPreschoolStudents).toHaveBeenCalledWith({ page: 1, perPage: 100 })
    expect(mockFetchStudentReportPeriod).toHaveBeenCalledWith('8', 'Term 1')
    expect(reports.selectedPeriodLabel.value).toBe('Term 1')
    expect(reports.reportBundle.value.student).toMatchObject({ id: 7, studentCode: 'S-007' })
  })
})
