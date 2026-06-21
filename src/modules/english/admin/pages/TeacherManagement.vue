<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import UsersTable from '@/components/data-display/Table.vue'
import TableActions from '@/components/data-display/components/TableActions.vue'
import Button from '@/components/buttons/Button.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useUserStore } from '@/store/userStore'
import { ROLES, isSuperAdminRole } from '@/constants/roles'
import {
  createEnglishTeacher,
  deleteEnglishTeacher,
  fetchEnglishTeachers,
  resetEnglishTeacherPassword,
  updateEnglishTeacher,
} from '@/modules/english/services/englishApi'
import ResetTeacherPasswordDialog from '@/modules/english/admin/components/teacher-management/ResetTeacherPasswordDialog.vue'

defineOptions({
  name: 'EnglishTeacherManagementPage',
})

const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = 10
const loading = ref(false)
const errorMessage = ref('')
const teachers = ref([])
const pagination = ref({ page: 1, perPage: pageSize, total: 0, totalPages: 1 })
const modalOpen = ref(false)
const modalMode = ref('create')
const saving = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')
const deleteTarget = ref(null)
const deleteOpen = ref(false)
const resetTarget = ref(null)
const resetOpen = ref(false)
const resetLoading = ref(false)
const resetBackendError = ref('')
const toast = useToast()
const userStore = useUserStore()
const { t, te } = useLanguage()

const form = reactive({
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  phone: '',
  status: 'active',
  password: '',
  password_confirmation: '',
})

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

function localizedStatus(value) {
  const key = `english.common.status.${normalizeKey(value)}`
  return te(key) ? t(key) : (value || '-')
}

const statusOptions = computed(() => [
  { value: 'active', label: t('english.common.status.active') },
  { value: 'pending', label: t('english.common.status.pending') },
  { value: 'inactive', label: t('english.common.status.inactive') },
  { value: 'suspended', label: t('english.common.status.suspended') },
])

const currentUser = computed(() => userStore.currentUser || {})
const currentUserRole = computed(() => String(currentUser.value?.role || '').trim().toLowerCase())
const canManageTeacherResets = computed(() =>
  isSuperAdminRole(currentUser.value?.role) || currentUserRole.value === ROLES.ADMIN_ENGLISH,
)

const tableColumns = computed(() => [
  { key: 'number', label: t('english.teachers.table.number'), align: 'left' },
  { key: 'user', label: t('english.teachers.table.teacher'), align: 'left' },
  { key: 'email', label: t('english.teachers.table.email'), align: 'left' },
  { key: 'role', label: t('english.teachers.table.role'), align: 'left' },
  { key: 'permission', label: t('english.teachers.table.permissions'), align: 'left' },
  { key: 'status', label: t('english.teachers.table.status'), align: 'left' },
  { key: 'phone', label: t('english.teachers.table.phone'), align: 'left' },
  { key: 'actions', label: t('english.teachers.table.actions'), align: 'right' },
])

const mappedTeachers = computed(() =>
  teachers.value.map((teacher) => ({
    ...teacher,
    name: teacher.fullName || teacher.name || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim(),
    email: teacher.email || '-',
    phone: teacher.phone || '-',
    statusCode: teacher.status || '',
    status: localizedStatus(teacher.status),
  })),
)

function resetForm() {
  Object.assign(form, {
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    status: 'active',
    password: '',
    password_confirmation: '',
  })
}

function openCreateModal() {
  modalMode.value = 'create'
  resetForm()
  modalOpen.value = true
}

function openEditModal(teacher, mode = 'edit') {
  modalMode.value = mode
  Object.assign(form, {
    first_name: teacher?.firstName || '',
    last_name: teacher?.lastName || '',
    username: teacher?.username || '',
    email: teacher?.email || '',
    phone: teacher?.phone || '',
    status: teacher?.statusCode || teacher?.status || 'active',
    password: '',
    password_confirmation: '',
  })
  deleteTarget.value = teacher || null
  modalOpen.value = true
}

function canResetTeacher(teacher) {
  return (
    canManageTeacherResets.value &&
    String(teacher?.role || '').trim().toLowerCase() === ROLES.TEACHER_ENGLISH
  )
}

function closeModal() {
  modalOpen.value = false
  saving.value = false
}

function normalizePayload() {
  return {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    username: form.username.trim() || null,
    email: form.email.trim(),
    phone: form.phone.trim() || null,
    status: form.status,
    ...(form.password ? {
      password: form.password,
      password_confirmation: form.password_confirmation,
    } : {}),
  }
}

