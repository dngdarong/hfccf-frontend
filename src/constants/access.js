import { ROLES, normalizeRole } from '@/constants/roles'

export const ACCESS_SCOPES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  STAFF: 'staff',
  PORTAL: 'portal',
})

export const DOMAINS = Object.freeze({
  GLOBAL: 'global',
  ENGLISH: 'english',
  PRESCHOOL: 'preschool',
  SCHOLARSHIP: 'scholarship',
  SPORT: 'sport',
})

export const DOMAIN_SIDEBAR_TONE_CLASS = Object.freeze({
  [DOMAINS.GLOBAL]: 'sidebar-shell--super-admin',
  [DOMAINS.ENGLISH]: 'sidebar-shell--english',
  [DOMAINS.PRESCHOOL]: 'sidebar-shell--preschool',
  [DOMAINS.SCHOLARSHIP]: 'sidebar-shell--scholarship',
  [DOMAINS.SPORT]: 'sidebar-shell--sport',
})

export const ROLE_ACCESS_MAP = Object.freeze({
  [ROLES.SUPER_ADMIN]: {
    scope: ACCESS_SCOPES.SUPER_ADMIN,
    domain: DOMAINS.GLOBAL,
  },

  [ROLES.ADMIN_ENGLISH]: {
    scope: ACCESS_SCOPES.ADMIN,
    domain: DOMAINS.ENGLISH,
  },
  [ROLES.ADMIN_PRESCHOOL]: {
    scope: ACCESS_SCOPES.ADMIN,
    domain: DOMAINS.PRESCHOOL,
  },
  [ROLES.ADMIN_SCHOLARSHIP]: {
    scope: ACCESS_SCOPES.ADMIN,
    domain: DOMAINS.SCHOLARSHIP,
  },
  [ROLES.ADMIN_SPORT]: {
    scope: ACCESS_SCOPES.ADMIN,
    domain: DOMAINS.SPORT,
  },

  [ROLES.TEACHER_ENGLISH]: {
    scope: ACCESS_SCOPES.STAFF,
    domain: DOMAINS.ENGLISH,
  },
  [ROLES.TEACHER_PRESCHOOL]: {
    scope: ACCESS_SCOPES.STAFF,
    domain: DOMAINS.PRESCHOOL,
  },
  [ROLES.TEACHER_SCHOLARSHIP]: {
    scope: ACCESS_SCOPES.STAFF,
    domain: DOMAINS.SCHOLARSHIP,
  },
  [ROLES.COACH]: {
    scope: ACCESS_SCOPES.STAFF,
    domain: DOMAINS.SPORT,
  },
  [ROLES.GUARDIAN]: {
    scope: ACCESS_SCOPES.PORTAL,
    domain: DOMAINS.PRESCHOOL,
  },
})

export function getRoleAccess(role) {
  return ROLE_ACCESS_MAP[normalizeRole(role)] || null
}
