import { describe, expect, it } from 'vitest'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'

function expectString(source, path) {
  const value = path.split('.').reduce((carry, key) => carry?.[key], source)
  expect(value, `missing locale key: ${path}`).toBeTypeOf('string')
  expect(value).not.toContain('<')
  expect(value).not.toMatch(/[\u00e2\u00e1\u017e\u00c3\uFFFD]/u)
}

describe('preschool workflow locale parity', () => {
  it('keeps the workflow center labels aligned in EN and KH', () => {
    const keys = [
      'preschoolWorkflowsPage.title',
      'preschoolWorkflowsPage.subtitle',
      'preschoolWorkflowsPage.refresh',
      'preschoolWorkflowsPage.generatedAt',
      'preschoolWorkflowsPage.loading',
      'preschoolWorkflowsPage.loadFailed',
      'preschoolWorkflowsPage.workflow',
      'preschoolWorkflowsPage.workflows',
      'preschoolWorkflowsPage.workflowDetails',
      'preschoolWorkflowsPage.approval',
      'preschoolWorkflowsPage.approvals',
      'preschoolWorkflowsPage.pendingApprovals',
      'preschoolWorkflowsPage.overdueWorkflows',
      'preschoolWorkflowsPage.myAssignments',
      'preschoolWorkflowsPage.recentlyUpdated',
      'preschoolWorkflowsPage.workflowQueue',
      'preschoolWorkflowsPage.approvalQueue',
      'preschoolWorkflowsPage.workflowSource',
      'preschoolWorkflowsPage.sourceUnavailable',
      'preschoolWorkflowsPage.openWorkflow',
      'preschoolWorkflowsPage.openWorkflowCenter',
      'preschoolWorkflowsPage.currentStep',
      'preschoolWorkflowsPage.sourceEntity',
      'preschoolWorkflowsPage.assignee',
      'preschoolWorkflowsPage.dueDate',
      'preschoolWorkflowsPage.sla',
      'preschoolWorkflowsPage.escalated',
      'preschoolWorkflowsPage.priority',
      'preschoolWorkflowsPage.status',
      'preschoolWorkflowsPage.assignedToMe',
      'preschoolWorkflowsPage.recentlyUpdatedWorkflows',
      'preschoolWorkflowsPage.pendingWorkflows',
      'preschoolWorkflowsPage.timeline',
      'preschoolWorkflowsPage.assignment',
      'preschoolWorkflowsPage.decisionNotes',
      'preschoolWorkflowsPage.noWorkflows',
      'preschoolWorkflowsPage.noPendingApprovals',
      'preschoolWorkflowsPage.noTimeline',
      'preschoolWorkflowsPage.viewWorkflow',
      'preschoolWorkflowsPage.viewSource',
      'preschoolWorkflowsPage.approve',
      'preschoolWorkflowsPage.reject',
      'preschoolWorkflowsPage.return',
      'preschoolWorkflowsPage.assign',
      'preschoolWorkflowsPage.transition',
      'preschoolWorkflowsPage.completeWorkflow',
      'preschoolWorkflowsPage.cancelWorkflow',
      'preschoolWorkflowsPage.escalateWorkflow',
      'preschoolWorkflowsPage.summary.totalWorkflows',
      'preschoolWorkflowsPage.summary.pendingApprovals',
      'preschoolWorkflowsPage.summary.overdueWorkflows',
      'preschoolWorkflowsPage.summary.escalatedWorkflows',
      'preschoolWorkflowsPage.summary.myAssignments',
      'preschoolWorkflowsPage.summary.assignedToMe',
      'preschoolWorkflowsPage.summary.completedRecently',
      'preschoolWorkflowsPage.sections.header',
      'preschoolWorkflowsPage.sections.summary',
      'preschoolWorkflowsPage.sections.pendingApprovals',
      'preschoolWorkflowsPage.sections.workflowQueue',
      'preschoolWorkflowsPage.sections.overdueWorkflows',
      'preschoolWorkflowsPage.sections.myAssignments',
      'preschoolWorkflowsPage.sections.recentlyUpdated',
      'preschoolWorkflowsPage.sections.timelinePreview',
      'preschoolWorkflowsPage.sections.detailsHeader',
      'preschoolWorkflowsPage.sections.detailsOverview',
      'preschoolWorkflowsPage.sections.detailsApprovals',
      'preschoolWorkflowsPage.sections.detailsTimeline',
      'preschoolWorkflowsPage.sections.detailsActions',
      'preschoolWorkflowsPage.statuses.open',
      'preschoolWorkflowsPage.statuses.inProgress',
      'preschoolWorkflowsPage.statuses.pendingApproval',
      'preschoolWorkflowsPage.statuses.approved',
      'preschoolWorkflowsPage.statuses.rejected',
      'preschoolWorkflowsPage.statuses.returned',
      'preschoolWorkflowsPage.statuses.completed',
      'preschoolWorkflowsPage.statuses.cancelled',
      'preschoolWorkflowsPage.statuses.escalated',
      'preschoolWorkflowsPage.statuses.overdue',
      'preschoolWorkflowsPage.empty.workflows',
      'preschoolWorkflowsPage.empty.approvals',
      'preschoolWorkflowsPage.empty.timeline',
      'preschoolWorkflowsPage.sourceTypes.enrollmentApplication',
      'preschoolWorkflowsPage.sourceTypes.healthAlert',
      'preschoolWorkflowsPage.sourceTypes.invoice',
      'preschoolWorkflowsPage.sourceTypes.assessmentReview',
      'preschoolWorkflowsPage.sourceTypes.attendanceFollowUp',
      'preschoolWorkflowsPage.sourceTypes.automationTask',
    ]

    keys.forEach((key) => {
      expectString(enPreschool, key)
      expectString(khPreschool, key)
    })
  })
})
