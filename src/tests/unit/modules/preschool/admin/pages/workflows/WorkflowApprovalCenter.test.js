import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import { useUserStore } from '@/store/userStore'
import enCommon from '@/i18n/en/common'
import enPreschool from '@/i18n/en/preschool'
import WorkflowApprovalCenter from '@/modules/preschool/admin/pages/workflows/WorkflowApprovalCenter.vue'

const mockLoadWorkflows = vi.fn()
const mockApproveApproval = vi.fn(async (id, payload, onSuccess) => {
  await onSuccess?.()
  return { approval: { id, payload } }
})
const mockRejectApproval = vi.fn(async (id, payload, onSuccess) => {
  await onSuccess?.()
  return { approval: { id, payload } }
})
const mockReturnApproval = vi.fn(async (id, payload, onSuccess) => {
  await onSuccess?.()
  return { approval: { id, payload } }
})
const mockCancelApproval = vi.fn(async (id, payload, onSuccess) => {
  await onSuccess?.()
  return { approval: { id, payload } }
})
const mockFetchPreschoolWorkflowSyncPreview = vi.fn()
const mockFetchPreschoolWorkflowSyncRuns = vi.fn()
const mockRunPreschoolWorkflowSync = vi.fn()
const mockFetchPreschoolWorkflowObservabilityDashboard = vi.fn()

const workflowData = {
  loading: ref(false),
  errorMessage: ref(''),
  definitions: ref([
    {
      id: 'def-1',
      key: 'enrollment_admission',
      name: 'Enrollment Admission',
    },
  ]),
  summary: ref({
    total: 4,
    open: 1,
    inProgress: 1,
    pendingApproval: 1,
    approved: 1,
    rejected: 0,
    returned: 0,
    completed: 1,
    cancelled: 0,
    escalated: 1,
    overdue: 1,
    myAssignments: 1,
    myApprovals: 1,
  }),
  workflows: ref([
    {
      id: 'wf-1',
      workflowDefinitionName: 'Enrollment Admission',
      workflowDefinitionKey: 'enrollment_admission',
      sourceLabel: 'Application #1',
      sourceType: 'enrollment_application',
      sourceId: 'app-1',
      currentStep: {
        id: 'step-1',
        key: 'submitted',
        name: 'Submitted',
        slaHours: 6,
      },
      status: 'in_progress',
      priority: 'high',
      assignedRole: 'adminpreschool',
      dueAt: '2026-07-03T10:00:00Z',
      updatedAt: '2026-07-03T09:00:00Z',
      timeline: [
        {
          id: 'event-1',
          title: 'Submitted',
          eventType: 'submitted',
          createdAt: '2026-07-03T08:00:00Z',
        },
      ],
    },
  ]),
  approvals: ref([
    {
      id: 'approval-1',
      status: 'pending',
      requestedToRole: 'adminpreschool',
      dueAt: '2026-07-03T11:00:00Z',
      instance: {
        id: 'wf-1',
        sourceLabel: 'Application #1',
        sourceType: 'enrollment_application',
        workflowDefinitionName: 'Enrollment Admission',
      },
    },
  ]),
  pagination: ref(null),
  approvalsPagination: ref(null),
  timelinePreview: ref([
    {
      id: 'event-1',
      title: 'Submitted',
      eventType: 'submitted',
      createdAt: '2026-07-03T08:00:00Z',
      workflowLabel: 'Application #1',
    },
  ]),
  generatedAt: ref('2026-07-03T09:15:00Z'),
  myAssignments: ref([
    {
      id: 'wf-1',
      workflowDefinitionName: 'Enrollment Admission',
      sourceLabel: 'Application #1',
      sourceType: 'enrollment_application',
      currentStep: { name: 'Submitted' },
      status: 'in_progress',
      priority: 'high',
      assignedRole: 'adminpreschool',
    },
  ]),
  overdueWorkflows: ref([
    {
      id: 'wf-2',
      workflowDefinitionName: 'Health Alert Resolution',
      sourceLabel: 'Health Alert #2',
      sourceType: 'health_alert',
      currentStep: { name: 'Assigned' },
      status: 'overdue',
      priority: 'urgent',
    },
  ]),
  escalatedWorkflows: ref([]),
  recentlyUpdatedWorkflows: ref([
    {
      id: 'wf-1',
      workflowDefinitionName: 'Enrollment Admission',
      sourceLabel: 'Application #1',
      sourceType: 'enrollment_application',
      currentStep: { name: 'Submitted' },
      status: 'in_progress',
      priority: 'high',
    },
  ]),
  recentTimelineEvents: ref([
    {
      id: 'event-1',
      title: 'Submitted',
      eventType: 'submitted',
      createdAt: '2026-07-03T08:00:00Z',
      workflowLabel: 'Application #1',
    },
  ]),
  loadWorkflows: mockLoadWorkflows,
}

