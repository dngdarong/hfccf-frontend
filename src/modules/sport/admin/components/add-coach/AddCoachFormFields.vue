<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AddAdminProfileImageField from '@/modules/super-admin/components/admin-management/AddAdminProfileImageField.vue'
import AddAdminIdentityFields from '@/modules/super-admin/components/admin-management/AddAdminIdentityFields.vue'
import RolePermissionsPreview from '@/modules/super-admin/components/add-admin/RolePermissionsPreview.vue'
import AddAdminPasswordFields from '@/modules/super-admin/components/admin-management/AddAdminPasswordFields.vue'

defineOptions({
  name: 'AddCoachFormFields',
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
  permissions: {
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
  roleLabel: {
    type: Function,
    required: true,
  },
  statusLabel: {
    type: Function,
    required: true,
  },
  permissionLabel: {
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

const { t } = useI18n()
const labels = computed(() => ({
  profileImage: t('sportAddCoach.profileImage'),
  removeImage: t('sportAddCoach.removeImage'),
  fullName: t('sportAddCoach.fullName'),
  email: t('sportAddCoach.email'),
  phone: t('sportAddCoach.phone'),
  role: t('sportAddCoach.role'),
  status: t('sportAddCoach.status'),
  permissions: t('sportAddCoach.permissions'),
  password: t('sportAddCoach.password'),
  confirmPassword: t('sportAddCoach.confirmPassword'),
  showPassword: t('sportAddCoach.showPassword'),
  hidePassword: t('sportAddCoach.hidePassword'),
}))
const placeholders = computed(() => ({
  fullName: t('sportAddCoach.enterFullName'),
  email: t('sportAddCoach.emailPlaceholder'),
  phone: t('sportAddCoach.phonePlaceholder'),
  password: t('sportAddCoach.minimumPassword'),
  confirmPassword: t('sportAddCoach.reenterPassword'),
}))
</script>

<template>
  <div class="add-coach-form-fields">
    <AddAdminProfileImageField
      class="add-coach-form-fields__field add-coach-form-fields__field--full"
      :title="labels.profileImage"
      :preview="profileImagePreview"
      :remove-label="labels.removeImage"
      :disabled="isLocked"
      @change="emit('profile-image-change', $event)"
      @remove="emit('profile-image-remove')"
    />

    <AddAdminIdentityFields
      class="add-coach-form-fields__field add-coach-form-fields__field--full"
      :name="name"
      :email="email"
      :phone="phone"
      :role="role"
      :status="status"
      :role-options="roleOptions"
      :status-options="statusOptions"
      :disabled="isLocked"
      :name-label="labels.fullName"
      :email-label="labels.email"
      :phone-label="labels.phone"
      :role-label-text="labels.role"
      :status-label-text="labels.status"
      :name-placeholder="placeholders.fullName"
      :email-placeholder="placeholders.email"
      :phone-placeholder="placeholders.phone"
      :role-label="roleLabel"
      :status-label="statusLabel"
      @update:name="emit('update:name', $event)"
      @update:email="emit('update:email', $event)"
      @update:phone="emit('update:phone', $event)"
      @update:role="emit('update:role', $event)"
      @update:status="emit('update:status', $event)"
    />

    <RolePermissionsPreview
      class="add-coach-form-fields__field add-coach-form-fields__field--full"
      :role="role"
      :permissions="permissions"
    />

    <AddAdminPasswordFields
      class="add-coach-form-fields__field add-coach-form-fields__field--full"
      :password="password"
      :confirm-password="confirmPassword"
      :disabled="isLocked"
      :password-visible="isPasswordVisible"
      :confirm-password-visible="isConfirmPasswordVisible"
      :password-label="labels.password"
      :confirm-password-label="labels.confirmPassword"
      :password-placeholder="placeholders.password"
      :confirm-password-placeholder="placeholders.confirmPassword"
      :show-password-label="labels.showPassword"
      :hide-password-label="labels.hidePassword"
      @update:password="emit('update:password', $event)"
      @update:confirm-password="emit('update:confirmPassword', $event)"
      @toggle-password="emit('toggle-password')"
      @toggle-confirm-password="emit('toggle-confirm-password')"
    />
  </div>
</template>

<style scoped>
.add-coach-form-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.add-coach-form-fields__field {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
}

.add-coach-form-fields__field--full {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .add-coach-form-fields {
    grid-template-columns: 1fr;
  }
}
</style>
