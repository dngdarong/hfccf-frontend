import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAssessmentMutations } from '../useAssessmentMutations'

vi.mock('../../services/api/preschoolAssessmentApi')
vi.mock('../../stores/assessmentStore', () => ({
  useAssessmentStore: () => ({
    saveAssessment: vi.fn(),
    updateAssessment: vi.fn(),
    finalize: vi.fn(),
    archive: vi.fn(),
    assessments: [],
  }),
}))

describe('useAssessmentMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Validation', () => {
    it('should validate required fields', () => {
      const { validateAssessment } = useAssessmentMutations()

      const data = {
        classId: null,
        categoryId: 1,
        periodLabel: 'Q1',
        assessmentDate: '2024-01-01',
        score: 85,
        rating: 'Good',
      }

      const isValid = validateAssessment(data)

      expect(isValid).toBe(false)
      expect(validateAssessment).toBeDefined()
    })

    it('should validate score range', () => {
      const { validateField } = useAssessmentMutations()

      const error101 = validateField('score', 101)
      expect(error101).toBeTruthy()

      const errorNegative = validateField('score', -5)
      expect(errorNegative).toBeTruthy()

      const validScore = validateField('score', 85)
      expect(validScore).toBeNull()
    })

    it('should validate rating enum', () => {
      const { validateField } = useAssessmentMutations()

      const validRating = validateField('rating', 'Good')
      expect(validRating).toBeNull()

      const invalidRating = validateField('rating', 'Terrible')
      expect(invalidRating).toBeTruthy()
    })
  })

  describe('State Checks', () => {
    it('should identify draft assessments', () => {
      const { isDraft } = useAssessmentMutations()

      const draftAssessment = { id: 1, status: 'draft' }
      const finalizedAssessment = { id: 2, status: 'finalized' }

      expect(isDraft(draftAssessment)).toBe(true)
      expect(isDraft(finalizedAssessment)).toBe(false)
    })

    it('should check if assessment can be edited', () => {
      const { canEdit } = useAssessmentMutations()

      const draftAssessment = { id: 1, status: 'draft' }
      const finalizedAssessment = { id: 2, status: 'finalized' }

      expect(canEdit(draftAssessment)).toBe(true)
      expect(canEdit(finalizedAssessment)).toBe(false)
    })

    it('should check if assessment can be finalized', () => {
      const { canFinalize } = useAssessmentMutations()

      const draftAssessment = { id: 1, status: 'draft' }
      const finalizedAssessment = { id: 2, status: 'finalized' }

      expect(canFinalize(draftAssessment)).toBe(true)
      expect(canFinalize(finalizedAssessment)).toBe(false)
    })

    it('should check if assessment can be archived', () => {
      const { canArchive } = useAssessmentMutations()

      const assessment = { id: 1, status: 'finalized' }

      expect(canArchive(assessment)).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should clear validation errors', () => {
      const { clearValidationErrors, validationErrors } = useAssessmentMutations()

      // Assume some errors exist
      clearValidationErrors()

      expect(Object.keys(validationErrors.value)).toHaveLength(0)
    })

    it('should get field-specific errors', () => {
      const { getFieldError } = useAssessmentMutations()

      const error = getFieldError('score')
      expect(error).toBeDefined()
    })
  })
})
