import { defineAsyncComponent } from 'vue'
import { ROLES } from '@/constants/roles'

/**
 * Role-specific dashboard component registry.
 * Keep this map static so dashboard resolution stays predictable.
 */
export const dashboardByRole = Object.freeze({
  [ROLES.SUPER_ADMIN]: defineAsyncComponent(() => import('@/modules/super-admin/pages/Dashboard.vue')),
  [ROLES.ADMIN_ENGLISH]: defineAsyncComponent(() => import('@/modules/english/admin/pages/Dashboard.vue')),
  [ROLES.ADMIN_PRESCHOOL]: defineAsyncComponent(() => import('@/modules/preschool/admin/pages/dashboard/PreschoolDashboard.vue')),
  [ROLES.ADMIN_SCHOLARSHIP]: defineAsyncComponent(() => import('@/modules/scholarship/admin/pages/Dashboard.vue')),
  [ROLES.ADMIN_SPORT]: defineAsyncComponent(() => import('@/modules/sport/admin/pages/dashboard/Dashboard.vue')),
  [ROLES.COACH]: defineAsyncComponent(() => import('@/modules/sport/coach/pages/Dashboard.vue')),
  [ROLES.TEACHER_ENGLISH]: defineAsyncComponent(() => import('@/modules/english/teacher/pages/Dashboard.vue')),
  [ROLES.TEACHER_PRESCHOOL]: defineAsyncComponent(() => import('@/modules/preschool/teacher/pages/Dashboard.vue')),
  [ROLES.TEACHER_SCHOLARSHIP]: defineAsyncComponent(() => import('@/modules/scholarship/teacher/pages/Dashboard.vue')),
})

/**
 * Human-readable labels for the resolved role dashboards.
 */
export const dashboardLabels = Object.freeze({
  [ROLES.SUPER_ADMIN]: 'common.role.superadmin',
  [ROLES.ADMIN_ENGLISH]: 'common.role.adminenglish',
  [ROLES.ADMIN_PRESCHOOL]: 'common.role.adminpreschool',
  [ROLES.ADMIN_SCHOLARSHIP]: 'common.role.adminscholarship',
  [ROLES.ADMIN_SPORT]: 'common.role.adminsport',
  [ROLES.COACH]: 'common.role.coach',
  [ROLES.TEACHER_ENGLISH]: 'common.role.teacher_english',
  [ROLES.TEACHER_PRESCHOOL]: 'common.role.teacher_preschool',
  [ROLES.TEACHER_SCHOLARSHIP]: 'common.role.teacher_scholarship',
})

/**
 * PrimeVue severity values for the role-specific dashboard tags.
 */
export const dashboardSeverities = Object.freeze({
  [ROLES.SUPER_ADMIN]: 'contrast',
  [ROLES.ADMIN_ENGLISH]: 'info',
  [ROLES.ADMIN_PRESCHOOL]: 'success',
  [ROLES.ADMIN_SCHOLARSHIP]: 'warn',
  [ROLES.ADMIN_SPORT]: 'danger',
  [ROLES.COACH]: 'danger',
  [ROLES.TEACHER_ENGLISH]: 'success',
  [ROLES.TEACHER_PRESCHOOL]: 'success',
  [ROLES.TEACHER_SCHOLARSHIP]: 'success',
})

