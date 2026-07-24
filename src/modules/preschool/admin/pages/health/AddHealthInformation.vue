<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchPreschoolStudents } from '@/modules/preschool/services/preschoolApi'
import {
  saveStudentMedicalProfile,
  saveStudentHealthAllergy,
  saveStudentHealthMedication,
  saveStudentHealthVaccination,
  saveStudentHealthContact,
  saveStudentHealthIncident,
} from '@/modules/preschool/services/api/preschoolHealthApi'
import { resolveAvatarSource } from '@/utils/avatar'
import HealthRecordForm from './components/HealthRecordForm.vue'

defineOptions({
  name: 'AddHealthInformationPage',
})

const router = useRouter()
const { t } = useLanguage()

const students = ref([])
const selectedStudentId = ref(null)
const searchQuery = ref('')
const loading = ref(false)
const formLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const currentStep = ref(1)

const selectedStudent = computed(() => {
  if (!selectedStudentId.value) return null
  return students.value.find(s => s.id === selectedStudentId.value)
})

const filteredStudents = computed(() => {
  if (!searchQuery.value.trim()) return students.value

  const query = searchQuery.value.toLowerCase()
  return students.value.filter(student => {
    const name = (student.fullName || student.name || '').toLowerCase()
    const code = (student.code || '').toLowerCase()
    return name.includes(query) || code.includes(query)
  })
})

const hasSelectedStudent = computed(() => selectedStudentId.value !== null && selectedStudent.value)

async function loadStudents() {
  loading.value = true
  try {
    const response = await fetchPreschoolStudents({ page: 1, perPage: 100 })
    students.value = (response.data || []).map(student => ({
      ...student,
      avatarUrl: resolveAvatarSource(student.avatarUrl || ''),
      fullName: student.fullName || student.name || '-',
      className: Array.isArray(student.classes) && student.classes.length
        ? student.classes.map(item => item?.name || item?.code || '').filter(Boolean).join(', ')
        : student.className || student.class?.name || student.class?.code || '-',
    }))
  } catch (error) {
    errorMessage.value = t('preschoolHealthPage.messages.loadFailed')
    console.error('Failed to load students:', error)
  } finally {
    loading.value = false
  }
}

async function handleFormSave(payload) {
  if (!selectedStudent.value) {
    errorMessage.value = t('preschoolHealthPage.messages.studentRequired')
    return
  }

  formLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const studentId = selectedStudent.value.id

    if (payload.basicInfo) {
      await saveStudentMedicalProfile(studentId, payload.basicInfo)
    }

    if (Array.isArray(payload.conditions)) {
      for (const condition of payload.conditions) {
        if (condition.condition_name) {
          await saveStudentHealthIncident(studentId, {
            ...condition,
            type: 'condition',
          })
        }
      }
    }

    if (Array.isArray(payload.allergies)) {
      for (const allergy of payload.allergies) {
        if (allergy.allergy_name) {
          await saveStudentHealthAllergy(studentId, allergy)
        }
      }
    }

    if (Array.isArray(payload.medications)) {
      for (const medication of payload.medications) {
        if (medication.medication_name) {
          await saveStudentHealthMedication(studentId, medication)
        }
      }
    }

    if (Array.isArray(payload.vaccinations)) {
      for (const vaccination of payload.vaccinations) {
        if (vaccination.vaccine_name) {
          await saveStudentHealthVaccination(studentId, vaccination)
        }
      }
    }

    if (Array.isArray(payload.emergencyContacts)) {
      for (const contact of payload.emergencyContacts) {
        if (contact.contact_name) {
          await saveStudentHealthContact(studentId, contact)
        }
      }
    }

    successMessage.value = t('preschoolHealthPage.messages.profileSaved')
    setTimeout(() => {
      router.push('/module/preschool-admin/health')
    }, 1500)
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || t('preschoolHealthPage.messages.saveFailed')
    console.error('Failed to save health information:', error)
  } finally {
    formLoading.value = false
  }
}

function selectStudent(student) {
  selectedStudentId.value = student.id
  searchQuery.value = ''
  currentStep.value = 2
}

function changeStudent() {
  selectedStudentId.value = null
  currentStep.value = 1
}

function closeForm() {
  router.push('/module/preschool-admin/health')
}

onMounted(() => {
  loadStudents()
})
</script>

