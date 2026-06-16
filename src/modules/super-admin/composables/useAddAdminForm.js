import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ROLES } from '@/constants/roles'
import {
  createAdminUser,
  updateAdminUser,
} from '@/modules/super-admin/services/adminUsersApi'
import { roleOptions, statusOptions } from './useAddAdminOptions'

/**
 * Core form state, validation, submit, and navigation for the Add/Edit Admin page.
 * Does not register lifecycle hooks — the page orchestrates onMounted.
 */
export function useAddAdminForm() {
  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()

  const form = reactive({
    name: '',
    email: '',
    phone: '',
    bio: '',
    role: ROLES.ADMIN_ENGLISH,
    status: statusOptions[0],
    password: '',
    confirmPassword: '',
    profileImage: null,
    avatarAction: 'none',
  })

  const isSubmitting = ref(false)
  const errorMessage = ref('')
  const showSuccess = ref(false)
  const showError = ref(false)
  const isPasswordVisible = ref(false)
  const isConfirmPasswordVisible = ref(false)

  const isEditMode = computed(() => route.query.mode === 'edit' || Boolean(route.query.id))
  const editingUserId = computed(() => String(route.query.id || '').trim())

  function resolvedText(key, fallback) {
    const translated = t(key)
    return translated !== key ? translated : fallback
  }

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

  function validateForm() {
    if (!form.name.trim()) return resolvedText('users.addAdmin.validation.fullNameRequired', 'Full name is required.')
    if (!form.email.trim()) return resolvedText('users.addAdmin.validation.emailRequired', 'Email is required.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return resolvedText('users.addAdmin.validation.emailInvalid', 'Please enter a valid email.')
    if (!form.role) return resolvedText('users.addAdmin.validation.roleRequired', 'Role is required.')
    if (!form.status) return resolvedText('users.addAdmin.validation.statusRequired', 'Status is required.')
    if (!isEditMode.value && form.password.length < 8) return resolvedText('users.addAdmin.validation.passwordLength', 'Password must be at least 8 characters.')
    if (isEditMode.value && form.password && form.password.length < 8) return resolvedText('users.addAdmin.validation.passwordLength', 'Password must be at least 8 characters.')
    if (form.password || form.confirmPassword) {
      if (form.password !== form.confirmPassword) return resolvedText('users.addAdmin.validation.passwordMismatch', 'Passwords do not match.')
    }
    return ''
  }

  async function onSubmit() {
    resetFeedback()
    const validationError = validateForm()
    if (validationError) {
      errorMessage.value = validationError
      showError.value = true
      return
    }

    isSubmitting.value = true
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        bio: form.bio,
        role: form.role,
        status: form.status,
        avatar: form.profileImage,
        removeAvatar: form.avatarAction === 'remove',
        password: form.password,
        confirmPassword: form.confirmPassword,
      }

      if (isEditMode.value) {
        await updateAdminUser(editingUserId.value, payload)
      } else {
        await createAdminUser(payload)
      }

      showSuccess.value = true
    } catch (error) {
      errorMessage.value = isEditMode.value
        ? error?.message || resolvedText('users.addAdmin.validation.updateFailed', 'Unable to update user right now.')
        : error?.message || resolvedText('users.addAdmin.validation.createFailed', 'Unable to create user right now.')
      showError.value = true
    } finally {
      isSubmitting.value = false
    }
  }

  async function onCancel() {
    await router.push('/module/super-admin/users/manage')
  }

  async function onSuccessClose() {
    showSuccess.value = false
    await router.push('/module/super-admin/users/manage')
  }

  function onErrorClose() {
    showError.value = false
  }

  function populateFromUser(found) {
    form.name = found.name || found.username || ''
    form.email = found.email || ''
    form.phone = found.phone || ''
    form.bio = found.bio || ''
    form.role = found.role || roleOptions[0]
    const normalizedStatus = String(found.status || '')
    const matched = statusOptions.find(
      (s) => s.toLowerCase() === normalizedStatus.toLowerCase(),
    )
    form.status = matched || statusOptions[0]
  }

  return {
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
    resetFeedback,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    validateForm,
    onSubmit,
    onCancel,
    onSuccessClose,
    onErrorClose,
    populateFromUser,
  }
}
