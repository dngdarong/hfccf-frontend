<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { createSportPlayingStyle, fetchSportPlayingStyle, updateSportPlayingStyle } from '@/modules/sport/services/sportApi'

defineOptions({
  name: 'SportAddPlayingStylePage',
})

const router = useRouter()
const route = useRoute()

const isEditMode = computed(() => route.query.mode === 'edit' || !!route.params.id)
const styleId = computed(() => route.params.id)
const pageTitle = computed(() =>
  isEditMode.value ? 'Edit Playing Style' : 'Create New Playing Style',
)
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Update playing style details and tactical approach'
    : 'Define a new tactical approach for team classification',
)

const form = ref({
  name: '',
  description: '',
  status: 'active',
})

const errors = ref({})
const isSubmitting = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')

const descriptionLength = computed(() => form.value.description.length)
const nameLength = computed(() => form.value.name.length)
const formCompletion = computed(() => {
  let completion = 0
  if (form.value.name?.trim()) completion += 50
  if (form.value.description?.trim()) completion += 30
  if (form.value.status) completion += 20
  return completion
})

const formSummaryCards = computed(() => [
  {
    id: 'style-name',
    title: 'Style Name',
    value: form.value.name || 'Not specified',
    label: 'Primary identifier for this playing style',
    status: form.value.name ? 'success' : 'warning',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    id: 'style-status',
    title: 'Status',
    value: form.value.status === 'active' ? 'Active' : 'Inactive',
    label: 'Controls visibility and team assignment',
    status: form.value.status,
    icon: 'M5 13l4 4L19 7',
  },
  {
    id: 'form-progress',
    title: 'Form Progress',
    value: `${formCompletion.value}%`,
    label: 'Complete your playing style definition',
    status: formCompletion.value === 100 ? 'success' : 'warning',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
])

function validateForm() {
  errors.value = {}

  if (!form.value.name?.trim()) {
    errors.value.name = 'Playing style name is required'
  }

  if (form.value.name && form.value.name.length > 100) {
    errors.value.name = 'Playing style name must be 100 characters or less'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    if (isEditMode.value) {
      await updateSportPlayingStyle(styleId.value, form.value)
    } else {
      await createSportPlayingStyle(form.value)
    }

    showSuccess.value = true
    setTimeout(() => {
      router.push({ name: 'dashboard-sport-admin-playing-styles' })
    }, 1500)
  } catch (error) {
    console.error('Error saving playing style:', error)
    errorMessage.value = isEditMode.value
      ? 'Failed to update playing style'
      : 'Failed to create playing style'
    showError.value = true
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  router.back()
}

onMounted(async () => {
  if (isEditMode.value && styleId.value) {
    try {
      const style = await fetchSportPlayingStyle(styleId.value)
      form.value = {
        name: style.name,
        description: style.description,
        status: style.status,
      }
    } catch (error) {
      console.error('Error loading playing style:', error)
      errorMessage.value = 'Failed to load playing style'
      showError.value = true
    }
  }
})
</script>

<template>
  <MainLayout>
    <section class="add-playing-style-page">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <!-- Summary Cards -->
      <div class="summary-cards-grid">
        <div
          v-for="card in formSummaryCards"
          :key="card.id"
          class="summary-card"
          :class="`summary-card--${card.status}`"
        >
          <div class="summary-card-header">
            <div>
              <p class="summary-card-title">{{ card.title }}</p>
              <p class="summary-card-value">{{ card.value }}</p>
            </div>
            <span class="summary-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path :d="card.icon" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
          <p class="summary-card-label">{{ card.label }}</p>
        </div>
      </div>

      <!-- Form Container -->
      <div class="form-shell">
        <form @submit.prevent="handleSubmit" class="playing-style-form">
          <!-- Form Section Header -->
          <div class="form-section-header">
            <h3>Playing Style Details</h3>
            <p class="form-section-description">
              Define the tactical characteristics and strategic approach for this playing style
            </p>
          </div>

          <!-- Name Field -->
          <div class="form-group">
            <div class="form-label-wrapper">
              <label for="name" class="form-label">
                <span class="label-text">Playing Style Name</span>
                <span class="label-required">*</span>
              </label>
              <span class="char-count" :class="{ 'char-count--warning': nameLength > 80 }">
                {{ nameLength }}/100
              </span>
            </div>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="e.g., Defensive, Attacking, Balanced, High Press, Possession"
              class="form-input"
              :class="{ 'form-input--error': errors.name, 'form-input--valid': form.name && !errors.name }"
              maxlength="100"
            />
            <p v-if="errors.name" class="form-error">
              <span class="error-icon">⚠</span> {{ errors.name }}
            </p>
            <p v-else class="form-hint">Give your playing style a clear, descriptive name</p>
          </div>

          <!-- Description Field -->
          <div class="form-group">
            <div class="form-label-wrapper">
              <label for="description" class="form-label">
                <span class="label-text">Description</span>
                <span class="label-optional">(Optional)</span>
              </label>
              <span class="char-count">{{ descriptionLength }}/500</span>
            </div>
            <textarea
              id="description"
              v-model="form.description"
              placeholder="Describe the tactical approach, formation preferences, and key characteristics of this playing style..."
              class="form-textarea"
              rows="5"
              maxlength="500"
            />
            <p class="form-hint">
              Provide context about team tactics, formation preferences, and strategic approach
            </p>
          </div>

          <!-- Status Field -->
          <div class="form-group">
            <label for="status" class="form-label">
              <span class="label-text">Status</span>
              <span class="label-required">*</span>
            </label>
            <div class="status-selector">
              <div
                v-for="option in ['active', 'inactive']"
                :key="option"
                class="status-option"
                :class="{ 'status-option--selected': form.status === option }"
                @click="form.status = option"
              >
                <input
                  type="radio"
                  :id="`status-${option}`"
                  :value="option"
                  v-model="form.status"
                  class="status-radio"
                />
                <label :for="`status-${option}`" class="status-label">
                  <span class="status-dot" :class="`status-dot--${option}`" />
                  <span class="status-text">{{ option === 'active' ? 'Active' : 'Inactive' }}</span>
                </label>
              </div>
            </div>
            <p class="form-hint">
              Active styles are available for team assignment. Inactive styles are hidden from selection.
            </p>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button
              type="submit"
              class="btn-primary"
              :disabled="isSubmitting"
              :class="{ 'btn-loading': isSubmitting }"
            >
              <span v-if="isSubmitting" class="btn-spinner" />
              {{ isSubmitting ? 'Saving...' : isEditMode ? 'Update Playing Style' : 'Create Playing Style' }}
            </button>
            <button type="button" class="btn-secondary" @click="handleCancel" :disabled="isSubmitting">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Success Message -->
      <transition name="fade">
        <div v-if="showSuccess" class="success-banner">
          <span class="success-icon">✓</span>
          <span>{{ isEditMode ? 'Playing style updated successfully!' : 'Playing style created successfully!' }}</span>
        </div>
      </transition>

      <!-- Error Message -->
      <transition name="fade">
        <div v-if="showError" class="error-banner">
          <span class="error-close" @click="showError = false">×</span>
          <span class="error-icon">!</span>
          <span>{{ errorMessage }}</span>
        </div>
      </transition>
    </section>
  </MainLayout>
</template>

<style scoped>
.add-playing-style-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

/* Summary Cards Grid */
.summary-cards-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.35rem;
  border-radius: 1.35rem;
  border: 1px solid #dbe6f4;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 252, 0.98) 100%);
  box-shadow: 0 24px 48px -38px rgba(15, 23, 42, 0.45);
  transition: all 0.2s ease;
}

.summary-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
}

