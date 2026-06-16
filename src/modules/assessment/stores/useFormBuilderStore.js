import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { assessmentFormApi } from '../services/assessmentFormApi'
import { assessmentQuestionTypeApi } from '../services/assessmentQuestionTypeApi'

function createEmptyTemplate() {
  return {
    id: null,
    uuid: null,
    code: '',
    name: '',
    description: '',
    module: 'preschool',
    status: 'draft',
    is_locked: false,
  }
}

export const useFormBuilderStore = defineStore('formBuilder', () => {
  const template = ref(createEmptyTemplate())
  const sections = ref([])
  const questionTypes = ref([])
  const isDirty = ref(false)
  const isSaving = ref(false)
  const isLoading = ref(false)
  const error = ref(null)

  const sortedSections = computed(() =>
    [...sections.value].sort((a, b) => a.order - b.order),
  )

  async function loadTemplate(id) {
    isLoading.value = true
    error.value = null
    try {
      const [tRes, sRes] = await Promise.all([
        assessmentFormApi.get(id),
        assessmentFormApi.listSections(id),
      ])
      template.value = tRes.data.data
      sections.value = sRes.data.data
    } catch (e) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  }

  async function loadQuestionTypes() {
    if (questionTypes.value.length) return

    try {
      const res = await assessmentQuestionTypeApi.list()
      questionTypes.value = res.data.data || []
    } catch {
      questionTypes.value = []
    }
  }

  async function saveTemplate(data) {
    isSaving.value = true
    try {
      if (template.value?.id) {
        const res = await assessmentFormApi.update(template.value.id, data)
        template.value = res.data.data
      } else {
        const res = await assessmentFormApi.create(data)
        template.value = res.data.data
      }
      isDirty.value = false
    } finally {
      isSaving.value = false
    }
  }

  async function publishTemplate() {
    const res = await assessmentFormApi.publish(template.value.id)
    template.value = res.data.data
  }

  async function addSection(data) {
    const res = await assessmentFormApi.createSection(template.value.id, data)
    sections.value.push(res.data.data)
  }

  async function updateSection(sectionId, data) {
    const res = await assessmentFormApi.updateSection(template.value.id, sectionId, data)
    const idx = sections.value.findIndex((s) => s.id === sectionId)
    if (idx !== -1) sections.value[idx] = res.data.data
  }

  async function deleteSection(sectionId) {
    await assessmentFormApi.deleteSection(template.value.id, sectionId)
    sections.value = sections.value.filter((s) => s.id !== sectionId)
  }

  function markDirty() {
    isDirty.value = true
  }

  function reset() {
    template.value = createEmptyTemplate()
    sections.value = []
    isDirty.value = false
    isSaving.value = false
    error.value = null
  }

  return {
    template,
    sections,
    questionTypes,
    isDirty,
    isSaving,
    isLoading,
    error,
    sortedSections,
    loadTemplate,
    loadQuestionTypes,
    saveTemplate,
    publishTemplate,
    addSection,
    updateSection,
    deleteSection,
    markDirty,
    reset,
  }
})
