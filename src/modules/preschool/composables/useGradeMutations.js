import { ref } from 'vue'
import {
  createPreschoolGrade,
  updatePreschoolGrade,
  deletePreschoolGrade,
  batchUpdateGrades,
} from '@/modules/preschool/services/api/preschoolGradeApi'

export function useGradeMutations() {
  const isSubmitting = ref(false)
  const errorMessage = ref('')

  async function saveGrade(gradeData, onSuccess) {
    isSubmitting.value = true
    errorMessage.value = ''

    try {
      let response
      if (gradeData.id) {
        response = await updatePreschoolGrade(gradeData.id, gradeData)
      } else {
        response = await createPreschoolGrade(gradeData)
      }

      if (onSuccess) await onSuccess(response)
      return response
    } catch (error) {
      errorMessage.value = error?.message || 'Failed to save grade'
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  async function removeGrade(gradeId, onSuccess) {
    isSubmitting.value = true
    errorMessage.value = ''

    try {
      await deletePreschoolGrade(gradeId)
      if (onSuccess) await onSuccess()
    } catch (error) {
      errorMessage.value = error?.message || 'Failed to delete grade'
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  async function saveBatchGrades(grades, onSuccess) {
    isSubmitting.value = true
    errorMessage.value = ''

    try {
      const response = await batchUpdateGrades(grades)
      if (onSuccess) await onSuccess(response)
      return response
    } catch (error) {
      errorMessage.value = error?.message || 'Failed to save grades'
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    errorMessage,
    saveGrade,
    removeGrade,
    saveBatchGrades,
  }
}
