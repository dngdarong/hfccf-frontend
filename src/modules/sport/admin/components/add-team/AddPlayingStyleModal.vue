<script setup>
import { computed, ref } from 'vue'
import { createSportPlayingStyle } from '@/modules/sport/services/sportApi'

defineOptions({
  name: 'AddPlayingStyleModal',
})

defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close', 'created'])

const form = ref({
  name: '',
  description: '',
  status: 'active',
})

const errors = ref({})
const isSubmitting = ref(false)
const showSuccess = ref(false)

const descriptionLength = computed(() => form.value.description.length)
const nameLength = computed(() => form.value.name.length)
const formCompletion = computed(() => {
  let completion = 0
  if (form.value.name?.trim()) completion += 50
  if (form.value.description?.trim()) completion += 30
  if (form.value.status) completion += 20
  return completion
})

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
    const newStyle = await createSportPlayingStyle(form.value)
    showSuccess.value = true

    // Emit the created style so parent can update dropdown
    emit('created', newStyle)

    // Reset form
    form.value = {
      name: '',
      description: '',
      status: 'active',
    }

    // Close modal after short delay
    setTimeout(() => {
      handleClose()
    }, 1500)
  } catch (error) {
    console.error('Error creating playing style:', error)
    errors.value.submit = 'Failed to create playing style'
  } finally {
    isSubmitting.value = false
  }
}

function handleClose() {
  showSuccess.value = false
  form.value = {
    name: '',
    description: '',
    status: 'active',
  }
  errors.value = {}
  emit('close')
}

function handleBackdropClick(event) {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}
</script>

<template>
  <transition name="modal">
    <div v-if="isOpen" class="modal-backdrop" @click="handleBackdropClick">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">Create New Playing Style</h2>
          <p class="modal-subtitle">Define a tactical approach for team classification</p>
          <button class="modal-close" @click="handleClose" aria-label="Close">×</button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="modal-form">
          <!-- Progress Bar -->
          <div class="progress-bar-wrapper">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${formCompletion}%` }" />
            </div>
            <p class="progress-text">{{ formCompletion }}% Complete</p>
          </div>

          <!-- Name Field -->
          <div class="form-group">
            <div class="form-label-wrapper">
              <label for="style-name" class="form-label">
                <span class="label-text">Playing Style Name</span>
                <span class="label-required">*</span>
              </label>
              <span class="char-count">{{ nameLength }}/100</span>
            </div>
            <input
              id="style-name"
              v-model="form.name"
              type="text"
              placeholder="e.g., Defensive, Attacking, Balanced"
              class="form-input"
              :class="{ 'form-input--error': errors.name, 'form-input--valid': form.name && !errors.name }"
              maxlength="100"
            />
            <p v-if="errors.name" class="form-error">
              <span class="error-icon">⚠</span> {{ errors.name }}
            </p>
          </div>

          <!-- Description Field -->
          <div class="form-group">
            <div class="form-label-wrapper">
              <label for="style-description" class="form-label">
                <span class="label-text">Description</span>
                <span class="label-optional">(Optional)</span>
              </label>
              <span class="char-count">{{ descriptionLength }}/500</span>
            </div>
            <textarea
              id="style-description"
              v-model="form.description"
              placeholder="Describe the tactical approach..."
              class="form-textarea"
              rows="3"
              maxlength="500"
            />
          </div>

          <!-- Status Field -->
          <div class="form-group">
            <label class="form-label">
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
                  :id="`style-status-${option}`"
                  :value="option"
                  v-model="form.status"
                  class="status-radio"
                />
                <label :for="`style-status-${option}`" class="status-label">
                  <span class="status-dot" :class="`status-dot--${option}`" />
                  <span class="status-text">{{ option === 'active' ? 'Active' : 'Inactive' }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errors.submit" class="error-message">
            <span class="error-icon">!</span>
            <span>{{ errors.submit }}</span>
          </div>

          <!-- Success Message -->
          <transition name="fade">
            <div v-if="showSuccess" class="success-message">
              <span class="success-icon">✓</span>
              <span>Playing style created successfully!</span>
            </div>
          </transition>

          <!-- Actions -->
          <div class="modal-actions">
            <button
              type="submit"
              class="btn-primary"
              :disabled="isSubmitting"
              :class="{ 'btn-loading': isSubmitting }"
            >
              <span v-if="isSubmitting" class="btn-spinner" />
              {{ isSubmitting ? 'Creating...' : 'Create Style' }}
            </button>
            <button
              type="button"
              class="btn-secondary"
              @click="handleClose"
              :disabled="isSubmitting"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(2px);
}

.modal-container {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  position: sticky;
  top: 0;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  z-index: 10;
}

.modal-title {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 700;
}

.modal-subtitle {
  margin: 0.5rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.modal-close {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: rgba(59, 130, 246, 0.1);
  color: #0f172a;
  font-size: 1.75rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(59, 130, 246, 0.2);
}

.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Progress Bar */
.progress-bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  height: 0.4rem;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  transition: width 0.3s ease;
}

.progress-text {
  margin: 0;
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}

/* Form Groups */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

/* Inputs */
.form-input,
.form-textarea {
  padding: 0.75rem 0.9rem;
  border-radius: 0.9rem;
  border: 1.5px solid #dbe6f4;
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.2s;
  background: white;
}

.form-input:hover,
.form-textarea:hover {
  border-color: #cbd5e1;
}

.form-input:focus,
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
  min-height: 80px;
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

/* Status Selector */
.status-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.status-option {
  cursor: pointer;
}

.status-radio {
  display: none;
}

.status-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem;
  border-radius: 0.85rem;
  border: 1.5px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.status-option--selected .status-label {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.status-dot {
  display: inline-block;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
}

.status-dot--active {
  background: #10b981;
}

.status-dot--inactive {
  background: #9ca3af;
}

.status-text {
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Messages */
.error-message,
.success-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 0.85rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.success-message {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  animation: slideIn 0.3s ease;
}

.success-icon {
  font-weight: 700;
}

/* Actions */
.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 0.8rem 1.25rem;
  border-radius: 0.9rem;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  pointer-events: none;
}

.btn-spinner {
  display: inline-block;
  width: 0.9rem;
  height: 0.9rem;
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
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.modal-backdrop.modal-enter-from,
.modal-backdrop.modal-leave-to {
  backdrop-filter: blur(0px);
}

/* Responsive */
@media (max-width: 640px) {
  .modal-backdrop {
    padding: 0;
  }

  .modal-container {
    border-radius: 1.5rem 1.5rem 0 0;
    max-height: 95vh;
  }

  .status-selector {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
