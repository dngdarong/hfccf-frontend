export const ROLES = Object.freeze({
  SUPER_ADMIN: 'superadmin',

  ADMIN_ENGLISH: 'adminenglish',
  ADMIN_PRESCHOOL: 'adminpreschool',
  ADMIN_SCHOLARSHIP: 'adminscholarship',
  ADMIN_SPORT: 'adminsport',

  COACH: 'coach',
  GUARDIAN: 'guardian',

  TEACHER_ENGLISH: 'teacher-english',
  TEACHER_PRESCHOOL: 'teacher-preschool',
  TEACHER_SCHOLARSHIP: 'teacher-scholarship',
})

export const PROGRAM_ADMIN_ROLES = Object.freeze([
  ROLES.ADMIN_ENGLISH,
  ROLES.ADMIN_PRESCHOOL,
  ROLES.ADMIN_SCHOLARSHIP,
  ROLES.ADMIN_SPORT,
])

export const TEACHER_ROLES = Object.freeze([
  ROLES.TEACHER_ENGLISH,
  ROLES.TEACHER_PRESCHOOL,
  ROLES.TEACHER_SCHOLARSHIP,
])

export const STAFF_ROLES = Object.freeze([
  ...PROGRAM_ADMIN_ROLES,
  ...TEACHER_ROLES,
  ROLES.COACH,
])

export function normalizeRole(role) {
  return String(role || '')
    .trim()
    .toLowerCase()
}

export const isSuperAdminRole = (role) =>
  normalizeRole(role) === ROLES.SUPER_ADMIN

export const isProgramAdminRole = (role) =>
  PROGRAM_ADMIN_ROLES.includes(normalizeRole(role))

export const isTeacherRole = (role) =>
  TEACHER_ROLES.includes(normalizeRole(role))

export const isCoachRole = (role) =>
  normalizeRole(role) === ROLES.COACH
