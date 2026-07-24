import { ref } from 'vue'
import {
  fetchPreschoolGrades,
  fetchGradeMonthlyEntry,
  fetchStudentGrades,
  normalizeGrade,
} from '@/modules/preschool/services/api/preschoolGradeApi'

export function useGradeData() {
  const grades = ref([])
  const loading = ref(false)
  const errorMessage = ref('')
  const pagination = ref({
    page: 1,
    perPage: 50,
    total: 0,
    totalPages: 0,
  })

  async function loadGrades(filters = {}) {
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await fetchPreschoolGrades({
        ...filters,
        page: pagination.value.page,
        perPage: pagination.value.perPage,
      })

      grades.value = Array.isArray(response.items || response)
        ? (response.items || response).map(normalizeGrade)
        : []

      if (response.meta || response.pagination) {
        const meta = response.meta || response.pagination
        pagination.value.total = meta.total || 0
        pagination.value.totalPages = meta.totalPages || Math.ceil(meta.total / pagination.value.perPage)
      }
    } catch (error) {
      errorMessage.value = error?.message || 'Failed to load grades'
      grades.value = []
    } finally {
      loading.value = false
    }
  }

  async function loadMonthlyEntry(classId, month, year) {
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await fetchGradeMonthlyEntry(classId, month, year)
      return response
    } catch (error) {
      errorMessage.value = error?.message || 'Failed to load monthly entry'
      return null
    } finally {
      loading.value = false
    }
  }

  async function loadStudentGrades(studentId) {
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await fetchStudentGrades(studentId)
      return Array.isArray(response.items || response)
        ? (response.items || response).map(normalizeGrade)
        : []
    } catch (error) {
      errorMessage.value = error?.message || 'Failed to load student grades'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    grades,
    loading,
    errorMessage,
    pagination,
    loadGrades,
    loadMonthlyEntry,
    loadStudentGrades,
  }
}
