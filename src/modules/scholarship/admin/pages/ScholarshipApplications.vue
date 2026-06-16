<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Table from '@/components/data-display/Table.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import Button from '@/components/buttons/Button.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import {
  approveScholarshipApplication,
  createScholarshipApplication,
  deleteScholarshipApplication,
  fetchScholarshipApplications,
  fetchScholarshipStudents,
  rejectScholarshipApplication,
  updateScholarshipApplication,
} from '@/modules/scholarship/services/scholarshipApi'

defineOptions({
  name: 'ScholarshipAdminApplicationsPage',
})

const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const yearFilter = ref('')
const currentPage = ref(1)
const pageSize = 10
const loading = ref(false)
const errorMessage = ref('')
const applications = ref([])
const pagination = ref({ page: 1, perPage: pageSize, total: 0, totalPages: 1 })
const students = ref([])
const modalOpen = ref(false)
const modalMode = ref('create')
const saving = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')
const deleteTarget = ref(null)
const deleteOpen = ref(false)

const form = reactive({
  student_id: '',
  application_code: '',
  scholarship_type: '',
  requested_amount: '',
  academic_year: '',
  submission_date: '',
  application_status: 'draft',
  assigned_reviewer_user_id: '',
  rejection_reason: '',
  notes: '',
})

const statusOptions = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'archived']
const typeOptions = ['Academic Excellence', 'Need Based', 'Transport Support', 'Book Support', 'Other']
const yearOptions = ['2025-2026', '2026-2027']

const tableColumns = [
  { key: 'number', label: 'No.', align: 'left' },
  { key: 'application', label: 'Application', align: 'left' },
  { key: 'student', label: 'Student', align: 'left' },
  { key: 'scholarshipType', label: 'Type', align: 'left' },
  { key: 'requestedAmountLabel', label: 'Amount', align: 'left' },
  { key: 'academicYear', label: 'Year', align: 'left' },
  { key: 'status', label: 'Status', align: 'left' },
  { key: 'reviewer', label: 'Reviewer', align: 'left' },
  { key: 'actions', label: 'Actions', align: 'right' },
]

const mappedApplications = computed(() =>
  applications.value.map((application) => ({
    ...application,
    application: application.applicationCode || '-',
    student: application.student?.fullName || '-',
    scholarshipType: application.scholarshipType || '-',
    requestedAmountLabel: `${Number(application.requestedAmount || 0).toFixed(2)} USD`,
    academicYear: application.academicYear || '-',
    reviewer: application.assignedReviewerName || '-',
    status: application.applicationStatus || '-',
  })),
)

const studentOptions = computed(() =>
  students.value.map((student) => ({
    value: student.id,
    label: `${student.fullName || student.studentCode || student.id} (${student.studentCode || '-'})`,
  })),
)

function resetForm() {
  Object.assign(form, {
    student_id: '',
    application_code: '',
    scholarship_type: '',
    requested_amount: '',
    academic_year: '',
    submission_date: '',
    application_status: 'draft',
    assigned_reviewer_user_id: '',
    rejection_reason: '',
    notes: '',
  })
}

function openCreateModal() {
  modalMode.value = 'create'
  resetForm()
  modalOpen.value = true
}

function openEditModal(application, mode = 'edit') {
  modalMode.value = mode
  Object.assign(form, {
    student_id: application?.student?.id || '',
    application_code: application?.applicationCode || '',
    scholarship_type: application?.scholarshipType || '',
    requested_amount: application?.requestedAmount ?? '',
    academic_year: application?.academicYear || '',
    submission_date: application?.submissionDate || '',
    application_status: application?.applicationStatus || 'draft',
    assigned_reviewer_user_id: application?.assignedReviewerUserId || '',
    rejection_reason: application?.rejectionReason || '',
    notes: application?.notes || '',
  })
  deleteTarget.value = application || null
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  saving.value = false
}

function normalizePayload() {
  return {
    student_id: form.student_id,
    application_code: form.application_code.trim() || null,
    scholarship_type: form.scholarship_type.trim(),
    requested_amount: Number(form.requested_amount || 0),
    academic_year: form.academic_year.trim(),
    submission_date: form.submission_date,
    application_status: form.application_status,
    assigned_reviewer_user_id: form.assigned_reviewer_user_id || null,
    rejection_reason: form.rejection_reason.trim() || null,
    notes: form.notes.trim() || null,
  }
}