async function loadTeachers() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchEnglishTeachers({
      page: currentPage.value,
      perPage: pageSize,
      search: searchQuery.value,
      status: statusFilter.value,
    })

    teachers.value = response.items || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    teachers.value = []
    errorMessage.value = error?.message || t('english.teachers.errorLoad')
  } finally {
    loading.value = false
  }
}

async function onSaveTeacher() {
  saving.value = true
  errorMessage.value = ''

  try {
    const payload = normalizePayload()
    if (modalMode.value === 'edit' && deleteTarget.value?.id) {
      await updateEnglishTeacher(deleteTarget.value.id, payload)
      successMessage.value = t('english.teachers.successUpdated')
    } else {
      await createEnglishTeacher(payload)
      successMessage.value = t('english.teachers.successCreated')
    }

    showSuccess.value = true
    closeModal()
    await loadTeachers()
  } catch (error) {
    errorMessage.value = error?.message || t('english.teachers.errorSave')
  } finally {
    saving.value = false
  }
}

function onViewTeacher(teacher) {
  openEditModal(teacher, 'view')
}

function onEditTeacher(teacher) {
  openEditModal(teacher, 'edit')
}

function onDeleteTeacher(teacher) {
  deleteTarget.value = teacher
  deleteOpen.value = true
}

function onResetTeacher(teacher) {
  if (!canResetTeacher(teacher)) return

  resetTarget.value = teacher || null
  resetBackendError.value = ''
  resetOpen.value = true
}

async function confirmDelete() {
  const id = String(deleteTarget.value?.id || '').trim()
  if (!id) return

  try {
    await deleteEnglishTeacher(id)
    successMessage.value = t('english.teachers.successDeleted')
    showSuccess.value = true
    deleteOpen.value = false
    deleteTarget.value = null
    await loadTeachers()
  } catch (error) {
    errorMessage.value = error?.message || t('english.teachers.errorDelete')
  }
}

function closeResetDialog() {
  resetOpen.value = false
  resetTarget.value = null
  resetBackendError.value = ''
}

async function confirmReset(payload) {
  const id = String(resetTarget.value?.id || '').trim()
  if (!id) return

  resetLoading.value = true
  resetBackendError.value = ''

  try {
    await resetEnglishTeacherPassword(id, payload)
    toast.add({
      severity: 'success',
      summary: t('english.teachers.passwordResetSuccess'),
      life: 3000,
    })
    closeResetDialog()
    await loadTeachers()
  } catch (error) {
    resetBackendError.value = error?.message || t('english.teachers.errorSave')
  } finally {
    resetLoading.value = false
  }
}

const pageTitle = computed(() => t('english.teachers.title'))
const pageSubtitle = computed(() => t('english.teachers.subtitle'))
const addButtonLabel = computed(() => t('english.teachers.addButton'))
const searchPlaceholder = computed(() => t('english.teachers.searchPlaceholder'))
const emptyText = computed(() => t('english.teachers.empty'))
const dialogTitle = computed(() =>
  modalMode.value === 'view'
    ? t('english.teachers.dialog.viewTitle')
    : modalMode.value === 'edit'
      ? t('english.teachers.dialog.editTitle')
      : t('english.teachers.dialog.createTitle'),
)
const firstNamePlaceholder = computed(() => t('english.teachers.placeholders.firstName'))
const lastNamePlaceholder = computed(() => t('english.teachers.placeholders.lastName'))
const usernamePlaceholder = computed(() => t('english.teachers.placeholders.username'))
const emailPlaceholder = computed(() => t('english.teachers.placeholders.email'))
const phonePlaceholder = computed(() => t('english.teachers.placeholders.phone'))
const passwordPlaceholder = computed(() => t('english.teachers.placeholders.password'))
const confirmPasswordPlaceholder = computed(() => t('english.teachers.placeholders.confirmPassword'))
const closeLabel = computed(() => t('english.common.actions.close'))
const saveLabel = computed(() => t('english.common.actions.save'))
const cancelLabel = computed(() => t('english.common.actions.cancel'))
const deleteConfirmTitle = computed(() => t('english.teachers.dialog.deleteTitle'))
const deleteConfirmMessage = computed(() =>
  t('english.teachers.dialog.deleteMessage', { name: deleteTarget.value?.name || t('english.common.empty.noResults') }),
)
const successButtonText = computed(() => t('english.common.actions.close'))

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
  loadTeachers()
})

watch(currentPage, () => {
  loadTeachers()
})

onMounted(() => {
  loadTeachers()
})
</script>

