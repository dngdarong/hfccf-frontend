import { ACCESS_SCOPES, DOMAINS } from '@/constants/access'
import { defineAppRoute } from '@/router/defineAppRoute'

export const dsamRoutes = [
  defineAppRoute({
    path: '/module/dsam/dashboard',
    name: 'dsam-dashboard',
    component: () => import('../pages/DsamDashboard.vue'),
    access: { domains: [DOMAINS.PRESCHOOL], scopes: [ACCESS_SCOPES.ADMIN, ACCESS_SCOPES.STAFF] },
  }),
  defineAppRoute({
    path: '/module/dsam/forms',
    name: 'dsam-form-list',
    component: () => import('../pages/DsamFormList.vue'),
    access: { domains: [DOMAINS.PRESCHOOL], scopes: [ACCESS_SCOPES.ADMIN] },
  }),
  defineAppRoute({
    path: '/module/dsam/forms/new',
    name: 'dsam-form-builder',
    component: () => import('../pages/DsamFormBuilder.vue'),
    access: { domains: [DOMAINS.PRESCHOOL], scopes: [ACCESS_SCOPES.ADMIN] },
  }),
  defineAppRoute({
    path: '/module/dsam/forms/:id/edit',
    name: 'dsam-form-builder-edit',
    component: () => import('../pages/DsamFormBuilder.vue'),
    access: { domains: [DOMAINS.PRESCHOOL], scopes: [ACCESS_SCOPES.ADMIN] },
  }),
  defineAppRoute({
    path: '/module/dsam/forms/:id/versions',
    name: 'dsam-form-versions',
    component: () => import('../pages/DsamFormList.vue'),  // reuse list; versions tab shown when id present
    access: { domains: [DOMAINS.PRESCHOOL], scopes: [ACCESS_SCOPES.ADMIN] },
  }),
  defineAppRoute({
    path: '/module/dsam/submissions',
    name: 'dsam-submission-list',
    component: () => import('../pages/DsamSubmissionList.vue'),
    access: { domains: [DOMAINS.PRESCHOOL], scopes: [ACCESS_SCOPES.ADMIN, ACCESS_SCOPES.STAFF] },
  }),
  defineAppRoute({
    path: '/module/dsam/submissions/:id',
    name: 'dsam-submission-detail',
    component: () => import('../pages/DsamSubmissionDetail.vue'),
    access: { domains: [DOMAINS.PRESCHOOL], scopes: [ACCESS_SCOPES.ADMIN, ACCESS_SCOPES.STAFF] },
  }),
  defineAppRoute({
    path: '/module/dsam/wizard',
    name: 'dsam-wizard',
    component: () => import('../pages/DsamWizard.vue'),
    access: { domains: [DOMAINS.PRESCHOOL], scopes: [ACCESS_SCOPES.ADMIN, ACCESS_SCOPES.STAFF] },
  }),
]
