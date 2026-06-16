<script setup>
import Tag from 'primevue/tag'
import { useLanguage } from '@/composables/useLanguage'
import { useAssessmentWizard } from '../../composables/useAssessmentWizard'

const { t } = useLanguage()
const { store, answeredCount } = useAssessmentWizard()
</script>

<template>
  <div class="wizard-step-review">
    <h3>{{ t('assessmentWizard.review') }}</h3>

    <div class="wizard-step-review__meta">
      <div class="wizard-step-review__meta-item">
        <span class="wizard-step-review__label">{{ t('assessmentWizard.steps.form') }}</span>
        <span>{{ store.selectedForm?.name ?? '—' }}</span>
      </div>
      <div class="wizard-step-review__meta-item">
        <span class="wizard-step-review__label">{{ t('assessmentWizard.steps.student') }}</span>
        <span>{{ store.selectedStudent?.fullName ?? '—' }}</span>
      </div>
      <div class="wizard-step-review__meta-item">
        <span class="wizard-step-review__label">{{ t('submissions.answers') }}</span>
        <Tag :value="`${answeredCount} answered`" severity="info" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.wizard-step-review {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.wizard-step-review h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.wizard-step-review__meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.wizard-step-review__meta-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.wizard-step-review__label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  min-width: 120px;
}
</style>
