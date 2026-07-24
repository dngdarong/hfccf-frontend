<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchPreschoolStudent } from '@/modules/preschool/services/preschoolApi'
import {
  fetchStudentMedicalProfile,
  saveStudentMedicalProfile,
  saveStudentHealthAllergy,
  saveStudentHealthMedication,
  saveStudentHealthVaccination,
  saveStudentHealthContact,
  saveStudentHealthIncident,
} from '@/modules/preschool/services/api/preschoolHealthApi'
import HealthRecordForm from './components/HealthRecordForm.vue'

defineOptions({
  name: 'HealthRecordCreatePage',
})

const router = useRouter()
const route = useRoute()
const { t } = useLanguage()

const student = ref(null)
const studentLoading = ref(false)
const studentError = ref('')
const formLoading = ref(false)
const existingProfile = ref(null)
const formRef = ref(null)

const studentId = computed(() => route.params.studentId)

async function loadStudent() {
  if (!studentId.value) {
    studentError.value = t('preschoolHealthPage.messages.studentRequired')
    return
  }

  studentLoading.value = true
  studentError.value = ''

  try {
    const response = await fetchPreschoolStudent(studentId.value)
    student.value = response

    // Check if student already has a health profile
    try {
      const profileResponse = await fetchStudentMedicalProfile(studentId.value)
      if (profileResponse?.medicalProfile) {
        existingProfile.value = profileResponse.medicalProfile
        // Redirect to edit page if profile already exists
        await router.push({
          name: 'preschool-health-records-edit',
          params: { studentId: studentId.value },
        })
      }
    } catch {
      // No existing profile - that's fine for create page
      existingProfile.value = null
    }
  } catch (error) {
    if (error?.response?.status === 404) {
      studentError.value = t('preschoolHealthPage.messages.studentNotFound')
    } else {
      studentError.value = error?.message || t('preschoolHealthPage.messages.loadFailed')
    }
  } finally {
    studentLoading.value = false
  }
}

async function handleFormSave(payload) {
  if (!student.value?.id) return

  formLoading.value = true
  try {
    const studentIdValue = student.value.id

    // Save basic health information to medical profile
    if (payload.basicInfo) {
      await saveStudentMedicalProfile(studentIdValue, payload.basicInfo)
    }

    // Save medical conditions
    if (Array.isArray(payload.conditions)) {
      for (const condition of payload.conditions) {
        if (condition.condition_name) {
          await saveStudentHealthIncident(studentIdValue, {
            title: condition.condition_name,
            description: condition.notes || '',
            incident_date: condition.diagnosis_date || new Date().toISOString().split('T')[0],
            status: condition.status || 'active',
          })
        }
      }
    }

    // Save allergies
    if (Array.isArray(payload.allergies)) {
      for (const allergy of payload.allergies) {
        if (allergy.allergy_name) {
          await saveStudentHealthAllergy(studentIdValue, allergy)
        }
      }
    }

    // Save medications
    if (Array.isArray(payload.medications)) {
      for (const medication of payload.medications) {
        if (medication.medication_name) {
          await saveStudentHealthMedication(studentIdValue, medication)
        }
      }
    }

    // Save vaccinations
    if (Array.isArray(payload.vaccinations)) {
      for (const vaccination of payload.vaccinations) {
        if (vaccination.vaccine_name) {
          await saveStudentHealthVaccination(studentIdValue, vaccination)
        }
      }
    }

    // Save emergency contacts
    if (Array.isArray(payload.emergencyContacts)) {
      for (const contact of payload.emergencyContacts) {
        if (contact.contact_name) {
          await saveStudentHealthContact(studentIdValue, contact)
        }
      }
    }

    // Navigate to detail page
    await router.push({
      name: 'preschool-health-records-detail',
      params: { studentId: studentIdValue },
    })
  } finally {
    formLoading.value = false
  }
}

function handleCancel() {
  router.push({ name: 'dashboard-preschool-admin-health' })
}

function handleSubmit() {
  formRef.value?.submitForm()
}

onMounted(() => {
  loadStudent()
})
</script>

<template>
  <MainLayout>
    <section class="health-record-create-page">
      <HeaderSection
        :title="t('preschoolHealthPage.records.addHealth')"
        :subtitle="t('preschoolHealthPage.records.subtitle')"
      />

      <div class="health-record-create-page__content">
        <div v-if="studentLoading" class="health-record-create-page__loading">
          <i class="pi pi-spin pi-spinner" />
          <p>{{ t('preschoolHealthPage.messages.loading') }}</p>
        </div>

        <div v-else-if="studentError" class="health-record-create-page__error">
          <p>{{ studentError }}</p>
          <Button
            type="button"
            variant="secondary"
            size="md"
            rounded="lg"
            :label="t('preschoolHealthPage.actions.backToStudents')"
            @click="handleCancel"
          />
        </div>

        <template v-else-if="student">
          <!-- Student Summary Card -->
          <div class="health-record-create-page__student-card">
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

          <!-- Health Record Form -->
          <div class="health-record-create-page__form-container">
            <HealthRecordForm
              ref="formRef"
              :student="student"
              :profile="null"
              mode="add"
              :loading="formLoading"
              @save="handleFormSave"
              @cancel="handleCancel"
            />
          </div>

          <!-- Action Buttons -->
          <div class="health-record-create-page__actions">
            <Button
              type="button"
              variant="secondary"
              size="md"
              rounded="lg"
              :label="t('common.cancel')"
              :disabled="formLoading"
              @click="handleCancel"
            />
            <Button
              type="button"
              variant="primary"
              size="md"
              rounded="lg"
              :label="t('common.save')"
              :loading="formLoading"
              @click="handleSubmit"
            />
          </div>
        </template>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.health-record-create-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.health-record-create-page__content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: #fff;
  border: 1px solid #dbe3ef;
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: 0 18px 36px -30px rgba(15, 23, 42, 0.45);
}

.health-record-create-page__loading,
.health-record-create-page__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 8rem;
  gap: 1rem;
  color: #64748b;
  text-align: center;
}

.health-record-create-page__error {
  color: #dc2626;
}

.health-record-create-page__student-card {
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

.health-record-create-page__form-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.health-record-create-page__actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .health-record-create-page__actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
}
</style>
