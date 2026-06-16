import { computed } from 'vue'
import { useWizardStore } from '../stores/useWizardStore'

export function useAssessmentWizard() {
  const store = useWizardStore()

  const progressPercent = computed(() =>
    Math.round(((store.currentStep + 1) / store.totalSteps) * 100),
  )

  const answeredCount = computed(() => Object.keys(store.answers).length)

  function selectForm(form) {
    store.selectedForm = form
  }

  function selectStudent(student) {
    store.selectedStudent = student
  }

  return {
    store,
    progressPercent,
    answeredCount,
    selectForm,
    selectStudent,
  }
}