function resetWorkflowData() {
  workflowData.loading.value = false
  workflowData.errorMessage.value = ''
  workflowData.definitions.value = [
    {
      id: 'def-1',
      key: 'enrollment_admission',
      name: 'Enrollment Admission',
    },
  ]
  workflowData.summary.value = {
    total: 4,
    open: 1,
    inProgress: 1,
    pendingApproval: 1,
    approved: 1,
    rejected: 0,
    returned: 0,
    completed: 1,
    cancelled: 0,
    escalated: 1,
    overdue: 1,
    myAssignments: 1,
    myApprovals: 1,
  }
  workflowData.workflows.value = [
    {
      id: 'wf-1',
      workflowDefinitionName: 'Enrollment Admission',
      workflowDefinitionKey: 'enrollment_admission',
      sourceLabel: 'Application #1',
      sourceType: 'enrollment_application',
      sourceId: 'app-1',
      currentStep: {
        id: 'step-1',
        key: 'submitted',
        name: 'Submitted',
        slaHours: 6,
      },
      status: 'in_progress',
      priority: 'high',
      assignedRole: 'adminpreschool',
      dueAt: '2026-07-03T10:00:00Z',
      updatedAt: '2026-07-03T09:00:00Z',
      timeline: [
        {
          id: 'event-1',
          title: 'Submitted',
          eventType: 'submitted',
          createdAt: '2026-07-03T08:00:00Z',
        },
      ],
    },
  ]
  workflowData.approvals.value = [
    {
      id: 'approval-1',
      status: 'pending',
      requestedToRole: 'adminpreschool',
      dueAt: '2026-07-03T11:00:00Z',
      instance: {
        id: 'wf-1',
        sourceLabel: 'Application #1',
        sourceType: 'enrollment_application',
        workflowDefinitionName: 'Enrollment Admission',
      },
    },
  ]
  workflowData.timelinePreview.value = [
    {
      id: 'event-1',
      title: 'Submitted',
      eventType: 'submitted',
      createdAt: '2026-07-03T08:00:00Z',
      workflowLabel: 'Application #1',
    },
  ]
  workflowData.generatedAt.value = '2026-07-03T09:15:00Z'
  workflowData.myAssignments.value = [
    {
      id: 'wf-1',
      workflowDefinitionName: 'Enrollment Admission',
      sourceLabel: 'Application #1',
      sourceType: 'enrollment_application',
      currentStep: { name: 'Submitted' },
      status: 'in_progress',
      priority: 'high',
      assignedRole: 'adminpreschool',
    },
  ]
  workflowData.overdueWorkflows.value = [
    {
      id: 'wf-2',
      workflowDefinitionName: 'Health Alert Resolution',
      sourceLabel: 'Health Alert #2',
      sourceType: 'health_alert',
      currentStep: { name: 'Assigned' },
      status: 'overdue',
      priority: 'urgent',
    },
  ]
  workflowData.recentlyUpdatedWorkflows.value = [
    {
      id: 'wf-1',
      workflowDefinitionName: 'Enrollment Admission',
      sourceLabel: 'Application #1',
      sourceType: 'enrollment_application',
      currentStep: { name: 'Submitted' },
      status: 'in_progress',
      priority: 'high',
    },
  ]
  workflowData.recentTimelineEvents.value = [
    {
      id: 'event-1',
      title: 'Submitted',
      eventType: 'submitted',
      createdAt: '2026-07-03T08:00:00Z',
      workflowLabel: 'Application #1',
    },
  ]
}

