import { computed } from 'vue'
import { useAssessmentStore } from '../stores/assessmentStore'
import {
  PRESCHOOL_ASSESSMENT_DEFAULT_FILTERS,
  PRESCHOOL_ASSESSMENT_PERIOD_OPTIONS,
  PRESCHOOL_ASSESSMENT_STATUS_OPTIONS,
} from '../admin/pages/assessments/constants/preschoolAssessmentWorkspace'

/**
 * useAssessmentFilters - Composable for managing assessment filters
 *
 * Filters stay here instead of inside the pages so every assessment surface
 * reads from the same shared criteria model.
 *
 * Responsibilities:
 * - Provide reactive filter state
 * - Expose filter-setting functions
 * - Calculate filter-related computed values
 * - Handle filter reset and persistence
 */
export function useAssessmentFilters() {
  const store = useAssessmentStore()

  // ============================================================================
  // COMPUTED - Filter State (for read-only access)
  // ============================================================================

  const studentFilter = computed({
    get: () => store.filters.studentId,
    set: (value) => store.setFilter('studentId', value),
  })

  const classFilter = computed({
    get: () => store.filters.classId,
    set: (value) => store.setFilter('classId', value),
  })

  const categoryFilter = computed({
    get: () => store.filters.categoryId,
    set: (value) => store.setFilter('categoryId', value),
  })

  const periodFilter = computed({
    get: () => store.filters.periodLabel,
    set: (value) => store.setFilter('periodLabel', value),
  })

  const statusFilter = computed({
    get: () => store.filters.status,
    set: (value) => store.setFilter('status', value),
  })

  const searchFilter = computed({
    get: () => store.filters.searchQuery,
    set: (value) => store.setFilter('searchQuery', value),
  })

  const dateFromFilter = computed({
    get: () => store.filters.dateFrom,
    set: (value) => store.setFilter('dateFrom', value),
  })

  const dateToFilter = computed({
    get: () => store.filters.dateTo,
    set: (value) => store.setFilter('dateTo', value),
  })

  // ============================================================================
  // COMPUTED - Filter State Tracking
  // ============================================================================

  /**
   * Check if any filter is active
   */
  const hasActiveFilters = computed(() => {
    return (
      store.filters.studentId !== null ||
      store.filters.classId !== null ||
      store.filters.categoryId !== null ||
      store.filters.periodLabel !== null ||
      store.filters.status !== 'all' ||
      store.filters.searchQuery !== '' ||
      store.filters.dateFrom !== null ||
      store.filters.dateTo !== null
    )
  })

  /**
   * Count of active filters
   */
  const activeFilterCount = computed(() => {
    let count = 0
    if (store.filters.studentId !== null) count++
    if (store.filters.classId !== null) count++
    if (store.filters.categoryId !== null) count++
    if (store.filters.periodLabel !== null) count++
    if (store.filters.status !== 'all') count++
    if (store.filters.searchQuery !== '') count++
    if (store.filters.dateFrom !== null) count++
    if (store.filters.dateTo !== null) count++
    return count
  })

  /**
   * Status filter options
   */
  const statusOptions = PRESCHOOL_ASSESSMENT_STATUS_OPTIONS

  /**
   * Period options (can be extended based on academic calendar)
   */
  const periodOptions = computed(() => PRESCHOOL_ASSESSMENT_PERIOD_OPTIONS)

  // ============================================================================
  // METHODS - Filter Operations
  // ============================================================================

  /**
   * Clear a specific filter
   */
  function clearFilter(filterName) {
    if (filterName in PRESCHOOL_ASSESSMENT_DEFAULT_FILTERS) {
      store.setFilter(filterName, PRESCHOOL_ASSESSMENT_DEFAULT_FILTERS[filterName])
    }
  }

  /**
   * Clear all filters
   */
  function clearAllFilters() {
    store.resetFilters()
  }

  /**
   * Apply multiple filters at once
   * @param {Object} filters - Object with filter key-value pairs
   */
  function applyFilters(filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (key in store.filters) {
        store.setFilter(key, value)
      }
    })
  }

  /**
   * Get current filter state as object (for saving/loading)
   */
  function getFilterState() {
    return { ...store.filters }
  }

  /**
   * Restore filter state from saved object
   * @param {Object} state - Filter state to restore
   */
  function restoreFilterState(state) {
    if (!state) return
    applyFilters(state)
  }

  /**
   * Check if a specific filter is active
   * @param {string} filterName - Filter name
   */
  function isFilterActive(filterName) {
    const value = store.filters[filterName]
    return value !== PRESCHOOL_ASSESSMENT_DEFAULT_FILTERS[filterName]
  }

  /**
   * Get readable filter label
   * @param {string} filterName - Filter name
   * @param {Object} options - Options objects {students, classes, categories}
   */
  function getFilterLabel(filterName, options = {}) {
    const value = store.filters[filterName]
    if (!value) return null

    switch (filterName) {
      case 'studentId':
        return options.students?.find(s => s.id === value)?.fullName || `Student #${value}`
      case 'classId':
        return options.classes?.find(c => c.id === value)?.name || `Class #${value}`
      case 'categoryId':
        return options.categories?.find(c => c.id === value)?.name || `Category #${value}`
      case 'periodLabel':
        return value
      case 'status':
        return value !== 'all' ? value.charAt(0).toUpperCase() + value.slice(1) : null
      case 'searchQuery':
        return `"${value}"`
      case 'dateFrom':
      case 'dateTo':
        return value
      default:
        return null
    }
  }

  /**
   * Export filters as JSON (for persistence)
   */
  function exportFilters() {
    return JSON.stringify(getFilterState())
  }

  /**
   * Import filters from JSON
   */
  function importFilters(json) {
    try {
      const state = JSON.parse(json)
      restoreFilterState(state)
      return true
    } catch {
      return false
    }
  }

  // ============================================================================
  // RETURN PUBLIC API
  // ============================================================================

  return {
    // Filter state (computed)
    studentFilter,
    classFilter,
    categoryFilter,
    periodFilter,
    statusFilter,
    searchFilter,
    dateFromFilter,
    dateToFilter,

    // Filter state tracking
    hasActiveFilters,
    activeFilterCount,

    // Options
    statusOptions,
    periodOptions,

    // Methods - Filter Operations
    clearFilter,
    clearAllFilters,
    applyFilters,
    isFilterActive,
    getFilterLabel,

    // Methods - State Management
    getFilterState,
    restoreFilterState,
    exportFilters,
    importFilters,

    // Store references (for advanced usage)
    filters: computed(() => store.filters),
    filteredAssessments: computed(() => store.filteredAssessments),
  }
}
