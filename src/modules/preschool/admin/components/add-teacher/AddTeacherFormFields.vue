<script setup>
import { useLanguage } from '@/composables/useLanguage'
import AddAdminProfileImageField from '@/modules/super-admin/components/admin-management/AddAdminProfileImageField.vue'
import AddAdminIdentityFields from '@/modules/super-admin/components/admin-management/AddAdminIdentityFields.vue'
import AddAdminPasswordFields from '@/modules/super-admin/components/admin-management/AddAdminPasswordFields.vue'
import RolePermissionsPreview from '@/modules/super-admin/components/add-admin/RolePermissionsPreview.vue'

defineOptions({
  name: 'AddTeacherFormFields',
})

defineProps({
  profileImagePreview: {
    type: String,
    default: '',
  },
  roleOptions: {
    type: Array,
    default: () => [],
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  rolePermissions: {
    type: Array,
    default: () => [],
  },
  name: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: '',
  },
  password: {
    type: String,
    default: '',
  },
  confirmPassword: {
    type: String,
    default: '',
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  isPasswordVisible: {
    type: Boolean,
    default: false,
  },
  isConfirmPasswordVisible: {
    type: Boolean,
    default: false,
  },
  rolePermissionsLoading: {
    type: Boolean,
    default: false,
  },
  roleLabel: {
    type: Function,
    required: true,
  },
  statusLabel: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits([
  'update:name',
  'update:email',
  'update:phone',
  'update:role',
  'update:status',
  'update:password',
  'update:confirmPassword',
  'profile-image-change',
  'profile-image-remove',
  'toggle-password',
  'toggle-confirm-password',
])

const { t } = useLanguage()
</script>

<template>
  <div class="add-teacher-form-fields">
    <AddAdminProfileImageField
      class="add-teacher-form-fields__field add-teacher-form-fields__field--full"
      :title="t('preschoolAddTeacher.form.profileImageTitle')"
      :preview="profileImagePreview"
      :remove-label="t('preschoolAddTeacher.form.removeImage')"
      :disabled="isLocked"
      @change="emit('profile-image-change', $event)"
      @remove="emit('profile-image-remove')"
    />

    <AddAdminIdentityFields
      class="add-teacher-form-fields__field add-teacher-form-fields__field--full"
      :name="name"
      :email="email"
      :phone="phone"
      :role="role"
      :status="status"
      :role-options="roleOptions"
      :status-options="statusOptions"
      :disabled="isLocked"
      :name-label="t('preschoolAddTeacher.form.fullName')"
      :email-label="t('preschoolAddTeacher.form.email')"
      :phone-label="t('preschoolAddTeacher.form.phone')"
      :role-label-text="t('preschoolAddTeacher.form.role')"
      :status-label-text="t('preschoolAddTeacher.form.status')"
      :name-placeholder="t('preschoolAddTeacher.form.fullNamePlaceholder')"
      :email-placeholder="t('preschoolAddTeacher.form.emailPlaceholder')"
      :phone-placeholder="t('preschoolAddTeacher.form.phonePlaceholder')"
      :role-label="roleLabel"
      :status-label="statusLabel"
      @update:name="emit('update:name', $event)"
      @update:email="emit('update:email', $event)"
      @update:phone="emit('update:phone', $event)"
      @update:role="emit('update:role', $event)"
      @update:status="emit('update:status', $event)"
    />

    <RolePermissionsPreview
      class="add-teacher-form-fields__field add-teacher-form-fields__field--full"
      :role="role"
      :permissions="rolePermissions"
      :loading="rolePermissionsLoading"
    />

    <AddAdminPasswordFields
      class="add-teacher-form-fields__field add-teacher-form-fields__field--full"
      :password="password"
      :confirm-password="confirmPassword"
      :disabled="isLocked"
      :password-visible="isPasswordVisible"
      :confirm-password-visible="isConfirmPasswordVisible"
      :password-label="t('preschoolAddTeacher.form.password')"
      :confirm-password-label="t('preschoolAddTeacher.form.confirmPassword')"
      :password-placeholder="t('preschoolAddTeacher.form.passwordPlaceholder')"
      :confirm-password-placeholder="t('preschoolAddTeacher.form.confirmPasswordPlaceholder')"
      :show-password-label="t('preschoolAddTeacher.form.showPassword')"
      :hide-password-label="t('preschoolAddTeacher.form.hidePassword')"
      @update:password="emit('update:password', $event)"
      @update:confirm-password="emit('update:confirmPassword', $event)"
      @toggle-password="emit('toggle-password')"
      @toggle-confirm-password="emit('toggle-confirm-password')"
    />
  </div>
</template>

<style scoped>
.add-teacher-form-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.add-teacher-form-fields__field {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
}

.add-teacher-form-fields__field--full {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .add-teacher-form-fields {
    grid-template-columns: 1fr;
  }
}
</style>
