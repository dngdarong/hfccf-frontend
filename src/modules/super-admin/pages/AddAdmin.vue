<script setup>
import { computed, onMounted, toRef } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Form from '@/components/forms/Form.vue'
import Button from '@/components/buttons/Button.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import AdminSummaryCards from '@/modules/super-admin/components/admin-management/AdminSummaryCards.vue'
import AdminChecklistPanel from '@/modules/super-admin/components/admin-management/AdminChecklistPanel.vue'
import AddAdminProfileImageField from '@/modules/super-admin/components/admin-management/AddAdminProfileImageField.vue'
import AddAdminIdentityFields from '@/modules/super-admin/components/admin-management/AddAdminIdentityFields.vue'
import AddAdminBioField from '@/modules/super-admin/components/admin-management/AddAdminBioField.vue'
import AddAdminPasswordFields from '@/modules/super-admin/components/admin-management/AddAdminPasswordFields.vue'
import RolePermissionsPreview from '@/modules/super-admin/components/add-admin/RolePermissionsPreview.vue'
import { findAdminUserById } from '@/modules/super-admin/services/adminUsersApi'
import { useAddAdminForm } from '@/modules/super-admin/composables/useAddAdminForm'
import { useAddAdminAvatar } from '@/modules/super-admin/composables/useAddAdminAvatar'
import { roleOptions, statusOptions, useAddAdminOptions } from '@/modules/super-admin/composables/useAddAdminOptions'

defineOptions({
  name: 'AddUserPage',
})

const route = useRoute()
const { t } = useI18n()

// ─── composables ──────────────────────────────────────────────────────────────

const {
  form,
  isSubmitting,
  errorMessage,
  showSuccess,
  showError,
  isPasswordVisible,
  isConfirmPasswordVisible,
  isEditMode,
  editingUserId,
  resolvedText,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
  onSubmit,
  onCancel,
  onSuccessClose,
  onErrorClose,
  populateFromUser,
} = useAddAdminForm()

const {
  profileImagePreview,
  profileImageFallbackLabel,
  initFromUser,
  changeProfileImage,
  removeProfileImage,
} = useAddAdminAvatar({ form })

const {
  rolePermissions,
  rolePermissionsLoading,
  statusLabel,
  roleLabel,
} = useAddAdminOptions({ roleRef: toRef(form, 'role') })

// ─── initialization ───────────────────────────────────────────────────────────

onMounted(async () => {
  if (!isEditMode.value) {
    const requestedRole = String(route.query.role || '').trim()
    if (roleOptions.includes(requestedRole)) {
      form.role = requestedRole
    }
    return
  }

  const found = await findAdminUserById(editingUserId.value)
  if (!found) return
  populateFromUser(found)
  initFromUser(found.avatar)
})

// ─── avatar handler (bridges avatar composable with page error state) ─────────

async function onProfileImageChange(event) {
  const error = await changeProfileImage(event)
  if (error) {
    errorMessage.value = error
    showError.value = true
  }
}

// ─── page text ────────────────────────────────────────────────────────────────

const pageTitle = computed(() =>
  isEditMode.value
    ? resolvedText('users.addAdmin.updateTitle', 'Update User')
    : resolvedText('users.addAdmin.title', 'Add User'),
)

const pageSubtitle = computed(() =>
  isEditMode.value
    ? resolvedText(
        'users.addAdmin.updateSubtitle',
        'Update the user profile, role-driven permissions, and account security details.',
      )
    : resolvedText(
        'users.addAdmin.summary',
        'Create a new system account, choose a role, and review the automatically assigned permissions before saving.',
      ),
)

const resolvedFormDescription = computed(() =>
  resolvedText(
    'users.addAdmin.formDescription',
    'Use the profile details, role selection, and permission preview below to create the account.',
  ),
)

const selectedRoleDescription = computed(() => roleLabel(form.role))

// ─── summary cards & checklist ────────────────────────────────────────────────