<template>
  <MainLayout>
    <HeaderSection
      :title="t('preschoolHealthPage.records.addHealth')"
      :subtitle="t('preschoolHealthPage.records.subtitle')"
      :breadcrumbs="[
        { label: t('common.breadcrumb.preschool'), path: '/module/preschool-admin' },
        { label: t('common.breadcrumb.health'), path: '/module/preschool-admin/health' },
        { label: t('preschoolHealthPage.records.add'), path: '' },
      ]"
    />

    <div class="add-health-container">
      <!-- Progress Indicator -->
      <div class="progress-indicator">
        <div class="progress-step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <div class="progress-circle">1</div>
          <span class="progress-label">{{ t('common.breadcrumb.students') }}</span>
        </div>
        <div class="progress-line" :class="{ active: currentStep > 1 }" />
        <div class="progress-step" :class="{ active: currentStep >= 2 }">
          <div class="progress-circle">2</div>
          <span class="progress-label">{{ t('preschoolHealthPage.records.healthInformation') }}</span>
        </div>
      </div>

      <!-- Error/Success Messages -->
      <div v-if="errorMessage" class="alert alert-error">
        <span class="alert-icon">⚠️</span>
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="alert alert-success">
        <span class="alert-icon">✓</span>
        {{ successMessage }}
      </div>

      <!-- Step 1: Student Selection -->
      <div v-if="currentStep === 1" class="step-container">
        <div class="step-header">
          <h2>{{ t('common.breadcrumb.students') }}</h2>
          <p>{{ t('common.breadcrumb.health') }}</p>
        </div>

        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('preschoolHealthPage.records.searchPlaceholder')"
            class="search-input"
            @focus="$event.target.select()"
          />
          <span class="search-icon">🔍</span>
        </div>

        <div v-if="loading" class="loading-container">
          <div class="spinner" />
          <p>{{ t('preschoolHealthPage.messages.loading') }}</p>
        </div>

        <div v-else-if="filteredStudents.length === 0" class="empty-container">
          <div class="empty-icon">👥</div>
          <p class="empty-title">{{ t('preschoolHealthPage.records.noStudents') }}</p>
          <p class="empty-subtitle">{{ t('preschoolHealthPage.records.noResults') }}</p>
        </div>

        <div v-else class="students-container">
          <button
            v-for="student in filteredStudents"
            :key="student.id"
            class="student-tile"
            @click="selectStudent(student)"
          >
            <div class="tile-avatar">
              <img v-if="student.avatarUrl" :src="student.avatarUrl" :alt="student.fullName" />
              <div v-else class="avatar-placeholder">
                {{ student.fullName.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="tile-content">
              <h3 class="tile-name">{{ student.fullName }}</h3>
              <div class="tile-meta">
                <span v-if="student.code" class="meta-item">{{ student.code }}</span>
                <span class="meta-item">{{ student.className }}</span>
              </div>
            </div>
            <div class="tile-arrow">→</div>
          </button>
        </div>
      </div>

      <!-- Step 2: Health Information -->
      <div v-else-if="currentStep === 2 && hasSelectedStudent" class="step-container">
        <div class="step-header">
          <h2>{{ t('preschoolHealthPage.records.healthInformation') }}</h2>
          <p>{{ selectedStudent.fullName }}</p>
        </div>

        <!-- Selected Student Card -->
        <div class="student-card">
          <div class="card-left">
            <div class="card-avatar">
              <img v-if="selectedStudent.avatarUrl" :src="selectedStudent.avatarUrl" :alt="selectedStudent.fullName" />
              <div v-else class="avatar-placeholder">
                {{ selectedStudent.fullName.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="card-info">
              <div class="info-name">{{ selectedStudent.fullName }}</div>
              <div class="info-meta">
                <span v-if="selectedStudent.code">{{ selectedStudent.code }}</span>
                <span>{{ selectedStudent.className }}</span>
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            :label="t('common.cancel')"
            @click="changeStudent"
          />
        </div>

        <!-- Health Form -->
        <div class="form-wrapper">
          <HealthRecordForm
            :student="selectedStudent"
            :profile="null"
            mode="add"
            :loading="formLoading"
            @save="handleFormSave"
            @close="closeForm"
          />
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.add-health-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

/* Progress Indicator */
.progress-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

@media (prefers-color-scheme: dark) {
  .progress-indicator {
    background: #1e293b;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.progress-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  background: #e2e8f0;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1.1rem;
  color: #64748b;
  transition: all 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .progress-circle {
    background: #334155;
    color: #cbd5e1;
  }
}

.progress-step.active .progress-circle {
  background: #1d4ed8;
  color: white;
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
}

.progress-step.completed .progress-circle {
  background: #10b981;
  color: white;
}

.progress-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  text-align: center;
  max-width: 90px;
}

.progress-step.active .progress-label {
  color: #1d4ed8;
  font-weight: 700;
}

.progress-step.completed .progress-label {
  color: #10b981;
}

.progress-line {
  width: 3rem;
  height: 2px;
  background: #e2e8f0;
  transition: all 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .progress-line {
    background: #475569;
  }
}

.progress-line.active {
  background: #10b981;
}

/* Alerts */
.alert {
  padding: 1rem 1.5rem;
  border-radius: 0.85rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-error {
  background: #fff1f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

@media (prefers-color-scheme: dark) {
  .alert-error {
    background: #7f1d1d;
    border-color: #dc2626;
    color: #fca5a5;
  }
}

.alert-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

@media (prefers-color-scheme: dark) {
  .alert-success {
    background: #064e3b;
    border-color: #10b981;
    color: #86efac;
  }
}

.alert-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

/* Step Container */
.step-container {
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

@media (prefers-color-scheme: dark) {
  .step-container {
    background: #1e293b;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
}

.step-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

@media (prefers-color-scheme: dark) {
  .step-header {
    border-bottom-color: #475569;
  }
}

.step-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

@media (prefers-color-scheme: dark) {
  .step-header h2 {
    color: #f1f5f9;
  }
}

.step-header p {
  margin: 0;
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 500;
}

/* Search Box */
.search-box {
  position: relative;
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 0.95rem 1.2rem 0.95rem 3rem;
  font-size: 0.95rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.85rem;
  background: #f8fafc;
  color: #0f172a;
  font-family: inherit;
  transition: all 0.2s ease;
}

@media (prefers-color-scheme: dark) {
  .search-input {
    background: #0f172a;
    color: #f1f5f9;
    border-color: #475569;
  }
}

.search-input:focus {
  outline: none;
  border-color: #1d4ed8;
  background: white;
  box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.1);
}

@media (prefers-color-scheme: dark) {
  .search-input:focus {
    background: #1e293b;
  }
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  pointer-events: none;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e2e8f0;
  border-top-color: #1d4ed8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: #64748b;
  font-weight: 500;
}

/* Empty State */
.empty-container {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  .empty-title {
    color: #f1f5f9;
  }
}

.empty-subtitle {
  font-size: 0.9rem;
  color: #94a3b8;
}

/* Students Grid */
.students-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.student-tile {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-family: inherit;
  font-size: 0.9rem;
}

@media (prefers-color-scheme: dark) {
  .student-tile {
    background: #334155;
    border-color: #475569;
  }
}

.student-tile:hover {
  border-color: #1d4ed8;
  background: white;
  box-shadow: 0 4px 16px rgba(29, 78, 216, 0.12);
  transform: translateY(-2px);
}

@media (prefers-color-scheme: dark) {
  .student-tile:hover {
    background: #1e293b;
  }
}

.tile-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  background: #e2e8f0;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (prefers-color-scheme: dark) {
  .tile-avatar {
    background: #475569;
  }
}

.tile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-weight: 700;
  font-size: 1.2rem;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tile-content {
  flex: 1;
}

.tile-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}

@media (prefers-color-scheme: dark) {
  .tile-name {
    color: #f1f5f9;
  }
}

.tile-meta {
  margin-top: 0.4rem;
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
}

.meta-item {
  color: #64748b;
}

.tile-arrow {
  font-size: 1.2rem;
  color: #1d4ed8;
  opacity: 0;
  transform: translateX(-0.5rem);
  transition: all 0.2s ease;
}

.student-tile:hover .tile-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Student Card (Step 2) */
.student-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0f4f8 0%, #e8ecf1 100%);
  border: 1px solid #d4dfe7;
  border-radius: 0.9rem;
  margin-bottom: 2rem;
}

@media (prefers-color-scheme: dark) {
  .student-card {
    background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
    border-color: #475569;
  }
}

.card-left {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.card-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: #e2e8f0;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (prefers-color-scheme: dark) {
  .card-avatar {
    background: #475569;
  }
}

.card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: #0f172a;
}

@media (prefers-color-scheme: dark) {
  .info-name {
    color: #f1f5f9;
  }
}

.info-meta {
  font-size: 0.8rem;
  color: #64748b;
  display: flex;
  gap: 0.75rem;
}

/* Form Wrapper */
.form-wrapper {
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .add-health-container {
    padding: 1rem;
  }

  .progress-indicator {
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .progress-step {
    width: 100%;
  }

  .progress-line {
    width: 2px;
    height: 1.5rem;
  }

  .step-container {
    padding: 1.5rem;
  }

  .students-container {
    grid-template-columns: 1fr;
  }

  .student-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
