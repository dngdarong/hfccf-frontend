import { describe, expect, it } from 'vitest'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'
import enNav from '@/i18n/en/dashboard/nav'
import khNav from '@/i18n/kh/dashboard/nav'

function expectString(source, path) {
  const value = path.split('.').reduce((carry, key) => carry?.[key], source)
  expect(typeof value).toBe('string')
  expect(value).not.toContain('<')
  expect(value).not.toMatch(/[\u00c2\u00c3\u00e2\u017e\uFFFD]/u)
}

describe('preschool operations locale parity', () => {
  it('keeps the operations labels aligned in EN and KH', () => {
    const keys = [
      'preschoolOperationsPage.title',
      'preschoolOperationsPage.subtitle',
      'preschoolOperationsPage.generatedAt',
      'preschoolOperationsPage.refresh',
      'preschoolOperationsPage.loading',
      'preschoolOperationsPage.filters.title',
      'preschoolOperationsPage.filters.subtitle',
      'preschoolOperationsPage.filters.dateFrom',
      'preschoolOperationsPage.filters.dateTo',
      'preschoolOperationsPage.filters.class',
      'preschoolOperationsPage.filters.teacher',
      'preschoolOperationsPage.filters.status',
      'preschoolOperationsPage.filters.apply',
      'preschoolOperationsPage.filters.reset',
      'preschoolOperationsPage.todayOverview',
      'preschoolOperationsPage.operationalSummary',
      'preschoolOperationsPage.workflowVisibility',
      'preschoolOperationsPage.workflowActivity',
      'preschoolOperationsPage.noWorkflowActivity',
      'preschoolOperationsPage.openWorkflow',
      'preschoolOperationsPage.openWorkflowCenter',
      'preschoolOperationsPage.pendingWorkflows',
      'preschoolOperationsPage.pendingApprovals',
      'preschoolOperationsPage.overdueWorkflows',
      'preschoolOperationsPage.escalatedWorkflows',
      'preschoolOperationsPage.recentlyUpdatedWorkflows',
      'preschoolOperationsPage.todaySessions',
      'preschoolOperationsPage.attendanceMonitoring',
      'preschoolOperationsPage.guardianFollowUp',
      'preschoolOperationsPage.healthMonitoring',
      'preschoolOperationsPage.paymentOperations',
      'preschoolOperationsPage.assessmentOperations',
      'preschoolOperationsPage.teacherOperations',
      'preschoolOperationsPage.operationalRisks',
      'preschoolOperationsPage.timeline',
      'preschoolOperationsPage.quickActions',
      'preschoolOperationsPage.openDetail',
      'preschoolOperationsPage.noData',
      'preschoolOperationsPage.noSessions',
      'preschoolOperationsPage.noRisks',
      'preschoolOperationsPage.noTimeline',
      'preschoolOperationsPage.takeAttendance',
      'preschoolOperationsPage.continueAttendance',
      'preschoolOperationsPage.viewSession',
      'preschoolOperationsPage.viewDetails',
      'preschoolOperationsPage.openAlerts',
      'preschoolOperationsPage.reviewAssessment',
      'preschoolOperationsPage.viewInvoice',
      'preschoolOperationsPage.viewReports',
      'preschoolOperationsPage.viewHealthRecord',
      'preschoolOperationsPage.viewGuardianContact',
      'preschoolOperationsPage.missingSessions',
      'preschoolOperationsPage.healthAlerts',
      'preschoolOperationsPage.openHealthAlerts',
      'preschoolOperationsPage.criticalIncidents',
      'preschoolOperationsPage.medicationReminders',
      'preschoolOperationsPage.studentsRequiringAttention',
      'preschoolOperationsPage.overduePayments',
      'preschoolOperationsPage.pendingAssessments',
      'preschoolOperationsPage.upcomingAssessments',
      'preschoolOperationsPage.overdueGrading',
      'preschoolOperationsPage.guardianFollowUps',
      'preschoolOperationsPage.criticalRisks',
      'preschoolOperationsPage.blockedWorkflows',
      'preschoolOperationsPage.todayWorkload',
      'preschoolOperationsPage.pendingAttendance',
      'preschoolOperationsPage.assignedSessions',
    ]

    keys.forEach((key) => {
      expectString(enPreschool, key)
      expectString(khPreschool, key)
    })

    expectString(enNav, 'items.operations')
    expectString(khNav, 'items.operations')
  })
})