const formSummaryCards = computed(() => {
  const permissionCount = rolePermissions.value.length
  const securityStatus =
    isEditMode.value || (form.password.length >= 6 && form.confirmPassword === form.password)
      ? 'success'
      : 'warning'

  return [
    {
      id: 'role-scope',
      title: resolvedText('users.addAdmin.roleScope', 'Role scope'),
      value: selectedRoleDescription.value,
      label: resolvedText('users.addAdmin.programAccess', 'Account access'),
      status: 'info',
      statusLabel: statusLabel('info'),
      surfaceClass: 'bg-cyan-50/80 border-cyan-200',
    },
    {
      id: 'permissions',
      title: resolvedText('users.addAdmin.permissions', 'Permissions'),
      value: permissionCount,
      label: permissionCount
        ? resolvedText('users.addAdmin.configuredPermissions', 'Role-based permissions loaded')
        : resolvedText('users.addAdmin.noPermissionsSelected', 'No permissions available'),
      status: permissionCount ? 'success' : 'warning',
      statusLabel: statusLabel(permissionCount ? 'success' : 'warning'),
      surfaceClass: 'bg-lime-50/80 border-lime-200',
    },
    {
      id: 'account-state',
      title: resolvedText('users.addAdmin.accountState', 'Account state'),
      value: statusLabel(form.status),
      label: resolvedText('users.addAdmin.initialAccountState', 'Initial account state'),
      status: form.status,
      statusLabel: statusLabel(form.status),
      surfaceClass: 'bg-amber-50/80 border-amber-200',
    },
    {
      id: 'security-review',
      title: resolvedText('users.addAdmin.securityReview', 'Security review'),
      value: profileImagePreview.value
        ? resolvedText('users.addAdmin.ready', 'Ready')
        : resolvedText('users.addAdmin.pending', 'Pending'),
      label: profileImagePreview.value
        ? resolvedText('users.addAdmin.profileImageSet', 'Profile image set')
        : resolvedText('users.addAdmin.profileImagePending', 'Profile image pending'),
      status: securityStatus,
      statusLabel: statusLabel(securityStatus),
      surfaceClass: 'bg-rose-50/80 border-rose-200',
    },
  ]
})

const checklistItems = computed(() => [
  {
    title: resolvedText('users.addAdmin.sidebarItems.role', 'Choose a role'),
    text: selectedRoleDescription.value,
  },
  {
    title: resolvedText('users.addAdmin.sidebarItems.permissions', 'Review permissions'),
    text: resolvedText(
      'users.addAdmin.sidebarItems.permissionsDetail',
      'The permission list is locked to the selected role and cannot be edited manually.',
    ),
  },
  {
    title: resolvedText('users.addAdmin.sidebarItems.security', 'Check security'),
    text: resolvedText(
      'users.addAdmin.sidebarItems.securityDetail',
      'Password strength and image upload are part of the final review.',
    ),
  },
  {
    title: resolvedText('users.addAdmin.sidebarItems.review', 'Review summary'),
    text: resolvedText(
      'users.addAdmin.sidebarItems.reviewDetail',
      'Use the summary cards to confirm the account is ready.',
    ),
  },
])
</script>

<template>
  <MainLayout>
    <section class="add-admin-page">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <AdminSummaryCards :cards="formSummaryCards" />

      <div class="add-admin-page__layout">
      <Form
        class="add-admin-page__form"
        :title="pageTitle"
        :description="resolvedFormDescription"
        :submit-text="pageTitle"
          :cancel-text="t('common.cancel')"
          :loading="isSubmitting"
          :show-cancel="true"
          @submit="onSubmit"
          @cancel="onCancel"
        >
          <div class="add-admin-page__intro">
            <div>
              <p class="text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-surface-500">
                {{ pageTitle }}
              </p>
              <p class="mt-1 text-[0.92rem] leading-6 text-slate-600">
                {{ pageSubtitle }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                class="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[0.74rem] font-semibold text-brand-800"
              >
                {{ selectedRoleDescription }}
              </span>
              <span
                class="inline-flex items-center rounded-full border border-surface-200 bg-slate-50 px-3 py-1 text-[0.74rem] font-semibold text-slate-700"
              >
                {{ statusLabel(form.status) }}
              </span>
            </div>
          </div>

          <div class="add-admin-page__grid">
            <AddAdminProfileImageField
              class="add-admin-page__field add-admin-page__field--full"
              :title="t('users.addAdmin.profileImage')"
              :preview="profileImagePreview"
              :fallback-label="profileImageFallbackLabel"
              :remove-label="t('users.addAdmin.removeImage')"
              :disabled="isSubmitting"
              @change="onProfileImageChange"
              @remove="removeProfileImage"
            />

            <AddAdminIdentityFields
              class="add-admin-page__field add-admin-page__field--full"
              v-model:name="form.name"
              v-model:email="form.email"
              v-model:phone="form.phone"
              v-model:role="form.role"
              v-model:status="form.status"
              :role-options="roleOptions"
              :status-options="statusOptions"
              :disabled="isSubmitting"
              :name-label="t('users.addAdmin.fullName')"
              :email-label="t('users.addAdmin.email')"
              :phone-label="t('users.addAdmin.phone')"
              :role-label-text="t('users.addAdmin.role')"
              :status-label-text="t('users.addAdmin.status')"
              :name-placeholder="t('users.addAdmin.enterFullName')"
              :email-placeholder="t('users.addAdmin.emailPlaceholder')"
              :phone-placeholder="t('users.addAdmin.phonePlaceholder')"
              :role-label="roleLabel"
              :status-label="statusLabel"
            />

            <AddAdminBioField
              class="add-admin-page__field add-admin-page__field--full"
              v-model:bio="form.bio"
              :label="t('users.addAdmin.bio')"
              :placeholder="t('users.addAdmin.bioPlaceholder')"
              :help-text="t('users.addAdmin.bioHelp')"
              :disabled="isSubmitting"
            />

            <RolePermissionsPreview
              class="add-admin-page__field add-admin-page__field--full"
              :role="form.role"
              :permissions="rolePermissions"
              :loading="rolePermissionsLoading"
            />

            <AddAdminPasswordFields
              v-if="!isEditMode"
              class="add-admin-page__field add-admin-page__field--full"
              v-model:password="form.password"
              v-model:confirmPassword="form.confirmPassword"
              :disabled="isSubmitting"
              :password-visible="isPasswordVisible"
              :confirm-password-visible="isConfirmPasswordVisible"
              :password-label="t('users.addAdmin.password')"
              :confirm-password-label="t('users.addAdmin.confirmPassword')"
              :password-placeholder="t('users.addAdmin.minimumPassword')"
              :confirm-password-placeholder="t('users.addAdmin.reenterPassword')"
              :show-password-label="t('users.addAdmin.showPassword')"
              :hide-password-label="t('users.addAdmin.hidePassword')"
              @toggle-password="togglePasswordVisibility"
              @toggle-confirm-password="toggleConfirmPasswordVisibility"
            />
          </div>

          <template #actions>
            <Button
              type="button"
              variant="outline"
              size="md"
              rounded="xl"
              :disabled="isSubmitting"
              @click="onCancel"
            >
              {{ t('common.cancel') }}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              rounded="xl"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              {{ pageTitle }}
            </Button>
          </template>
        </Form>

        <div class="add-admin-page__rail">
          <AdminChecklistPanel
            :title="t('users.addAdmin.sidebarTitle')"
            :description="t('users.addAdmin.sidebarText')"
            :items="checklistItems"
            :highlight-label="t('users.addAdmin.roleScope')"
            :highlight-value="selectedRoleDescription"
          />
        </div>
      </div>
    </section>

    <AlertError
      :show="showError"
      :title="resolvedText('users.addAdmin.validationError', 'Validation error')"
      :message="errorMessage"
      :button-text="t('common.close')"
      @close="onErrorClose"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="isEditMode ? resolvedText('users.addAdmin.adminUpdated', 'User updated') : resolvedText('users.addAdmin.adminCreated', 'User created')"
      :message="
        isEditMode
          ? resolvedText('users.addAdmin.updatedMessage', 'The user account was updated successfully.')
          : resolvedText('users.addAdmin.createdMessage', 'The user account was created successfully.')
      "
      :button-text="resolvedText('users.addAdmin.backToAdmins', 'Back to users')"
      @close="onSuccessClose"
    />
  </MainLayout>
</template>

<style scoped>
.add-admin-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.add-admin-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.95fr);
  gap: 1rem;
  align-items: start;
}

