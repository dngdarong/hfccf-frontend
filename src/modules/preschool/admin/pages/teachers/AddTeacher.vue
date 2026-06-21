<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Form from '@/components/forms/Form.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import AdminSummaryCards from '@/modules/super-admin/components/admin-management/AdminSummaryCards.vue'
import AdminChecklistPanel from '@/modules/super-admin/components/admin-management/AdminChecklistPanel.vue'
import AddTeacherIntro from '@/modules/preschool/admin/components/add-teacher/AddTeacherIntro.vue'
import AddTeacherFormFields from '@/modules/preschool/admin/components/add-teacher/AddTeacherFormFields.vue'
import AddTeacherFormActions from '@/modules/preschool/admin/components/add-teacher/AddTeacherFormActions.vue'
import { useLanguage } from '@/composables/useLanguage'
import { ROLES } from '@/constants/roles'
import { optimizeImageFile } from '@/utils/imageOptimization'
import { fetchRolePermissions } from '@/modules/super-admin/services/rolePermissionsApi'
import {
  createPreschoolTeacher,
  fetchPreschoolTeacher,
  updatePreschoolTeacher,
} from '@/modules/preschool/services/preschoolApi'
import { TEACHER_DIRECTORY_PATH, EDIT_MODE_PATH, STATUS_OPTIONS, DEFAULT_FORM, IMAGE_MAX_SIZE, IMAGE_ALLOWED_TYPES, IMAGE_OPTIMIZE_OPTIONS } from './constants/addTeacherConstants'
import { statusLabel, roleLabel, isBlobUrl, validateForm, populateFromTeacher, buildFormPayload, buildFormSummaryCards, buildChecklistItems } from './utils/addTeacherHelpers'

defineOptions({
  name: 'PreschoolAdminAddTeacherPage',
})

const router = useRouter()
const route = useRoute()
const { t } = useLanguage()

const teacherRole = ROLES.TEACHER_PRESCHOOL
const roleOptions = [teacherRole]
const statusOptions = STATUS_OPTIONS

const form = reactive({ ...DEFAULT_FORM, role: teacherRole, status: STATUS_OPTIONS[0] })

const isSubmitting = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const profileImagePreview = ref('')
const rolePermissions = ref([])
const rolePermissionsLoading = ref(false)

const mode = computed(() => {
  if (route.query.mode === 'view') return 'view'
  if (route.query.mode === 'edit' || Boolean(route.query.id)) return 'edit'
  return 'add'
})
const isViewMode = computed(() => mode.value === 'view')
const isEditMode = computed(() => mode.value === 'edit')
const isAddMode = computed(() => mode.value === 'add')
const isFormLocked = computed(() => isSubmitting.value || isViewMode.value)
const editingTeacherId = computed(() => String(route.query.id || '').trim())

const pageTitle = computed(() => {
  if (isViewMode.value) return t('preschoolAddTeacher.viewTitle')
  if (isEditMode.value) return t('preschoolAddTeacher.updateTitle')
  return t('preschoolAddTeacher.title')
})

const pageSubtitle = computed(() => {
  if (isViewMode.value) return t('preschoolAddTeacher.pageSubtitle.view')
  if (isEditMode.value) return t('preschoolAddTeacher.pageSubtitle.edit')
  return t('preschoolAddTeacher.pageSubtitle.add')
})

function resetFeedback() {
  errorMessage.value = ''
  showError.value = false
}

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value
}

function toggleConfirmPasswordVisibility() {
  isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value
}

function getStatusLabel(status) {
  return statusLabel(t, status)
}

function getRoleLabel(value) {
  return roleLabel(t, value, teacherRole)
}

async function onProfileImageChange(event) {
  if (isFormLocked.value) return

  const [file] = event?.target?.files || []
  if (!file) return

  if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
    errorMessage.value = t('preschoolAddTeacher.validation.profileImageType')
    showError.value = true
    return
  }

  if (file.size > IMAGE_MAX_SIZE) {
    errorMessage.value = t('preschoolAddTeacher.validation.profileImageSize')
    showError.value = true
    return
  }

  const optimizedFile = await optimizeImageFile(file, IMAGE_OPTIMIZE_OPTIONS).catch(() => file)

  if (isBlobUrl(profileImagePreview.value)) {
    URL.revokeObjectURL(profileImagePreview.value)
  }

  form.profileImage = optimizedFile
  form.removeAvatar = false
  profileImagePreview.value = URL.createObjectURL(optimizedFile)
}

function removeProfileImage() {
  if (isFormLocked.value) return

  if (isBlobUrl(profileImagePreview.value)) {
    URL.revokeObjectURL(profileImagePreview.value)
  }

  profileImagePreview.value = ''
  form.profileImage = null
  form.removeAvatar = true
}

async function goBackToTeachers() {
  await router.push(TEACHER_DIRECTORY_PATH)
}

async function goToEditMode() {
  if (!editingTeacherId.value) return
  await router.push({ path: EDIT_MODE_PATH, query: { mode: 'edit', id: editingTeacherId.value } })
}

