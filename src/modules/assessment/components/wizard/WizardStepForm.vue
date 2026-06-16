<script setup>
import { onMounted, ref } from 'vue'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import { assessmentFormApi } from '../../services/assessmentFormApi'
import { useAssessmentWizard } from '../../composables/useAssessmentWizard'

const { t } = useLanguage()
const { store, selectForm } = useAssessmentWizard()

const forms = ref([])
const isLoading = ref(false)

async function load() {
  isLoading.value = true
  try {
    const res = await assessmentFormApi.list({ module: 'preschool', status: 'published' })
    forms.value = res.data.data
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="wizard-step-form">
    <h3>{{ t('assessmentWizard.selectForm') }}</h3>
    <Select
      :model-value="store.selectedForm"
      :options="forms"
      option-label="name"
      :loading="isLoading"
      :placeholder="t('assessmentWizard.selectForm')"
      class="w-full"
      @update:model-value="selectForm"
    />
  </div>
</template>

<style scoped>
.wizard-step-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wizard-step-form h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}
</style>
