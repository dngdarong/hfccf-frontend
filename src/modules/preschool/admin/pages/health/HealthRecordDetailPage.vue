<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchPreschoolStudent } from '@/modules/preschool/services/preschoolApi'
import { fetchStudentMedicalProfile, deleteStudentMedicalProfile } from '@/modules/preschool/services/api/preschoolHealthApi'

defineOptions({
  name: 'HealthRecordDetailPage',
})

const router = useRouter()
const route = useRoute()
const { t } = useLanguage()

const student = ref(null)
const profile = ref(null)
const loading = ref(false)
const deleteLoading = ref(false)
const error = ref('')
const confirmDeleteOpen = ref(false)

const studentId = computed(() => route.params.studentId)

async function loadData() {
  if (!studentId.value) {
    error.value = t('preschoolHealthPage.messages.studentRequired')
    return
  }

  loading.value = true
  error.value = ''

  try {
    const [studentResponse, profileResponse] = await Promise.all([
      fetchPreschoolStudent(studentId.value),
      fetchStudentMedicalProfile(studentId.value),
    ])

    student.value = studentResponse
    profile.value = profileResponse?.medicalProfile || null
  } catch (err) {
    if (err?.response?.status === 404) {
      error.value = t('preschoolHealthPage.messages.studentNotFound')
    } else {
      error.value = err?.message || t('preschoolHealthPage.messages.loadFailed')
    }
  } finally {
    loading.value = false
  }
}

function handleBack() {
  router.push({ name: 'dashboard-preschool-admin-health' })
}

function handleEdit() {
  router.push({
    name: 'preschool-health-records-edit',
    params: { studentId: studentId.value },
  })
}

function openDeleteConfirm() {
  confirmDeleteOpen.value = true
}

async function handleDelete() {
  if (!studentId.value) return

  deleteLoading.value = true
  try {
    await deleteStudentMedicalProfile(studentId.value)
    confirmDeleteOpen.value = false
    await router.push({ name: 'dashboard-preschool-admin-health' })
  } finally {
    deleteLoading.value = false
  }
}

function closeDeleteDialog() {
  confirmDeleteOpen.value = false
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <MainLayout>
    <section class="health-record-detail-page">
      <HeaderSection
        :title="t('preschoolHealthPage.records.title')"
        :subtitle="t('preschoolHealthPage.records.subtitle')"
      />

      <div class="health-record-detail-page__content">
        <div v-if="loading" class="health-record-detail-page__loading">
          <i class="pi pi-spin pi-spinner" />
          <p>{{ t('preschoolHealthPage.messages.loading') }}</p>
        </div>

        <div v-else-if="error" class="health-record-detail-page__error">
          <p>{{ error }}</p>
          <Button
            type="button"
            variant="secondary"
            size="md"
            rounded="lg"
            :label="t('preschoolHealthPage.actions.backToStudents')"
            @click="handleBack"
          />
        </div>

        <template v-else-if="student && profile">
          <!-- Student Summary Card -->
          <div class="health-record-detail-page__student-card">
            <div class="student-summary">
              <div v-if="student.avatarUrl" class="student-summary__avatar">
                <img :src="student.avatarUrl" :alt="student.fullName" class="student-summary__image" />
              </div>
              <div v-else class="student-summary__avatar student-summary__avatar--fallback">
                {{ (student.fullName || '?').charAt(0) }}
              </div>
              <div class="student-summary__info">
                <h3 class="student-summary__name">{{ student.fullName || '-' }}</h3>
                <p class="student-summary__code">{{ student.publicId || student.studentCode || '-' }}</p>
              </div>
            </div>
          </div>

          <!-- Student Details Grid -->
          <div class="health-record-detail-page__details-grid">
            <div class="detail-field">
              <span class="detail-label">{{ t('preschoolHealthPage.records.gender') }}</span>
              <span class="detail-value">{{ student.gender || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ t('preschoolHealthPage.records.dateOfBirth') }}</span>
              <span class="detail-value">{{ student.dateOfBirth || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ t('preschoolHealthPage.records.class') }}</span>
              <span class="detail-value">{{ student.className || '-' }}</span>
            </div>
          </div>

          <!-- Health Information Section -->
          <div class="detail-section">
            <h4 class="detail-section-title">{{ t('preschoolHealthPage.records.healthInformation') }}</h4>

            <div class="detail-row">
              <div class="detail-field-block">
                <span class="detail-label">{{ t('preschoolHealthPage.records.bloodType') }}</span>
                <span class="detail-value">{{ profile.blood_type || '-' }}</span>
              </div>
              <div class="detail-field-block">
                <span class="detail-label">{{ t('preschoolHealthPage.records.height') }}</span>
                <span class="detail-value">{{ profile.height || '-' }}</span>
              </div>
              <div class="detail-field-block">
                <span class="detail-label">{{ t('preschoolHealthPage.records.weight') }}</span>
                <span class="detail-value">{{ profile.weight || '-' }}</span>
              </div>
              <div class="detail-field-block">
                <span class="detail-label">{{ t('preschoolHealthPage.records.specialNeeds') }}</span>
                <span class="detail-value">{{ profile.special_needs || '-' }}</span>
              </div>
            </div>

            <div class="detail-field-block">
              <span class="detail-label">{{ t('preschoolHealthPage.records.medicalNotes') }}</span>
              <span class="detail-value detail-value--multiline">{{ profile.medical_notes || '-' }}</span>
            </div>
          </div>
        </template>

        <template v-else-if="!loading && student && !profile">
          <div class="health-record-detail-page__empty">
            <p>{{ t('preschoolHealthPage.records.noProfile') }}</p>
          </div>
        </template>
      </div>

      <!-- Action Buttons -->
      <div v-if="!loading && student && profile" class="health-record-detail-page__actions">
        <Button
          type="button"
          variant="secondary"
          size="md"
          rounded="lg"
          :label="t('common.back')"
          @click="handleBack"
        />
        <div class="health-record-detail-page__action-group">
          <Button
            type="button"
            variant="secondary"
            size="md"
            rounded="lg"
            :label="t('common.edit')"
            @click="handleEdit"
          />
          <Button
            type="button"
            variant="danger"
            size="md"
            rounded="lg"
            :label="t('common.delete')"
            @click="openDeleteConfirm"
          />
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <div v-if="confirmDeleteOpen" class="delete-overlay" @click="closeDeleteDialog">
        <div class="delete-dialog" @click.stop>
          <div class="delete-header">
            <h3>{{ t('preschoolHealthPage.records.confirmDelete') }}</h3>
            <button class="delete-close" @click="closeDeleteDialog">&times;</button>
          </div>
          <div class="delete-body">
            <p>{{ t('preschoolHealthPage.records.deleteWarning') }}</p>
            <p class="delete-student">{{ student?.fullName || '-' }}</p>
          </div>
          <div class="delete-footer">
            <Button
              type="button"
              variant="secondary"
              size="md"
              rounded="lg"
              :label="t('common.cancel')"
              :disabled="deleteLoading"
              @click="closeDeleteDialog"
            />
            <Button
              type="button"
              variant="danger"
              size="md"
              rounded="lg"
              :label="t('common.delete')"
              :loading="deleteLoading"
              @click="handleDelete"
            />
          </div>
        </div>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.health-record-detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.health-record-detail-page__content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: #fff;
  border: 1px solid #dbe3ef;
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: 0 18px 36px -30px rgba(15, 23, 42, 0.45);
}

