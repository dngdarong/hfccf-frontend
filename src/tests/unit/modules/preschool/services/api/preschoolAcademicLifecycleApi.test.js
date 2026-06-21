import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  activateAcademicTerm,
  activateAcademicYear,
  archiveAcademicTerm,
  archiveAcademicYear,
  createAcademicTerm,
  createAcademicYear,
  fetchAcademicYears,
  fetchTerms,
  updateAcademicTerm,
  updateAcademicYear,
} from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('preschool academic lifecycle api', () => {
  it('fetches and normalizes academic years and terms from the settings endpoints', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      academicYears: [
        {
          id: 1,
          code: 'AY-1',
          name: '2025 - 2026',
          description: 'Primary year',
          start_date: '2025-06-01',
          end_date: '2026-05-31',
          status: 'active',
          is_current: true,
          created_by: 'usr_1',
          updated_by: 'usr_1',
          terms_count: 1,
        },
      ],
      currentContext: { academic_year_id: 1 },
    }))

    await expect(fetchAcademicYears()).resolves.toMatchObject({
      academicYears: [
        {
          id: 1,
          code: 'AY-1',
          name: '2025 - 2026',
          dateRange: '2025-06-01 - 2026-05-31',
          isCurrent: true,
          isActive: true,
        },
      ],
      currentContext: { academic_year_id: 1 },
    })
    expect(http.get).toHaveBeenCalledWith('/preschool/settings/academic-years')

    http.get.mockResolvedValueOnce(stubResponse({
      terms: [
        {
          id: 11,
          academic_year_id: 1,
          name: 'Term 1',
          start_date: '2025-06-01',
          end_date: '2025-08-31',
          status: 'active',
          is_current: true,
          sort_order: 1,
        },
      ],
    }))

    await expect(fetchTerms()).resolves.toMatchObject({
      terms: [
        {
          id: 11,
          academicYearId: 1,
          name: 'Term 1',
          dateRange: '2025-06-01 - 2025-08-31',
          isCurrent: true,
          isActive: true,
        },
      ],
    })
    expect(http.get).toHaveBeenCalledWith('/preschool/settings/terms')
  })

  it('posts to the dedicated settings endpoints for create, update, activate, and archive operations', async () => {
    http.post.mockResolvedValueOnce(stubResponse({ academicYears: [], terms: [] }))
    await expect(createAcademicYear({ name: '2026 - 2027' })).resolves.toMatchObject({ academicYears: [], terms: [] })
    expect(http.post).toHaveBeenCalledWith('/preschool/settings/academic-years', { name: '2026 - 2027' })

    http.put.mockResolvedValueOnce(stubResponse({ academicYears: [], terms: [] }))
    await expect(updateAcademicYear(5, { name: '2026 - 2027 Updated' })).resolves.toMatchObject({ academicYears: [], terms: [] })
    expect(http.put).toHaveBeenCalledWith('/preschool/settings/academic-years/5', { name: '2026 - 2027 Updated' })

    http.post.mockResolvedValueOnce(stubResponse({ academicYears: [], terms: [] }))
    await expect(activateAcademicYear(5)).resolves.toMatchObject({ academicYears: [], terms: [] })
    expect(http.post).toHaveBeenCalledWith('/preschool/settings/academic-years/5/activate')

    http.post.mockResolvedValueOnce(stubResponse({ academicYears: [], terms: [] }))
    await expect(archiveAcademicYear(5)).resolves.toMatchObject({ academicYears: [], terms: [] })
    expect(http.post).toHaveBeenCalledWith('/preschool/settings/academic-years/5/archive')

    http.post.mockResolvedValueOnce(stubResponse({ academicYears: [], terms: [] }))
    await expect(createAcademicTerm({ academic_year_id: 1, name: 'Term 1' })).resolves.toMatchObject({ academicYears: [], terms: [] })
    expect(http.post).toHaveBeenCalledWith('/preschool/settings/terms', { academic_year_id: 1, name: 'Term 1' })

    http.put.mockResolvedValueOnce(stubResponse({ academicYears: [], terms: [] }))
    await expect(updateAcademicTerm(11, { name: 'Term 1 Updated' })).resolves.toMatchObject({ academicYears: [], terms: [] })
    expect(http.put).toHaveBeenCalledWith('/preschool/settings/terms/11', { name: 'Term 1 Updated' })

    http.post.mockResolvedValueOnce(stubResponse({ academicYears: [], terms: [] }))
    await expect(activateAcademicTerm(11)).resolves.toMatchObject({ academicYears: [], terms: [] })
    expect(http.post).toHaveBeenCalledWith('/preschool/settings/terms/11/activate')

    http.post.mockResolvedValueOnce(stubResponse({ academicYears: [], terms: [] }))
    await expect(archiveAcademicTerm(11)).resolves.toMatchObject({ academicYears: [], terms: [] })
    expect(http.post).toHaveBeenCalledWith('/preschool/settings/terms/11/archive')
  })
})