.add-admin-page__form {
  display: block;
}

.add-admin-page__rail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 1rem;
}

.add-admin-page__intro {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border: 1px solid #e7eaf3;
  border-radius: 1rem;
  background: linear-gradient(180deg, rgba(248, 251, 255, 1) 0%, rgba(255, 255, 255, 1) 100%);
}

.add-admin-page__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.add-admin-page__field {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
}

  .add-admin-page__field--full {
  grid-column: 1 / -1;
}

.add-admin-page__label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.add-admin-page__input {
  width: 100%;
  border: 1px solid #d4dde8;
  border-radius: 0.75rem;
  padding: 0.68rem 0.88rem;
  font-size: 0.88rem;
  color: #111827;
  background: #fcfdff;
  outline: none;
  transition: all 0.18s ease;
}

.add-admin-page__input:hover {
  border-color: #bfccdb;
}

.add-admin-page__password-wrap {
  position: relative;
}

.add-admin-page__input--password {
  padding-right: 2.75rem;
}

.add-admin-page__toggle-password {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 2.5rem;
  border: 0;
  background: transparent;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.add-admin-page__toggle-password:hover {
  color: #334155;
}

.add-admin-page__toggle-password:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-admin-page__input:focus {
  border-color: var(--hope-o-cyan-blue);
  box-shadow: 0 0 0 3px rgba(0, 174, 239, 0.15);
  background: #ffffff;
}

.add-admin-page__profile {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  align-items: center;
  border: 1px dashed #c9d9e8;
  border-radius: 0.9rem;
  background: #f9fcff;
  padding: 0.75rem;
}

.add-admin-page__profile-preview-wrap {
  width: 68px;
  height: 68px;
  border-radius: 999px;
  overflow: hidden;
  border: 2px solid #c7d9ea;
  box-shadow: 0 6px 14px -10px rgba(15, 23, 42, 0.6);
}

.add-admin-page__profile-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.add-admin-page__profile-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.add-admin-page__file-input {
  max-width: 260px;
  font-size: 0.8rem;
  color: #334155;
}

.add-admin-page__remove-image {
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #be123c;
  border-radius: 0.6rem;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.42rem 0.62rem;
}

.add-admin-page__remove-image:hover {
  background: #ffe4e6;
}

@media (max-width: 1120px) {
  .add-admin-page__layout {
    grid-template-columns: 1fr;
  }

  .add-admin-page__rail {
    position: static;
  }
}

@media (max-width: 768px) {
  .add-admin-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
