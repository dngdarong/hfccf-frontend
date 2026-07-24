import { ACCESS_SCOPES, DOMAINS } from '@/constants/access'
import { defineAppRoute } from '@/router/defineAppRoute'

// Preserve stable Preschool route names while moving legacy filenames toward
// clearer component names and explicit scaffold states.
export const preschoolRoutes = [
  defineAppRoute({
    path: '/module/preschool-admin/dashboard',
    name: 'dashboard-preschool-admin',
    component: () => import('@/modules/preschool/admin/pages/dashboard/PreschoolDashboard.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/students',
    name: 'dashboard-preschool-admin-students',
    component: () => import('@/modules/preschool/admin/pages/students/StudentInfo.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/students/add',
    name: 'dashboard-preschool-admin-students-add',
    component: () => import('@/modules/preschool/admin/pages/students/StudentForm.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/students/:id/edit',
    name: 'dashboard-preschool-admin-students-edit',
    component: () => import('@/modules/preschool/admin/pages/students/StudentForm.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/students/:id/profile',
    name: 'dashboard-preschool-admin-student-profile',
    component: () => import('@/modules/preschool/admin/pages/students/StudentProfile.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/users',
    name: 'dashboard-preschool-admin-users',
    component: () => import('@/modules/preschool/admin/pages/teachers/TeacherManagement.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/users/add',
    name: 'dashboard-preschool-admin-users-add',
    component: () => import('@/modules/preschool/admin/pages/teachers/AddTeacher.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/users/:id',
    name: 'dashboard-preschool-admin-teacher-view',
    component: () => import('@/modules/preschool/admin/pages/teachers/TeacherView.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
    defineAppRoute({
      path: '/module/preschool-admin/classes',
      name: 'dashboard-preschool-admin-classes',
      component: () => import('@/modules/preschool/admin/pages/classes/ClassesManagement.vue'),
      access: {
        domains: [DOMAINS.PRESCHOOL],
        scopes: [ACCESS_SCOPES.ADMIN],
      },
    }),
    defineAppRoute({
      path: '/module/preschool-admin/classes/add',
      name: 'dashboard-preschool-admin-classes-add',
      component: () => import('@/modules/preschool/admin/pages/classes/AddClass.vue'),
      access: {
        domains: [DOMAINS.PRESCHOOL],
        scopes: [ACCESS_SCOPES.ADMIN],
      },
    }),
    defineAppRoute({
      path: '/module/preschool-admin/classes/:id',
      name: 'dashboard-preschool-admin-class-details',
      component: () => import('@/modules/preschool/admin/pages/classes/ClassDetails.vue'),
      access: {
        domains: [DOMAINS.PRESCHOOL],
        scopes: [ACCESS_SCOPES.ADMIN],
      },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/payment',
    name: 'dashboard-preschool-admin-payment',
    component: () => import('@/modules/preschool/admin/pages/payments/PaymentManagement.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/payment/invoices',
    name: 'dashboard-preschool-admin-invoices',
    component: () => import('@/modules/preschool/admin/pages/payments/InvoiceManagement.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/payment/invoices/:id',
    name: 'dashboard-preschool-admin-invoice-detail',
    component: () => import('@/modules/preschool/admin/pages/payments/InvoiceDetail.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/payment/receipts/:id',
    name: 'dashboard-preschool-admin-receipt-view',
    component: () => import('@/modules/preschool/admin/pages/payments/ReceiptView.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/attendance',
    name: 'dashboard-preschool-admin-attendance',
    component: () => import('@/modules/preschool/admin/pages/attendance/AttendanceManagement.vue'),
    access: { domains: [DOMAINS.PRESCHOOL], scopes: [ACCESS_SCOPES.ADMIN] },
  }),
  defineAppRoute({
    path: '/preschool/operations',
    alias: '/module/preschool-admin/operations',
    name: 'dashboard-preschool-admin-operations',
    component: () => import('@/modules/preschool/admin/pages/operations/OperationsCenter.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/notifications',
    name: 'dashboard-preschool-admin-notifications',
    redirect: to => ({
      name: 'dashboard-notifications',
      query: {
        ...to.query,
        tab: 'tasks',
      },
    }),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/workflows',
    name: 'dashboard-preschool-admin-workflows',
    component: () => import('@/modules/preschool/admin/pages/workflows/WorkflowApprovalCenter.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/workflows/:id',
    name: 'dashboard-preschool-admin-workflow-details',
    component: () => import('@/modules/preschool/admin/pages/workflows/WorkflowDetails.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/workflows/sync/runs/:id',
    alias: '/preschool/workflows/sync/runs/:id',
    name: 'dashboard-preschool-admin-workflow-sync-run',
    component: () => import('@/modules/preschool/admin/pages/workflows/WorkflowSyncRunDetails.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/attendance/students',
    name: 'dashboard-preschool-admin-attendance-students',
    component: () => import('@/modules/preschool/admin/pages/attendance/AttendanceStudents.vue'),
    access: { domains: [DOMAINS.PRESCHOOL], scopes: [ACCESS_SCOPES.ADMIN] },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/attendance/history',
    name: 'dashboard-preschool-admin-attendance-history',
    component: () => import('@/modules/preschool/admin/pages/attendance/AttendanceHistory.vue'),
    access: { domains: [DOMAINS.PRESCHOOL], scopes: [ACCESS_SCOPES.ADMIN] },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/attendance/sessions/:id',
    name: 'dashboard-preschool-admin-attendance-session-details',
    component: () => import('@/modules/preschool/admin/pages/attendance/AttendanceSessionDetails.vue'),
    access: { domains: [DOMAINS.PRESCHOOL], scopes: [ACCESS_SCOPES.ADMIN] },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/attendance/alerts',
    name: 'dashboard-preschool-admin-attendance-alerts',
    component: () => import('@/modules/preschool/admin/pages/attendance/AttendanceAlerts.vue'),
    access: { domains: [DOMAINS.PRESCHOOL], scopes: [ACCESS_SCOPES.ADMIN] },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/attendance/profile',
    name: 'dashboard-preschool-admin-attendance-profile',
    component: () => import('@/modules/preschool/admin/pages/attendance/AttendanceProfile.vue'),
    access: { domains: [DOMAINS.PRESCHOOL], scopes: [ACCESS_SCOPES.ADMIN] },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/attendance/id-card',
    name: 'dashboard-preschool-admin-attendance-id-card',
    component: () => import('@/modules/preschool/admin/pages/attendance/AttendanceIdCard.vue'),
    access: { domains: [DOMAINS.PRESCHOOL], scopes: [ACCESS_SCOPES.ADMIN] },
  }),
  // Health and medical records stay under the preschool admin tree so student
  // identity, enrollment, and clinical-style follow-up remain anchored to the
  // same student record instead of branching into a separate module shell.
  defineAppRoute({
    path: '/module/preschool-admin/health',
    alias: '/preschool/health-records',
    name: 'dashboard-preschool-admin-health',
    component: () => import('@/modules/preschool/admin/pages/health/HealthRecordsPage.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/health-records/:studentId/create',
    name: 'preschool-health-records-create',
    component: () => import('@/modules/preschool/admin/pages/health/HealthRecordCreatePage.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/health-records/:studentId',
    name: 'preschool-health-records-detail',
    component: () => import('@/modules/preschool/admin/pages/health/HealthRecordDetailPage.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/health-records/:studentId/edit',
    name: 'preschool-health-records-edit',
    component: () => import('@/modules/preschool/admin/pages/health/HealthRecordEditPage.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/health/add',
    name: 'dashboard-preschool-admin-health-add',
    component: () => import('@/modules/preschool/admin/pages/health/AddHealthInformation.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/health/students/:id',
    name: 'dashboard-preschool-admin-health-student',
    component: () => import('@/modules/preschool/admin/pages/health/StudentHealthProfile.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  // Settings stays in the admin Preschool route tree so the configuration
  // surface remains discoverable without creating a second dashboard shell.
  defineAppRoute({
    path: '/preschool/settings',
    alias: '/module/preschool-admin/settings',
    name: 'dashboard-preschool-admin-settings',
    component: () => import('@/modules/preschool/admin/pages/settings/PreschoolSettingsDashboard.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/settings/academic',
    alias: '/module/preschool-admin/settings/academic',
    name: 'dashboard-preschool-admin-settings-academic',
    component: () => import('@/modules/preschool/admin/pages/settings/PreschoolAcademicSettingsPage.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/settings/attendance',
    alias: '/module/preschool-admin/settings/attendance',
    name: 'dashboard-preschool-admin-settings-attendance',
    component: () => import('@/modules/preschool/admin/pages/settings/PreschoolAttendanceSettingsPage.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/settings/payments',
    alias: '/module/preschool-admin/settings/payments',
    name: 'dashboard-preschool-admin-settings-payments',
    component: () => import('@/modules/preschool/admin/pages/settings/PreschoolPaymentSettingsPage.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/settings/health',
    alias: '/module/preschool-admin/settings/health',
    name: 'dashboard-preschool-admin-settings-health',
    component: () => import('@/modules/preschool/admin/pages/settings/PreschoolHealthSettingsPage.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/settings/preferences',
    alias: '/module/preschool-admin/settings/preferences',
    name: 'dashboard-preschool-admin-settings-preferences',
    component: () => import('@/modules/preschool/admin/pages/settings/PreschoolPreferencesSettingsPage.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  // Assignment workflow stays admin-only so student/class, teacher/class, and
  // schedule ownership can be managed without exposing teacher setup controls
  // to staff users.
  defineAppRoute({
    path: '/module/preschool-admin/assignments',
    name: 'dashboard-preschool-admin-assignments',
    component: () => import('@/modules/preschool/admin/pages/assignments/PreschoolAssignments.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/analytics',
    alias: '/module/preschool-admin/analytics',
    name: 'dashboard-preschool-admin-analytics',
    component: () => import('@/modules/preschool/admin/pages/analytics/AnalyticsDashboard.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/analytics/attendance',
    alias: '/module/preschool-admin/analytics/attendance',
    name: 'dashboard-preschool-admin-analytics-attendance',
    component: () => import('@/modules/preschool/admin/pages/analytics/AttendanceAnalyticsDetail.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/analytics/sessions',
    alias: '/module/preschool-admin/analytics/sessions',
    name: 'dashboard-preschool-admin-analytics-sessions',
    component: () => import('@/modules/preschool/admin/pages/analytics/SessionAnalyticsDetail.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/analytics/alerts',
    alias: '/module/preschool-admin/analytics/alerts',
    name: 'dashboard-preschool-admin-analytics-alerts',
    component: () => import('@/modules/preschool/admin/pages/analytics/AlertAnalyticsDetail.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/analytics/students',
    alias: '/module/preschool-admin/analytics/students',
    name: 'dashboard-preschool-admin-analytics-students',
    component: () => import('@/modules/preschool/admin/pages/analytics/StudentAnalyticsDetail.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/analytics/teachers',
    alias: '/module/preschool-admin/analytics/teachers',
    name: 'dashboard-preschool-admin-analytics-teachers',
    component: () => import('@/modules/preschool/admin/pages/analytics/TeacherAnalyticsDetail.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/analytics/guardian-contacts',
    alias: '/module/preschool-admin/analytics/guardian-contacts',
    name: 'dashboard-preschool-admin-analytics-guardian-contacts',
    component: () => import('@/modules/preschool/admin/pages/analytics/GuardianContactAnalyticsDetail.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/reports',
    alias: '/module/preschool-admin/reports',
    name: 'dashboard-preschool-admin-reports',
    component: () => import('@/modules/preschool/admin/pages/reports/PreschoolReportsDashboard.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/reports/student-summary',
    alias: '/module/preschool-admin/reports/student-summary',
    name: 'dashboard-preschool-admin-reports-student-summary',
    component: () => import('@/modules/preschool/admin/pages/reports/StudentSummaryReport.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN, ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/preschool/reports/attendance',
    alias: '/module/preschool-admin/reports/attendance',
    name: 'dashboard-preschool-admin-reports-attendance',
    component: () => import('@/modules/preschool/admin/pages/reports/PreschoolAttendanceReportsPage.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN, ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/preschool/reports/attendance-register',
    alias: '/module/preschool-admin/reports/attendance-register',
    name: 'dashboard-preschool-admin-reports-attendance-register',
    component: () => import('@/modules/preschool/admin/pages/reports/PreschoolAttendanceRegisterReport.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/reports/health',
    alias: '/module/preschool-admin/reports/health',
    name: 'dashboard-preschool-admin-reports-health',
    component: () => import('@/modules/preschool/admin/pages/reports/PreschoolHealthReportsPage.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/reports/payments',
    alias: '/module/preschool-admin/reports/payments',
    name: 'dashboard-preschool-admin-reports-payments',
    component: () => import('@/modules/preschool/admin/pages/reports/PreschoolPaymentReportsPage.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/reports/enrollments',
    alias: '/module/preschool-admin/reports/enrollments',
    name: 'dashboard-preschool-admin-reports-enrollments',
    component: () => import('@/modules/preschool/admin/pages/reports/PreschoolEnrollmentReportsPage.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/reports/guardians',
    alias: '/module/preschool-admin/reports/guardians',
    name: 'dashboard-preschool-admin-reports-guardians',
    component: () => import('@/modules/preschool/admin/pages/reports/PreschoolGuardianReportsPage.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/preschool/grades',
    alias: '/module/preschool-admin/grades',
    name: 'dashboard-preschool-admin-grades',
    component: () => import('@/modules/preschool/admin/pages/grades/GradeEntry.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN, ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/reports/audit',
    name: 'dashboard-preschool-admin-lifecycle-audit',
    component: () => import('@/modules/preschool/admin/pages/reports/LifecycleAudit.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  // Snapshot archive is admin-only because it exposes immutable historical
  // report output for browsing, comparison, and export rather than editing.
  defineAppRoute({
    path: '/module/preschool-admin/reports/snapshots',
    name: 'dashboard-preschool-admin-report-snapshots',
    component: () => import('@/modules/preschool/admin/pages/reports/ReportSnapshotArchive.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  // Export governance stays admin-only so institutional exports and historical
  // comparisons remain read-only review surfaces rather than a teacher tool.
  defineAppRoute({
    path: '/module/preschool-admin/reports/export-governance',
    name: 'dashboard-preschool-admin-export-governance',
    component: () => import('@/modules/preschool/admin/pages/reports/ReportExportGovernance.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  // Governance review stays admin-only so institutional reconstruction and
  // historical anomaly review never create a write surface for staff users.
  defineAppRoute({
    path: '/module/preschool-admin/governance/review',
    name: 'dashboard-preschool-admin-governance-review',
    component: () => import('@/modules/preschool/admin/pages/governance/GovernanceReview.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  // Institutional reconstruction stays admin-only so historical state can be
  // replayed from immutable records without mutating live operational data.
  defineAppRoute({
    path: '/module/preschool-admin/governance/reconstruction',
    name: 'dashboard-preschool-admin-reconstruction',
    component: () => import('@/modules/preschool/admin/pages/governance/InstitutionalReconstruction.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  // Governance diff analysis stays admin-only so institutional comparisons
  // remain snapshot-first, review-focused, and separate from operational CRUD.
  defineAppRoute({
    path: '/module/preschool-admin/governance/diff',
    name: 'dashboard-preschool-admin-governance-diff',
    component: () => import('@/modules/preschool/admin/pages/governance/GovernanceDiffAnalysis.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  // Governance cases keep diff and integrity findings in a review workflow so
  // administrators can assign, escalate, and resolve institutional risk.
  defineAppRoute({
    path: '/module/preschool-admin/governance/cases',
    name: 'dashboard-preschool-admin-governance-cases',
    component: () => import('@/modules/preschool/admin/pages/governance/GovernanceCases.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  // Reports stay split into overview, student, and classroom routes so the UI
  // can navigate to real finalized data without exposing placeholder screens.
  defineAppRoute({
    path: '/module/preschool-admin/reports/students',
    name: 'dashboard-preschool-admin-student-reports',
    component: () => import('@/modules/preschool/admin/pages/reports/StudentReports.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN, ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/reports/classes',
    name: 'dashboard-preschool-admin-classroom-reports',
    component: () => import('@/modules/preschool/admin/pages/reports/ClassroomReports.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN, ACCESS_SCOPES.STAFF],
    },
  }),
  // Weekly schedules stay separate from reports so timetable management can
  // evolve without coupling it to assessments or attendance history.
  defineAppRoute({
    path: '/module/preschool-admin/schedules',
    name: 'dashboard-preschool-admin-schedules',
    component: () => import('@/modules/preschool/admin/pages/schedule/ScheduleManagement.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/schedules/:id',
    name: 'dashboard-preschool-admin-schedule-details',
    component: () => import('@/modules/preschool/admin/pages/schedule/ScheduleDetails.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/schedules/classes',
    name: 'dashboard-preschool-admin-class-schedule',
    component: () => import('@/modules/preschool/admin/pages/classes/ClassSchedule.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN, ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/schedules/teachers',
    name: 'dashboard-preschool-admin-teacher-schedule',
    component: () => import('@/modules/preschool/admin/pages/teachers/TeacherSchedule.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN, ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/forms',
    name: 'dashboard-preschool-admin-forms',
    component: () => import('@/modules/preschool/admin/pages/forms/FormManagement.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/forms/manage',
    name: 'dashboard-preschool-admin-forms-manage',
    component: () => import('@/modules/preschool/admin/pages/forms/FormManagementManage.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/classroom-resources',
    name: 'dashboard-preschool-admin-classroom-resources',
    component: () => import('@/modules/preschool/admin/pages/classes/ClassroomResources.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/enrollments/create',
    name: 'dashboard-preschool-admin-enrollments-create',
    component: () => import('@/modules/preschool/admin/pages/enrollment/CreateEnrollmentApplication.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/enrollments',
    name: 'dashboard-preschool-admin-enrollments',
    component: () => import('@/modules/preschool/admin/pages/enrollment/EnrollmentManagement.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/teacher',
    name: 'dashboard-preschool-teacher',
    component: () => import('@/modules/preschool/teacher/pages/Dashboard.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/teacher/classes',
    name: 'dashboard-preschool-teacher-classes',
    component: () => import('@/modules/preschool/teacher/pages/MyClasses.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/teacher/classes/:classId',
    name: 'dashboard-preschool-teacher-class-detail',
    component: () => import('@/modules/preschool/teacher/pages/MyClassDetail.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/teacher/students',
    name: 'dashboard-preschool-teacher-students',
    component: () => import('@/modules/preschool/teacher/pages/MyStudents.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/teacher/schedule',
    name: 'dashboard-preschool-teacher-schedule',
    component: () => import('@/modules/preschool/teacher/pages/MySchedule.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/teacher/schedules/:id',
    name: 'dashboard-preschool-teacher-schedule-details',
    component: () => import('@/modules/preschool/admin/pages/schedule/ScheduleDetails.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/teacher/attendance',
    name: 'dashboard-preschool-teacher-attendance',
    component: () => import('@/modules/preschool/admin/pages/attendance/AttendanceStudents.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/teacher/attendance/sessions/:id',
    name: 'dashboard-preschool-teacher-attendance-session-details',
    component: () => import('@/modules/preschool/admin/pages/attendance/AttendanceSessionDetails.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/teacher/grades',
    name: 'dashboard-preschool-teacher-grades',
    component: () => import('@/modules/preschool/admin/pages/grades/GradeEntry.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/teacher/report',
    name: 'dashboard-preschool-teacher-report',
    component: () => import('@/modules/preschool/admin/pages/reports/StudentReports.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/teacher/classroomresources',
    name: 'dashboard-preschool-teacher-classroomresources',
    component: () => import('@/modules/preschool/teacher/pages/TeacherClassroomResources.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/preschool-admin/teacher/healthy',
    name: 'dashboard-preschool-teacher-healthy',
    component: () => import('@/modules/preschool/teacher/pages/Healthy.vue'),
    access: {
      domains: [DOMAINS.PRESCHOOL],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
]
