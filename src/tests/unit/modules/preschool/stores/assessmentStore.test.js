import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAssessmentStore } from '@/modules/preschool/stores/assessmentStore'

const mockFetchStudentAssessments = vi.fn()
const mockFetchAssessmentCategories = vi.fn()
const mockCreateStudentAssessment = vi.fn()
const mockUpdateStudentAssessment = vi.fn()
const mockFinalizeStudentAssessment = vi.fn()
const mockArchiveStudentAssessment = vi.fn()
const mockNormalizeAssessment = vi.fn((assessment) => ({
  id: assessment.id,
  studentId: assessment.student_id ?? assessment.studentId,
  classId: assessment.class_id ?? assessment.classId,
  categoryId: assessment.category_id ?? assessment.categoryId,
  student: assessment.student || null,
  class: assessment.class || null,
  category: assessment.category || null,
  score: assessment.score,
  status: assessment.status,
  assessmentDate: assessment.assessment_date ?? assessment.assessmentDate,
  observation: assessment.observation || '',
}))
const mockNormalizeCategory = vi.fn((category) => ({
  id: category.id,
  name: category.name,
  isActive: Boolean(category.isActive ?? category.is_active),
}))
const mockPrepareAssessmentData = vi.fn((data) => data)

vi.mock('@/modules/preschool/services/api/preschoolAssessmentApi', () => ({
  fetchStudentAssessments: (...args) => mockFetchStudentAssessments(...args),
  fetchAssessmentCategories: (...args) => mockFetchAssessmentCategories(...args),
  createStudentAssessment: (...args) => mockCreateStudentAssessment(...args),
  updateAssessment: (...args) => mockUpdateStudentAssessment(...args),
  finalizeAssessment: (...args) => mockFinalizeStudentAssessment(...args),
  archiveAssessment: (...args) => mockArchiveStudentAssessment(...args),
  updateStudentAssessment: (...args) => mockUpdateStudentAssessment(...args),
  finalizeStudentAssessment: (...args) => mockFinalizeStudentAssessment(...args),
  archiveStudentAssessment: (...args) => mockArchiveStudentAssessment(...args),
  normalizeAssessment: (...args) => mockNormalizeAssessment(...args),
  normalizeCategory: (...args) => mockNormalizeCategory(...args),
  prepareAssessmentData: (...args) => mockPrepareAssessmentData(...args),
}))

describe('assessmentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads assessments and updates pagination', async () => {
    mockFetchStudentAssessments.mockResolvedValue({
      items: [
        {
          id: 1,
          student_id: 7,
          class_id: 3,
          category_id: 9,
          score: 82,
          status: 'draft',
          assessment_date: '2026-06-01',
          student: { fullName: 'Lina Chan' },
          class: { name: 'Morning Class' },
          category: { name: 'Learning Progress' },
        },
      ],
      pagination: {
        page: 2,
        perPage: 10,
        total: 1,
        totalPages: 1,
      },
    })

    const store = useAssessmentStore()
    await store.loadAssessments(7, { page: 2, perPage: 10 })

    expect(mockFetchStudentAssessments).toHaveBeenCalledWith(7, { page: 2, perPage: 10 })
    expect(store.assessments).toHaveLength(1)
    expect(store.assessments[0]).toMatchObject({
      id: 1,
      studentId: 7,
      classId: 3,
      categoryId: 9,
      score: 82,
      status: 'draft',
    })
    expect(store.pagination).toEqual({
      page: 2,
      perPage: 10,
      total: 1,
      totalPages: 1,
    })
  })

  it('filters assessments and manages lifecycle mutations', async () => {
    const store = useAssessmentStore()
    store.assessments = [
      {
        id: 1,
        studentId: 7,
        classId: 3,
        categoryId: 9,
        student: { fullName: 'Lina Chan' },
        class: { name: 'Morning Class' },
        category: { name: 'Learning Progress' },
        score: 82,
        status: 'draft',
        assessmentDate: '2026-06-01',
        observation: 'Focus well in class',
      },
      {
        id: 2,
        studentId: 8,
        classId: 4,
        categoryId: 10,
        student: { fullName: 'Sok Dara' },
        class: { name: 'Afternoon Class' },
        category: { name: 'Health' },
        score: 91,
        status: 'finalized',
        assessmentDate: '2026-06-10',
        observation: 'Excellent progress',
      },
    ]

    store.setFilter('status', 'draft')
    store.setFilter('searchQuery', 'lina')
    store.setFilter('dateFrom', '2026-06-01')
    store.setFilter('dateTo', '2026-06-30')

    expect(store.filteredAssessments).toHaveLength(1)
    expect(store.filteredAssessments[0].id).toBe(1)
    expect(store.statusCounts).toEqual({
      total: 2,
      draft: 1,
      finalized: 1,
    })

    mockCreateStudentAssessment.mockResolvedValue({
      id: 3,
      student_id: 7,
      class_id: 3,
      category_id: 9,
      score: 88,
      status: 'draft',
      assessment_date: '2026-06-12',
    })
    mockUpdateStudentAssessment.mockResolvedValue({
      id: 1,
      student_id: 7,
      class_id: 3,
      category_id: 9,
      score: 90,
      status: 'draft',
      assessment_date: '2026-06-13',
    })
    mockFinalizeStudentAssessment.mockResolvedValue({
      id: 1,
      student_id: 7,
      class_id: 3,
      category_id: 9,
      score: 90,
      status: 'finalized',
      assessment_date: '2026-06-13',
    })
    mockArchiveStudentAssessment.mockResolvedValue({ success: true })

    const created = await store.saveAssessment(7, {
      classId: 3,
      categoryId: 9,
      periodLabel: 'Q1',
      assessmentDate: '2026-06-12',
      score: 88,
      rating: 'Good',
    })

    expect(mockPrepareAssessmentData).toHaveBeenCalled()
    expect(created.id).toBe(3)
    expect(store.currentAssessment.id).toBe(3)
    expect(store.assessments[0].id).toBe(3)

    await store.updateAssessment(1, {
      classId: 3,
      categoryId: 9,
      periodLabel: 'Q1',
      assessmentDate: '2026-06-13',
      score: 90,
      rating: 'Excellent',
    })
    await store.finalize(1)
    await store.archive(2)

    expect(store.assessments.find((assessment) => assessment.id === 2)).toBeUndefined()
    expect(store.assessments.find((assessment) => assessment.id === 1)?.status).toBe('finalized')
    expect(mockUpdateStudentAssessment).toHaveBeenCalledWith(1, {
      classId: 3,
      categoryId: 9,
      periodLabel: 'Q1',
      assessmentDate: '2026-06-13',
      score: 90,
      rating: 'Excellent',
    })
    expect(mockFinalizeStudentAssessment).toHaveBeenCalledWith(1)
    expect(mockArchiveStudentAssessment).toHaveBeenCalledWith(2)
  })
})