function resetObservabilityDashboard() {
  mockFetchPreschoolWorkflowObservabilityDashboard.mockResolvedValue({
    summary: {
      totalRuns: 4,
      successfulRuns: 1,
      runsWithErrors: 1,
      failedRuns: 1,
      runningRuns: 1,
      staleRuns: 1,
      totalProcessed: 5,
      totalCreated: 2,
      totalExisting: 1,
      totalSkipped: 1,
      totalFailedItems: 1,
      successRate: 25,
      failureRate: 50,
      averageDurationMs: 1500,
      longestDurationMs: 5000,
      averageItemsPerRun: 1.25,
    },
    performance: {
      averageDurationMs: 1500,
      longestDurationMs: 5000,
      slowestRuns: [],
      durationTrend: [],
      processedItemsTrend: [],
      throughputTrend: [],
    },
    health: {
      status: 'warning',
      staleRuns: [
        {
          isStale: true,
          staleReason: 'Running longer than the configured threshold.',
          ageMs: 7200000,
          thresholdMs: 1800000,
          run: {
            id: 99,
            mode: 'run',
            status: 'running',
            definitionKey: 'enrollment_admission',
            definitionName: 'Enrollment Admission',
            sourceType: 'preschool_enrollment_application',
            startedByUserId: 'user-1',
            startedBy: {
              id: 'user-1',
              name: 'Admin User',
              roleCode: 'adminpreschool',
            },
            startedAt: '2026-07-03T08:00:00Z',
            completedAt: '',
            createdAt: '2026-07-03T08:00:00Z',
            updatedAt: '2026-07-03T08:05:00Z',
            processedCount: 2,
            createdCount: 1,
            existingCount: 1,
            skippedCount: 0,
            failedCount: 0,
          },
        },
      ],
      recentFailedRuns: [],
      recentRunsWithErrors: [],
      highFailureRateRuns: [],
    },
    breakdowns: {
      byDefinition: [
        {
          definitionKey: 'enrollment_admission',
          definitionName: 'Enrollment Admission',
          totalRuns: 2,
          successfulRuns: 1,
          runsWithErrors: 1,
          failedRuns: 0,
          staleRuns: 1,
          totalProcessed: 5,
          averageDurationMs: 1500,
        },
      ],
      bySourceType: [
        {
          sourceType: 'preschool_enrollment_application',
          sourceLabel: 'Enrollment Application',
          totalRuns: 2,
          successfulRuns: 1,
          runsWithErrors: 1,
          failedRuns: 0,
          staleRuns: 1,
        },
      ],
      byRunStatus: [
        { status: 'completed', totalRuns: 1 },
        { status: 'running', totalRuns: 1 },
      ],
      byItemStatus: [
        { resultStatus: 'created', totalItems: 2 },
        { resultStatus: 'failed', totalItems: 1 },
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
          successfulRuns: 1,
          runsWithErrors: 1,
          failedRuns: 1,
          totalProcessed: 5,
        },
      ],
      byFailureCategory: [
        {
          failureCategory: 'validation_error',
          totalFailures: 2,
          runFailures: 1,
          itemFailures: 1,
        },
      ],
    },
    trends: {
      runsOverTime: [
        {
          date: '2026-07-03',
          totalRuns: 2,
          successfulRuns: 1,
          runsWithErrors: 1,
          failedRuns: 0,
          runningRuns: 1,
          staleRuns: 1,
        },
      ],
      processedItemsOverTime: [
        {
          date: '2026-07-03',
          processedItems: 5,
          createdItems: 2,
          existingItems: 1,
          skippedItems: 1,
          failedItems: 1,
        },
      ],
      failureRateOverTime: [
        {
          date: '2026-07-03',
          totalRuns: 2,
          failedRuns: 0,
          runsWithErrors: 1,
          failureRate: 50,
        },
      ],
      durationOverTime: [
        {
          date: '2026-07-03',
          totalRuns: 2,
          completedRuns: 2,
          averageDurationMs: 1500,
          longestDurationMs: 5000,
        },
      ],
    },
    recentActivity: {
      recentRuns: [
        {
          id: 99,
          mode: 'run',
          status: 'running',
          definitionKey: 'enrollment_admission',
          definitionName: 'Enrollment Admission',
          sourceType: 'preschool_enrollment_application',
          startedByUserId: 'user-1',
          startedBy: {
            id: 'user-1',
            name: 'Admin User',
            roleCode: 'adminpreschool',
          },
          processedCount: 2,
          createdCount: 1,
          existingCount: 1,
          skippedCount: 0,
          failedCount: 0,
          startedAt: '2026-07-03T08:00:00Z',
          completedAt: '',
          createdAt: '2026-07-03T08:00:00Z',
          updatedAt: '2026-07-03T08:05:00Z',
          durationMs: null,
          throughputItemsPerSecond: null,
          stale: {
            isStale: true,
            staleReason: 'Running longer than the configured threshold.',
            ageMs: 7200000,
            thresholdMs: 1800000,
            run: null,
          },
        },
      ],
      recentFailures: [
        {
          kind: 'run',
          id: 'run-88',
          runId: 88,
          definitionKey: 'enrollment_admission',
          sourceType: 'preschool_enrollment_application',
          sourceId: null,
          sourceLabel: null,
          status: 'failed',
          failureCategory: 'validation_error',
          reason: 'Validation error.',
          errorMessage: 'Validation error.',
          occurredAt: '2026-07-03T09:00:00Z',
          run: null,
        },
      ],
      recentlyCompletedRuns: [
        {
          id: 77,
          mode: 'run',
          status: 'completed',
          definitionKey: 'enrollment_admission',
          definitionName: 'Enrollment Admission',
          sourceType: 'preschool_enrollment_application',
          startedByUserId: 'user-1',
          startedBy: {
            id: 'user-1',
            name: 'Admin User',
            roleCode: 'adminpreschool',
          },
          processedCount: 2,
          createdCount: 1,
          existingCount: 1,
          skippedCount: 0,
          failedCount: 0,
          startedAt: '2026-07-03T07:00:00Z',
          completedAt: '2026-07-03T07:01:00Z',
          createdAt: '2026-07-03T07:00:00Z',
          updatedAt: '2026-07-03T07:01:00Z',
          durationMs: 60000,
          throughputItemsPerSecond: 0.0333,
          stale: null,
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
    filters: {},
    generatedAt: '2026-07-03T10:00:00Z',
  })
}

vi.mock('@/modules/preschool/admin/pages/workflows/composables/useWorkflowData', () => ({
  useWorkflowData: () => workflowData,
}))

vi.mock('@/modules/preschool/admin/pages/workflows/composables/useWorkflowActions', () => ({
  useWorkflowActions: () => ({
    approveApproval: mockApproveApproval,
    rejectApproval: mockRejectApproval,
    returnApproval: mockReturnApproval,
    cancelApproval: mockCancelApproval,
  }),
}))

vi.mock('@/modules/preschool/services/api/preschoolWorkflowApi', () => ({
  fetchPreschoolWorkflowSyncPreview: (...args) => mockFetchPreschoolWorkflowSyncPreview(...args),
  fetchPreschoolWorkflowObservabilityDashboard: (...args) => mockFetchPreschoolWorkflowObservabilityDashboard(...args),
  fetchPreschoolWorkflowSyncRuns: (...args) => mockFetchPreschoolWorkflowSyncRuns(...args),
  runPreschoolWorkflowSync: (...args) => mockRunPreschoolWorkflowSync(...args),
}))

function createRoute() {
  return {
    path: '/module/preschool-admin/workflows',
    name: 'dashboard-preschool-admin-workflows',
    component: { template: '<div />' },
  }
}

function createSyncRunRoute() {
  return {
    path: '/module/preschool-admin/workflows/sync/runs/:id',
    name: 'dashboard-preschool-admin-workflow-sync-run',
    component: { template: '<div />' },
  }
}

async function mountPage(currentUser = { id: 'user-1', role: 'adminpreschool' }, routes = [createRoute(), createSyncRunRoute()]) {
  const wrapper = mountWithPlugins(WorkflowApprovalCenter, {
    messages: {
      en: { common: enCommon, ...enPreschool },
    },
    routes,
    piniaSetup(pinia) {
      const userStore = useUserStore(pinia)
      userStore.currentUser = currentUser
    },
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        Card: {
          template: '<section class="card"><header><slot name="title" /></header><div><slot name="content" /><slot /></div></section>',
        },
        Button: {
          props: ['disabled', 'loading'],
          emits: ['click'],
          template: '<button type="button" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
        },
      },
    },
  })

  await wrapper.vm.$router.push({ name: 'dashboard-preschool-admin-workflows' })
  await flushPromises()
  await flushPromises()

  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  resetWorkflowData()
  resetObservabilityDashboard()
  mockFetchPreschoolWorkflowSyncRuns.mockResolvedValue({
    items: [],
    pagination: null,
  })
})