async function loadStudents() {
  try {
    const response = await fetchScholarshipStudents({ perPage: 100 })
    students.value = response.items || []
  } catch {
    students.value = []
  }
}

async function loadApplications() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchScholarshipApplications({
      page: currentPage.value,
      perPage: pageSize,
      search: searchQuery.value,
      status: statusFilter.value,
      scholarshipType: typeFilter.value,
      academicYear: yearFilter.value,
    })

    applications.value = response.items || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    applications.value = []
    errorMessage.value = error?.message || 'Failed to load scholarship applications.'
  } finally {
    loading.value = false
  }
}

async function onSaveApplication() {
  saving.value = true
  errorMessage.value = ''

  try {
    const payload = normalizePayload()
    if (modalMode.value === 'edit' && deleteTarget.value?.id) {
      await updateScholarshipApplication(deleteTarget.value.id, payload)
      successMessage.value = 'Scholarship application updated successfully.'
    } else {
      await createScholarshipApplication(payload)
      successMessage.value = 'Scholarship application created successfully.'
    }

    showSuccess.value = true
    closeModal()
    await loadApplications()
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to save scholarship application.'
  } finally {
    saving.value = false
  }
}

async function onApproveApplication() {
  if (!deleteTarget.value?.id) return

  saving.value = true
  errorMessage.value = ''

  try {
    await approveScholarshipApplication(deleteTarget.value.id, {
      note: form.notes || null,
      assigned_reviewer_user_id: form.assigned_reviewer_user_id || null,
    })
    successMessage.value = 'Scholarship application approved successfully.'
    showSuccess.value = true
    closeModal()
    await loadApplications()
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to approve scholarship application.'
  } finally {
    saving.value = false
  }
}

async function onRejectApplication() {
  if (!deleteTarget.value?.id) return

  if (!form.rejection_reason.trim()) {
    errorMessage.value = 'Rejection reason is required.'
    return
  }

  saving.value = true
  errorMessage.value = ''

  try {
    await rejectScholarshipApplication(deleteTarget.value.id, {
      note: form.notes || null,
      rejection_reason: form.rejection_reason,
      assigned_reviewer_user_id: form.assigned_reviewer_user_id || null,
    })
    successMessage.value = 'Scholarship application rejected successfully.'
    showSuccess.value = true
    closeModal()
    await loadApplications()
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to reject scholarship application.'
  } finally {
    saving.value = false
  }
}

function onViewApplication(application) {
  openEditModal(application, 'view')
}

function onEditApplication(application) {
  openEditModal(application, 'edit')
}

function onDeleteApplication(application) {
  deleteTarget.value = application
  deleteOpen.value = true
}

async function confirmDelete() {
  const id = String(deleteTarget.value?.id || '').trim()
  if (!id) return

  try {
    await deleteScholarshipApplication(id)
    successMessage.value = 'Scholarship application deleted successfully.'
    showSuccess.value = true
    deleteOpen.value = false
    deleteTarget.value = null
    await loadApplications()
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to delete scholarship application.'
  }
}

watch([searchQuery, statusFilter, typeFilter, yearFilter], () => {
  currentPage.value = 1
  loadApplications()
})

watch(currentPage, () => {
  loadApplications()
})

onMounted(async () => {
  await Promise.all([loadStudents(), loadApplications()])
})
</script>

