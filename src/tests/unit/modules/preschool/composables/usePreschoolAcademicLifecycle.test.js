import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { usePreschoolAcademicLifecycle } from '@/modules/preschool/composables/usePreschoolAcademicLifecycle'

const mockFetchAcademicLifecycle = vi.fn()
const mockCreateAcademicYear = vi.fn()
const mockUpdateAcademicYear = vi.fn()
const mockActivateAcademicYear = vi.fn()
const mockCloseAcademicYear = vi.fn()
const mockArchiveAcademicYear = vi.fn()
const mockCreateAcademicTerm = vi.fn()
const mockUpdateAcademicTerm = vi.fn()
const mockActivateAcademicTerm = vi.fn()
const mockCloseAcademicTerm = vi.fn()
const mockArchiveAcademicTerm = vi.fn()

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchAcademicLifecycle: (...args) => mockFetchAcademicLifecycle(...args),
  createAcademicYear: (...args) => mockCreateAcademicYear(...args),
  updateAcademicYear: (...args) => mockUpdateAcademicYear(...args),
  activateAcademicYear: (...args) => mockActivateAcademicYear(...args),
  closeAcademicYear: (...args) => mockCloseAcademicYear(...args),
  archiveAcademicYear: (...args) => mockArchiveAcademicYear(...args),
  createAcademicTerm: (...args) => mockCreateAcademicTerm(...args),
  updateAcademicTerm: (...args) => mockUpdateAcademicTerm(...args),
  activateAcademicTerm: (...args) => mockActivateAcademicTerm(...args),
  closeAcademicTerm: (...args) => mockCloseAcademicTerm(...args),
  archiveAcademicTerm: (...args) => mockArchiveAcademicTerm(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchAcademicLifecycle.mockResolvedValue({
    academicYears: [
      { id: 1, name: '2025 - 2026', isCurrent: true },
    ],
    terms: [
      { id: 11, academicYearId: 1, name: 'Term 1', isCurrent: true },
    ],
    currentContext: { academic_year_id: 1, term_id: 11 },
  })
  mockCreateAcademicYear.mockResolvedValue({
    academicYears: [{ id: 2, name: '2026 - 2027', isCurrent: true }],
    terms: [],
    currentContext: { academic_year_id: 2 },
  })
  mockUpdateAcademicYear.mockResolvedValue({
    academicYears: [{ id: 2, name: '2026 - 2027 Updated', isCurrent: true }],
    terms: [],
    currentContext: { academic_year_id: 2 },
  })
  mockActivateAcademicYear.mockResolvedValue({
    academicYears: [{ id: 2, name: '2026 - 2027 Updated', isCurrent: true }],
    terms: [],
    currentContext: { academic_year_id: 2 },
  })
  mockCloseAcademicYear.mockResolvedValue({ academicYears: [], terms: [], currentContext: {} })
  mockArchiveAcademicYear.mockResolvedValue({ academicYears: [], terms: [], currentContext: {} })
  mockCreateAcademicTerm.mockResolvedValue({
    academicYears: [{ id: 1, name: '2025 - 2026', isCurrent: true }],
    terms: [{ id: 12, academicYearId: 1, name: 'Term 2', isCurrent: true }],
    currentContext: { academic_year_id: 1, term_id: 12 },
  })
  mockUpdateAcademicTerm.mockResolvedValue({
    academicYears: [{ id: 1, name: '2025 - 2026', isCurrent: true }],
    terms: [{ id: 12, academicYearId: 1, name: 'Term 2 Updated', isCurrent: true }],
    currentContext: { academic_year_id: 1, term_id: 12 },
  })
  mockActivateAcademicTerm.mockResolvedValue({
    academicYears: [{ id: 1, name: '2025 - 2026', isCurrent: true }],
    terms: [{ id: 12, academicYearId: 1, name: 'Term 2 Updated', isCurrent: true }],
    currentContext: { academic_year_id: 1, term_id: 12 },
  })
  mockCloseAcademicTerm.mockResolvedValue({ academicYears: [], terms: [], currentContext: {} })
  mockArchiveAcademicTerm.mockResolvedValue({ academicYears: [], terms: [], currentContext: {} })
})

describe('usePreschoolAcademicLifecycle', () => {
  it('loads lifecycle data and keeps the active context in sync after mutations', async () => {
    const lifecycle = usePreschoolAcademicLifecycle()

    await lifecycle.loadAcademicLifecycle()
    expect(lifecycle.currentAcademicYear.value).toMatchObject({ id: 1, name: '2025 - 2026' })
    expect(lifecycle.currentTerm.value).toMatchObject({ id: 11, name: 'Term 1' })

    await lifecycle.createYear({ name: '2026 - 2027' })
    await lifecycle.updateYear(2, { name: '2026 - 2027 Updated' })
    await lifecycle.activateYear(2)
    await lifecycle.archiveYear(2)

    await lifecycle.createTerm({ academic_year_id: 1, name: 'Term 2' })
    await lifecycle.updateTerm(12, { name: 'Term 2 Updated' })
    await lifecycle.activateTerm(12)
    await lifecycle.archiveTerm(12)
    await nextTick()

    expect(mockFetchAcademicLifecycle).toHaveBeenCalledTimes(1)
    expect(mockCreateAcademicYear).toHaveBeenCalledWith({ name: '2026 - 2027' })
    expect(mockUpdateAcademicYear).toHaveBeenCalledWith(2, { name: '2026 - 2027 Updated' })
    expect(mockActivateAcademicYear).toHaveBeenCalledWith(2)
    expect(mockArchiveAcademicYear).toHaveBeenCalledWith(2)
    expect(mockCreateAcademicTerm).toHaveBeenCalledWith({ academic_year_id: 1, name: 'Term 2' })
    expect(mockUpdateAcademicTerm).toHaveBeenCalledWith(12, { name: 'Term 2 Updated' })
    expect(mockActivateAcademicTerm).toHaveBeenCalledWith(12)
    expect(mockArchiveAcademicTerm).toHaveBeenCalledWith(12)
    expect(lifecycle.currentContext.value).toMatchObject({ academic_year_id: 1, term_id: 12 })
  })
})
