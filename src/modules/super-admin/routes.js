import { ACCESS_SCOPES, DOMAINS } from '@/constants/access'
import { defineAppRoute } from '@/router/defineAppRoute'

export const superAdminRoutes = [
  defineAppRoute({
    path: '/module/super-admin/dashboard',
    name: 'dashboard-super-admin',
    component: () => import('@/modules/super-admin/pages/Dashboard.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/super-admin/command-center/executive-operations',
    name: 'dashboard-super-admin-command-center-executive-operations',
    component: () => import('@/modules/preschool/admin/pages/operations/OperationsCenter.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/super-admin/command-center/workflow-approvals',
    name: 'dashboard-super-admin-command-center-workflow-approvals',
    component: () => import('@/modules/preschool/admin/pages/workflows/WorkflowApprovalCenter.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/super-admin/command-center/preschool-analytics',
    name: 'dashboard-super-admin-command-center-preschool-analytics',
    component: () => import('@/modules/preschool/admin/pages/analytics/AnalyticsDashboard.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/super-admin/users/manage',
    name: 'dashboard-super-admin-users-manage',
    component: () => import('@/modules/super-admin/pages/ManageAdmins.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/super-admin/users/:id/view',
    name: 'dashboard-super-admin-users-view',
    component: () => import('@/modules/super-admin/pages/ViewUser.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/super-admin/users/add',
    name: 'dashboard-super-admin-users-add',
    component: () => import('@/modules/super-admin/pages/AddAdmin.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
]
