<script setup>
import { onMounted, ref } from 'vue'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import { useAssessmentWizard } from '../../composables/useAssessmentWizard'
import { fetchPreschoolStudents } from '@/modules/preschool/services/preschoolApi'

const { t } = useLanguage()
const { store, selectStudent } = useAssessmentWizard()

const students = ref([])
const isLoading = ref(false)

async function load() {
  isLoading.value = true
  try {
    const response = await fetchPreschoolStudents({ perPage: 200 })
    students.value = response.students
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="wizard-step-student">
    <h3>{{ t('assessmentWizard.selectStudent') }}</h3>
    <Select
      :model-value="store.selectedStudent"
      :options="students"
      option-label="fullName"
      :loading="isLoading"
      :placeholder="t('assessmentWizard.selectStudent')"
      filter
      class="w-full"
      @update:model-value="selectStudent"
    />
  </div>
</template>

<style scoped>
.wizard-step-student {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wizard-step-student h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}
</style>
