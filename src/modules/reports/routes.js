import { ACCESS_SCOPES, DOMAINS } from '@/constants/access'
import { defineAppRoute } from '@/router/defineAppRoute'

export const reportsRoutes = [
  {
    path: '/module/reports',
    redirect: '/module/reports/attendance',
  },
  defineAppRoute({
    path: '/module/reports/attendance',
    name: 'reports-attendance',
    component: () => import('@/modules/reports/pages/AttendanceReport.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/reports/student-performance',
    name: 'reports-student-performance',
    component: () => import('@/modules/reports/pages/StudentPerformance.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/reports/training',
    name: 'reports-training',
    component: () => import('@/modules/reports/pages/TrainingReport.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/reports/audit-logs',
    name: 'reports-audit-logs',
    component: () => import('@/modules/reports/pages/AuditLogs.vue'),
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
]