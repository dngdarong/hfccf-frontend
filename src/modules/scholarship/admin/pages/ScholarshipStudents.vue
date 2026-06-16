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
  createScholarshipStudent,
  deleteScholarshipStudent,
  fetchScholarshipStudents,
  updateScholarshipStudent,
} from '@/modules/scholarship/services/scholarshipApi'

defineOptions({
  name: 'ScholarshipAdminStudentsPage',
})

const searchQuery = ref('')
const statusFilter = ref('')
const genderFilter = ref('')
const gradeFilter = ref('')
const currentPage = ref(1)
const pageSize = 10
const loading = ref(false)
const errorMessage = ref('')
const students = ref([])
const pagination = ref({ page: 1, perPage: pageSize, total: 0, totalPages: 1 })
const modalOpen = ref(false)
const modalMode = ref('create')
const saving = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')
const deleteTarget = ref(null)
const deleteOpen = ref(false)

const form = reactive({
  student_code: '',
  first_name: '',
  last_name: '',
  gender: '',
  date_of_birth: '',
  phone: '',
  email: '',
  school_name: '',
  grade_level: '',
  guardian_name: '',
  guardian_phone: '',
  address: '',
  status: 'active',
  notes: '',
})

const genderOptions = ['male', 'female', 'other']
const statusOptions = ['active', 'pending', 'inactive', 'graduated', 'archived']
const gradeOptions = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']

const tableColumns = [
  { key: 'number', label: 'No.', align: 'left' },
  { key: 'student', label: 'Student', align: 'left' },
  { key: 'studentCode', label: 'Code', align: 'left' },
  { key: 'schoolName', label: 'School', align: 'left' },
  { key: 'gradeLevel', label: 'Grade', align: 'left' },
  { key: 'status', label: 'Status', align: 'left' },
  { key: 'guardianPhone', label: 'Guardian Phone', align: 'left' },
  { key: 'actions', label: 'Actions', align: 'right' },
]

const mappedStudents = computed(() =>
  students.value.map((student) => ({
    ...student,
    student: student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || '-',
    schoolName: student.schoolName || '-',
    gradeLevel: student.gradeLevel || '-',
    guardianPhone: student.guardianPhone || '-',
  })),
)

function resetForm() {
  Object.assign(form, {
    student_code: '',
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    phone: '',
    email: '',
    school_name: '',
    grade_level: '',
    guardian_name: '',
    guardian_phone: '',
    address: '',
    status: 'active',
    notes: '',
  })
}

function openCreateModal() {
  modalMode.value = 'create'
  resetForm()
  modalOpen.value = true
}

function openEditModal(student, mode = 'edit') {
  modalMode.value = mode
  Object.assign(form, {
    student_code: student?.studentCode || '',
    first_name: student?.firstName || '',
    last_name: student?.lastName || '',
    gender: student?.gender || '',
    date_of_birth: student?.dateOfBirth || '',
    phone: student?.phone || '',
    email: student?.email || '',
    school_name: student?.schoolName || '',
    grade_level: student?.gradeLevel || '',
    guardian_name: student?.guardianName || '',
    guardian_phone: student?.guardianPhone || '',
    address: student?.address || '',
    status: student?.status || 'active',
    notes: student?.notes || '',
  })
  deleteTarget.value = student || null
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  saving.value = false
}

function normalizePayload() {
  return {
    student_code: form.student_code.trim(),
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    gender: form.gender || null,
    date_of_birth: form.date_of_birth || null,
    phone: form.phone.trim() || null,
    email: form.email.trim() || null,
    school_name: form.school_name.trim(),
    grade_level: form.grade_level.trim(),
    guardian_name: form.guardian_name.trim(),
    guardian_phone: form.guardian_phone.trim(),
    address: form.address.trim(),
    status: form.status,
    notes: form.notes.trim() || null,
  }
}

async function loadStudents() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchScholarshipStudents({
      page: currentPage.value,
      perPage: pageSize,
      search: searchQuery.value,
      status: statusFilter.value,
      gender: genderFilter.value,
      gradeLevel: gradeFilter.value,
    })

    students.value = response.items || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    students.value = []
    errorMessage.value = error?.message || 'Failed to load scholarship students.'
  } finally {
    loading.value = false
  }
}

async function onSaveStudent() {
  saving.value = true
  errorMessage.value = ''

  try {
    const payload = normalizePayload()
    if (modalMode.value === 'edit' && deleteTarget.value?.id) {
      await updateScholarshipStudent(deleteTarget.value.id, payload)
      successMessage.value = 'Scholarship student updated successfully.'
    } else {
      await createScholarshipStudent(payload)
      successMessage.value = 'Scholarship student created successfully.'
    }

    showSuccess.value = true
    closeModal()
    await loadStudents()
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to save scholarship student.'
  } finally {
    saving.value = false
  }
}

function onViewStudent(student) {
  openEditModal(student, 'view')
}

function onEditStudent(student) {
  openEditModal(student, 'edit')
}

function onDeleteStudent(student) {
  deleteTarget.value = student
  deleteOpen.value = true
}

async function confirmDelete() {
  const id = String(deleteTarget.value?.id || '').trim()
  if (!id) return

  try {
    await deleteScholarshipStudent(id)
    successMessage.value = 'Scholarship student deleted successfully.'
    showSuccess.value = true
    deleteOpen.value = false
    deleteTarget.value = null
    await loadStudents()
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to delete scholarship student.'
  }
}