describe('WorkflowApprovalCenter', () => {
  it('renders the workflow summary, queues, and timeline sections', async () => {
    const wrapper = await mountPage()

    expect(mockLoadWorkflows).toHaveBeenCalledWith({
      page: 1,
      perPage: 20,
      status: '',
      priority: '',
      search: '',
      sourceType: '',
      workflowDefinitionKey: '',
      assignedToUserId: '',
      assignedRole: '',
    })

    expect(wrapper.text()).toContain('Workflow & Approval Center')
    expect(wrapper.text()).toContain('Total Workflows')
    expect(wrapper.text()).toContain('Pending Approvals')
    expect(wrapper.text()).toContain('Workflow Queue')
    expect(wrapper.text()).toContain('Overdue Workflows')
    expect(wrapper.text()).toContain('My Assignments')
    expect(wrapper.text()).toContain('Recently Updated')
    expect(wrapper.text()).toContain('Timeline')
    expect(wrapper.text()).toContain('Application #1')
    expect(wrapper.text()).toContain('Workflow Source')
    expect(wrapper.text()).toContain('Workflow Sync')
    expect(wrapper.text()).toContain('Workflow Observability')
    expect(wrapper.text()).toContain('Sync Health')
    expect(wrapper.text()).toContain('Failure Analysis')
    expect(wrapper.text()).toContain('Stale Runs')
    expect(wrapper.text()).toContain('Recent Operational Activity')
    expect(wrapper.text()).toContain('Enrollment Admission')
    expect(mockFetchPreschoolWorkflowObservabilityDashboard).toHaveBeenCalledWith({
      definitionKey: '',
      sourceType: '',
      status: '',
      startedByUserId: '',
      dateFrom: '',
      dateTo: '',
      mode: '',
    })
  })

  it('calls the approval action API and refreshes the list', async () => {
    const wrapper = await mountPage()

    const approveButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Approve')

    await approveButton.trigger('click')
    await flushPromises()

    expect(mockApproveApproval).toHaveBeenCalledWith('approval-1', {}, expect.any(Function))
    expect(mockLoadWorkflows).toHaveBeenCalledTimes(2)
  })

  it('keeps the page empty and error states visible', async () => {
    workflowData.loading.value = true
    workflowData.errorMessage.value = 'Failed to load workflow center.'
    workflowData.workflows.value = []
    workflowData.approvals.value = []
    workflowData.myAssignments.value = []
    workflowData.overdueWorkflows.value = []
    workflowData.recentlyUpdatedWorkflows.value = []
    workflowData.recentTimelineEvents.value = []

    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('Failed to load workflow center.')
    expect(wrapper.text()).toContain('Loading workflows...')
    expect(wrapper.text()).toContain('No Workflows')
    expect(wrapper.text()).toContain('No Pending Approvals')
    expect(wrapper.text()).toContain('No Timeline')
  })

  it('shows the sync panel for admin users, previews before run, and renders results', async () => {
    mockFetchPreschoolWorkflowSyncRuns.mockResolvedValue({
      items: [
        {
          id: 1,
          mode: 'run',
          status: 'completed',
          definitionKey: 'enrollment_admission',
          sourceType: 'preschool_enrollment_application',
          startedBy: {
            name: 'Admin User',
          },
          startedAt: '2026-07-03T10:00:00Z',
          completedAt: '2026-07-03T10:01:00Z',
          processedCount: 1,
        },
      ],
      pagination: {
        currentPage: 1,
        lastPage: 1,
        perPage: 5,
        total: 1,
      },
    })
    mockFetchPreschoolWorkflowSyncPreview.mockResolvedValue({
      dryRun: true,
      limit: 25,
      summary: {
        eligible: 1,
        created: 1,
        existing: 0,
        skipped: 0,
        failed: 0,
      },
      items: [
        {
          definitionKey: 'enrollment_admission',
          sourceType: 'preschool_enrollment_application',
          sourceId: 'app-99',
          sourceLabel: 'Application #99',
          sourceStatus: 'submitted',
          status: 'created',
          reason: 'Workflow would be created.',
        },
      ],
    })
    mockRunPreschoolWorkflowSync.mockResolvedValue({
      dryRun: false,
      limit: 25,
      summary: {
        eligible: 1,
        created: 1,
        existing: 0,
        skipped: 0,
        failed: 0,
      },
      items: [
        {
          definitionKey: 'enrollment_admission',
          sourceType: 'preschool_enrollment_application',
          sourceId: 'app-99',
          sourceLabel: 'Application #99',
          sourceStatus: 'submitted',
          status: 'created',
          reason: 'Workflow created successfully.',
          workflowInstanceId: 123,
        },
      ],
    })

    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('Workflow Sync')
    expect(wrapper.text()).toContain('Admin controlled sync')
    expect(wrapper.text()).toContain('This does not change source statuses.')
    expect(wrapper.text()).toContain('Recent Sync Runs')
    expect(wrapper.text()).toContain('Admin User')

    const runButtonBeforePreview = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Run Sync')
    expect(runButtonBeforePreview.attributes('disabled')).toBeDefined()

    const previewButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Preview Sync')
    await previewButton.trigger('click')
    await flushPromises()

    expect(mockFetchPreschoolWorkflowSyncPreview).toHaveBeenCalledWith({
      definitionKey: '',
      sourceType: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      limit: 25,
      batchSize: 25,
      dryRun: false,
    })
    expect(wrapper.text()).toContain('Application #99')
    expect(wrapper.text()).toContain('Workflow would be created.')

    const runButtonAfterPreview = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Run Sync')
    expect(runButtonAfterPreview.attributes('disabled')).toBeUndefined()

    await runButtonAfterPreview.trigger('click')
    await flushPromises()

    expect(mockRunPreschoolWorkflowSync).toHaveBeenCalledWith({
      definitionKey: '',
      sourceType: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      limit: 25,
      batchSize: 25,
      dryRun: false,
    })
    expect(wrapper.text()).toContain('Sync completed')
  })

  it('safely hides run navigation when the details route is missing', async () => {
    const wrapper = await mountPage({ id: 'user-1', role: 'adminpreschool' }, [createRoute()])

    expect(wrapper.find('.workflow-observability-section').exists()).toBe(true)
    expect(wrapper.findAll('button').some((button) => button.text() === 'View Run')).toBe(false)
  })

  it('shows observability loading and error states', async () => {
    mockFetchPreschoolWorkflowObservabilityDashboard.mockImplementationOnce(() => new Promise(() => {}))
    const loadingWrapper = await mountPage()

    expect(loadingWrapper.find('.workflow-observability-panel__loading').exists()).toBe(true)

    mockFetchPreschoolWorkflowObservabilityDashboard.mockRejectedValueOnce(new Error('Observability failed.'))
    const errorWrapper = await mountPage()

    expect(errorWrapper.text()).toContain('Observability failed.')
  })

  it('sends observability filters to the backend and navigates to run details when the route exists', async () => {
    const wrapper = await mountPage()

    const observabilityPanel = wrapper.find('.workflow-observability-panel')
    const selects = observabilityPanel.findAll('select')
    await selects[0].setValue('enrollment_admission')
    await selects[1].setValue('preschool_enrollment_application')
    await selects[2].setValue('failed')
    await selects[3].setValue('run')

    const inputs = observabilityPanel.findAll('input')
    await inputs[0].setValue('77')
    await inputs[1].setValue('2026-07-01')
    await inputs[2].setValue('2026-07-03')

    const refreshButton = observabilityPanel
      .findAll('button')
      .find((button) => button.text() === 'Run Filters')

    await refreshButton.trigger('click')
    await flushPromises()

    expect(mockFetchPreschoolWorkflowObservabilityDashboard).toHaveBeenLastCalledWith({
      definitionKey: 'enrollment_admission',
      sourceType: 'preschool_enrollment_application',
      status: 'failed',
      startedByUserId: '77',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-03',
      mode: 'run',
    })

    const viewRunButton = wrapper
      .find('.workflow-observability-section')
      .findAll('button')
      .find((button) => button.text() === 'View Run')

    await viewRunButton.trigger('click')
    await flushPromises()

    expect(wrapper.vm.$router.currentRoute.value.name).toBe('dashboard-preschool-admin-workflow-sync-run')
  })

  it('hides the sync panel for teacher users', async () => {
    const wrapper = await mountPage({ id: 'teacher-1', role: 'teacher-preschool' })

    expect(wrapper.text()).not.toContain('Workflow Sync')
    expect(wrapper.text()).not.toContain('Preview Sync')
    expect(wrapper.text()).not.toContain('Run Sync')
    expect(wrapper.text()).not.toContain('Recent Sync Runs')
    expect(wrapper.text()).not.toContain('Workflow Observability')
  })
})
