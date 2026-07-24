import { ROLES } from '@/constants/roles'

export function statusLabel(status: string | null | undefined, t: any): string {
  const normalized = String(status || '').trim()
  if (!normalized) return '-'

  const key = `common.status.${normalized.replace(/[\s-]+/g, '_').toLowerCase()}`
  const translated = t(key)
  return translated !== key ? translated : String(status || '')
}

export function roleLabel(value: string | null | undefined, t: any): string {
  const normalized = String(value || '').trim()
  if (!normalized) return '-'

  const key = `common.role.${normalized.replace(/[\s-]+/g, '_').toLowerCase()}`
  const translated = t(key)
  return translated !== key ? translated : String(value || '')
}

export function permissionLabel(value: string | null | undefined, t: any): string {
  const normalized = String(value || '').trim()
  if (!normalized) return '-'

  const key = `common.permission.${normalized.toLowerCase()}`
  const translated = t(key)
  if (translated !== key) return translated

  return String(value || '')
    .replace(/[:_]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function validateForm(form: any, isAddMode: boolean, t: any): string {
  const nameParts = String(form.name || '').trim().split(/\s+/).filter(Boolean)
  if (nameParts.length < 2) return t('sportAddCoach.validation.fullNameRequired')
  if (!form.email.trim()) return t('sportAddCoach.validation.emailRequired')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t('sportAddCoach.validation.emailInvalid')
  if (!form.status) return t('sportAddCoach.validation.statusRequired')
  if (isAddMode && form.password.length < 8) return t('sportAddCoach.validation.passwordLength')
  if (form.password || form.confirmPassword) {
    if (form.password.length < 8) return t('sportAddCoach.validation.passwordLength')
    if (form.password !== form.confirmPassword) return t('sportAddCoach.validation.passwordMismatch')
  }
  return ''
}

export function getFormPayload(form: any, isAddMode = true): Record<string, any> {
  const payload: Record<string, any> = {
    name: form.name,
    email: form.email,
    phone: form.phone,
    status: form.status,
    avatar: form.profileImage,
    removeAvatar: !form.profileImage,
  }

  if (isAddMode) {
    payload.password = form.password
    payload.confirmPassword = form.confirmPassword
  }

  return payload
}

export function initializeFormFromCoach(
  coach: any,
  form: any,
  statusOptions: string[],
  loadPermissions: () => Promise<string[]>,
) {
  form.name = coach.fullName || coach.name || coach.username || ''
  form.email = coach.email || ''
  form.phone = coach.phone || ''
  form.role = ROLES.COACH
  form.permissions = Array.isArray(coach.permissions) && coach.permissions.length
    ? coach.permissions
    : loadPermissions()
  form.status = statusOptions.find((status) => status.toLowerCase() === String(coach.status || '').toLowerCase()) || statusOptions[0]
  form.password = ''
  form.confirmPassword = ''
  form.profileImage = null
}

export function getProfileImagePreview(coach: any): string {
  return String(coach.avatar || '').trim()
}