watch([searchQuery, statusFilter, genderFilter, gradeFilter], () => {
  currentPage.value = 1
  loadStudents()
})

watch(currentPage, () => {
  loadStudents()
})

onMounted(() => {
  loadStudents()
})
</script>

<template>
  <MainLayout>
    <section class="scholarship-students-page">
      <HeaderSection
        title="Scholarship Students"
        subtitle="Manage scholarship student records and eligibility profiles."
      />

      <div class="scholarship-students-page__panel">
        <div class="scholarship-students-page__toolbar">
          <Button type="button" variant="primary" size="md" rounded="xl" @click="openCreateModal">
            Add Student
          </Button>
        </div>

        <div class="scholarship-students-page__filters">
          <input v-model="searchQuery" class="scholarship-students-page__input" type="search" placeholder="Search students" />
          <select v-model="statusFilter" class="scholarship-students-page__input">
            <option value="">All status</option>
            <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
          </select>
          <select v-model="genderFilter" class="scholarship-students-page__input">
            <option value="">All genders</option>
            <option v-for="option in genderOptions" :key="option" :value="option">{{ option }}</option>
          </select>
          <select v-model="gradeFilter" class="scholarship-students-page__input">
            <option value="">All grades</option>
            <option v-for="option in gradeOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>

        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {{ errorMessage }}
        </div>

        <Table
          :rows="mappedStudents"
          :columns="tableColumns"
          :loading="loading"
          empty-text="No scholarship students found."
          @view="onViewStudent"
          @edit="onEditStudent"
          @delete="onDeleteStudent"
        />

        <div v-if="pagination.totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="pagination.totalPages" class="mt-2" />
        </div>
      </div>
    </section>

    <Dialog v-model:visible="modalOpen" :header="modalMode === 'view' ? 'View Student' : modalMode === 'edit' ? 'Edit Student' : 'Create Student'" modal class="scholarship-students-page__dialog">
      <div class="scholarship-students-page__dialog-grid">
        <input v-model="form.student_code" class="scholarship-students-page__input" type="text" placeholder="Student code" :disabled="modalMode === 'view'" />
        <input v-model="form.first_name" class="scholarship-students-page__input" type="text" placeholder="First name" :disabled="modalMode === 'view'" />
        <input v-model="form.last_name" class="scholarship-students-page__input" type="text" placeholder="Last name" :disabled="modalMode === 'view'" />
        <select v-model="form.gender" class="scholarship-students-page__input" :disabled="modalMode === 'view'">
          <option value="">Gender</option>
          <option v-for="option in genderOptions" :key="option" :value="option">{{ option }}</option>
        </select>
        <input v-model="form.date_of_birth" class="scholarship-students-page__input" type="date" :disabled="modalMode === 'view'" />
        <input v-model="form.phone" class="scholarship-students-page__input" type="text" placeholder="Phone" :disabled="modalMode === 'view'" />
        <input v-model="form.email" class="scholarship-students-page__input" type="email" placeholder="Email" :disabled="modalMode === 'view'" />
        <input v-model="form.school_name" class="scholarship-students-page__input" type="text" placeholder="School name" :disabled="modalMode === 'view'" />
        <input v-model="form.grade_level" class="scholarship-students-page__input" type="text" placeholder="Grade level" :disabled="modalMode === 'view'" />
        <input v-model="form.guardian_name" class="scholarship-students-page__input" type="text" placeholder="Guardian name" :disabled="modalMode === 'view'" />
        <input v-model="form.guardian_phone" class="scholarship-students-page__input" type="text" placeholder="Guardian phone" :disabled="modalMode === 'view'" />
        <select v-model="form.status" class="scholarship-students-page__input" :disabled="modalMode === 'view'">
          <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
        </select>
        <textarea v-model="form.address" class="scholarship-students-page__input scholarship-students-page__dialog-full" rows="3" placeholder="Address" :disabled="modalMode === 'view'"></textarea>
        <textarea v-model="form.notes" class="scholarship-students-page__input scholarship-students-page__dialog-full" rows="3" placeholder="Notes" :disabled="modalMode === 'view'"></textarea>
      </div>

      <template #footer>
        <Button type="button" variant="outline" rounded="xl" @click="closeModal">Close</Button>
        <Button v-if="modalMode !== 'view'" type="button" variant="primary" rounded="xl" :loading="saving" :disabled="saving" @click="onSaveStudent">
          Save
        </Button>
      </template>
    </Dialog>

    <AlertQuestion
      :show="deleteOpen"
      title="Delete student?"
      :message="`Are you sure you want to delete ${deleteTarget?.fullName || 'this student'}?`"
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
.scholarship-students-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.scholarship-students-page__panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.scholarship-students-page__toolbar {
  display: flex;
  justify-content: flex-end;
}

.scholarship-students-page__filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.scholarship-students-page__input {
  width: 100%;
  min-height: 2.7rem;
  border-radius: 0.8rem;
  border: 1px solid #d4dde8;
  background: #fcfdff;
  padding: 0.6rem 0.8rem;
  color: #0f172a;
}

.scholarship-students-page__dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  min-width: min(100vw - 2rem, 48rem);
}

.scholarship-students-page__dialog-full {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .scholarship-students-page__filters,
  .scholarship-students-page__dialog-grid {
    grid-template-columns: 1fr;
    min-width: 0;
  }
}
</style>
