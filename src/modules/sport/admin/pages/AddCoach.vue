<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Form from '@/components/forms/Form.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import { ROLES } from '@/constants/roles'
import { useLanguage } from '@/composables/useLanguage'
import { mapUser } from '@/services/mappers/userMapper'
import usersMock from '@/mocks/users.json'
import AddCoachIntro from '@/modules/sport/admin/components/add-coach/AddCoachIntro.vue'
import AddCoachFormFields from '@/modules/sport/admin/components/add-coach/AddCoachFormFields.vue'
import AddCoachFormActions from '@/modules/sport/admin/components/add-coach/AddCoachFormActions.vue'
import AdminSummaryCards from '@/modules/super-admin/components/admin-management/AdminSummaryCards.vue'
import AdminChecklistPanel from '@/modules/super-admin/components/admin-management/AdminChecklistPanel.vue'

defineOptions({
  name: 'SportAdminAddCoachPage',
})

const router = useRouter()
const route = useRoute()
const { t, language } = useLanguage()

const coachDirectoryPath = '/module/sport-admin/users'
const roleOptions = [ROLES.COACH]
const statusOptions = ['active', 'pending', 'inactive', 'suspended']
const permissionOptions = ['dashboard:read', 'athletes:read', 'training:write', 'tasks:read']
const allowedProfileImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const maxProfileImageSizeBytes = 2 * 1024 * 1024