<template>
  <MainLayout>
    <Toast />
    <section class="english-teachers-page">
      <HeaderSection
        :title="pageTitle"
        :subtitle="pageSubtitle"
      />

      <div class="english-teachers-page__panel">
        <div class="english-teachers-page__toolbar">
          <Button type="button" variant="primary" size="md" rounded="xl" @click="openCreateModal">
            {{ addButtonLabel }}
          </Button>
        </div>

        <div class="english-teachers-page__filters">
          <input v-model="searchQuery" class="english-teachers-page__input" type="search" :placeholder="searchPlaceholder" />
          <select v-model="statusFilter" class="english-teachers-page__input">
            <option value="">{{ t('english.teachers.statusPlaceholder') }}</option>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>

        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {{ errorMessage }}
        </div>

        <UsersTable
          :rows="mappedTeachers"
          :columns="tableColumns"
          :loading="loading"
          :empty-text="emptyText"
        >
          <template #actions="{ data }">
            <TableActions
              :item="data"
              :show-view-action="true"
              :show-edit-action="true"
              :show-delete-action="true"
              :show-reset-action="canResetTeacher(data)"
              @view="onViewTeacher"
              @edit="onEditTeacher"
              @delete="onDeleteTeacher"
              @reset="onResetTeacher"
            />
          </template>
        </UsersTable>

        <div v-if="pagination.totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="pagination.totalPages" class="mt-2" />
        </div>
      </div>
    </section>

    <Dialog
      v-model:visible="modalOpen"
      :header="dialogTitle"
      modal
      class="english-teachers-page__dialog"
    >
      <div class="english-teachers-page__dialog-grid">
        <input v-model="form.first_name" class="english-teachers-page__input" type="text" :placeholder="firstNamePlaceholder" :disabled="modalMode === 'view'" />
        <input v-model="form.last_name" class="english-teachers-page__input" type="text" :placeholder="lastNamePlaceholder" :disabled="modalMode === 'view'" />
        <input v-model="form.username" class="english-teachers-page__input" type="text" :placeholder="usernamePlaceholder" :disabled="modalMode === 'view'" />
        <input v-model="form.email" class="english-teachers-page__input" type="email" :placeholder="emailPlaceholder" :disabled="modalMode === 'view'" />
        <input v-model="form.phone" class="english-teachers-page__input" type="text" :placeholder="phonePlaceholder" :disabled="modalMode === 'view'" />
        <select v-model="form.status" class="english-teachers-page__input" :disabled="modalMode === 'view'">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <input
          v-if="modalMode === 'create'"
          v-model="form.password"
          class="english-teachers-page__input english-teachers-page__dialog-full"
          type="password"
          :placeholder="passwordPlaceholder"
        />
        <input
          v-if="modalMode === 'create'"
          v-model="form.password_confirmation"
          class="english-teachers-page__input english-teachers-page__dialog-full"
          type="password"
          :placeholder="confirmPasswordPlaceholder"
        />
      </div>

      <template #footer>
        <Button type="button" variant="outline" rounded="xl" @click="closeModal">{{ closeLabel }}</Button>
        <Button v-if="modalMode !== 'view'" type="button" variant="primary" rounded="xl" :loading="saving" :disabled="saving" @click="onSaveTeacher">
          {{ saveLabel }}
        </Button>
      </template>
    </Dialog>

    <AlertQuestion
      :show="deleteOpen"
      :title="deleteConfirmTitle"
      :message="deleteConfirmMessage"
      :confirm-text="t('english.common.actions.delete')"
      :cancel-text="cancelLabel"
      type="danger"
      @confirm="confirmDelete"
      @cancel="deleteOpen = false"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="t('english.common.feedback.success')"
      :message="successMessage"
      :button-text="successButtonText"
      @close="showSuccess = false"
    />

    <ResetTeacherPasswordDialog
      v-model:visible="resetOpen"
      :loading="resetLoading"
      :backend-error="resetBackendError"
      @confirm="confirmReset"
      @cancel="closeResetDialog"
    />
  </MainLayout>
</template>

<style scoped>
.english-teachers-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.english-teachers-page__panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.english-teachers-page__toolbar {
  display: flex;
  justify-content: flex-end;
}

.english-teachers-page__filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.english-teachers-page__input {
  width: 100%;
  min-height: 2.7rem;
  border-radius: 0.8rem;
  border: 1px solid #d4dde8;
  background: #fcfdff;
  padding: 0.6rem 0.8rem;
  color: #0f172a;
}

.english-teachers-page__dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  min-width: min(100vw - 2rem, 44rem);
}

.english-teachers-page__dialog-full {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .english-teachers-page__filters,
  .english-teachers-page__dialog-grid {
    grid-template-columns: 1fr;
    min-width: 0;
  }
}
</style>
