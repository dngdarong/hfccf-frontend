<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { createSportDivision, fetchSportDivision, updateSportDivision } from '@/modules/sport/services/sportApi'

defineOptions({
  name: 'SportAddDivisionPage',
})

const router = useRouter()
const route = useRoute()

const isEditMode = computed(() => route.query.mode === 'edit' || !!route.params.id)
const divisionId = computed(() => route.params.id)
const pageTitle = computed(() =>
  isEditMode.value ? 'Edit Division' : 'Create New Division',
)
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Update division details'
    : 'Add a new division to organize teams',
)

const form = ref({
  name: '',
  description: '',
  status: 'active',
})

const errors = ref({})
const isSubmitting = ref(false)

function validateForm() {
  errors.value = {}

  if (!form.value.name?.trim()) {
    errors.value.name = 'Division name is required'
  }

  if (form.value.name && form.value.name.length > 100) {
    errors.value.name = 'Division name must be 100 characters or less'
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
      await updateSportDivision(divisionId.value, form.value)
    } else {
      await createSportDivision(form.value)
    }

    await router.push({ name: 'dashboard-sport-admin-divisions' })
  } catch (error) {
    console.error('Error saving division:', error)
    alert('Failed to save division')
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  router.back()
}

onMounted(async () => {
  if (isEditMode.value && divisionId.value) {
    try {
      const division = await fetchSportDivision(divisionId.value)
      form.value = {
        name: division.name,
        description: division.description,
        status: division.status,
      }
    } catch (error) {
      console.error('Error loading division:', error)
      alert('Failed to load division')
    }
  }
})
</script>

<template>
  <MainLayout>
    <section class="add-division-page">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <div class="form-container">
        <form @submit.prevent="handleSubmit" class="division-form">
          <div class="form-group">
            <label for="name" class="form-label">Division Name *</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="e.g., Division A, Premier League"
              class="form-input"
              :class="{ 'form-input--error': errors.name }"
              maxlength="100"
            />
            <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
          </div>

          <div class="form-group">
            <label for="description" class="form-label">Description</label>
            <textarea
              id="description"
              v-model="form.description"
              placeholder="Enter division description (optional)"
              class="form-textarea"
              rows="4"
              maxlength="500"
            />
            <p class="form-hint">{{ form.description.length }}/500</p>
          </div>

          <div class="form-group">
            <label for="status" class="form-label">Status</label>
            <select v-model="form.status" id="status" class="form-select">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving...' : isEditMode ? 'Update Division' : 'Create Division' }}
            </button>
            <button type="button" class="btn-secondary" @click="handleCancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.add-division-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.form-container {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.division-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 600;
  display: block;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border-radius: 0.9rem;
  border: 1px solid #dbe6f4;
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input--error,
.form-input--error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-error {
  margin: 0;
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 500;
}

.form-hint {
  margin: 0;
  color: #94a3b8;
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 0.75rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.9rem;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-secondary:hover {
  background: #cbd5e1;
}

@media (max-width: 640px) {
  .form-container {
    padding: 1.1rem;
  }

  .division-form {
    gap: 1.2rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
