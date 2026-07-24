<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import EnrollmentApplicationForm from '@/modules/preschool/admin/components/enrollment/EnrollmentApplicationForm.vue'
import { createEnrollment } from '@/modules/preschool/services/api/preschoolEnrollmentApi'
import { fetchAcademicLifecycle } from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'
import http from '@/services/http'
import { unwrapApiData } from '@/services/api'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

const academicYears = ref([])
const terms = ref([])
const classes = ref([])
const saving = ref(false)
const errorMessage = ref('')
const validationErrors = ref({})

const pageTitle = t('preschoolEnrollmentPage.createPage.title')
const pageSubtitle = t('preschoolEnrollmentPage.createPage.subtitle')

async function loadLifecycle() {
  try {
    const [lifecycle, classRes] = await Promise.all([
      fetchAcademicLifecycle(),
      http.get('/preschool/classes?per_page=100').then((response) => unwrapApiData(response)),
    ])

    academicYears.value = lifecycle?.academicYears ?? []
    terms.value = lifecycle?.terms ?? []
    classes.value = Array.isArray(classRes) ? classRes : (classRes?.data ?? [])
  } catch {
    academicYears.value = []
    terms.value = []
    classes.value = []
  }
}

async function saveApplication(payload) {
  saving.value = true
  errorMessage.value = ''
  validationErrors.value = {}

  try {
    await createEnrollment(payload)
    toast.add({
      severity: 'success',
      summary: t('preschoolEnrollmentPage.messages.createSuccess'),
      life: 3000,
    })
    router.push({ name: 'dashboard-preschool-admin-enrollments' })
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolEnrollmentPage.messages.errorSave')
    validationErrors.value = error?.validationErrors || error?.details?.errors || {}
  } finally {
    saving.value = false
  }
}

function cancel() {
  if (saving.value) return
  router.push({ name: 'dashboard-preschool-admin-enrollments' })
}

function goBack() {
  router.push({ name: 'dashboard-preschool-admin-enrollments' })
}

onMounted(async () => {
  await loadLifecycle()
})
</script>

<template>
  <MainLayout>
    <Toast />

    <section class="enr-create-page">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <div class="enr-create-page__shell">
        <div class="enr-create-page__toolbar">
          <Button type="button" variant="ghost" rounded="xl" @click="goBack">
            {{ t('preschoolEnrollmentPage.createPage.actions.backToEnrollments') }}
          </Button>
        </div>

        <div v-if="errorMessage" class="enr-create-page__state enr-create-page__state--error">
          {{ errorMessage }}
        </div>

        <EnrollmentApplicationForm
          :academic-years="academicYears"
          :terms="terms"
          :classes="classes"
          :loading="saving"
          :validation-errors="validationErrors"
          :cancel-label="t('preschoolEnrollmentPage.createPage.actions.cancel')"
          :save-label="t('preschoolEnrollmentPage.createPage.actions.saveApplication')"
          @cancel="cancel"
          @save="saveApplication"
        />
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.enr-create-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.enr-create-page__shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 1.25rem;
  border: 1px solid #dce6f2;
  border-radius: 1.5rem;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.99) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.enr-create-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.enr-create-page__state {
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  border: 1px solid #dbeafe;
  background: linear-gradient(180deg, #fff 0%, #f8fbff 100%);
  color: #0f172a;
  font-weight: 600;
}

.enr-create-page__state--error {
  border-color: #fecaca;
  background: linear-gradient(180deg, #fff 0%, #fff7f7 100%);
  color: #b91c1c;
}

@media (max-width: 900px) {
  .enr-create-page__toolbar {
    flex-direction: column;
  }

  .enr-create-page__shell {
    padding: 1rem;
  }
}
</style>
