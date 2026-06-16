import { ACCESS_SCOPES, DOMAINS } from '@/constants/access'
import { defineAppRoute } from '@/router/defineAppRoute'

export const assessmentRoutes = [
  defineAppRoute({
    path: '/module/assessment',
    name: 'assessment-tracker',
    component: () => import('../pages/AssessmentTracker.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN, ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/assessment/dashboard',
    name: 'assessment-dashboard',
    component: () => import('../pages/AssessmentDashboard.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/assessment/forms',
    name: 'assessment-form-list',
    component: () => import('../pages/AssessmentFormList.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/assessment/forms/new',
    name: 'assessment-form-create',
    component: () => import('../pages/AssessmentFormBuilder.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/assessment/forms/:id/edit',
    name: 'assessment-form-edit',
    component: () => import('../pages/AssessmentFormBuilder.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/assessment/forms/:id/scoring',
    name: 'assessment-scoring',
    component: () => import('../pages/AssessmentScoringManager.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/assessment/forms/:id/print',
    name: 'assessment-print-designer',
    component: () => import('../pages/AssessmentPrintDesigner.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/assessment/submissions',
    name: 'assessment-submission-list',
    component: () => import('../pages/AssessmentSubmissionList.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN, ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/assessment/submissions/:id',
    name: 'assessment-submission-detail',
    component: () => import('../pages/AssessmentSubmissionDetail.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN, ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/assessment/wizard',
    name: 'assessment-wizard',
    component: () => import('../pages/AssessmentWizard.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN, ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/assessment/reports',
    name: 'assessment-reports',
    component: () => import('../pages/AssessmentReports.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/assessment/audit-logs',
    name: 'assessment-audit-logs',
    component: () => import('../pages/AssessmentAuditLogs.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
]
