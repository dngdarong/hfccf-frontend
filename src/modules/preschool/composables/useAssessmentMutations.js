import { computed, ref } from 'vue'
import { useAssessmentStore } from '../stores/assessmentStore'
import { PRESCHOOL_ASSESSMENT_RATING_OPTIONS } from '../admin/pages/assessments/constants/preschoolAssessmentWorkspace'

/**
 * useAssessmentMutations - Composable for handling assessment save/update/delete operations
 *
 * This composable is intentionally paired with the canonical Preschool
 * assessment store so mutations do not bypass the shared backend contract.
 * Keep new assessment write paths here instead of adding per-page HTTP calls.
 *
 * Responsibilities:
 * - Validate assessment data before submission
 * - Save (create/update) assessments
 * - Finalize assessments
 * - Archive assessments
 * - Handle validation errors
 * - Provide success/error feedback
 */
export function useAssessmentMutations() {
  const store = useAssessmentStore()

  // Validation errors
  const validationErrors = ref({})

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Validation rules for assessment fields
   */
  const validationRules = {
    classId: {
      required: 'Class is required',
    },
    categoryId: {
      required: 'Category is required',
    },
    periodLabel: {
      required: 'Period is required',
    },
    assessmentDate: {
      required: 'Assessment date is required',
    },
    score: {
      required: 'Score is required',
      min: 'Score must be at least 0',
      max: 'Score cannot exceed 100',
    },
    rating: {
      required: 'Rating is required',
      enum: 'Invalid rating selected',
    },
  }

  /**
   * Validate a single field
   * @param {string} fieldName - Field name to validate
   * @param {*} value - Field value
   * @returns {string|null} Error message or null if valid
   */
  function validateField(fieldName, value) {
    const rules = validationRules[fieldName]
    if (!rules) return null

    // Required validation
    if (rules.required && (value === null || value === '' || value === undefined)) {
      return rules.required
    }

    // Score validations
    if (fieldName === 'score' && value !== null && value !== '') {
      const score = parseFloat(value)
      if (isNaN(score)) {
        return 'Score must be a number'
      }
      if (score < 0) {
        return rules.min
      }
      if (score > 100) {
        return rules.max
      }
    }

    // Rating enum validation
    if (fieldName === 'rating' && value) {
      const validRatings = PRESCHOOL_ASSESSMENT_RATING_OPTIONS.map(option => option.value)
      if (!validRatings.includes(value)) {
        return rules.enum
      }
    }

    return null
  }

  /**
   * Validate entire assessment data
   * @param {Object} data - Assessment data to validate
   * @returns {boolean} True if valid
   */
  function validateAssessment(data) {
    validationErrors.value = {}

    // Validate required fields
    const requiredFields = ['classId', 'categoryId', 'periodLabel', 'assessmentDate', 'score', 'rating']

    requiredFields.forEach(field => {
      const error = validateField(field, data[field])
      if (error) {
        validationErrors.value[field] = error
      }
    })

    return Object.keys(validationErrors.value).length === 0
  }

  /**
   * Check if assessment is in draft state
   */
  function isDraft(assessment) {
    return assessment?.status === 'draft'
  }

  /**
   * Check if assessment can be edited
   */
  function canEdit(assessment) {
    return isDraft(assessment)
  }

  /**
   * Check if assessment can be finalized
   */
  function canFinalize(assessment) {
    return isDraft(assessment)
  }

  /**
   * Check if assessment can be archived
   */
  function canArchive(_assessment) {
    return true // Can archive any assessment
  }

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  /**
   * Create a new assessment
   * @param {number|string} studentId - Student ID
   * @param {Object} assessmentData - Assessment data
   * @returns {Promise} Created assessment
   */
  async function createAssessment(studentId, assessmentData) {
    // Validate
    if (!validateAssessment(assessmentData)) {
      const message = Object.values(validationErrors.value)[0] || 'Validation failed'
      throw new Error(message)
    }

    if (!studentId) {
      throw new Error('Student ID is required')
    }

    const result = await store.saveAssessment(studentId, assessmentData)
    validationErrors.value = {} // Clear on success
    return result
  }

  /**
   * Update an existing assessment
   * @param {number|string} assessmentId - Assessment ID
   * @param {Object} assessmentData - Updated assessment data
   * @returns {Promise} Updated assessment
   */
  async function updateAssessment(assessmentId, assessmentData) {
    // Validate
    if (!validateAssessment(assessmentData)) {
      const message = Object.values(validationErrors.value)[0] || 'Validation failed'
      throw new Error(message)
    }

    if (!assessmentId) {
      throw new Error('Assessment ID is required')
    }

    // Check if can edit
    const assessment = store.assessments.find(a => a.id === assessmentId)
    if (!canEdit(assessment)) {
      throw new Error('This assessment cannot be edited as it is already finalized')
    }

    const result = await store.updateAssessment(assessmentId, assessmentData)
    validationErrors.value = {} // Clear on success
    return result
  }

  /**
   * Save assessment (create or update depending on ID)
   * @param {number|string} studentId - Student ID
   * @param {Object} assessmentData - Assessment data
   * @returns {Promise} Saved assessment
   */
  async function saveAssessment(studentId, assessmentData) {
    if (assessmentData.id) {
      return updateAssessment(assessmentData.id, assessmentData)
    } else {
      return createAssessment(studentId, assessmentData)
    }
  }

  /**
   * Finalize (lock) an assessment
   * @param {number|string} assessmentId - Assessment ID
   * @returns {Promise} Finalized assessment
   */
  async function finalizeAssessment(assessmentId) {
    if (!assessmentId) {
      throw new Error('Assessment ID is required')
    }

    const assessment = store.assessments.find(a => a.id === assessmentId)
    if (!canFinalize(assessment)) {
      throw new Error('This assessment cannot be finalized')
    }

    return await store.finalize(assessmentId)
  }

  /**
   * Archive an assessment
   * @param {number|string} assessmentId - Assessment ID
   * @returns {Promise}
   */
  async function archiveAssessment(assessmentId) {
    if (!assessmentId) {
      throw new Error('Assessment ID is required')
    }

    const assessment = store.assessments.find(a => a.id === assessmentId)
    if (!canArchive(assessment)) {
      throw new Error('This assessment cannot be archived')
    }

    return await store.archive(assessmentId)
  }

  /**
   * Bulk finalize multiple assessments
   * @param {Array<number|string>} assessmentIds - Assessment IDs
   * @returns {Promise<Array>} Results for each assessment
   */
  async function bulkFinalize(assessmentIds) {
    if (!Array.isArray(assessmentIds) || assessmentIds.length === 0) {
      throw new Error('Assessment IDs are required')
    }

    const results = []
    const errors = []

    for (const id of assessmentIds) {
      try {
        const result = await finalizeAssessment(id)
        results.push({ id, success: true, data: result })
      } catch (err) {
        errors.push({ id, error: err.message })
      }
    }

    if (errors.length > 0) {
      const message = `${results.length} finalized, ${errors.length} failed`
      const err = new Error(message)
      err.errors = errors
      err.results = results
      throw err
    }

    return results
  }

  /**
   * Bulk archive multiple assessments
   * @param {Array<number|string>} assessmentIds - Assessment IDs
   * @returns {Promise<Array>} Results for each assessment
   */
  async function bulkArchive(assessmentIds) {
    if (!Array.isArray(assessmentIds) || assessmentIds.length === 0) {
      throw new Error('Assessment IDs are required')
    }

    const results = []
    const errors = []

    for (const id of assessmentIds) {
      try {
        const result = await archiveAssessment(id)
        results.push({ id, success: true, data: result })
      } catch (err) {
        errors.push({ id, error: err.message })
      }
    }

    if (errors.length > 0) {
      const message = `${results.length} archived, ${errors.length} failed`
      const err = new Error(message)
      err.errors = errors
      err.results = results
      throw err
    }

    return results
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Clear validation errors
   */
  function clearValidationErrors() {
    validationErrors.value = {}
  }

  /**
   * Get error message for a field
   */
  function getFieldError(fieldName) {
    return validationErrors.value[fieldName] || null
  }

  /**
   * Check if field has error
   */
  function hasFieldError(fieldName) {
    return !!validationErrors.value[fieldName]
  }

  /**
   * Get all validation errors as array
   */
  function getAllValidationErrors() {
    return Object.entries(validationErrors.value).map(([field, message]) => ({
      field,
      message,
    }))
  }

  // ============================================================================
  // RETURN PUBLIC API
  // ============================================================================

  return {
    // Validation
    validationErrors: computed(() => validationErrors.value),
    validateField,
    validateAssessment,
    clearValidationErrors,
    getFieldError,
    hasFieldError,
    getAllValidationErrors,

    // State checks
    isDraft,
    canEdit,
    canFinalize,
    canArchive,

    // Mutations
    createAssessment,
    updateAssessment,
    saveAssessment,
    finalizeAssessment,
    archiveAssessment,
    bulkFinalize,
    bulkArchive,

    // Store references
    saving: computed(() => store.saving),
    error: computed(() => store.error),
  }
}