.summary-card-title {
  margin: 0;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-card-value {
  margin: 0.65rem 0 0;
  color: #0f172a;
  font-size: 1.5rem;
  line-height: 1;
  font-weight: 800;
}

.summary-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.95rem;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.18);
  color: #3b82f6;
}

.summary-card-icon svg {
  width: 1.15rem;
  height: 1.15rem;
}

.summary-card-label {
  margin: 0;
  color: #475569;
  font-size: 0.88rem;
  line-height: 1.55;
}

.summary-card--success {
  border-color: #d1fae5;
  background: linear-gradient(180deg, rgba(240, 253, 250, 0.98) 0%, rgba(236, 253, 245, 0.98) 100%);
}

.summary-card--success .summary-card-icon {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.18);
  color: #10b981;
}

.summary-card--warning {
  border-color: #fef3c7;
  background: linear-gradient(180deg, rgba(254, 252, 232, 0.98) 0%, rgba(254, 250, 224, 0.98) 100%);
}

.summary-card--warning .summary-card-icon {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.18);
  color: #f59e0b;
}

/* Form Container */
.form-shell {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  padding: 2rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.form-section-header {
  margin-bottom: 0.5rem;
}

.form-section-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 700;
}

.form-section-description {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.playing-style-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.form-label-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.form-label {
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.label-text {
  display: block;
}

.label-required {
  color: #ef4444;
  font-weight: 700;
}

.label-optional {
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 400;
}

.char-count {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}

.char-count--warning {
  color: #f59e0b;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.9rem 1rem;
  border-radius: 0.95rem;
  border: 1.5px solid #dbe6f4;
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background: white;
}

.form-input:hover,
.form-select:hover,
.form-textarea:hover {
  border-color: #cbd5e1;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input--error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.02);
}

.form-input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-input--valid {
  border-color: #10b981;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-error {
  margin: 0;
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.error-icon {
  font-weight: 700;
}

.form-hint {
  margin: 0;
  color: #94a3b8;
  font-size: 0.85rem;
  line-height: 1.5;
}

/* Status Selector */
.status-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.status-option {
  position: relative;
  cursor: pointer;
}

.status-radio {
  display: none;
}

.status-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.95rem;
  border: 1.5px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-option--selected .status-label {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.status-dot {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.status-dot--active {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.status-dot--inactive {
  background: #9ca3af;
  box-shadow: 0 0 0 3px rgba(156, 163, 175, 0.15);
}

.status-text {
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.85rem 1.75rem;
  border-radius: 0.95rem;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-loading {
  pointer-events: none;
}

.btn-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-secondary {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-secondary:hover:not(:disabled) {
  background: #cbd5e1;
  transform: translateY(-1px);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Messages */
.success-banner,
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 0.95rem;
  font-size: 0.95rem;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.success-banner {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.success-icon {
  font-size: 1.25rem;
  font-weight: 700;
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  justify-content: space-between;
}

.error-close {
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: 300;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.error-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .summary-cards-grid {
    grid-template-columns: 1fr;
  }

  .form-shell {
    padding: 1.5rem;
  }

  .status-selector {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
