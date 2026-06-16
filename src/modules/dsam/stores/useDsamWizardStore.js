import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { dsamSubmissionApi } from '../services/dsamSubmissionApi'

export const useDsamWizardStore = defineStore('dsamWizard', () => {
  const submission = ref(null)
  const answers    = ref({})   // { [questionId]: { text_value, number_value, date_value, json_value } }
  const currentStep  = ref(0)
  const isLoading    = ref(false)
  const isSaving     = ref(false)
  const isSubmitting = ref(false)
  const lastSavedAt  = ref(null)
  const error        = ref(null)

  const sections = computed(() => submission.value?.form_template?.sections ?? [])
  const totalSteps = computed(() => sections.value.length)
  const currentSection = computed(() => sections.value[currentStep.value] ?? null)
  const isLastStep = computed(() => currentStep.value >= totalSteps.value - 1)
  const progressPct = computed(() =>
    totalSteps.value ? Math.round(((currentStep.value) / totalSteps.value) * 100) : 0,
  )

  // ── Start / Resume ────────────────────────────────────────────────────────

  async function start(formTemplateId, studentId, academicYearId) {
    isLoading.value = true
    error.value = null
    try {
      const res = await dsamSubmissionApi.create({ form_template_id: formTemplateId, student_id: studentId, academic_year_id: academicYearId })
      await _loadSubmission(res.data.data.id)
    } catch (e) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  }

  async function resume(submissionId) {
    isLoading.value = true
    error.value = null
    try {
      await _loadSubmission(submissionId)
      // Restore step from server draft_data if available
      const draftStep = submission.value?.draft_data?.current_step
      if (draftStep !== undefined) currentStep.value = draftStep
    } catch (e) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  }

  async function _loadSubmission(id) {
    const res = await dsamSubmissionApi.get(id)
    submission.value = res.data.data

    // Hydrate answers from server
    answers.value = {}
    for (const answer of submission.value.answers ?? []) {
      answers.value[answer.question_id] = {
        text_value:   answer.text_value,
        number_value: answer.number_value,
        date_value:   answer.date_value,
        json_value:   answer.json_value,
        file_path:    answer.file_path,
      }
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async function next() {
    await saveDraft()
    if (!isLastStep.value) currentStep.value++
  }

  function prev() {
    if (currentStep.value > 0) currentStep.value--
  }

  function goToStep(index) {
    currentStep.value = Math.max(0, Math.min(index, totalSteps.value - 1))
  }

  // ── Answer management ─────────────────────────────────────────────────────

  function setAnswer(questionId, value) {
    answers.value[questionId] = value
  }

  // ── Save draft ────────────────────────────────────────────────────────────

  async function saveDraft() {
    if (!submission.value?.id) return
    isSaving.value = true
    try {
      const payload = _buildPayload()
      const res = await dsamSubmissionApi.save(submission.value.id, payload)
      submission.value = { ...submission.value, ...res.data.data }
      lastSavedAt.value = new Date()
    } catch (e) {
      error.value = e
    } finally {
      isSaving.value = false
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function submit() {
    if (!submission.value?.id) return
    isSubmitting.value = true
    error.value = null
    try {
      await saveDraft()
      const res = await dsamSubmissionApi.submit(submission.value.id)
      submission.value = res.data.data
      return true
    } catch (e) {
      error.value = e
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function _buildPayload() {
    const answersArr = Object.entries(answers.value).map(([questionId, value]) => ({
      question_id: Number(questionId),
      ...value,
    }))

    return {
      current_step: currentStep.value,
      draft_data: { current_step: currentStep.value, saved_at: new Date().toISOString() },
      answers: answersArr,
    }
  }

  function reset() {
    submission.value  = null
    answers.value     = {}
    currentStep.value = 0
    lastSavedAt.value = null
    error.value       = null
  }

  return {
    submission, answers, currentStep, isLoading, isSaving, isSubmitting, lastSavedAt, error,
    sections, totalSteps, currentSection, isLastStep, progressPct,
    start, resume, next, prev, goToStep, setAnswer, saveDraft, submit, reset,
  }
})
