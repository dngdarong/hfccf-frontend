<script setup>
import { onMounted, ref } from 'vue'
import { useAssessmentWizard } from '../../composables/useAssessmentWizard'
import { assessmentFormApi } from '../../services/assessmentFormApi'
import QuestionRenderer from '../questions/QuestionRenderer.vue'

const { store } = useAssessmentWizard()

const sections = ref([])
const questions = ref([])
const isLoading = ref(false)

async function load() {
  if (!store.selectedForm) return
  isLoading.value = true
  try {
    const [sRes, qRes] = await Promise.all([
      assessmentFormApi.listSections(store.selectedForm.id),
      assessmentFormApi.listQuestions(store.selectedForm.id),
    ])
    sections.value = sRes.data.data
    questions.value = qRes.data.data
  } finally {
    isLoading.value = false
  }
}

function getQuestionsForSection(sectionId) {
  return questions.value
    .filter((q) => q.section_id === sectionId)
    .sort((a, b) => a.order - b.order)
}

onMounted(load)
</script>

<template>
  <div class="wizard-step-assessment">
    <div v-if="isLoading" class="wizard-step-assessment__loading">
      <i class="pi pi-spin pi-spinner" />
    </div>
    <template v-else>
      <div
        v-for="section in sections"
        :key="section.id"
        class="wizard-step-assessment__section"
      >
        <h4 class="wizard-step-assessment__section-title">{{ section.title }}</h4>
        <QuestionRenderer
          v-for="question in getQuestionsForSection(section.id)"
          :key="question.id"
          :question="question"
          :model-value="store.answers[`${question.id}_0`]?.answer_value"
          @update:model-value="(val) => store.setAnswer(question.id, val)"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.wizard-step-assessment {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.wizard-step-assessment__loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.wizard-step-assessment__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wizard-step-assessment__section-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}
</style>
