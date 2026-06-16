import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { dsamFormApi } from '../services/dsamFormApi'

export const useDsamFormBuilderStore = defineStore('dsamFormBuilder', () => {
  const template     = ref(null)
  const sections     = ref([])       // full tree: sections with .questions[] embedded
  const questionTypes = ref([])
  const activeSectionId  = ref(null)
  const activeQuestionId = ref(null)

  const isLoading = ref(false)
  const isSaving  = ref(false)
  const error     = ref(null)

  const isPublished = computed(() => template.value?.status === 'published')

  const activeSection  = computed(() => sections.value.find(s => s.id === activeSectionId.value) ?? null)
  const activeQuestion = computed(() => {
    for (const s of sections.value) {
      const q = (s.questions ?? []).find(q => q.id === activeQuestionId.value)
      if (q) return q
    }
    return null
  })

  // ── Load ──────────────────────────────────────────────────────────────────

  async function load(formId) {
    isLoading.value = true
    error.value = null
    try {
      const [formRes, typesRes] = await Promise.all([
        dsamFormApi.get(formId),
        questionTypes.value.length ? Promise.resolve(null) : dsamFormApi.questionTypes(),
      ])
      template.value = formRes.data.data
      sections.value = (template.value.sections ?? []).map(normSection)
      if (typesRes) questionTypes.value = typesRes.data.data ?? []

      if (sections.value.length && !activeSectionId.value) {
        activeSectionId.value = sections.value[0].id
      }
    } catch (e) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  }

  // ── Template ──────────────────────────────────────────────────────────────

  async function saveTemplate(data) {
    isSaving.value = true
    try {
      const id = template.value?.id
      const res = id
        ? await dsamFormApi.update(id, data)
        : await dsamFormApi.create(data)
      template.value = res.data.data
    } finally {
      isSaving.value = false
    }
  }

  async function publish() {
    const res = await dsamFormApi.publish(template.value.id)
    template.value = res.data.data
  }

  // ── Sections ──────────────────────────────────────────────────────────────

  async function addSection(data) {
    const res = await dsamFormApi.createSection(template.value.id, data)
    const section = normSection(res.data.data)
    sections.value.push(section)
    activeSectionId.value = section.id
  }

  async function updateSection(sectionId, data) {
    const res = await dsamFormApi.updateSection(template.value.id, sectionId, data)
    const idx = sections.value.findIndex(s => s.id === sectionId)
    if (idx !== -1) {
      sections.value[idx] = normSection({ ...sections.value[idx], ...res.data.data })
    }
  }

  async function deleteSection(sectionId) {
    await dsamFormApi.deleteSection(template.value.id, sectionId)
    sections.value = sections.value.filter(s => s.id !== sectionId)
    if (activeSectionId.value === sectionId) {
      activeSectionId.value = sections.value[0]?.id ?? null
    }
  }

  async function reorderSections(orderedIds) {
    sections.value = orderedIds
      .map(id => sections.value.find(s => s.id === id))
      .filter(Boolean)
    await dsamFormApi.reorderSections(template.value.id, orderedIds)
  }

  // ── Questions ─────────────────────────────────────────────────────────────

  async function addQuestion(sectionId, data) {
    const res = await dsamFormApi.createQuestion(sectionId, data)
    const question = res.data.data
    const section = sections.value.find(s => s.id === sectionId)
    if (section) {
      section.questions = [...(section.questions ?? []), question]
    }
    activeQuestionId.value = question.id
    return question
  }

  async function updateQuestion(sectionId, questionId, data) {
    const res = await dsamFormApi.updateQuestion(sectionId, questionId, data)
    const section = sections.value.find(s => s.id === sectionId)
    if (section) {
      const idx = (section.questions ?? []).findIndex(q => q.id === questionId)
      if (idx !== -1) section.questions[idx] = res.data.data
    }
  }

  async function deleteQuestion(sectionId, questionId) {
    await dsamFormApi.deleteQuestion(sectionId, questionId)
    const section = sections.value.find(s => s.id === sectionId)
    if (section) {
      section.questions = (section.questions ?? []).filter(q => q.id !== questionId)
    }
    if (activeQuestionId.value === questionId) activeQuestionId.value = null
  }

  async function reorderQuestions(sectionId, orderedIds) {
    const section = sections.value.find(s => s.id === sectionId)
    if (section) {
      section.questions = orderedIds
        .map(id => (section.questions ?? []).find(q => q.id === id))
        .filter(Boolean)
    }
    await dsamFormApi.reorderQuestions(sectionId, orderedIds)
  }

  // ── Options ───────────────────────────────────────────────────────────────

  async function addOption(sectionId, questionId, data) {
    const res = await dsamFormApi.createOption(questionId, data)
    _mutateQuestion(sectionId, questionId, q => {
      q.options = [...(q.options ?? []), res.data.data]
    })
  }

  async function updateOption(sectionId, questionId, optionId, data) {
    const res = await dsamFormApi.updateOption(questionId, optionId, data)
    _mutateQuestion(sectionId, questionId, q => {
      const idx = (q.options ?? []).findIndex(o => o.id === optionId)
      if (idx !== -1) q.options[idx] = res.data.data
    })
  }

  async function deleteOption(sectionId, questionId, optionId) {
    await dsamFormApi.deleteOption(questionId, optionId)
    _mutateQuestion(sectionId, questionId, q => {
      q.options = (q.options ?? []).filter(o => o.id !== optionId)
    })
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function setActiveSection(id) { activeSectionId.value = id }
  function setActiveQuestion(id) { activeQuestionId.value = id }
  function clearActiveQuestion() { activeQuestionId.value = null }

  function _mutateQuestion(sectionId, questionId, mutate) {
    const section = sections.value.find(s => s.id === sectionId)
    if (!section) return
    const question = (section.questions ?? []).find(q => q.id === questionId)
    if (question) mutate(question)
  }

  function normSection(s) {
    return { ...s, questions: (s.questions ?? s.all_questions ?? []) }
  }

  function reset() {
    template.value = null
    sections.value = []
    activeSectionId.value = null
    activeQuestionId.value = null
    error.value = null
  }

  return {
    template, sections, questionTypes,
    activeSectionId, activeQuestionId,
    activeSection, activeQuestion,
    isLoading, isSaving, error, isPublished,
    load, saveTemplate, publish,
    addSection, updateSection, deleteSection, reorderSections,
    addQuestion, updateQuestion, deleteQuestion, reorderQuestions,
    addOption, updateOption, deleteOption,
    setActiveSection, setActiveQuestion, clearActiveQuestion,
    reset,
  }
})