function loadTeacherIntoForm(user) {
  populateFromTeacher(user, form, profileImagePreview, teacherRole)
}

async function loadRolePermissions() {
  rolePermissionsLoading.value = true
  try {
    rolePermissions.value = await fetchRolePermissions(teacherRole)
  } catch {
    rolePermissions.value = []
  } finally {
    rolePermissionsLoading.value = false
  }
}

async function loadTeacher() {
  if (!editingTeacherId.value) return

  try {
    const teacher = await fetchPreschoolTeacher(editingTeacherId.value)
    if (!teacher) return
    loadTeacherIntoForm(teacher)
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolAddTeacher.validation.loadFailed')
    showError.value = true
  }
}

async function onSubmit() {
  if (isViewMode.value) return

  resetFeedback()
  const validationError = validateForm(t, form, isAddMode.value)

  if (validationError) {
    errorMessage.value = validationError
    showError.value = true
    return
  }

  isSubmitting.value = true

  try {
    const payload = buildFormPayload(form, teacherRole)

    if (isEditMode.value) {
      await updatePreschoolTeacher(editingTeacherId.value, payload)
    } else {
      await createPreschoolTeacher(payload)
    }

    showSuccess.value = true
  } catch (error) {
    errorMessage.value =
      error?.message ||
      (isEditMode.value
        ? t('preschoolAddTeacher.validation.updateFailed')
        : t('preschoolAddTeacher.validation.createFailed'))
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
  await goBackToTeachers()
}

const selectedRoleDescription = computed(() => getRoleLabel(form.role))

const formSummaryCards = computed(() => buildFormSummaryCards(t, form, rolePermissions.value, selectedRoleDescription.value, profileImagePreview.value, getStatusLabel))

const checklistItems = computed(() => buildChecklistItems(t, selectedRoleDescription.value))

onMounted(async () => {
  await loadRolePermissions()

  if (isAddMode.value) {
    return
  }

  await loadTeacher()
})

onBeforeUnmount(() => {
  if (isBlobUrl(profileImagePreview.value)) {
    URL.revokeObjectURL(profileImagePreview.value)
  }
})
</script>

<template>
  <MainLayout>
    <section class="add-teacher-page">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <AdminSummaryCards :cards="formSummaryCards" />

      <div class="add-teacher-page__layout">
        <Form
          class="add-teacher-page__form"
          :title="pageTitle"
          :description="t('preschoolAddTeacher.formDescription')"
          :cancel-text="t('common.cancel')"
          :loading="isSubmitting"
          :disabled="isViewMode"
          :show-cancel="true"
          @submit="onSubmit"
          @cancel="goBackToTeachers"
        >
          <AddTeacherIntro
            :role-label="selectedRoleDescription"
            :status-label="getStatusLabel(form.status)"
          />

          <AddTeacherFormFields
            :profile-image-preview="profileImagePreview"
            :role-options="roleOptions"
            :status-options="statusOptions"
            :role-permissions="rolePermissions"
            :role-permissions-loading="rolePermissionsLoading"
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
            :role-label="getRoleLabel"
            :status-label="getStatusLabel"
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
            <AddTeacherFormActions
              :is-submitting="isSubmitting"
              :is-view-mode="isViewMode"
              :is-edit-mode="isEditMode"
              @back="goBackToTeachers"
              @edit="goToEditMode"
            />
          </template>
        </Form>

        <div class="add-teacher-page__rail">
          <AdminChecklistPanel
            :title="t('preschoolAddTeacher.sidebarTitle')"
            :description="t('preschoolAddTeacher.sidebarText')"
            :items="checklistItems"
            :highlight-label="t('preschoolAddTeacher.roleScopeTitle')"
            :highlight-value="selectedRoleDescription"
          />
        </div>
      </div>
    </section>

    <AlertError
      :show="showError"
      :title="t('preschoolAddTeacher.validation.validationError')"
      :message="errorMessage"
      :button-text="t('preschoolAddTeacher.buttons.close')"
      @close="onErrorClose"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="isEditMode ? t('preschoolAddTeacher.feedback.updatedTitle') : t('preschoolAddTeacher.feedback.createdTitle')"
      :message="
        isEditMode
          ? t('preschoolAddTeacher.feedback.updatedMessage')
          : t('preschoolAddTeacher.feedback.createdMessage')
      "
      :button-text="t('preschoolAddTeacher.buttons.backToTeachers')"
      @close="onSuccessClose"
    />
  </MainLayout>
</template>

<style scoped>
.add-teacher-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.add-teacher-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.95fr);
  gap: 1rem;
  align-items: start;
}

.add-teacher-page__form {
  display: block;
}

.add-teacher-page__rail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 1rem;
}

@media (max-width: 1120px) {
  .add-teacher-page__layout {
    grid-template-columns: 1fr;
  }

  .add-teacher-page__rail {
    position: static;
  }
}
</style>
