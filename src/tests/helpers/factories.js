import { ROLES } from '@/constants/roles'
import { ACCESS_SCOPES, DOMAINS } from '@/constants/access'

/**
 * Base user factory. All role-specific factories call this.
 * Override any field by passing the overrides object.
 */
export function makeUser(overrides = {}) {
  return {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    name: 'Test User',
    fullName: 'User Test',
    username: 'testuser',
    email: 'test@example.com',
    avatar: '',
    role: ROLES.ADMIN_ENGLISH,
    scope: ACCESS_SCOPES.ADMIN,
    domain: DOMAINS.ENGLISH,
    permissions: [],
    role_permission: [],
    rolePermission: [],
    role_permissions: [],
    status: 'active',
    phone: '',
    bio: '',
    ...overrides,
  }
}

export const makeSuperAdmin = (overrides = {}) =>
  makeUser({
    role: ROLES.SUPER_ADMIN,
    scope: ACCESS_SCOPES.SUPER_ADMIN,
    domain: DOMAINS.GLOBAL,
    permissions: ['all:*'],
    role_permission: ['all:*'],
    rolePermission: ['all:*'],
    role_permissions: ['all:*'],
    ...overrides,
  })

export const makeAdminEnglish = (overrides = {}) =>
  makeUser({
    role: ROLES.ADMIN_ENGLISH,
    scope: ACCESS_SCOPES.ADMIN,
    domain: DOMAINS.ENGLISH,
    ...overrides,
  })

export const makeAdminPreschool = (overrides = {}) =>
  makeUser({
    role: ROLES.ADMIN_PRESCHOOL,
    scope: ACCESS_SCOPES.ADMIN,
    domain: DOMAINS.PRESCHOOL,
    ...overrides,
  })

export const makeAdminSport = (overrides = {}) =>
  makeUser({
    role: ROLES.ADMIN_SPORT,
    scope: ACCESS_SCOPES.ADMIN,
    domain: DOMAINS.SPORT,
    ...overrides,
  })

export const makeCoach = (overrides = {}) =>
  makeUser({
    role: ROLES.COACH,
    scope: ACCESS_SCOPES.STAFF,
    domain: DOMAINS.SPORT,
    ...overrides,
  })

export const makeTeacherEnglish = (overrides = {}) =>
  makeUser({
    role: ROLES.TEACHER_ENGLISH,
    scope: ACCESS_SCOPES.STAFF,
    domain: DOMAINS.ENGLISH,
    ...overrides,
  })

export const makeTeacherPreschool = (overrides = {}) =>
  makeUser({
    role: ROLES.TEACHER_PRESCHOOL,
    scope: ACCESS_SCOPES.STAFF,
    domain: DOMAINS.PRESCHOOL,
    ...overrides,
  })
