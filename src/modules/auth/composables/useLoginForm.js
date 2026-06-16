import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ROLES } from '@/constants/roles'
import { useUserStore } from '@/store/userStore'

const USER_TYPE_GROUPS = Object.freeze({
  ADMIN: 'admin',
  STAFF: 'staff',
})

const adminRoleValues = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN_ENGLISH,
  ROLES.ADMIN_PRESCHOOL,
  ROLES.ADMIN_SCHOLARSHIP,
  ROLES.ADMIN_SPORT,
]

const staffRoleValues = [
  ROLES.TEACHER_ENGLISH,
  ROLES.TEACHER_PRESCHOOL,
  ROLES.TEACHER_SCHOLARSHIP,
  ROLES.COACH,
]

const userTypeOptions = [
  {
    labelKey: 'auth.loginForm.adminOption',
    value: USER_TYPE_GROUPS.ADMIN,
    roles: adminRoleValues,
  },
  {
    labelKey: 'auth.loginForm.staffOption',
    value: USER_TYPE_GROUPS.STAFF,
    roles: staffRoleValues,
  },
]

function normalizeRoleList(values = []) {
  if (!Array.isArray(values)) return []

  return values.map((role) => String(role || '').trim().toLowerCase()).filter(Boolean)
}

export function useLoginForm({ accessPolicy, language }) {
  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()
  const authStore = useUserStore()

  const isKhmer = computed(() => language.value === 'KH')

  const form = reactive({
    email: '',
    password: '',
    userType: '',
    remember: false,
  })

  const touched = reactive({
    email: false,
    password: false,
    userType: false,
  })

  const isSubmitting = computed(() => Boolean(authStore.loading))
  const errorMessage = ref('')
  const showLoginSuccess = ref(false)
  const shouldRedirectAfterSuccess = ref(false)
  const loginRedirectTarget = ref('')

  const allowedRoleValues = computed(() => normalizeRoleList(accessPolicy.allowedRoles))

  const normalizedUserType = computed(() =>
    String(form.userType || '')
      .trim()
      .toLowerCase(),
  )

  const selectedUserTypeOption = computed(() =>
    userTypeOptions.find((option) => option.value === normalizedUserType.value),
  )

  function optionMatchesAllowedRoles(option) {
    if (!allowedRoleValues.value.length) return true
    return option.roles.some((role) => allowedRoleValues.value.includes(role))
  }

  const isRoleAllowed = computed(
    () => Boolean(selectedUserTypeOption.value) && optionMatchesAllowedRoles(selectedUserTypeOption.value),
  )

  const recoveryRole = computed(() =>
    String(accessPolicy.recoveryRole || ROLES.SUPER_ADMIN)
      .trim()
      .toLowerCase(),
  )

  const canUsePasswordRecovery = computed(() =>
    Boolean(selectedUserTypeOption.value?.roles.includes(recoveryRole.value)),
  )

  const localizedUserTypeOptions = computed(() =>
    userTypeOptions
      .filter((option) => optionMatchesAllowedRoles(option))
      .map((option) => ({
        ...option,
        displayLabel: t(option.labelKey),
      })),
  )

  const emailError = computed(() => {
    if (!touched.email) return ''
    if (!form.email.trim()) return t('auth.loginForm.emailRequired')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return t('auth.loginForm.emailInvalid')
    }
    return ''
  })

  const passwordError = computed(() => {
    if (!touched.password) return ''
    if (!form.password) return t('auth.loginForm.passwordRequired')
    return ''
  })

  const userTypeError = computed(() => {
    if (!touched.userType) return ''
    if (!form.userType) return t('auth.loginForm.userTypeRequired')
    if (!isRoleAllowed.value) return t('auth.loginForm.userTypeNotAllowed')
    return ''
  })

  const isFormValid = computed(
    () =>
      Boolean(form.email.trim()) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
      Boolean(form.password) &&
      Boolean(form.userType) &&
      isRoleAllowed.value,
  )

  const localizedSubmitLabel = computed(() => {
    if (isSubmitting.value) return t('auth.loginForm.signingIn')
    return t('auth.loginForm.signIn')
  })

  function touchField(field) {
    touched[field] = true
  }


  function hasRequiredPermissionsForRole(user) {
    const role = String(user?.role || '')
      .trim()
      .toLowerCase()

    const requiredPermissions = Array.isArray(accessPolicy.requiredPermissionsByRole?.[role])
      ? accessPolicy.requiredPermissionsByRole[role]
      : []

    const userPermissions = Array.isArray(user?.permissions)
      ? user.permissions
      : Array.isArray(user?.role_permission)
        ? user.role_permission
        : []

    if (!requiredPermissions.length) return true
    if (userPermissions.includes('all:*')) return true

    return requiredPermissions.every((permission) => userPermissions.includes(permission))
  }

  function userMatchesSelectedType(user) {
    const role = String(user?.role || '')
      .trim()
      .toLowerCase()

    return Boolean(selectedUserTypeOption.value?.roles.includes(role))
  }

  async function onSubmit() {
    touched.email = true
    touched.password = true
    touched.userType = true
    errorMessage.value = ''

    if (!isFormValid.value) return

    try {
      const authenticatedUser = await authStore.login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        remember: form.remember,
      })

      if (!userMatchesSelectedType(authenticatedUser) || !isRoleAllowed.value) {
        await authStore.logout({ callApi: false })
        throw new Error(t('auth.loginForm.accountTypeMismatch'))
      }

      if (!hasRequiredPermissionsForRole(authenticatedUser)) {
        await authStore.logout({ callApi: false })
        throw new Error(t('auth.loginForm.missingRequiredPermissions'))
      }

      loginRedirectTarget.value = getRedirectTargetForRole(authenticatedUser)
      shouldRedirectAfterSuccess.value = true
      showLoginSuccess.value = true
    } catch (error) {
      errorMessage.value = error?.message || t('auth.loginForm.unableToLogin')
    }
  }

  function getSafeRedirectTarget(value) {
    const redirect = String(value || '').trim()

    if (!redirect.startsWith('/') || redirect.startsWith('//')) {
      return accessPolicy.defaultRedirect || '/module/dashboard'
    }

    return redirect
  }

  function getRedirectTargetForRole(_user) {
    return getSafeRedirectTarget(route.query.redirect || accessPolicy.defaultRedirect)
  }

  async function onLoginSuccessClose() {
    showLoginSuccess.value = false

    if (!shouldRedirectAfterSuccess.value) return

    shouldRedirectAfterSuccess.value = false
    await router.push(loginRedirectTarget.value || getSafeRedirectTarget(route.query.redirect))
  }

  return {
    t,
    isKhmer,
    form,
    isSubmitting,
    errorMessage,
    showLoginSuccess,
    canUsePasswordRecovery,
    localizedUserTypeOptions,
    emailError,
    passwordError,
    userTypeError,
    isFormValid,
    localizedSubmitLabel,
    touchField,
    onSubmit,
    onLoginSuccessClose,
  }
}
