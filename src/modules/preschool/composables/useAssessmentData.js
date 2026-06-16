import { computed, ref } from 'vue'
import { useAssessmentStore } from '../stores/assessmentStore'
import { fetchPreschoolStudents, fetchPreschoolClasses } from '../services/preschoolApi'

/**
 * useAssessmentData - Composable for fetching and managing assessment data
 *
 * This is the canonical data-loading companion to the Preschool assessment
 * store. Pages should read from this stack instead of creating new local
 * copies of assessment lookup state.
 *
 * Responsibilities:
 * - Load assessments for a student
 * - Load assessment categories
 * - Load students and classes (for dropdowns)
 * - Handle loading states
 * - Cache data to avoid redundant API calls
 */
export function useAssessmentData() {
  const store = useAssessmentStore()

  // Cache flags to prevent redundant API calls
  const categoriesLoaded = ref(false)
  const studentsLoaded = ref(false)
  const classesLoaded = ref(false)

  // Data for dropdowns
  const students = ref([])
  const classes = ref([])
  const studentOptions = computed(() =>
    students.value.map(s => ({
      label: `${s.fullName || s.name}${s.studentCode ? ` (${s.studentCode})` : ''}`,
      value: s.id,
      raw: s,
    }))
  )

  const classOptions = computed(() =>
    classes.value.map(c => ({
      label: `${c.code} - ${c.name}`,
      value: c.id,
      raw: c,
    }))
  )

  /**
   * Load assessment categories once
   */
  async function loadCategories() {
    if (categoriesLoaded.value) return

    try {
      await store.loadCategories()
      categoriesLoaded.value = true
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  /**
   * Load students for dropdown
   */
  async function loadStudents() {
    if (studentsLoaded.value) return

    try {
      const response = await fetchPreschoolStudents({ page: 1, perPage: 1000 })
      students.value = response.items || []
      studentsLoaded.value = true
    } catch (err) {
      console.error('Failed to load students:', err)
    }
  }

  /**
   * Load classes for dropdown
   */
  async function loadClasses() {
    if (classesLoaded.value) return

    try {
      const response = await fetchPreschoolClasses({ page: 1, perPage: 1000 })
      classes.value = response.items || []
      classesLoaded.value = true
    } catch (err) {
      console.error('Failed to load classes:', err)
    }
  }

  /**
   * Load assessments for a specific student
   * @param {number|string} studentId - Student ID
   * @param {Object} params - Additional query parameters
   */
  async function loadAssessments(studentId, params = {}) {
    if (!studentId) {
      store.reset()
      return
    }

    await store.loadAssessments(studentId, params)
  }

  /**
   * Load all required lookup data (called once on component mount)
   */
  async function loadAllLookupData() {
    await Promise.all([
      loadCategories(),
      loadStudents(),
      loadClasses(),
    ])
  }

  /**
   * Initialize assessments for a student (load both lookups and assessments)
   * @param {number|string} studentId - Student ID
   */
  async function initializeAssessments(studentId) {
    await loadAllLookupData()
    await loadAssessments(studentId)
  }

  /**
   * Refresh assessments (reload from server)
   * @param {number|string} studentId - Student ID
   */
  async function refreshAssessments(studentId) {
    await store.loadAssessments(studentId)
  }

  /**
   * Get student by ID from cached students
   */
  function getStudentById(studentId) {
    return students.value.find(s => s.id === studentId)
  }

  /**
   * Get class by ID from cached classes
   */
  function getClassById(classId) {
    return classes.value.find(c => c.id === classId)
  }

  /**
   * Reset all data and caches
   */
  function reset() {
    store.reset()
    students.value = []
    classes.value = []
    categoriesLoaded.value = false
    studentsLoaded.value = false
    classesLoaded.value = false
  }

  return {
    // Store bindings
    assessments: computed(() => store.assessments),
    categories: computed(() => store.categories),
    loading: computed(() => store.loading),
    error: computed(() => store.error),

    // Local data
    students,
    classes,
    studentOptions,
    classOptions,

    // Methods
    loadCategories,
    loadStudents,
    loadClasses,
    loadAllLookupData,
    loadAssessments,
    initializeAssessments,
    refreshAssessments,
    getStudentById,
    getClassById,
    reset,
  }
}
