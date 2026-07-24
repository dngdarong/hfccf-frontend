import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  approvePreschoolWorkflowApproval,
  assignPreschoolWorkflow,
  cancelPreschoolWorkflow,
  cancelPreschoolWorkflowApproval,
  completePreschoolWorkflow,
  createPreschoolWorkflow,
  escalatePreschoolWorkflow,
  fetchPreschoolWorkflow,
  fetchPreschoolWorkflowApprovals,
  fetchPreschoolWorkflowDefinitions,
  fetchPreschoolWorkflowSummary,
  fetchPreschoolWorkflowObservabilityDashboard,
  fetchPreschoolWorkflowSyncPreview,
  fetchPreschoolWorkflowSyncRun,
  fetchPreschoolWorkflowSyncRunItems,
  fetchPreschoolWorkflowSyncRuns,
  fetchPreschoolWorkflowTimeline,
  fetchPreschoolWorkflows,
  rejectPreschoolWorkflowApproval,
  requestPreschoolWorkflowApproval,
  runPreschoolWorkflowSync,
  returnPreschoolWorkflowApproval,
  transitionPreschoolWorkflow,
} from '@/modules/preschool/services/api/preschoolWorkflowApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('preschool workflow api', () => {
  it('sends supported workflow filters and normalizes the list payload', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        summary: {
          total: 4,
          pending_approval: 2,
          overdue: 1,
          my_assignments: 1,
        },
        items: [
          {
            id: 'wf-1',
            workflow_definition_id: 'def-1',
            workflow_definition_key: 'enrollment_admission',
            workflow_definition_name: 'Enrollment Admission',
            source_type: 'enrollment_application',
            source_id: 'app-1',
            source_label: 'Application #1',
            current_step: {
              id: 'step-1',
              key: 'submitted',
              name: 'Submitted',
              step_type: 'review',
              assigned_role: 'adminpreschool',
              sla_hours: 6,
            },
            status: 'in_progress',
            priority: 'high',
            assigned_to_user_id: 'user-1',
            assigned_role: 'adminpreschool',
            due_at: '2026-07-03T10:00:00Z',
            approvals_count: 2,
            events_count: 3,
            created_at: '2026-07-03T08:00:00Z',
            updated_at: '2026-07-03T09:00:00Z',
          },
        ],
        pagination: {
          current_page: 2,
          last_page: 5,
          per_page: 20,
          total: 100,
        },
      }),
    )

    await expect(fetchPreschoolWorkflows({
      page: 2,
      perPage: 20,
      status: 'in_progress',
      priority: 'high',
      search: 'application',
      sourceType: 'enrollment_application',
      workflowDefinitionKey: 'enrollment_admission',
      assignedToUserId: 'user-1',
      assignedRole: 'adminpreschool',
      ignored: 'value',
    })).resolves.toMatchObject({
      summary: {
        total: 4,
        pendingApproval: 2,
        overdue: 1,
        myAssignments: 1,
      },
      items: [
        {
          id: 'wf-1',
          workflowDefinitionKey: 'enrollment_admission',
          workflowDefinitionName: 'Enrollment Admission',
          sourceType: 'enrollment_application',
          sourceId: 'app-1',
          sourceLabel: 'Application #1',
          currentStep: {
            id: 'step-1',
            key: 'submitted',
            name: 'Submitted',
            stepType: 'review',
            assignedRole: 'adminpreschool',
            slaHours: 6,
          },
          status: 'in_progress',
          priority: 'high',
        },
      ],
      pagination: {
        currentPage: 2,
        lastPage: 5,
        perPage: 20,
        total: 100,
      },
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/workflows', {
      params: {
        page: 2,
        per_page: 20,
        status: 'in_progress',
        priority: 'high',
        search: 'application',
        source_type: 'enrollment_application',
        workflow_definition_key: 'enrollment_admission',
        assigned_to_user_id: 'user-1',
        assigned_role: 'adminpreschool',
      },
      signal: undefined,
    })
  })

  it('normalizes definitions, workflow details, approvals, summary, and timeline payloads', async () => {
    http.get
      .mockResolvedValueOnce(
        stubResponse({
          definitions: [
            {
              id: 'def-1',
              key: 'health_alert_resolution',
              name: 'Health Alert Resolution',
              description: 'Resolve health alert',
              domain: 'health',
              is_active: true,
              steps: [
                {
                  id: 'step-1',
                  workflow_definition_id: 'def-1',
                  key: 'created',
                  name: 'Created',
                  sort_order: 1,
                  step_type: 'start',
                  assigned_role: 'adminpreschool',
                  sla_hours: 4,
                },
              ],
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        stubResponse({
          workflow: {
            id: 'wf-1',
            workflow_definition_key: 'health_alert_resolution',
            workflow_definition_name: 'Health Alert Resolution',
            source_type: 'health_alert',
            source_id: 'health-1',
            source_label: 'Health Alert #1',
            current_step: {
              id: 'step-1',
              key: 'created',
              name: 'Created',
            },
            status: 'pending_approval',
            priority: 'normal',
            assigned_to_user_id: 'user-1',
            assigned_role: 'adminpreschool',
            approvals: [
              {
                id: 'approval-1',
                workflow_instance_id: 'wf-1',
                status: 'pending',
                requested_to_role: 'adminpreschool',
                due_at: '2026-07-03T11:00:00Z',
              },
            ],
            timeline: [
              {
                id: 'event-1',
                event_type: 'created',
                title: 'Workflow created',
                actor: {
                  id: 'user-1',
                  first_name: 'Test',
                  last_name: 'User',
                  role_code: 'adminpreschool',
                },
                created_at: '2026-07-03T08:00:00Z',
              },
            ],
          },
        }),
      )
      .mockResolvedValueOnce(
        stubResponse({
          items: [
            {
              id: 'approval-1',
              workflow_instance_id: 'wf-1',
              status: 'pending',
              requested_to_role: 'adminpreschool',
              due_at: '2026-07-03T11:00:00Z',
            },
          ],
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 1,
          },
        }),
      )
      .mockResolvedValueOnce(
        stubResponse({
          total: 4,
          pending_approval: 1,
          overdue: 1,
        }),
      )
      .mockResolvedValueOnce(
        stubResponse({
          items: [
            {
              id: 'event-1',
              event_type: 'created',
              title: 'Workflow created',
              created_at: '2026-07-03T08:00:00Z',
            },
          ],
        }),
      )

    await expect(fetchPreschoolWorkflowDefinitions()).resolves.toMatchObject({
      definitions: [
        {
          key: 'health_alert_resolution',
          name: 'Health Alert Resolution',
          steps: [
            {
              key: 'created',
              stepType: 'start',
              assignedRole: 'adminpreschool',
              slaHours: 4,
            },
          ],
        },
      ],
    })

    await expect(fetchPreschoolWorkflow('wf-1')).resolves.toMatchObject({
      workflow: {
        id: 'wf-1',
        workflowDefinitionKey: 'health_alert_resolution',
        sourceType: 'health_alert',
        sourceId: 'health-1',
        sourceLabel: 'Health Alert #1',
        currentStep: {
          key: 'created',
          name: 'Created',
        },
        approvals: [
          {
            id: 'approval-1',
            workflowInstanceId: 'wf-1',
            status: 'pending',
            requestedToRole: 'adminpreschool',
          },
        ],
        timeline: [
          {
            id: 'event-1',
            eventType: 'created',
            title: 'Workflow created',
            actor: {
              firstName: 'Test',
              lastName: 'User',
              roleCode: 'adminpreschool',
            },
          },
        ],
      },
    })

    await expect(fetchPreschoolWorkflowApprovals({ status: 'pending' })).resolves.toMatchObject({
      items: [
        {
          id: 'approval-1',
          workflowInstanceId: 'wf-1',
          status: 'pending',
          requestedToRole: 'adminpreschool',
        },
      ],
      pagination: {
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 1,
      },
    })

    await expect(fetchPreschoolWorkflowSummary({ status: 'pending' })).resolves.toMatchObject({
      total: 4,
      pendingApproval: 1,
      overdue: 1,
    })

    await expect(fetchPreschoolWorkflowTimeline('wf-1')).resolves.toMatchObject({
      timeline: [
        {
          id: 'event-1',
          eventType: 'created',
          title: 'Workflow created',
        },
      ],
    })
  })

  it('calls the workflow and approval action endpoints', async () => {
    http.post.mockResolvedValue(stubResponse({ workflow: { id: 'wf-2' }, approval: { id: 'approval-2' } }))
    http.patch.mockResolvedValue(stubResponse({ workflow: { id: 'wf-2' }, approval: { id: 'approval-2' } }))

    await createPreschoolWorkflow({ workflowDefinitionKey: 'invoice_collection' })
    await assignPreschoolWorkflow('wf-2', { assignedRole: 'adminpreschool' })
    await transitionPreschoolWorkflow('wf-2', { nextStepKey: 'review' })
    await completePreschoolWorkflow('wf-2', { decisionNotes: 'Done' })
    await cancelPreschoolWorkflow('wf-2', { decisionNotes: 'Cancelled' })
    await escalatePreschoolWorkflow('wf-2', { decisionNotes: 'Escalate' })
    await requestPreschoolWorkflowApproval('wf-2', { requestedToRole: 'adminpreschool' })
    await approvePreschoolWorkflowApproval('approval-2', { decisionNotes: 'Approved' })
    await rejectPreschoolWorkflowApproval('approval-2', { decisionNotes: 'Rejected' })
    await returnPreschoolWorkflowApproval('approval-2', { decisionNotes: 'Return' })
    await cancelPreschoolWorkflowApproval('approval-2', { decisionNotes: 'Cancel' })

    expect(http.post).toHaveBeenCalledWith('/preschool/workflows', { workflowDefinitionKey: 'invoice_collection' })
    expect(http.patch).toHaveBeenCalledWith('/preschool/workflows/wf-2/assign', { assignedRole: 'adminpreschool' })
    expect(http.patch).toHaveBeenCalledWith('/preschool/workflows/wf-2/transition', { nextStepKey: 'review' })
    expect(http.patch).toHaveBeenCalledWith('/preschool/workflows/wf-2/complete', { decisionNotes: 'Done' })
    expect(http.patch).toHaveBeenCalledWith('/preschool/workflows/wf-2/cancel', { decisionNotes: 'Cancelled' })
    expect(http.patch).toHaveBeenCalledWith('/preschool/workflows/wf-2/escalate', { decisionNotes: 'Escalate' })
    expect(http.post).toHaveBeenCalledWith('/preschool/workflows/wf-2/approvals', { requestedToRole: 'adminpreschool' })
    expect(http.patch).toHaveBeenCalledWith('/preschool/workflows/approvals/approval-2/approve', { decisionNotes: 'Approved' })
    expect(http.patch).toHaveBeenCalledWith('/preschool/workflows/approvals/approval-2/reject', { decisionNotes: 'Rejected' })
    expect(http.patch).toHaveBeenCalledWith('/preschool/workflows/approvals/approval-2/return', { decisionNotes: 'Return' })
    expect(http.patch).toHaveBeenCalledWith('/preschool/workflows/approvals/approval-2/cancel', { decisionNotes: 'Cancel' })
  })

  it('sends sync filters and normalizes sync preview and run payloads', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        dryRun: true,
        limit: 2,
        generatedAt: '2026-07-03T10:00:00Z',
        summary: {
          eligible: 2,
          created: 1,
          existing: 1,
          skipped: 0,
          failed: 0,
        },
        items: [
          {
            definition_key: 'enrollment_admission',
            source_type: 'preschool_enrollment_application',
            source_id: '101',
            source_label: 'ENR-101',
            source_status: 'submitted',
            status: 'created',
            reason: 'Workflow would be created.',
          },
        ],
      }),
    )
    http.post.mockResolvedValueOnce(
      stubResponse({
        dryRun: false,
        limit: 2,
        generatedAt: '2026-07-03T10:05:00Z',
        summary: {
          eligible: 1,
          created: 1,
          existing: 0,
          skipped: 0,
          failed: 0,
        },
        items: [
          {
            definitionKey: 'health_alert_resolution',
            sourceType: 'preschool_health_alert',
            sourceId: '55',
            sourceLabel: 'Health alert 55',
            sourceStatus: 'new',
            status: 'created',
            reason: 'Workflow created successfully.',
            workflow_instance_id: 77,
          },
        ],
      }),
    )

    await expect(fetchPreschoolWorkflowSyncPreview({
      definitionKey: 'enrollment_admission',
      sourceType: 'preschool_enrollment_application',
      status: 'submitted',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-03',
      limit: 2,
    })).resolves.toMatchObject({
      dryRun: true,
      limit: 2,
      summary: {
        eligible: 2,
        created: 1,
        existing: 1,
        skipped: 0,
        failed: 0,
      },
      items: [
        {
          definitionKey: 'enrollment_admission',
          sourceType: 'preschool_enrollment_application',
          sourceId: '101',
          sourceLabel: 'ENR-101',
          sourceStatus: 'submitted',
          status: 'created',
          reason: 'Workflow would be created.',
        },
      ],
    })

    await expect(runPreschoolWorkflowSync({
      definitionKey: 'health_alert_resolution',
      sourceType: 'preschool_health_alert',
      status: 'new',
      limit: 2,
    })).resolves.toMatchObject({
      dryRun: false,
      limit: 2,
      summary: {
        eligible: 1,
        created: 1,
        existing: 0,
        skipped: 0,
        failed: 0,
      },
      items: [
        {
          definitionKey: 'health_alert_resolution',
          sourceType: 'preschool_health_alert',
          sourceId: '55',
          sourceLabel: 'Health alert 55',
          sourceStatus: 'new',
          status: 'created',
          reason: 'Workflow created successfully.',
          workflowInstanceId: 77,
        },
      ],
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/workflows/sync/preview', {
      params: {
        definition_key: 'enrollment_admission',
        source_type: 'preschool_enrollment_application',
        status: 'submitted',
        date_from: '2026-07-01',
        date_to: '2026-07-03',
        limit: 2,
        batch_size: 25,
        dry_run: false,
      },
      signal: undefined,
    })

    expect(http.post).toHaveBeenCalledWith('/preschool/workflows/sync/run', {
      definition_key: 'health_alert_resolution',
      source_type: 'preschool_health_alert',
      status: 'new',
      limit: 2,
      batch_size: 25,
      dry_run: false,
    }, {
      signal: undefined,
    })
  })

  it('sends observability filters and normalizes dashboard payloads', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        summary: {
          totalRuns: 4,
          successfulRuns: 2,
          runsWithErrors: 1,
          failedRuns: 1,
          runningRuns: 1,
          staleRuns: 1,
          totalProcessed: 12,
          totalCreated: 4,
          totalExisting: 5,
          totalSkipped: 2,
          totalFailedItems: 1,
          successRate: 50,
          failureRate: 50,
          averageDurationMs: 1200,
          longestDurationMs: 5000,
          averageItemsPerRun: 3,
        },
        performance: {
          averageDurationMs: 1200,
          longestDurationMs: 5000,
          slowestRuns: [
            {
              id: 1,
              mode: 'run',
              status: 'completed',
              definitionKey: 'invoice_collection',
              sourceType: 'preschool_invoice',
              durationMs: 5000,
              throughputItemsPerSecond: 0.4,
            },
          ],
          durationTrend: [
            { date: '2026-07-03', averageDurationMs: 1200, longestDurationMs: 5000 },
          ],
          processedItemsTrend: [
            { date: '2026-07-03', processedItems: 12 },
          ],
          throughputTrend: [
            { date: '2026-07-03', throughputItemsPerSecond: 2.4 },
          ],
        },
        health: {
          status: 'warning',
          staleRuns: [],
          recentFailedRuns: [],
          recentRunsWithErrors: [],
          highFailureRateRuns: [],
        },
        breakdowns: {
          byDefinition: [
            {
              definitionKey: 'invoice_collection',
              definitionName: 'Invoice Collection',
              totalRuns: 2,
              failedRuns: 1,
              averageDurationMs: 1200,
            },
          ],
          bySourceType: [
            {
              sourceType: 'preschool_invoice',
              sourceLabel: 'Invoice',
              totalRuns: 2,
              failedRuns: 1,
            },
          ],
          byRunStatus: [
            { status: 'completed', totalRuns: 2 },
          ],
          byItemStatus: [
            { resultStatus: 'created', totalItems: 4 },
          ],
          byActor: [
            {
              startedByUserId: 'user-1',
              startedBy: {
                id: 'user-1',
                name: 'Admin User',
                roleCode: 'adminpreschool',
              },
              totalRuns: 4,
              failedRuns: 1,
            },
          ],
          byFailureCategory: [
            {
              failureCategory: 'database_error',
              totalFailures: 1,
              runFailures: 1,
              itemFailures: 0,
            },
          ],
        },
        trends: {
          runsOverTime: [
            { date: '2026-07-03', totalRuns: 4, failedRuns: 1, failureRate: 50 },
          ],
          processedItemsOverTime: [
            { date: '2026-07-03', processedItems: 12 },
          ],
          failureRateOverTime: [
            { date: '2026-07-03', failureRate: 50 },
          ],
          durationOverTime: [
            { date: '2026-07-03', averageDurationMs: 1200, longestDurationMs: 5000 },
          ],
        },
        recentActivity: {
          recentRuns: [],
          recentFailures: [
            {
              kind: 'run',
              id: 'run-1',
              runId: 1,
              definitionKey: 'invoice_collection',
              sourceType: 'preschool_invoice',
              status: 'failed',
              failureCategory: 'database_error',
              reason: 'Database error.',
              errorMessage: 'Database error.',
              occurredAt: '2026-07-03T10:00:00Z',
            },
          ],
          recentlyCompletedRuns: [],
        },
        governance: {
          oldestRunAt: '2026-07-01T00:00:00Z',
          totalRunRecords: 4,
          totalItemRecords: 8,
          retentionMode: 'policy_only',
          automaticPruningEnabled: false,
        },
      }),
    )

    await expect(fetchPreschoolWorkflowObservabilityDashboard({
      definitionKey: 'invoice_collection',
      sourceType: 'preschool_invoice',
      status: 'failed',
      startedByUserId: 'user-1',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-03',
      mode: 'run',
    })).resolves.toMatchObject({
      summary: {
        totalRuns: 4,
        successfulRuns: 2,
        runsWithErrors: 1,
        failedRuns: 1,
        runningRuns: 1,
        staleRuns: 1,
        totalProcessed: 12,
        totalCreated: 4,
        totalExisting: 5,
        totalSkipped: 2,
        totalFailedItems: 1,
        averageDurationMs: 1200,
        longestDurationMs: 5000,
        averageItemsPerRun: 3,
      },
      breakdowns: {
        byFailureCategory: [
          {
            failureCategory: 'database_error',
            totalFailures: 1,
            runFailures: 1,
            itemFailures: 0,
          },
        ],
      },
      governance: {
        oldestRunAt: '2026-07-01T00:00:00Z',
        totalRunRecords: 4,
        totalItemRecords: 8,
        retentionMode: 'policy_only',
        automaticPruningEnabled: false,
      },
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/workflows/observability/dashboard', {
      params: {
        definition_key: 'invoice_collection',
        source_type: 'preschool_invoice',
        status: 'failed',
        started_by_user_id: 'user-1',
        date_from: '2026-07-01',
        date_to: '2026-07-03',
        mode: 'run',
      },
      signal: undefined,
    })
  })

  it('normalizes sync run history and run item payloads', async () => {
    http.get
      .mockResolvedValueOnce(
        stubResponse({
          items: [
            {
              id: 10,
              mode: 'run',
              status: 'completed_with_errors',
              definition_key: 'invoice_collection',
              source_type: 'preschool_invoice',
              filters: {
                definition_key: 'invoice_collection',
                source_type: 'preschool_invoice',
              },
              requested_limit: 25,
              batch_size: 10,
              eligible_count: 3,
              processed_count: 3,
              created_count: 1,
              existing_count: 1,
              skipped_count: 0,
              failed_count: 1,
              started_by_user_id: 'user-1',
              started_at: '2026-07-03T10:00:00Z',
              completed_at: '2026-07-03T10:01:00Z',
              started_by: {
                id: 'user-1',
                name: 'Admin User',
                role_code: 'adminpreschool',
              },
            },
          ],
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 1,
          },
        }),
      )
      .mockResolvedValueOnce(
        stubResponse({
          run: {
            id: 10,
            mode: 'run',
            status: 'completed',
            started_by_user_id: 'user-1',
          },
        }),
      )
      .mockResolvedValueOnce(
        stubResponse({
          items: [
            {
              id: 100,
              sync_run_id: 10,
              definition_key: 'invoice_collection',
              source_type: 'preschool_invoice',
              source_id: '55',
              source_label: 'Invoice 55',
              result_status: 'created',
              reason: 'Workflow created successfully.',
              workflow_instance_id: 88,
              processed_at: '2026-07-03T10:00:30Z',
            },
          ],
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 1,
          },
        }),
      )

    await expect(fetchPreschoolWorkflowSyncRuns({
      mode: 'run',
      status: 'completed_with_errors',
      definitionKey: 'invoice_collection',
      sourceType: 'preschool_invoice',
      startedByUserId: 'user-1',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-03',
      perPage: 20,
    })).resolves.toMatchObject({
      items: [
        {
          id: 10,
          mode: 'run',
          status: 'completed_with_errors',
          definitionKey: 'invoice_collection',
          sourceType: 'preschool_invoice',
          eligibleCount: 3,
          processedCount: 3,
          failedCount: 1,
          startedBy: {
            name: 'Admin User',
          },
        },
      ],
      pagination: {
        currentPage: 1,
        lastPage: 1,
        perPage: 20,
        total: 1,
      },
    })

    await expect(fetchPreschoolWorkflowSyncRun(10)).resolves.toMatchObject({
      run: {
        id: 10,
        mode: 'run',
        status: 'completed',
      },
    })

    await expect(fetchPreschoolWorkflowSyncRunItems(10)).resolves.toMatchObject({
      items: [
        {
          id: 100,
          syncRunId: 10,
          definitionKey: 'invoice_collection',
          sourceType: 'preschool_invoice',
          sourceId: '55',
          sourceLabel: 'Invoice 55',
          resultStatus: 'created',
          workflowInstanceId: 88,
        },
      ],
      pagination: {
        currentPage: 1,
        lastPage: 1,
        perPage: 20,
        total: 1,
      },
    })
  })
})
