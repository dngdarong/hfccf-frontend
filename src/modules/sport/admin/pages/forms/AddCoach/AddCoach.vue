<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Form from '@/components/forms/Form.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import { ROLES } from '@/constants/roles'
import { useLanguage } from '@/composables/useLanguage'
import { fetchRolePermissions } from '@/modules/super-admin/services/rolePermissionsApi'
import {
  createSportCoach,
  fetchSportCoach,
  updateSportCoach,
} from '@/modules/sport/services/sportApi'
import AddCoachIntro from '@/modules/sport/admin/components/add-coach/AddCoachIntro.vue'
import AddCoachFormFields from '@/modules/sport/admin/components/add-coach/AddCoachFormFields.vue'
import AddCoachFormActions from '@/modules/sport/admin/components/add-coach/AddCoachFormActions.vue'
import AdminSummaryCards from '@/modules/super-admin/components/admin-management/AdminSummaryCards.vue'
import AdminChecklistPanel from '@/modules/super-admin/components/admin-management/AdminChecklistPanel.vue'
import { useCoachProfileImage } from './composables/useCoachProfileImage'
import {
  statusLabel as getStatusLabel,
  roleLabel as getRoleLabel,
  permissionLabel as getPermissionLabel,
  validateForm,
  getFormPayload,
  initializeFormFromCoach,
  getProfileImagePreview,
} from './utils/addCoachHelpers'
import {
  COACHES_DIRECTORY_PATH,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  DEFAULT_PERMISSIONS,
} from './constants/addCoachConstants'

defineOptions({
  name: 'SportAdminAddCoachPage',
})

const router = useRouter()
const route = useRoute()
const { t, language } = useLanguage()

const {
  profileImagePreview,
  handleProfileImageChange: handleImageChange,
  removeProfileImage: removeImage,
  setImagePreview,
} = useCoachProfileImage(t)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  role: ROLES.COACH,
  permissions: [],
  status: STATUS_OPTIONS[0],
  password: '',
  confirmPassword: '',
  profileImage: null,
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

const mode = computed(() => {
  if (route.query.mode === 'view') return 'view'
  if (route.query.mode === 'edit' || Boolean(route.query.id)) return 'edit'
  return 'add'
})
const isViewMode = computed(() => mode.value === 'view')
const isEditMode = computed(() => mode.value === 'edit')
const isAddMode = computed(() => mode.value === 'add')
const isFormLocked = computed(() => isSubmitting.value || isViewMode.value)
const isKh = computed(() => language.value === 'KH')

const roleOptions = ROLE_OPTIONS
const statusOptions = STATUS_OPTIONS

function statusLabel(status) {
  return getStatusLabel(status, t)
}

function roleLabel(value) {
  return getRoleLabel(value, t)
}

function permissionLabel(value) {
  return getPermissionLabel(value, t)
}

function resetFeedback() {
  errorMessage.value = ''
  showError.value = false
}

const pageTitle = computed(() => {
  if (isViewMode.value) return t('sportAddCoach.viewTitle')
  if (isEditMode.value) return t('sportAddCoach.updateTitle')
  return t('sportAddCoach.title')
})

const pageSubtitle = computed(() => {
  if (isViewMode.value) return t('sportAddCoach.viewSubtitle')
  if (isEditMode.value) return t('sportAddCoach.updateSubtitle')
  return t('sportAddCoach.summary')
})

const selectedRoleDescription = computed(() => roleLabel(form.role))
const permissionCount = computed(() => form.permissions.length)

