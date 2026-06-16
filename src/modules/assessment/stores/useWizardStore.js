import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { assessmentSubmissionApi } from '../services/assessmentSubmissionApi'

export const useWizardStore = defineStore('assessmentWizard', () => {
  const currentStep = ref(0)
  const selectedForm = ref(null)
  const selectedStudent = ref(null)
  const answers = ref({})
  const submission = ref(null)
  const isSubmitting = ref(false)
  const isSaving = ref(false)
  const error = ref(null)

  const steps = ['form', 'student', 'assessment', 'review']
  const totalSteps = steps.length

  const currentStepKey = computed(() => steps[currentStep.value])
  const canGoNext = computed(() => {
    if (currentStep.value === 0) return !!selectedForm.value
    if (currentStep.value === 1) return !!selectedStudent.value
    return true
  })
  const canGoBack = computed(() => currentStep.value > 0)
  const isLastStep = computed(() => currentStep.value === totalSteps - 1)

  function goNext() {
    if (currentStep.value < totalSteps - 1) currentStep.value++
  }

  function goBack() {
    if (currentStep.value > 0) currentStep.value--
  }

  function goToStep(step) {
    currentStep.value = step
  }

  function setAnswer(questionId, value, repeatIndex = 0) {
    const key = `${questionId}_${repeatIndex}`
    answers.value[key] = { question_id: questionId, answer_value: value, repeat_index: repeatIndex }
  }

  async function saveDraft() {
    isSaving.value = true
    try {
      const payload = buildPayload('draft')
      if (submission.value?.id) {
        const res = await assessmentSubmissionApi.update(submission.value.id, payload)
        submission.value = res.data.data
      } else {
        const res = await assessmentSubmissionApi.create(payload)
        submission.value = res.data.data
      }
    } finally {
      isSaving.value = false
    }
  }

  async function submit() {
    isSubmitting.value = true
    try {
      await saveDraft()
      const res = await assessmentSubmissionApi.submit(submission.value.id)
      submission.value = res.data.data
    } finally {
      isSubmitting.value = false
    }
  }

  function buildPayload(status = 'draft') {
    if (!selectedForm.value?.id) {
      throw new Error('Form must be selected')
    }
    if (!selectedStudent.value?.id) {
      throw new Error('Student must be selected')
    }
    return {
      form_template_id: selectedForm.value.id,
      student_id: selectedStudent.value.id,
      status,
      answers: Object.values(answers.value),
    }
  }

  function reset() {
    currentStep.value = 0
    selectedForm.value = null
    selectedStudent.value = null
    answers.value = {}
    submission.value = null
    isSubmitting.value = false
    isSaving.value = false
    error.value = null
  }

  return {
    currentStep,
    selectedForm,
    selectedStudent,
    answers,
    submission,
    isSubmitting,
    isSaving,
    error,
    steps,
    totalSteps,
    currentStepKey,
    canGoNext,
    canGoBack,
    isLastStep,
    goNext,
    goBack,
    goToStep,
    setAnswer,
    saveDraft,
    submit,
    reset,
  }
})