<template>
  <MainLayout>
    <section class="scholarship-applications-page">
      <HeaderSection
        title="Scholarship Applications"
        subtitle="Track applications, approvals, and reviewer assignments."
      />

      <div class="scholarship-applications-page__panel">
        <div class="scholarship-applications-page__toolbar">
          <Button type="button" variant="primary" size="md" rounded="xl" @click="openCreateModal">
            Add Application
          </Button>
        </div>

        <div class="scholarship-applications-page__filters">
          <input v-model="searchQuery" class="scholarship-applications-page__input" type="search" placeholder="Search applications" />
          <select v-model="statusFilter" class="scholarship-applications-page__input">
            <option value="">All status</option>
            <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
          </select>
          <select v-model="typeFilter" class="scholarship-applications-page__input">
            <option value="">All types</option>
            <option v-for="option in typeOptions" :key="option" :value="option">{{ option }}</option>
          </select>
          <select v-model="yearFilter" class="scholarship-applications-page__input">
            <option value="">All years</option>
            <option v-for="option in yearOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>

        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {{ errorMessage }}
        </div>

        <Table
          :rows="mappedApplications"
          :columns="tableColumns"
          :loading="loading"
          empty-text="No scholarship applications found."
          @view="onViewApplication"
          @edit="onEditApplication"
          @delete="onDeleteApplication"
        />

        <div v-if="pagination.totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="pagination.totalPages" class="mt-2" />
        </div>
      </div>
    </section>

    <Dialog v-model:visible="modalOpen" :header="modalMode === 'view' ? 'View Application' : modalMode === 'edit' ? 'Edit Application' : 'Create Application'" modal class="scholarship-applications-page__dialog">
      <div class="scholarship-applications-page__dialog-grid">
        <select v-model="form.student_id" class="scholarship-applications-page__input" :disabled="modalMode === 'view'">
          <option value="">Select student</option>
          <option v-for="option in studentOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <input v-model="form.application_code" class="scholarship-applications-page__input" type="text" placeholder="Application code" :disabled="modalMode === 'view'" />
        <select v-model="form.scholarship_type" class="scholarship-applications-page__input" :disabled="modalMode === 'view'">
          <option value="">Scholarship type</option>
          <option v-for="option in typeOptions" :key="option" :value="option">{{ option }}</option>
        </select>
        <input v-model="form.requested_amount" class="scholarship-applications-page__input" type="number" step="0.01" min="0" placeholder="Requested amount" :disabled="modalMode === 'view'" />
        <select v-model="form.academic_year" class="scholarship-applications-page__input" :disabled="modalMode === 'view'">
          <option value="">Academic year</option>
          <option v-for="option in yearOptions" :key="option" :value="option">{{ option }}</option>
        </select>
        <input v-model="form.submission_date" class="scholarship-applications-page__input" type="date" :disabled="modalMode === 'view'" />
        <select v-model="form.application_status" class="scholarship-applications-page__input" :disabled="modalMode === 'view'">
          <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
        </select>
        <input v-model="form.assigned_reviewer_user_id" class="scholarship-applications-page__input" type="text" placeholder="Assigned reviewer user ID" :disabled="modalMode === 'view'" />
        <textarea v-model="form.rejection_reason" class="scholarship-applications-page__input scholarship-applications-page__dialog-full" rows="3" placeholder="Rejection reason" :disabled="modalMode === 'view'"></textarea>
        <textarea v-model="form.notes" class="scholarship-applications-page__input scholarship-applications-page__dialog-full" rows="3" placeholder="Notes" :disabled="modalMode === 'view'"></textarea>
      </div>

      <template #footer>
        <Button type="button" variant="outline" rounded="xl" @click="closeModal">Close</Button>
        <Button v-if="modalMode !== 'view'" type="button" variant="outline" rounded="xl" :loading="saving" :disabled="saving" @click="onSaveApplication">Save</Button>
        <Button v-if="modalMode !== 'view' && deleteTarget?.id" type="button" variant="success" rounded="xl" :loading="saving" :disabled="saving" @click="onApproveApplication">Approve</Button>
        <Button v-if="modalMode !== 'view' && deleteTarget?.id" type="button" variant="danger" rounded="xl" :loading="saving" :disabled="saving" @click="onRejectApplication">Reject</Button>
      </template>
    </Dialog>

    <AlertQuestion
      :show="deleteOpen"
      title="Delete application?"
      :message="`Are you sure you want to delete ${deleteTarget?.applicationCode || 'this application'}?`"
      confirm-text="Delete"
      cancel-text="Cancel"
      type="danger"
      @confirm="confirmDelete"
      @cancel="deleteOpen = false"
    />

    <AlertSuccess
      :show="showSuccess"
      title="Success"
      :message="successMessage"
      button-text="Close"
      @close="showSuccess = false"
    />
  </MainLayout>
</template>

<style scoped>
.scholarship-applications-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.scholarship-applications-page__panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.scholarship-applications-page__toolbar {
  display: flex;
  justify-content: flex-end;
}

.scholarship-applications-page__filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.scholarship-applications-page__input {
  width: 100%;
  min-height: 2.7rem;
  border-radius: 0.8rem;
  border: 1px solid #d4dde8;
  background: #fcfdff;
  padding: 0.6rem 0.8rem;
  color: #0f172a;
}

.scholarship-applications-page__dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  min-width: min(100vw - 2rem, 48rem);
}

.scholarship-applications-page__dialog-full {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .scholarship-applications-page__filters,
  .scholarship-applications-page__dialog-grid {
    grid-template-columns: 1fr;
    min-width: 0;
  }
}
</style>
