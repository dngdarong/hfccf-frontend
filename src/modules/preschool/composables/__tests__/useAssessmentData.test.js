import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAssessmentData } from '../useAssessmentData'
import * as assessmentApi from '../../services/api/preschoolAssessmentApi'
import * as preschoolApi from '../../services/preschoolApi'

vi.mock('../../services/api/preschoolAssessmentApi')
vi.mock('../../services/preschoolApi')

describe('useAssessmentData', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    assessmentApi.normalizeCategory.mockImplementation((category) => ({
      ...category,
      isActive: Boolean(category?.isActive ?? category?.is_active),
    }))
    assessmentApi.normalizeAssessment.mockImplementation((assessment) => assessment)
    assessmentApi.prepareAssessmentData.mockImplementation((data) => data)
  })

  describe('loadCategories', () => {
    it('should load categories once', async () => {
      const mockCategories = [
        { id: 1, name: 'Language', isActive: true },
        { id: 2, name: 'Math', isActive: false },
      ]

      assessmentApi.fetchAssessmentCategories.mockResolvedValue(mockCategories)

      const { loadCategories, categories } = useAssessmentData()

      await loadCategories()
      expect(categories.value).toHaveLength(1)
      expect(categories.value[0].name).toBe('Language')

      // Second call should not make another API request due to caching
      await loadCategories()
      expect(assessmentApi.fetchAssessmentCategories).toHaveBeenCalledTimes(1)
    })

    it('should handle category loading errors', async () => {
      assessmentApi.fetchAssessmentCategories.mockRejectedValue(new Error('API Error'))

      const { loadCategories, categories } = useAssessmentData()

      await loadCategories()
      expect(categories.value).toEqual([])
    })
  })

  describe('loadStudents', () => {
    it('should load students for dropdown', async () => {
      const mockStudents = [
        { id: 1, fullName: 'John Doe', studentCode: 'STU001' },
        { id: 2, fullName: 'Jane Smith', studentCode: 'STU002' },
      ]

      preschoolApi.fetchPreschoolStudents.mockResolvedValue({ items: mockStudents })

      const { loadStudents, studentOptions } = useAssessmentData()

      await loadStudents()

      expect(studentOptions.value).toHaveLength(2)
      expect(studentOptions.value[0]).toEqual({
        label: 'John Doe (STU001)',
        value: 1,
        raw: mockStudents[0],
      })
    })

    it('should format student options correctly', async () => {
      const mockStudent = {
        id: 1,
        fullName: 'Test Student',
        studentCode: 'TS001',
      }

      preschoolApi.fetchPreschoolStudents.mockResolvedValue({ items: [mockStudent] })

      const { loadStudents, studentOptions } = useAssessmentData()

      await loadStudents()

      expect(studentOptions.value[0].label).toBe('Test Student (TS001)')
    })
  })

  describe('loadClasses', () => {
    it('should load classes for dropdown', async () => {
      const mockClasses = [
        { id: 1, code: 'A', name: 'Class A' },
        { id: 2, code: 'B', name: 'Class B' },
      ]

      preschoolApi.fetchPreschoolClasses.mockResolvedValue({ items: mockClasses })

      const { loadClasses, classOptions } = useAssessmentData()

      await loadClasses()

      expect(classOptions.value).toHaveLength(2)
      expect(classOptions.value[0]).toEqual({
        label: 'A - Class A',
        value: 1,
        raw: mockClasses[0],
      })
    })
  })

  describe('loadAssessments', () => {
    it('should load assessments for a student', async () => {
      const mockAssessments = [
        { id: 1, studentId: 1, score: 85, status: 'finalized' },
        { id: 2, studentId: 1, score: 90, status: 'draft' },
      ]

      assessmentApi.fetchStudentAssessments.mockResolvedValue({
        items: mockAssessments,
        pagination: { page: 1, perPage: 25, total: 2, totalPages: 1 },
      })

      const { loadAssessments, assessments } = useAssessmentData()

      await loadAssessments(1)

      expect(assessments.value).toHaveLength(2)
      expect(assessmentApi.fetchStudentAssessments).toHaveBeenCalledWith(1, { page: 1, perPage: 25 })
    })

    it('should not load assessments without student ID', async () => {
      const { loadAssessments } = useAssessmentData()

      await loadAssessments(null)

      expect(assessmentApi.fetchStudentAssessments).not.toHaveBeenCalled()
    })

    it('should pass pagination parameters', async () => {
      assessmentApi.fetchStudentAssessments.mockResolvedValue({
        items: [],
        pagination: { page: 2, perPage: 50, total: 100, totalPages: 2 },
      })

      const { loadAssessments } = useAssessmentData()

      await loadAssessments(1, { page: 2, perPage: 50 })

      expect(assessmentApi.fetchStudentAssessments).toHaveBeenCalledWith(1, { page: 2, perPage: 50 })
    })
  })

  describe('initializeAssessments', () => {
    it('should load lookup data and assessments', async () => {
      const mockCategories = [{ id: 1, name: 'Language', isActive: true }]
      const mockStudents = [{ id: 1, fullName: 'John' }]
      const mockClasses = [{ id: 1, code: 'A', name: 'Class A' }]
      const mockAssessments = [{ id: 1, studentId: 1 }]

      assessmentApi.fetchAssessmentCategories.mockResolvedValue(mockCategories)
      preschoolApi.fetchPreschoolStudents.mockResolvedValue({ items: mockStudents })
      preschoolApi.fetchPreschoolClasses.mockResolvedValue({ items: mockClasses })
      assessmentApi.fetchStudentAssessments.mockResolvedValue({
        items: mockAssessments,
        pagination: { page: 1, perPage: 25, total: 1, totalPages: 1 },
      })

      const { initializeAssessments, categories, studentOptions, classOptions, assessments } = useAssessmentData()

      await initializeAssessments(1)

      expect(categories.value).toHaveLength(1)
      expect(studentOptions.value).toHaveLength(1)
      expect(classOptions.value).toHaveLength(1)
      expect(assessments.value).toHaveLength(1)
    })
  })

  describe('getStudentById', () => {
    it('should return student by ID', async () => {
      const mockStudents = [
        { id: 1, fullName: 'John Doe' },
        { id: 2, fullName: 'Jane Smith' },
      ]

      preschoolApi.fetchPreschoolStudents.mockResolvedValue({ items: mockStudents })

      const { loadStudents, getStudentById } = useAssessmentData()

      await loadStudents()

      const student = getStudentById(1)
      expect(student).toEqual(mockStudents[0])
    })

    it('should return undefined for non-existent student', async () => {
      preschoolApi.fetchPreschoolStudents.mockResolvedValue({ items: [] })

      const { loadStudents, getStudentById } = useAssessmentData()

      await loadStudents()

      const student = getStudentById(999)
      expect(student).toBeUndefined()
    })
  })
})
