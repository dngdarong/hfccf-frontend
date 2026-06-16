import { STATUS_OPTIONS, PASSWORD_MIN_LENGTH } from '../constants/addTeacherConstants'

export function statusLabel(t: any, status: string): string {
  const normalized = String(status || '').trim().toLowerCase()
  if (!normalized) return ''
  return t(`common.status.${normalized}`) || normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export function roleLabel(t: any, value: string, teacherRole: string): string {
  if (String(value || '').trim().toLowerCase() === teacherRole) {
    return t('preschoolAddTeacher.introEyebrow')
  }
  return String(value || '-')
}

export function isBlobUrl(value: string): boolean {
  return String(value || '').startsWith('blob:')
}

export function validateForm(t: any, form: any, isAddMode: boolean): string {
  if (!form.name.trim()) return t('preschoolAddTeacher.validation.nameRequired')
  if (!form.email.trim()) return t('preschoolAddTeacher.validation.emailRequired')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t('preschoolAddTeacher.validation.emailInvalid')
  if (!form.status) return t('preschoolAddTeacher.validation.statusRequired')

  if (isAddMode || form.password || form.confirmPassword) {
    if (form.password.length < PASSWORD_MIN_LENGTH) return t('preschoolAddTeacher.validation.passwordTooShort')
    if (form.password !== form.confirmPassword) return t('preschoolAddTeacher.validation.passwordsMismatch')
  }

  return ''
}

export function populateFromTeacher(teacher: any, form: any, profileImagePreview: any, teacherRole: string) {
  form.name = teacher?.fullName || teacher?.name || teacher?.username || ''
  form.email = teacher?.email || ''
  form.phone = teacher?.phone || ''
  form.role = teacherRole
  form.status = String(teacher?.status || STATUS_OPTIONS[0]).toLowerCase()
  form.password = ''
  form.confirmPassword = ''
  form.profileImage = null
  form.removeAvatar = false
  profileImagePreview.value = String(teacher?.avatar || '').trim()
}

export function buildFormPayload(form: any, teacherRole: string) {
  return {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    role: teacherRole,
    status: form.status,
    avatar: form.profileImage,
    removeAvatar: form.removeAvatar,
    password: form.password,
    confirmPassword: form.confirmPassword,
  }
}

export function buildFormSummaryCards(t: any, form: any, rolePermissions: any[], selectedRoleDescription: string, profileImagePreview: string, statusLabelFn: (status: string) => string) {
  const permissionCount = rolePermissions.length
  const securityStatus = form.password.length >= PASSWORD_MIN_LENGTH ? 'success' : 'warning'

  return [
    {
      id: 'teacher-role',
      title: t('preschoolAddTeacher.roleScopeTitle'),
      value: selectedRoleDescription,
      label: t('preschoolAddTeacher.programAccess'),
      status: 'info',
      statusLabel: statusLabelFn('info'),
      surfaceClass: 'bg-cyan-50/80 border-cyan-200',
    },
    {
      id: 'teacher-permissions',
      title: t('preschoolAddTeacher.permissionsTitle'),
      value: permissionCount,
      label: permissionCount ? t('preschoolAddTeacher.configuredPermissions') : t('preschoolAddTeacher.permissionsFromRole'),
      status: 'success',
      statusLabel: statusLabelFn('success'),
      surfaceClass: 'bg-lime-50/80 border-lime-200',
    },
    {
      id: 'teacher-account-state',
      title: t('preschoolAddTeacher.accountStateTitle'),
      value: statusLabelFn(form.status),
      label: t('preschoolAddTeacher.initialAccountStatus'),
      status: form.status,
      statusLabel: statusLabelFn(form.status),
      surfaceClass: 'bg-amber-50/80 border-amber-200',
    },
    {
      id: 'teacher-security-review',
      title: t('preschoolAddTeacher.securityReviewTitle'),
      value: profileImagePreview ? t('preschoolAddTeacher.ready') : t('preschoolAddTeacher.pending'),
      label: profileImagePreview ? t('preschoolAddTeacher.profileImageSet') : t('preschoolAddTeacher.profileImagePending'),
      status: securityStatus,
      statusLabel: statusLabelFn(securityStatus),
      surfaceClass: 'bg-rose-50/80 border-rose-200',
    },
  ]
}

export function buildChecklistItems(t: any, selectedRoleDescription: string) {
  return [
    {
      title: t('preschoolAddTeacher.checklist.roleTitle'),
      text: selectedRoleDescription,
    },
    {
      title: t('preschoolAddTeacher.checklist.permissionsTitle'),
      text: t('preschoolAddTeacher.checklist.permissions'),
    },
    {
      title: t('preschoolAddTeacher.checklist.securityTitle'),
      text: t('preschoolAddTeacher.checklist.security'),
    },
    {
      title: t('preschoolAddTeacher.checklist.reviewTitle'),
      text: t('preschoolAddTeacher.checklist.review'),
    },
  ]
}
