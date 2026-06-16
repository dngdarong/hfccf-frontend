export function formatPermissionLabel(permission: string): string {
  return String(permission || '')
    .replace(/[:_.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase()) || '—'
}

export function normalizePermissions(perms: any): any[] {
  if (Array.isArray(perms)) return perms
  return []
}

export function buildPermissionChips(permissions: any[]) {
  return permissions.map((permission, index) => ({
    raw: permission,
    label: formatPermissionLabel(permission),
    tone: index % 4,
  }))
}

export function buildSummaryCards(teacher: any, permissionCount: number, t: any) {
  const hasEmail = Boolean(String(teacher?.email || '').trim())
  const hasPhone = Boolean(String(teacher?.phone || '').trim())

  return [
    {
      key: 'permissions',
      label: t('preschoolTeacherView.summary.permissions'),
      value: String(permissionCount),
      caption: t('preschoolTeacherView.summary.permissionsCaption'),
    },
    {
      key: 'contact',
      label: t('preschoolTeacherView.summary.contact'),
      value: hasEmail || hasPhone ? t('preschoolTeacherView.summary.contactReady') : t('preschoolTeacherView.summary.contactMissing'),
      caption: t('preschoolTeacherView.summary.contactCaption'),
    },
    {
      key: 'account',
      label: t('preschoolTeacherView.summary.account'),
      value: teacher?.username || '—',
      caption: t('preschoolTeacherView.summary.accountCaption'),
    },
    {
      key: 'status',
      label: t('preschoolTeacherView.summary.status'),
      value: String(teacher?.status || '—'),
      caption: t('preschoolTeacherView.summary.statusCaption'),
    },
  ]
}

export function getTeacherDisplayName(teacher: any): string {
  return teacher?.name || teacher?.fullName || '—'
}
