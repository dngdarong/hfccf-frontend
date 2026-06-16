<script setup>
import { onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useAssessmentWizard } from '../composables/useAssessmentWizard'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import WizardStepForm from '../components/wizard/WizardStepForm.vue'
import WizardStepStudent from '../components/wizard/WizardStepStudent.vue'
import WizardStepAssessment from '../components/wizard/WizardStepAssessment.vue'
import WizardStepReview from '../components/wizard/WizardStepReview.vue'

defineOptions({ name: 'AssessmentWizardPage' })

const router = useRouter()
const { t } = useLanguage()
const toast = useToast()
const confirm = useConfirm()
const { store } = useAssessmentWizard()

const stepItems = [
  { label: t('assessmentWizard.steps.form') },
  { label: t('assessmentWizard.steps.student') },
  { label: t('assessmentWizard.steps.assessment') },
  { label: t('assessmentWizard.steps.review') },
]

async function submitAssessment() {
  confirm.require({
    message: t('assessmentWizard.confirmSubmit'),
    accept: async () => {
      await store.submit()
      toast.add({ severity: 'success', summary: t('assessmentWizard.submitSuccess'), life: 3000 })
      router.push({ name: 'assessment-submission-list' })
    },
  })
}

onUnmounted(() => store.reset())
</script>

<template>
  <MainLayout>
    <div class="wizard">
      <HeaderSection :title="t('assessmentWizard.title')" />

      <div class="wizard__hero">
        <div class="wizard__hero-content">
          <h2 class="wizard__hero-title">✨ Assessment Wizard</h2>
          <p class="wizard__hero-subtitle">
            Complete assessment in 4 simple steps
          </p>
          <div class="wizard__progress">
            <div class="wizard__progress-info">
              <span class="wizard__progress-text">Step {{ store.currentStep + 1 }} of 4</span>
              <div class="wizard__progress-bar">
                <div class="wizard__progress-fill" :style="{ width: ((store.currentStep + 1) / 4) * 100 + '%' }" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="wizard__steps-overview">
        <div
          v-for="(step, index) in stepItems"
          :key="index"
          class="wizard__step-card"
          :class="{
            'wizard__step-card--active': index === store.currentStep,
            'wizard__step-card--completed': index < store.currentStep,
          }"
        >
          <div class="wizard__step-number">
            <span v-if="index < store.currentStep" class="wizard__step-check">✓</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="wizard__step-label">{{ step.label }}</div>
        </div>
      </div>

      <div class="wizard__content">
        <div class="wizard__content-header">
          <h3 class="wizard__content-title">{{ stepItems[store.currentStep].label }}</h3>
          <p class="wizard__content-subtitle">Step {{ store.currentStep + 1 }} of 4</p>
        </div>

        <div class="wizard__body">
          <WizardStepForm v-if="store.currentStep === 0" />
          <WizardStepStudent v-else-if="store.currentStep === 1" />
          <WizardStepAssessment v-else-if="store.currentStep === 2" />
          <WizardStepReview v-else-if="store.currentStep === 3" />
        </div>

        <div class="wizard__actions">
          <Button
            :label="t('assessmentWizard.navigation.back')"
            icon="pi pi-arrow-left"
            severity="secondary"
            :disabled="!store.canGoBack"
            @click="store.goBack()"
          />
          <Button
            :label="t('assessmentWizard.navigation.saveDraft')"
            icon="pi pi-save"
            severity="secondary"
            :loading="store.isSaving"
            @click="store.saveDraft()"
          />
          <div class="wizard__spacer" />
          <Button
            v-if="!store.isLastStep"
            :label="t('assessmentWizard.navigation.next')"
            icon="pi pi-arrow-right"
            icon-pos="right"
            :disabled="!store.canGoNext"
            @click="store.goNext()"
          />
          <Button
            v-else
            :label="t('assessmentWizard.navigation.submit')"
            icon="pi pi-check"
            :loading="store.isSubmitting"
            @click="submitAssessment"
          />
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.wizard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.wizard__hero {
  background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.wizard__hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.wizard__hero-content {
  position: relative;
  z-index: 1;
}

.wizard__hero-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 800;
  color: white;
}

.wizard__hero-subtitle {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.wizard__progress {
  max-width: 400px;
}

.wizard__progress-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.wizard__progress-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.wizard__progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.wizard__progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  transition: width 0.3s ease;
}

.wizard__steps-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.wizard__step-card {
  background: var(--surface-card);
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.wizard__step-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.wizard__step-card--active {
  border-color: #a855f7;
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
}

.wizard__step-card--completed {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.wizard__step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f5f9;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.wizard__step-card--active .wizard__step-number {
  background: #a855f7;
  color: white;
}

.wizard__step-card--completed .wizard__step-number {
  background: #10b981;
  color: white;
}

.wizard__step-check {
  font-size: 1.5rem;
}

.wizard__step-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
}

.wizard__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.wizard__content-header {
  margin-bottom: 0.5rem;
}

.wizard__content-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.wizard__content-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

.wizard__body {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 2rem;
  min-height: 400px;
}

.wizard__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.wizard__spacer {
  flex: 1;
}

@media (max-width: 1024px) {
  .wizard__steps-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .wizard__hero {
    padding: 2rem;
  }

  .wizard__hero-title {
    font-size: 1.5rem;
  }

  .wizard__steps-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .wizard__body {
    padding: 1.5rem;
  }

  .wizard__actions {
    flex-direction: column;
  }

  .wizard__spacer {
    display: none;
  }
}

@media (max-width: 480px) {
  .wizard__steps-overview {
    grid-template-columns: 1fr;
  }
}
</style>