.health-record-detail-page__loading,
.health-record-detail-page__error,
.health-record-detail-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 8rem;
  gap: 1rem;
  color: #64748b;
  text-align: center;
}

.health-record-detail-page__error {
  color: #dc2626;
}

.health-record-detail-page__student-card {
  background: #f0f4f8;
  border: 1px solid #d4dfe7;
  border-radius: 0.85rem;
  padding: 1.25rem;
}

.student-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-summary__avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  overflow: hidden;
  flex-shrink: 0;
}

.student-summary__avatar--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  color: #1d4ed8;
  font-weight: 800;
  font-size: 1.2rem;
}

.student-summary__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-summary__info {
  min-width: 0;
  flex: 1;
}

.student-summary__name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.student-summary__code {
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  color: #64748b;
}

.health-record-detail-page__details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.detail-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.detail-value {
  font-size: 0.95rem;
  color: #0f172a;
}

.detail-value--multiline {
  white-space: pre-wrap;
  word-break: break-word;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-section-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
}

.detail-field-block {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.health-record-detail-page__actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #dbe3ef;
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: 0 18px 36px -30px rgba(15, 23, 42, 0.45);
}

.health-record-detail-page__action-group {
  display: flex;
  gap: 1rem;
}

.delete-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}

.delete-dialog {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 20px 50px -30px rgba(0, 0, 0, 0.3);
  max-width: 28rem;
  width: 90%;
}

.delete-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.delete-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  line-height: 1;
}

.delete-close:hover {
  color: #0f172a;
}

.delete-body {
  padding: 1.5rem;
  color: #0f172a;
  font-size: 0.95rem;
}

.delete-body p {
  margin: 0 0 0.75rem 0;
}

.delete-body p:last-child {
  margin-bottom: 0;
}

.delete-student {
  font-weight: 600;
  color: #dc2626;
  margin-top: 1rem !important;
}

.delete-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .health-record-detail-page__actions {
    flex-direction: column;
  }

  .health-record-detail-page__action-group {
    width: 100%;
  }

  .health-record-detail-page__action-group :deep(button) {
    flex: 1;
  }
}
</style>
