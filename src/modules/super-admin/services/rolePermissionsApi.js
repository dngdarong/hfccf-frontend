import http from '@/services/http'
import { unwrapApiData } from '@/services/api'

function humanizePermissionCode(code) {
  const normalized = String(code || '').trim()

  if (!normalized) return ''
  if (normalized === 'all:*') return 'All permissions'

  return normalized
    .replace(/[:_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function normalizePermissionItem(permission) {
  if (typeof permission === 'string') {
    const code = permission.trim()
    return {
      code,
      name: humanizePermissionCode(code),
    }
  }

  const code = String(permission?.code || permission?.permission_code || '').trim()

  return {
    code,
    name: String(permission?.name || permission?.label || humanizePermissionCode(code)).trim(),
  }
}

export async function fetchRolePermissions(role) {
  const normalizedRole = String(role || '').trim().toLowerCase()

  if (!normalizedRole) {
    return []
  }

  const response = await http.get(`/roles/${encodeURIComponent(normalizedRole)}/permissions`)
  const payload = unwrapApiData(response)
  const permissions = Array.isArray(payload?.permissions)
    ? payload.permissions
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload)
        ? payload
        : []

  return permissions.map((permission) => normalizePermissionItem(permission))
}

export function normalizePermissionLabel(code) {
  return humanizePermissionCode(code)
}
