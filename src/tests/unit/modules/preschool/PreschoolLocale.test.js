import { describe, expect, it } from 'vitest'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'

// Keep Preschool locale parity covered so the real pages do not regress back to
// missing-key warnings, corrupted Unicode, or accidental double nesting when
// the module evolves.
function expectString(source, path) {
  const value = path.split('.').reduce((carry, key) => carry?.[key], source)
  expect(value, `missing locale key: ${path}`).toBeTypeOf('string')
  expect(value).not.toContain('<')
  // Regression protection: keep the scan focused on raw Unicode corruption
  // without embedding corrupted marker bytes in the test file itself.
  expect(value).not.toMatch(/[\u00e2\u00e1\u017e\u00c3\uFFFD]/u)
}

describe('preschool locale parity', () => {
  it('keeps real Preschool page keys aligned in EN and KH', () => {
    const keys = [
      'preschoolDashboardPage.title',
      'preschoolDashboardPage.loading',
      'preschoolStudentInfoPage.alerts.deleteFallback',
      'preschoolTeacherAttendancePage.messages.noResults',
      'preschoolTeachersManagement.resetPassword',
      'preschoolTeachersManagement.resetPasswordTitle',
      'preschoolTeachersManagement.resetPasswordDescription',
      'preschoolTeachersManagement.newPassword',
      'preschoolTeachersManagement.confirmPassword',
      'preschoolTeachersManagement.reason',
      'preschoolTeachersManagement.reasonPlaceholder',
      'preschoolTeachersManagement.passwordResetSuccess',
      'preschoolTeachersManagement.validation.passwordRequired',
      'preschoolTeachersManagement.validation.confirmPasswordRequired',
      'preschoolTeachersManagement.validation.passwordTooShort',
      'preschoolTeachersManagement.validation.passwordMismatch',
      'preschoolTeachersManagement.validation.reasonRequired',
      'preschoolPaymentManagementPage.alerts.deleteFallback',
      'preschoolClassesManagement.alerts.deleteTitle',
      'preschoolAddClass.statusLabels.success',
      'preschoolScaffold.reportManagement.title',
      'preschoolAssessmentPage.title',
      'preschoolAssessmentPage.loading',
      'preschoolAssessmentFormPage.title',
      'preschoolProgressSummaryPage.title',
      'preschoolProgressSummaryPage.loading',
      'preschoolReportsPage.title',
      'preschoolReportsPage.loading',
      'preschoolReportsPage.emptyOverview',
      'preschoolReportsPage.actions.openStudentReports',
      'preschoolReportsPage.actions.openClassroomReports',
      'preschoolReportsPage.overview.periods',
      'preschoolReportsShared.loading',
      'preschoolReportsShared.emptyReport',
      'preschoolReportsShared.emptyOverview',
      'preschoolReportsShared.periodHint',
      'preschoolReportsShared.summary.finalized',
      'preschoolReportsShared.summary.average',
      'preschoolReportsShared.summary.students',
      'preschoolReportsShared.summary.observations',
      'preschoolReportsShared.summary.latest',
      'preschoolReportsShared.attendanceTitle',
      'preschoolReportsShared.attendance.total',
      'preschoolReportsShared.attendance.present',
      'preschoolReportsShared.attendance.late',
      'preschoolReportsShared.attendance.absent',
      'preschoolReportsShared.attendance.excused',
      'preschoolReportsShared.attendance.latest',
      'preschoolReportsShared.attendance.totalShort',
      'preschoolReportsShared.observationsTitle',
      'preschoolReportsShared.emptyObservations',
      'preschoolReportsShared.assessmentsTitle',
      'preschoolReportsShared.emptyAssessments',
      'preschoolReportsShared.labels.studentFallback',
      'preschoolReportsShared.labels.categoryFallback',
      'preschoolReportsShared.labels.score',
      'preschoolReportsShared.actions.refresh',
      'preschoolStudentReportsPage.title',
      'preschoolStudentReportsPage.filters.student',
      'preschoolStudentReportsPage.filters.period',
      'preschoolStudentReportsPage.placeholders.student',
      'preschoolStudentReportsPage.placeholders.period',
      'preschoolStudentReportsPage.actions.back',
      'preschoolClassroomReportsPage.title',
      'preschoolClassroomReportsPage.studentsTitle',
      'preschoolClassroomReportsPage.filters.class',
      'preschoolClassroomReportsPage.filters.period',
      'preschoolClassroomReportsPage.placeholders.class',
      'preschoolClassroomReportsPage.placeholders.period',
      'preschoolClassroomReportsPage.actions.back',
      'preschoolClassroomReportsPage.studentColumns.name',
      'preschoolClassroomReportsPage.studentColumns.assessments',
      'preschoolClassroomReportsPage.studentColumns.average',
      'preschoolClassroomReportsPage.studentColumns.attendance',
      'preschoolClassroomReportsPage.studentColumns.latest',
      'preschoolAttendanceProfilePage.filters.class',
      'preschoolAttendanceProfilePage.placeholders.class',
      'preschoolAdminAttendanceHistoryPage.filters.student',
      'preschoolAdminAttendanceHistoryPage.placeholders.searchStudent',
    ]

    keys.forEach((key) => {
      expectString(enPreschool, key)
      expectString(khPreschool, key)
    })
  })

  it('keeps Preschool locale exports flat at the module boundary', () => {
    expect(Object.prototype.hasOwnProperty.call(enPreschool, 'preschool')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(khPreschool, 'preschool')).toBe(false)
  })
})