const formSummaryCards = computed(() => [
  {
    id: 'coach-role',
    title: t('sportAddCoach.roleScope'),
    value: selectedRoleDescription.value,
    label: t('sportAddCoach.programAccess'),
    status: 'info',
    statusLabel: statusLabel('info'),
    surfaceClass: 'bg-cyan-50/80 border-cyan-200',
  },
  {
    id: 'coach-permissions',
    title: t('sportAddCoach.permissions'),
    value: permissionCount.value,
    label: permissionCount.value
      ? t('sportAddCoach.configuredPermissions')
      : t('sportAddCoach.noPermissionsSelected'),
    status: permissionCount.value ? 'success' : 'warning',
    statusLabel: statusLabel(permissionCount.value ? 'success' : 'warning'),
    surfaceClass: 'bg-lime-50/80 border-lime-200',
  },
  {
    id: 'coach-account-state',
    title: t('sportAddCoach.accountState'),
    value: statusLabel(form.status),
    label: t('sportAddCoach.initialAccountState'),
    status: form.status,
    statusLabel: statusLabel(form.status),
    surfaceClass: 'bg-amber-50/80 border-amber-200',
  },
  {
    id: 'coach-security-review',
    title: t('sportAddCoach.securityReview'),
    value: profileImagePreview.value ? t('sportAddCoach.ready') : t('sportAddCoach.pending'),
    label: profileImagePreview.value
      ? t('sportAddCoach.profileImageSet')
      : t('sportAddCoach.profileImagePending'),
    status: profileImagePreview.value ? 'success' : 'warning',
    statusLabel: statusLabel(profileImagePreview.value ? 'success' : 'warning'),
    surfaceClass: 'bg-rose-50/80 border-rose-200',
  },
])

const checklistItems = computed(() => [
  { title: t('sportAddCoach.sidebarItems.role'), text: selectedRoleDescription.value },
  { title: t('sportAddCoach.sidebarItems.permissions'), text: t('sportAddCoach.sidebarItems.permissionsDetail') },
  { title: t('sportAddCoach.sidebarItems.security'), text: t('sportAddCoach.sidebarItems.securityDetail') },
  { title: t('sportAddCoach.sidebarItems.review'), text: t('sportAddCoach.sidebarItems.reviewDetail') },
])

async function loadPermissions() {
  try {
    form.permissions = await fetchRolePermissions(ROLES.COACH)
  } catch {
    form.permissions = DEFAULT_PERMISSIONS
  }
}

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value
}

function toggleConfirmPasswordVisibility() {
  isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value
}

async function onProfileImageChange(event) {
  const error = await handleImageChange(event, form, isFormLocked.value)
  if (error) {
    errorMessage.value = error
    showError.value = true
  }
}

function removeProfileImage() {
  removeImage(form, isFormLocked.value)
}

async function goBackToCoaches() {
  await router.push(COACHES_DIRECTORY_PATH)
}

async function goToEditMode() {
  const id = String(route.query.id || '').trim()
  if (!id) return
  await router.push({ path: '/module/sport-admin/users/add', query: { mode: 'edit', id } })
}

async function onSubmit() {
  if (isViewMode.value) return

  resetFeedback()
  const validationError = validateForm(form, isAddMode.value, t)
  if (validationError) {
    errorMessage.value = validationError
    showError.value = true
    return
  }

  isSubmitting.value = true
  try {
    const payload = getFormPayload(form, isAddMode.value)

    if (isEditMode.value && route.query.id) {
      await updateSportCoach(route.query.id, payload)
    } else {
      await createSportCoach(payload)
    }

    showSuccess.value = true
  } catch (error) {
    errorMessage.value = error?.message || (isEditMode.value ? t('sportAddCoach.validation.updateFailed') : t('sportAddCoach.validation.createFailed'))
    showError.value = true
  } finally {
    isSubmitting.value = false
  }
}

function onErrorClose() {
  showError.value = false
}

async function onSuccessClose() {
  showSuccess.value = false
  await goBackToCoaches()
}

onMounted(async () => {
  await loadPermissions()

  if (isAddMode.value) return

  const id = String(route.query.id || '').trim()
  if (!id) return

  const coach = await fetchSportCoach(id).catch(() => null)
  if (!coach?.id) return

  await initializeFormFromCoach(coach, form, statusOptions, loadPermissions)
  setImagePreview(getProfileImagePreview(coach))
})
</script>