const form = reactive({
  name: '',
  email: '',
  phone: '',
  role: ROLES.COACH,
  permissions: permissionOptions.slice(0, 3),
  status: statusOptions[0],
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
const profileImagePreview = ref('')
const profileImageObjectUrl = ref('')

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

function cleanupProfileImageObjectUrl() {
  if (!profileImageObjectUrl.value) return
  URL.revokeObjectURL(profileImageObjectUrl.value)
  profileImageObjectUrl.value = ''
}

function resetFeedback() {
  errorMessage.value = ''
  showError.value = false
}

function statusLabel(status) {
  const key = `common.status.${String(status || '').replace(/[\s-]+/g, '_').toLowerCase()}`
  const translated = t(key)
  return translated !== key ? translated : String(status || '')
}

function roleLabel(value) {
  const key = `common.role.${String(value || '').replace(/[\s-]+/g, '_').toLowerCase()}`
  const translated = t(key)
  return translated !== key ? translated : String(value || '')
}

function permissionLabel(value) {
  const key = `common.permission.${String(value || '').trim().toLowerCase()}`
  const translated = t(key)
  if (translated !== key) return translated

  return String(value || '')
    .replace(/[:_]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
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

const formSummaryCards = computed(() => {
  const permissionCount = form.permissions.length
  const securityStatus =
    form.password.length >= 6 && form.confirmPassword === form.password ? 'success' : 'warning'

  return [
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
      value: permissionCount,
      label: permissionCount
        ? t('sportAddCoach.configuredPermissions')
        : t('sportAddCoach.noPermissionsSelected'),
      status: permissionCount ? 'success' : 'warning',
      statusLabel: statusLabel(permissionCount ? 'success' : 'warning'),
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
      status: securityStatus,
      statusLabel: statusLabel(securityStatus),
      surfaceClass: 'bg-rose-50/80 border-rose-200',
    },
  ]
})

const checklistItems = computed(() => [
  {
    title: t('sportAddCoach.sidebarItems.role'),
    text: selectedRoleDescription.value,
  },
  {
    title: t('sportAddCoach.sidebarItems.permissions'),
    text: t('sportAddCoach.sidebarItems.permissionsDetail'),
  },
  {
    title: t('sportAddCoach.sidebarItems.security'),
    text: t('sportAddCoach.sidebarItems.securityDetail'),
  },
  {
    title: t('sportAddCoach.sidebarItems.review'),
    text: t('sportAddCoach.sidebarItems.reviewDetail'),
  },
])

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value
}

function toggleConfirmPasswordVisibility() {
  isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value
}

function hasPermission(permission) {
  return form.permissions.includes(permission)
}

function togglePermission(permission) {
  if (isFormLocked.value) return

  if (hasPermission(permission)) {
    form.permissions = form.permissions.filter((value) => value !== permission)
    return
  }

  form.permissions = [...form.permissions, permission]
}

function onProfileImageChange(event) {
  if (isFormLocked.value) return

  const [file] = event?.target?.files || []
  if (!file) return

  if (!allowedProfileImageTypes.includes(file.type)) {
    errorMessage.value = t('sportAddCoach.validation.imageType')
    showError.value = true
    return
  }

  if (file.size > maxProfileImageSizeBytes) {
    errorMessage.value = t('sportAddCoach.validation.imageSize')
    showError.value = true
    return
  }

  cleanupProfileImageObjectUrl()
  profileImageObjectUrl.value = URL.createObjectURL(file)
  profileImagePreview.value = profileImageObjectUrl.value
  form.profileImage = file
}

function removeProfileImage() {
  if (isFormLocked.value) return
  cleanupProfileImageObjectUrl()
  profileImagePreview.value = ''
  form.profileImage = null
}

function validateForm() {
  if (!form.name.trim()) return t('sportAddCoach.validation.fullNameRequired')
  if (!form.email.trim()) return t('sportAddCoach.validation.emailRequired')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t('sportAddCoach.validation.emailInvalid')
  if (!form.role) return t('sportAddCoach.validation.roleRequired')
  if (!form.permissions.length) return t('sportAddCoach.validation.permissionsRequired')
  if (!form.status) return t('sportAddCoach.validation.statusRequired')
  if (form.password.length < 6) return t('sportAddCoach.validation.passwordLength')
  if (form.password !== form.confirmPassword) return t('sportAddCoach.validation.passwordMismatch')
  return ''
}

async function goBackToCoaches() {
  await router.push(coachDirectoryPath)
}

async function goToEditMode() {
  const id = String(route.query.id || '').trim()
  if (!id) return
  await router.push({ path: '/module/sport-admin/users/add', query: { mode: 'edit', id } })
}

async function onSubmit() {
  if (isViewMode.value) return

  resetFeedback()
  const validationError = validateForm()
  if (validationError) {
    errorMessage.value = validationError
    showError.value = true
    return
  }

  isSubmitting.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 700))
    showSuccess.value = true
  } catch {
    errorMessage.value = isEditMode.value
      ? t('sportAddCoach.validation.updateFailed')
      : t('sportAddCoach.validation.createFailed')
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

function populateFromUser(user) {
  form.name = user.name || user.username || ''
  form.email = user.email || ''
  form.phone = user.phone || ''
  form.role = user.role || ROLES.COACH
  form.permissions = Array.isArray(user.permissions) ? [...user.permissions] : permissionOptions.slice(0, 3)

  const normalizedStatus = String(user.status || '')
  const matchedStatus = statusOptions.find(
    (status) => status.toLowerCase() === normalizedStatus.toLowerCase(),
  )
  form.status = matchedStatus || statusOptions[0]
  form.password = 'Coach@123'
  form.confirmPassword = 'Coach@123'
  form.profileImage = null
  cleanupProfileImageObjectUrl()
  profileImagePreview.value = String(user.avatar || '').trim()
}

onMounted(() => {
  if (isAddMode.value) return

  const id = String(route.query.id || '').trim()
  const found = mapUser(
    usersMock.find(
      (item) => String(item.id) === id && String(item.role || '').toLowerCase() === ROLES.COACH,
    ) || {},
  )

  if (!found?.id) return
  populateFromUser(found)
})

onBeforeUnmount(() => {
  cleanupProfileImageObjectUrl()
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
            :permission-options="permissionOptions"
            :permissions="form.permissions"
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
            @toggle-permission="togglePermission"
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
