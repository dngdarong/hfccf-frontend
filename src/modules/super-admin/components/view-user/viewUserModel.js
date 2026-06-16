import { normalizeRole } from '@/constants/roles'
import { resolveAvatarSource } from '@/utils/avatar'

function firstNonEmpty(...values) {
  const value = values.find((item) => {
    if (item === null || item === undefined) return false
    return String(item).trim() !== ''
  })

  return value === undefined ? '' : value
}

function asText(value) {
  const normalized = String(value ?? '').trim()
  return normalized || '-'
}

function asOptionalText(value) {
  const normalized = String(value ?? '').trim()
  return normalized || ''
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

export function normalizePermissionList(raw = {}) {
  const combined = [
    ...toArray(raw.permissions),
    ...toArray(raw.role_permission),
    ...toArray(raw.rolePermission),
    ...toArray(raw.role_permissions),
  ]

  return [...new Set(combined.map((permission) => String(permission).trim()).filter(Boolean))]
}

export function roleLabel(value, translate) {
  const normalized = normalizeRole(value)

  if (!normalized) {
    return '-'
  }

  const key = `common.role.${String(normalized).replace(/[\s-]+/g, '_').toLowerCase()}`
  const translated = translate?.(key)

  return translated && translated !== key ? translated : asText(value)
}

export function statusLabel(value, translate) {
  const normalized = String(value || '').trim()

  if (!normalized) return '-'

  const key = `common.status.${normalized.replace(/[\s-]+/g, '_').toLowerCase()}`
  const translated = translate?.(key)

  return translated && translated !== key ? translated : asText(value)
}

export function statusTone(value) {
  const key = String(value || '').trim().toLowerCase()

  if (key === 'active') return 'success'
  if (key === 'pending') return 'info'
  if (key === 'inactive') return 'warning'
  if (key === 'suspended') return 'error'

  return 'info'
}

export function permissionLabel(permission, translate) {
  const normalized = String(permission || '').trim()

  if (!normalized) return '-'
  if (normalized === 'all:*') {
    const translated = translate?.('users.viewUser.fullAccess')
    return translated && translated !== 'users.viewUser.fullAccess' ? translated : 'Full access'
  }

  return normalized
}

export function formatDateTime(value) {
  const normalized = String(value || '').trim()

  if (!normalized) return '-'

  const date = new Date(normalized)

  if (Number.isNaN(date.getTime())) {
    return normalized
  }

  return date.toLocaleString()
}

export function normalizeUser(raw = {}, translate) {
  const firstName = firstNonEmpty(raw.firstName, raw.first_name)
  const lastName = firstNonEmpty(raw.lastName, raw.last_name)
  const username = firstNonEmpty(raw.username, raw.user_name, raw.id)
  const nameFromParts = [firstName, lastName].filter(Boolean).join(' ').trim()
  const name = firstNonEmpty(
    raw.name,
    raw.fullName,
    raw.full_name,
    nameFromParts,
    username,
    raw.email,
    raw.id,
  )
  const permissions = normalizePermissionList(raw)
  const role = asOptionalText(raw.role)
  const scope = asOptionalText(raw.scope)
  const domain = asOptionalText(raw.domain)
  const avatar = resolveAvatarSource(
    firstNonEmpty(
      raw.avatar,
      raw.avatar_url,
      raw.avatarUrl,
      raw.profile_photo_url,
      raw.profilePhotoUrl,
      raw.profileImage,
      raw.photo,
    ),
  )

  return {
    id: asOptionalText(firstNonEmpty(raw.id, raw.user_id)),
    firstName: asOptionalText(firstName),
    lastName: asOptionalText(lastName),
    name: asOptionalText(name),
    fullName: asOptionalText(firstNonEmpty(raw.fullName, raw.full_name, name)),
    username: asOptionalText(username),
    email: asOptionalText(raw.email),
    phone: asOptionalText(raw.phone),
    role,
    roleLabel: roleLabel(role, translate),
    scope,
    domain,
    departmentCode: asOptionalText(firstNonEmpty(raw.departmentCode, raw.department_code)),
    department: asOptionalText(raw.department),
    bio: asOptionalText(raw.bio),
    status: asOptionalText(raw.status),
    avatar,
    permissions,
    role_permission: permissions,
    rolePermission: permissions,
    role_permissions: permissions,
    createdAt: asOptionalText(firstNonEmpty(raw.createdAt, raw.created_at)),
    updatedAt: asOptionalText(firstNonEmpty(raw.updatedAt, raw.updated_at)),
    lastLoginAt: asOptionalText(firstNonEmpty(raw.lastLoginAt, raw.last_login_at)),
    emailVerifiedAt: asOptionalText(firstNonEmpty(raw.emailVerifiedAt, raw.email_verified_at)),
  }
}