<template>
  <MainLayout>
    <section :class="isKh ? 'add-coach-page add-coach-page--kh' : 'add-coach-page'">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <AdminSummaryCards :cards="formSummaryCards" />

      <div class="add-coach-page__layout">
        <Form
          class="add-coach-page__form"
          :title="pageTitle"
          :description="t('sportAddCoach.formDescription')"
          :cancel-text="t('common.cancel')"
          :loading="isSubmitting"
          :disabled="isViewMode"
          :show-cancel="true"
          @submit="onSubmit"
          @cancel="goBackToCoaches"
        >
          <AddCoachIntro
            :role-label="selectedRoleDescription"
            :status-label="statusLabel(form.status)"
          />

          <AddCoachFormFields
            :profile-image-preview="profileImagePreview"
            :role-options="roleOptions"
            :status-options="statusOptions"
            :permissions="form.permissions"
            :show-password-fields="isAddMode"
            :name="form.name"
            :email="form.email"
            :phone="form.phone"
            :role="form.role"
            :status="form.status"
            :password="form.password"
            :confirm-password="form.confirmPassword"
            :is-locked="isFormLocked"
            :is-password-visible="isPasswordVisible"
            :is-confirm-password-visible="isConfirmPasswordVisible"
            :role-label="roleLabel"
            :status-label="statusLabel"
            :permission-label="permissionLabel"
            @update:name="form.name = $event"
            @update:email="form.email = $event"
            @update:phone="form.phone = $event"
            @update:role="form.role = $event"
            @update:status="form.status = $event"
            @update:password="form.password = $event"
            @update:confirm-password="form.confirmPassword = $event"
            @profile-image-change="onProfileImageChange"
            @profile-image-remove="removeProfileImage"
            @toggle-password="togglePasswordVisibility"
            @toggle-confirm-password="toggleConfirmPasswordVisibility"
          />

          <template #actions>
            <AddCoachFormActions
              :is-submitting="isSubmitting"
              :is-view-mode="isViewMode"
              :is-edit-mode="isEditMode"
              @edit="goToEditMode"
              @cancel="goBackToCoaches"
            />
          </template>
        </Form>

        <div class="add-coach-page__rail">
          <AdminChecklistPanel
            :title="t('sportAddCoach.sidebarTitle')"
            :description="t('sportAddCoach.sidebarText')"
            :items="checklistItems"
            :highlight-label="t('sportAddCoach.roleScope')"
            :highlight-value="selectedRoleDescription"
          />
        </div>
      </div>
    </section>

    <AlertError
      :show="showError"
      :title="t('sportAddCoach.validationError')"
      :message="errorMessage"
      :button-text="t('common.close')"
      @close="onErrorClose"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="isEditMode ? t('sportAddCoach.coachUpdated') : t('sportAddCoach.coachCreated')"
      :message="isEditMode ? t('sportAddCoach.updatedMessage') : t('sportAddCoach.createdMessage')"
      :button-text="t('common.cancel')"
      @close="onSuccessClose"
    />
  </MainLayout>
</template>

<style scoped>
.add-coach-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.add-coach-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.95fr);
  gap: 1rem;
  align-items: start;
}

.add-coach-page__form {
  display: block;
}

.add-coach-page__rail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 1rem;
}

.add-coach-page--kh :deep(.admin-checklist-panel .p-card-title),
.add-coach-page--kh :deep(.admin-checklist-panel .p-card-content),
.add-coach-page--kh :deep(form header h3),
.add-coach-page--kh :deep(form header p),
.add-coach-page--kh :deep(.p-dialog-content),
.add-coach-page--kh :deep(.p-dialog-footer) {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.add-coach-page--kh :deep(form header p),
.add-coach-page--kh :deep(.admin-checklist-panel .p-card-content p),
.add-coach-page--kh :deep(.p-dialog-content p) {
  line-height: 1.7;
}

@media (max-width: 1120px) {
  .add-coach-page__layout {
    grid-template-columns: 1fr;
  }

  .add-coach-page__rail {
    position: static;
  }
}
</style>
