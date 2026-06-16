import { ACCESS_SCOPES, DOMAINS } from '@/constants/access'
import { defineAppRoute } from '@/router/defineAppRoute'

export const scholarshipRoutes = [
  defineAppRoute({
    path: '/module/scholarship-admin/dashboard',
    name: 'dashboard-scholarship-admin',
    component: () => import('@/modules/scholarship/admin/pages/Dashboard.vue'),
    access: {
      domains: [DOMAINS.SCHOLARSHIP],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/scholarship-admin/applications',
    name: 'dashboard-scholarship-admin-users',
    component: () => import('@/modules/scholarship/admin/pages/ScholarshipApplications.vue'),
    access: {
      domains: [DOMAINS.SCHOLARSHIP],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/scholarship-admin/students',
    name: 'dashboard-scholarship-admin-students',
    component: () => import('@/modules/scholarship/admin/pages/ScholarshipStudents.vue'),
    access: {
      domains: [DOMAINS.SCHOLARSHIP],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/scholarship-teacher/dashboard',
    name: 'dashboard-scholarship-teacher',
    component: () => import('@/modules/scholarship/teacher/pages/Dashboard.vue'),
    access: {
      domains: [DOMAINS.SCHOLARSHIP],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/scholarship-teacher/applications',
    name: 'dashboard-scholarship-teacher-applications',
    component: () => import('@/modules/scholarship/teacher/pages/ScholarshipStudents.vue'),
    access: {
      domains: [DOMAINS.SCHOLARSHIP],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/scholarship-teacher/reviews',
    name: 'dashboard-scholarship-teacher-reviews',
    component: () => import('@/modules/scholarship/teacher/pages/ScoreManagement.vue'),
    access: {
      domains: [DOMAINS.SCHOLARSHIP],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
]
