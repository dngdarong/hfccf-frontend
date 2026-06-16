import { computed, ref } from 'vue'
import {
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
      currentContext.value = payload.currentContext || {}

      return payload
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
      currentContext.value = next.currentContext || currentContext.value
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
      currentContext.value = next.currentContext || currentContext.value
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
      currentContext.value = next.currentContext || currentContext.value
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
      currentContext.value = next.currentContext || currentContext.value
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
      currentContext.value = next.currentContext || currentContext.value
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
      currentContext.value = next.currentContext || currentContext.value
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
      currentContext.value = next.currentContext || currentContext.value
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
      currentContext.value = next.currentContext || currentContext.value
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
    createTerm,
    updateTerm,
    activateTerm,
    closeTerm,
  }
}
