import { getRoleAccess } from '@/constants/access'
import { resolveAvatarSource } from '@/utils/avatar'

function firstNonEmpty(...values) {
  const value = values.find((item) => {
    if (item === null || item === undefined) return false
    return String(item).trim() !== ''
  })

  return value === undefined ? '' : value
}

export function mapUser(raw = {}) {
  const firstName = String(raw.firstName || raw.first_name || '').trim()
  const lastName = String(raw.lastName || raw.last_name || '').trim()
  const fallbackName = `${firstName} ${lastName}`.trim()
  const roleAccess = getRoleAccess(String(raw.role || ''))

  const permissions = Array.isArray(raw.permissions)
    ? [...raw.permissions]
    : Array.isArray(raw.role_permission)
      ? [...raw.role_permission]
      : Array.isArray(raw.role_permissions)
        ? [...raw.role_permissions]
        : []

  const avatarSource = firstNonEmpty(
    raw.avatar,
    raw.avatar_url,
    raw.avatarUrl,
    raw.profile_photo_url,
    raw.profilePhotoUrl,
    raw.profileImage,
    raw.photo,
  )

  const avatar = resolveAvatarSource(avatarSource)

  return {
    id: raw.id ?? '',
    firstName,
    lastName,
    name: String(raw.name || fallbackName || raw.username || raw.id || ''),
    fullName: String(raw.fullName || raw.name || fallbackName || raw.username || raw.id || ''),
    username: String(raw.username || raw.id || ''),
    email: String(raw.email || ''),
    avatar,
    avatarUrl: avatar,
    profilePhotoUrl: avatar,
    role: String(raw.role || ''),
    scope: String(raw.scope || roleAccess?.scope || ''),
    domain: String(raw.domain || roleAccess?.domain || ''),
    permissions,
    role_permission: permissions,
    rolePermission: permissions,
    role_permissions: permissions,
    status: String(raw.status || ''),
    phone: String(raw.phone || ''),
    bio: raw.bio || '',
    department: raw.department || '',
    departmentCode: raw.departmentCode || raw.department_code || '',
    createdAt: raw.createdAt || raw.created_at || '',
    updatedAt: raw.updatedAt || raw.updated_at || '',
    lastLoginAt: raw.lastLoginAt || raw.last_login_at || '',
    emailVerifiedAt: raw.emailVerifiedAt || raw.email_verified_at || '',
  }
}

export function mapUsers(items = []) {
  return Array.isArray(items) ? items.map((item) => mapUser(item)) : []
}