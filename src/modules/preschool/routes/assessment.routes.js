/**
 * Assessment Module Routes
 *
 * Routes for the Preschool Assessment module including:
 * - Dashboard (hub page)
 * - List (management with filters)
 * - Reports (analytics)
 * - Settings (configuration)
 */

export const assessmentRoutes = [
  {
    path: 'assessments',
    name: 'preschool-assessment-dashboard',
    component: () => import('@/modules/preschool/admin/pages/assessments/AssessmentDashboard.vue'),
    meta: {
      requiresAuth: true,
      scopes: ['adminpreschool', 'teacher-preschool'],
      title: 'Assessment Dashboard',
      breadcrumbs: [
        { label: 'Preschool', name: 'dashboard-preschool-admin' },
        { label: 'Assessments', active: true },
      ],
    },
  },

  {
    path: 'assessments/list',
    name: 'preschool-assessment-list',
    component: () => import('@/modules/preschool/admin/pages/assessments/AssessmentListPage.vue'),
    meta: {
      requiresAuth: true,
      scopes: ['adminpreschool', 'teacher-preschool'],
      title: 'Assessment Management',
      breadcrumbs: [
        { label: 'Preschool', name: 'dashboard-preschool-admin' },
        { label: 'Assessments', name: 'preschool-assessment-dashboard' },
        { label: 'Manage', active: true },
      ],
    },
  },

  {
    path: 'assessments/form-builder',
    name: 'preschool-assessment-form-builder',
    component: () => import('@/modules/preschool/admin/pages/assessments/AssessmentFormBuilderPage.vue'),
    meta: {
      requiresAuth: true,
      scopes: ['adminpreschool'],
      title: 'Assessment Form Builder',
      breadcrumbs: [
        { label: 'Preschool', name: 'dashboard-preschool-admin' },
        { label: 'Assessments', name: 'preschool-assessment-dashboard' },
        { label: 'Form Builder', active: true },
      ],
    },
  },

  {
    path: 'assessments/reports',
    name: 'preschool-assessment-reports',
    component: () => import('@/modules/preschool/admin/pages/assessments/AssessmentReportsPage.vue'),
    meta: {
      requiresAuth: true,
      scopes: ['adminpreschool', 'teacher-preschool'],
      title: 'Assessment Reports',
      breadcrumbs: [
        { label: 'Preschool', name: 'dashboard-preschool-admin' },
        { label: 'Assessments', name: 'preschool-assessment-dashboard' },
        { label: 'Reports', active: true },
      ],
    },
  },

  {
    path: 'assessments/settings',
    name: 'preschool-assessment-settings',
    component: () => import('@/modules/preschool/admin/pages/assessments/AssessmentSettingsPage.vue'),
    meta: {
      requiresAuth: true,
      scopes: ['adminpreschool'],
      title: 'Assessment Settings',
      breadcrumbs: [
        { label: 'Preschool', name: 'dashboard-preschool-admin' },
        { label: 'Assessments', name: 'preschool-assessment-dashboard' },
        { label: 'Settings', active: true },
      ],
    },
  },
]
