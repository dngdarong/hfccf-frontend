import { computed, ref } from 'vue'
import {
  archiveAcademicTerm,
  archiveAcademicYear,
  activateAcademicTerm,
  activateAcademicYear,
  closeAcademicTerm,
  closeAcademicYear,
  createAcademicTerm,
  createAcademicYear,
  fetchAcademicLifecycle,
  updateAcademicTerm,
  updateAcademicYear,
} from '@/modules/preschool/services/preschoolApi'

// Academic lifecycle state belongs beside the Preschool settings backbone so
// the page can manage first-class year/term records without coupling them to
// the older JSON configuration snapshot.
export function usePreschoolAcademicLifecycle() {
  const academicYears = ref([])
  const terms = ref([])
  const currentContext = ref({})
  const loading = ref(false)
  const saving = ref(false)

  const currentAcademicYear = computed(() => academicYears.value.find((year) => year.isCurrent) || academicYears.value[0] || null)
  const currentTerm = computed(() => terms.value.find((term) => term.isCurrent) || terms.value[0] || null)

  async function loadAcademicLifecycle() {
    loading.value = true

    try {
      const payload = await fetchAcademicLifecycle()
      academicYears.value = payload.academicYears || []
      terms.value = payload.terms || []
      currentContext.value = hasContext(payload.currentContext) ? payload.currentContext : {}

      return payload
    } catch (error) {
      // If access is denied to academic lifecycle settings, continue with empty data
      if (error?.response?.status === 403) {
        console.warn('Access denied to academic lifecycle settings')
        academicYears.value = []
        terms.value = []
        currentContext.value = {}
        return { academicYears: [], terms: [], currentContext: {} }
      }
      // Re-throw other errors
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createYear(payload) {
    saving.value = true
    try {
      const next = await createAcademicYear(payload)
      academicYears.value = next.academicYears || []
      terms.value = next.terms || terms.value
      currentContext.value = hasContext(next.currentContext) ? next.currentContext : currentContext.value
      return next
    } finally {
      saving.value = false
    }
  }

  async function updateYear(id, payload) {
    saving.value = true
    try {
      const next = await updateAcademicYear(id, payload)
      academicYears.value = next.academicYears || []
      terms.value = next.terms || terms.value
      currentContext.value = hasContext(next.currentContext) ? next.currentContext : currentContext.value
      return next
    } finally {
      saving.value = false
    }
  }

  async function activateYear(id) {
    saving.value = true
    try {
      const next = await activateAcademicYear(id)
      academicYears.value = next.academicYears || []
      terms.value = next.terms || terms.value
      currentContext.value = hasContext(next.currentContext) ? next.currentContext : currentContext.value
      return next
    } finally {
      saving.value = false
    }
  }

  async function closeYear(id) {
    saving.value = true
    try {
      const next = await closeAcademicYear(id)
      academicYears.value = next.academicYears || []
      terms.value = next.terms || terms.value
      currentContext.value = hasContext(next.currentContext) ? next.currentContext : currentContext.value
      return next
    } finally {
      saving.value = false
    }
  }

  async function archiveYear(id) {
    saving.value = true
    try {
      const next = await archiveAcademicYear(id)
      academicYears.value = next.academicYears || []
      terms.value = next.terms || terms.value
      currentContext.value = hasContext(next.currentContext) ? next.currentContext : currentContext.value
      return next
    } finally {
      saving.value = false
    }
  }

  async function createTerm(payload) {
    saving.value = true
    try {
      const next = await createAcademicTerm(payload)
      academicYears.value = next.academicYears || academicYears.value
      terms.value = next.terms || []
      currentContext.value = hasContext(next.currentContext) ? next.currentContext : currentContext.value
      return next
    } finally {
      saving.value = false
    }
  }

  async function updateTerm(id, payload) {
    saving.value = true
    try {
      const next = await updateAcademicTerm(id, payload)
      academicYears.value = next.academicYears || academicYears.value
      terms.value = next.terms || []
      currentContext.value = hasContext(next.currentContext) ? next.currentContext : currentContext.value
      return next
    } finally {
      saving.value = false
    }
  }

  async function activateTerm(id) {
    saving.value = true
    try {
      const next = await activateAcademicTerm(id)
      academicYears.value = next.academicYears || academicYears.value
      terms.value = next.terms || []
      currentContext.value = hasContext(next.currentContext) ? next.currentContext : currentContext.value
      return next
    } finally {
      saving.value = false
    }
  }

  async function closeTerm(id) {
    saving.value = true
    try {
      const next = await closeAcademicTerm(id)
      academicYears.value = next.academicYears || academicYears.value
      terms.value = next.terms || []
      currentContext.value = hasContext(next.currentContext) ? next.currentContext : currentContext.value
      return next
    } finally {
      saving.value = false
    }
  }

  async function archiveTerm(id) {
    saving.value = true
    try {
      const next = await archiveAcademicTerm(id)
      academicYears.value = next.academicYears || academicYears.value
      terms.value = next.terms || []
      currentContext.value = hasContext(next.currentContext) ? next.currentContext : currentContext.value
      return next
    } finally {
      saving.value = false
    }
  }

  return {
    academicYears,
    terms,
    currentContext,
    currentAcademicYear,
    currentTerm,
    loading,
    saving,
    loadAcademicLifecycle,
    createYear,
    updateYear,
    activateYear,
    closeYear,
    archiveYear,
    createTerm,
    updateTerm,
    activateTerm,
    closeTerm,
    archiveTerm,
  }
}

function hasContext(value) {
  return Boolean(value && typeof value === 'object' && Object.keys(value).length > 0)
}
