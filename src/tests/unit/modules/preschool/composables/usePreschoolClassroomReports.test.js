import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePreschoolClassroomReports } from '@/modules/preschool/composables/usePreschoolClassroomReports'

const mockGetCurrentUser = vi.fn()
const mockFetchMyPreschoolClasses = vi.fn()
const mockFetchPreschoolClasses = vi.fn()
const mockFetchReportPeriods = vi.fn()
const mockFetchClassroomReport = vi.fn()

vi.mock('@/services/auth', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}))

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchMyPreschoolClasses: (...args) => mockFetchMyPreschoolClasses(...args),
  fetchPreschoolClasses: (...args) => mockFetchPreschoolClasses(...args),
}))

vi.mock('@/modules/preschool/services/api/preschoolReportsApi', () => ({
  fetchReportPeriods: (...args) => mockFetchReportPeriods(...args),
  fetchClassroomReport: (...args) => mockFetchClassroomReport(...args),
}))

// Keep the classroom report composable covered so period loading and class
// selection remain role-aware and tied to the finalized report contract.
beforeEach(() => {
  vi.clearAllMocks()

  mockFetchMyPreschoolClasses.mockResolvedValue({
    items: [{ id: 3, code: 'PS-3', name: 'Morning Class' }],
    pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
  })
  mockFetchPreschoolClasses.mockResolvedValue({
    items: [{ id: 4, code: 'PS-4', name: 'Afternoon Class' }],
    pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
  })
  mockFetchReportPeriods.mockResolvedValue([{ label: 'Term 2', assessmentCount: 4 }])
  mockFetchClassroomReport.mockResolvedValue({
    class: { id: 3, code: 'PS-3', name: 'Morning Class' },
    periods: [{ label: 'Term 2' }],
    period: { label: 'Term 2' },
    report: { summary: { finalizedAssessments: 4 }, attendanceSummary: {}, categorySummaries: [], studentSummaries: [], observations: [], assessments: [] },
  })
})

describe('usePreschoolClassroomReports', () => {
  it('loads teacher-scoped classes and classroom report bundles', async () => {
    mockGetCurrentUser.mockReturnValue({ role: 'teacher-preschool' })

    const reports = usePreschoolClassroomReports()
    await reports.loadLookupData()
    await reports.loadReportPeriodOptions(3)
    await reports.loadClassroomReport(3)

    expect(mockFetchMyPreschoolClasses).toHaveBeenCalledWith({ page: 1, perPage: 100 })
    expect(mockFetchReportPeriods).toHaveBeenCalledWith({ classId: '3' })
    expect(mockFetchClassroomReport).toHaveBeenCalledWith('3', 'Term 2')
    expect(reports.selectedClassId.value).toBe('3')
    expect(reports.reportBundle.value.report.summary.finalizedAssessments).toBe(4)
  })

  it('loads a specific classroom period and keeps admin lookup data intact', async () => {
    mockGetCurrentUser.mockReturnValue({ role: 'adminpreschool' })

    const reports = usePreschoolClassroomReports()
    await reports.loadLookupData()
    await reports.loadClassroomReport(4, 'Term 2')

    expect(mockFetchPreschoolClasses).toHaveBeenCalledWith({ page: 1, perPage: 100 })
    expect(mockFetchClassroomReport).toHaveBeenCalledWith('4', 'Term 2')
    expect(reports.selectedPeriodLabel.value).toBe('Term 2')
    expect(reports.reportBundle.value.class).toMatchObject({ id: 3, code: 'PS-3' })
  })
})
