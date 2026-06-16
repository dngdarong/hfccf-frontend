import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchStudentAssessments,
  fetchAssessmentCategories,
  createStudentAssessment,
  updateAssessment as updateAssessmentApi,
  finalizeAssessment as finalizeAssessmentApi,
  archiveAssessment as archiveAssessmentApi,
  normalizeAssessment,
  normalizeCategory,
  prepareAssessmentData,
} from '../services/api/preschoolAssessmentApi'
import { PRESCHOOL_ASSESSMENT_DEFAULT_FILTERS } from '../admin/pages/assessments/constants/preschoolAssessmentWorkspace'

// Canonical Preschool assessment state lives here. The pages, filters,
// mutations, and reporting composables all read from this store so the module
// does not drift back into duplicate local state or direct HTTP calls.
export const useAssessmentStore = defineStore('preschoolAssessment', () => {
  // ============================================================================
  // STATE
  // ============================================================================

  // Data
  const assessments = ref([])
  const categories = ref([])
  const currentAssessment = ref(null)

  // Loading & Error
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  // Pagination
  const pagination = ref({
    page: 1,
    perPage: 25,
    total: 0,
    totalPages: 0,
  })

  // Filters
  const filters = ref({
    ...PRESCHOOL_ASSESSMENT_DEFAULT_FILTERS,
  })

  // UI State
  const isFormOpen = ref(false)
  const editingAssessment = ref(null)

  // ============================================================================
  // GETTERS / COMPUTED
  // ============================================================================

  /**
   * Filtered assessments based on current filter criteria
   */
  const filteredAssessments = computed(() => {
    let result = [...assessments.value]

    // Status filter
    if (filters.value.status !== 'all') {
      result = result.filter(a => a.status === filters.value.status)
    }

    // Student filter
    if (filters.value.studentId) {
      result = result.filter(a => a.studentId === filters.value.studentId)
    }

    // Class filter
    if (filters.value.classId) {
      result = result.filter(a => a.classId === filters.value.classId)
    }

    // Category filter
    if (filters.value.categoryId) {
      result = result.filter(a => a.categoryId === filters.value.categoryId)
    }

    // Period filter
    if (filters.value.periodLabel) {
      result = result.filter(a => a.periodLabel === filters.value.periodLabel)
    }

    // Search query (searches in student name, class, observation)
    if (filters.value.searchQuery) {
      const query = filters.value.searchQuery.toLowerCase()
      result = result.filter(a => {
        const studentName = (a.student?.fullName || '').toLowerCase()
        const className = (a.class?.name || '').toLowerCase()
        const observation = (a.observation || '').toLowerCase()
        return (
          studentName.includes(query) ||
          className.includes(query) ||
          observation.includes(query)
        )
      })
    }

    // Date range filter
    if (filters.value.dateFrom) {
      result = result.filter(a => a.assessmentDate && new Date(a.assessmentDate) >= new Date(filters.value.dateFrom))
    }
    if (filters.value.dateTo) {
      result = result.filter(a => a.assessmentDate && new Date(a.assessmentDate) <= new Date(filters.value.dateTo))
    }

    return result
  })

  /**
   * Assessment count by status
   */
  const statusCounts = computed(() => ({
    total: assessments.value.length,
    draft: assessments.value.filter(a => a.status === 'draft').length,
    finalized: assessments.value.filter(a => a.status === 'finalized').length,
  }))

  /**
   * Average score by category
   */
  const averageByCategory = computed(() => {
    const result = {}
    categories.value.forEach(cat => {
      const scores = assessments.value
        .filter(a => a.categoryId === cat.id && a.status === 'finalized')
        .map(a => parseFloat(a.score) || 0)

      if (scores.length > 0) {
        result[cat.id] = {
          categoryId: cat.id,
          categoryName: cat.name,
          average: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
          count: scores.length,
        }
      }
    })
    return result
  })

  /**
   * Average score per student
   */
  const averageByStudent = computed(() => {
    const result = {}
    assessments.value.forEach(a => {
      if (!result[a.studentId]) {
        result[a.studentId] = {
          studentId: a.studentId,
          studentName: a.student?.fullName || 'Unknown',
          scores: [],
        }
      }
      if (a.status === 'finalized' && a.score) {
        result[a.studentId].scores.push(parseFloat(a.score))
      }
    })

    // Calculate averages
    Object.keys(result).forEach(studentId => {
      const scores = result[studentId].scores
      result[studentId].average = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
        : null
    })

    return result
  })

  /**
   * Get category by ID
   */
  const getCategoryById = computed(() => (id) => {
    return categories.value.find(c => c.id === id)
  })

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Load assessments for a specific student
   */
  async function loadAssessments(studentId, params = {}) {
    loading.value = true
    error.value = null

    try {
      const queryParams = {
        page: pagination.value.page,
        perPage: pagination.value.perPage,
        ...params,
      }

      const response = await fetchStudentAssessments(studentId, queryParams)

      // Normalize assessments
      assessments.value = (response.items || []).map(normalizeAssessment)

      // Update pagination
      if (response.pagination) {
        pagination.value = {
          page: response.pagination.page,
          perPage: response.pagination.perPage,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        }
      }
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to load assessments'
      console.error('Load assessments error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Load assessment categories
   */
  async function loadCategories() {
    loading.value = true
    error.value = null

    try {
      const data = await fetchAssessmentCategories()
      const items = Array.isArray(data) ? data : data?.items || data?.data || []
      categories.value = items.map(normalizeCategory).filter(c => c.isActive)
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to load categories'
      console.error('Load categories error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new assessment
   */
  async function saveAssessment(studentId, assessmentData) {
    saving.value = true
    error.value = null

    try {
      const data = prepareAssessmentData(assessmentData)
      const result = await createStudentAssessment(studentId, data)
      const normalized = normalizeAssessment(result)

      assessments.value.unshift(normalized)
      currentAssessment.value = normalized

      return normalized
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to save assessment'
      console.error('Save assessment error:', err)
      throw error.value
    } finally {
      saving.value = false
    }
  }

  /**
   * Update an existing assessment
   */
  async function updateAssessment(assessmentId, assessmentData) {
    saving.value = true
    error.value = null

    try {
      const data = prepareAssessmentData(assessmentData)
      const result = await updateAssessmentApi(assessmentId, data)
      const normalized = normalizeAssessment(result)

      // Update in list
      const index = assessments.value.findIndex(a => a.id === assessmentId)
      if (index > -1) {
        assessments.value[index] = normalized
      }

      currentAssessment.value = normalized

      return normalized
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to update assessment'
      console.error('Update assessment error:', err)
      throw error.value
    } finally {
      saving.value = false
    }
  }

  /**
   * Finalize (lock) an assessment
   */
  async function finalize(assessmentId) {
    saving.value = true
    error.value = null

    try {
      const result = await finalizeAssessmentApi(assessmentId)
      const normalized = normalizeAssessment(result)

      // Update in list
      const index = assessments.value.findIndex(a => a.id === assessmentId)
      if (index > -1) {
        assessments.value[index] = normalized
      }

      currentAssessment.value = normalized

      return normalized
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to finalize assessment'
      console.error('Finalize assessment error:', err)
      throw error.value
    } finally {
      saving.value = false
    }
  }

  /**
   * Archive (soft delete) an assessment
   */
  async function archive(assessmentId) {
    saving.value = true
    error.value = null

    try {
      await archiveAssessmentApi(assessmentId)

      // Remove from list
      assessments.value = assessments.value.filter(a => a.id !== assessmentId)
      if (currentAssessment.value?.id === assessmentId) {
        currentAssessment.value = null
      }
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to archive assessment'
      console.error('Archive assessment error:', err)
      throw error.value
    } finally {
      saving.value = false
    }
  }

  /**
   * Set filter value
   */
  function setFilter(key, value) {
    if (key in filters.value) {
      filters.value[key] = value
      // Reset pagination when filters change
      pagination.value.page = 1
    }
  }

  /**
   * Reset all filters
   */
  function resetFilters() {
    filters.value = { ...PRESCHOOL_ASSESSMENT_DEFAULT_FILTERS }
    pagination.value.page = 1
  }

  /**
   * Set pagination page
   */
  function setPage(page) {
    pagination.value.page = page
  }

  /**
   * Open form for creating new assessment
   */
  function openCreateForm() {
    editingAssessment.value = null
    isFormOpen.value = true
  }

  /**
   * Open form for editing assessment
   */
  function openEditForm(assessment) {
    editingAssessment.value = assessment
    isFormOpen.value = true
  }

  /**
   * Close form
   */
  function closeForm() {
    isFormOpen.value = false
    editingAssessment.value = null
  }

  /**
   * Clear all state
   */
  function reset() {
    assessments.value = []
    categories.value = []
    currentAssessment.value = null
    loading.value = false
    saving.value = false
    error.value = null
    pagination.value = {
      page: 1,
      perPage: 25,
      total: 0,
      totalPages: 0,
    }
    filters.value = { ...PRESCHOOL_ASSESSMENT_DEFAULT_FILTERS }
    isFormOpen.value = false
    editingAssessment.value = null
  }

  // ============================================================================
  // RETURN PUBLIC API
  // ============================================================================

  return {
    // State
    assessments,
    categories,
    currentAssessment,
    loading,
    saving,
    error,
    pagination,
    filters,
    isFormOpen,
    editingAssessment,

    // Computed
    filteredAssessments,
    statusCounts,
    averageByCategory,
    averageByStudent,
    getCategoryById,

    // Actions
    loadAssessments,
    loadCategories,
    saveAssessment,
    updateAssessment,
    finalize,
    archive,
    setFilter,
    resetFilters,
    setPage,
    openCreateForm,
    openEditForm,
    closeForm,
    reset,
  }
})
