import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import { useUserStore } from '@/store/userStore'
import enCommon from '@/i18n/en/common'
import enPreschool from '@/i18n/en/preschool'
import WorkflowDetails from '@/modules/preschool/admin/pages/workflows/WorkflowDetails.vue'

let loadWorkflowDetailsMock
let assignWorkflowMock
let transitionWorkflowMock
let completeWorkflowMock
let cancelWorkflowMock
let escalateWorkflowMock
let approveApprovalMock
let rejectApprovalMock
let returnApprovalMock
let cancelApprovalMock

let detailsState

function createState() {
  loadWorkflowDetailsMock = vi.fn(async () => undefined)
  assignWorkflowMock = vi.fn(async (id, payload, onSuccess) => {
    await onSuccess?.()
    return { workflow: { id, payload } }
  })
  transitionWorkflowMock = vi.fn(async (id, payload, onSuccess) => {
    await onSuccess?.()
    return { workflow: { id, payload } }
  })
  completeWorkflowMock = vi.fn(async (id, payload, onSuccess) => {
    await onSuccess?.()
    return { workflow: { id, payload } }
  })
  cancelWorkflowMock = vi.fn(async (id, payload, onSuccess) => {
    await onSuccess?.()
    return { workflow: { id, payload } }
  })
  escalateWorkflowMock = vi.fn(async (id, payload, onSuccess) => {
    await onSuccess?.()
    return { workflow: { id, payload } }
  })
  approveApprovalMock = vi.fn(async (id, payload, onSuccess) => {
    await onSuccess?.()
    return { approval: { id, payload } }
  })
  rejectApprovalMock = vi.fn(async (id, payload, onSuccess) => {
    await onSuccess?.()
    return { approval: { id, payload } }
  })
  returnApprovalMock = vi.fn(async (id, payload, onSuccess) => {
    await onSuccess?.()
    return { approval: { id, payload } }
  })
  cancelApprovalMock = vi.fn(async (id, payload, onSuccess) => {
    await onSuccess?.()
    return { approval: { id, payload } }
  })

  detailsState = {
    loading: ref(false),
    errorMessage: ref(''),
    workflow: ref({
      id: 'wf-1',
      workflowDefinitionName: 'Health Alert Resolution',
      workflowDefinitionKey: 'health_alert_resolution',
      workflowDefinitionDomain: 'health',
      sourceLabel: 'Health Alert #1',
      sourceType: 'health_alert',
      sourceId: 'health-1',
      sourceExists: true,
      currentStep: {
        id: 'step-1',
        key: 'assigned',
        name: 'Assigned',
        slaHours: 4,
      },
      status: 'in_progress',
      priority: 'high',
      assignedRole: 'adminpreschool',
      dueAt: '2026-07-03T11:00:00Z',
      approvals: [
        {
          id: 'approval-1',
          status: 'pending',
          requestedToRole: 'adminpreschool',
          dueAt: '2026-07-03T11:00:00Z',
          instance: {
            id: 'wf-1',
            sourceLabel: 'Health Alert #1',
            sourceType: 'health_alert',
          },
        },
      ],
    }),
    timeline: ref([
      {
        id: 'event-1',
        title: 'Workflow created',
        eventType: 'created',
        createdAt: '2026-07-03T08:00:00Z',
      },
    ]),
    definitions: ref([]),
    approvals: ref([
        {
          id: 'approval-1',
          status: 'pending',
          requestedToRole: 'adminpreschool',
          dueAt: '2026-07-03T11:00:00Z',
          instance: {
            id: 'wf-1',
            sourceLabel: 'Health Alert #1',
            sourceType: 'health_alert',
          },
        },
    ]),
    sourceTypeLabel: ref('Health Alert'),
    currentStep: ref('Assigned'),
    loadWorkflowDetails: loadWorkflowDetailsMock,
  }
}

vi.mock('@/modules/preschool/admin/pages/workflows/composables/useWorkflowDetailsData', () => ({
  useWorkflowDetailsData: () => detailsState,
}))

vi.mock('@/modules/preschool/admin/pages/workflows/composables/useWorkflowActions', () => ({
  useWorkflowActions: () => ({
    canManageWorkflows: ref(true),
    assignWorkflow: assignWorkflowMock,
    transitionWorkflow: transitionWorkflowMock,
    completeWorkflow: completeWorkflowMock,
    cancelWorkflow: cancelWorkflowMock,
    escalateWorkflow: escalateWorkflowMock,
    approveApproval: approveApprovalMock,
    rejectApproval: rejectApprovalMock,
    returnApproval: returnApprovalMock,
    cancelApproval: cancelApprovalMock,
  }),
}))

function createRoutes() {
  return [
    {
      path: '/module/preschool-admin/workflows/:id',
      name: 'dashboard-preschool-admin-workflow-details',
      component: { template: '<div />' },
    },
    {
      path: '/module/preschool-admin/health',
      name: 'dashboard-preschool-admin-health',
      component: { template: '<div />' },
    },
  ]
}

async function mountPage(currentUser = { id: 'user-1', role: 'adminpreschool' }) {
  const wrapper = mountWithPlugins(WorkflowDetails, {
    messages: {
      en: { common: enCommon, ...enPreschool },
    },
    routes: createRoutes(),
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
        Dialog: {
          props: ['visible', 'header'],
          template: '<section v-if="visible" data-testid="dialog"><slot /><footer><slot name="footer" /></footer></section>',
        },
        InputText: { template: '<input type="text" />' },
        Select: { template: '<select />' },
        Textarea: { template: '<textarea />' },
      },
    },
  })

  await wrapper.vm.$router.push({ name: 'dashboard-preschool-admin-workflow-details', params: { id: 'wf-1' } })
  await flushPromises()
  await flushPromises()

  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  createState()
})

describe('WorkflowDetails', () => {
  it('renders the workflow detail sections and calls workflow actions', async () => {
    const wrapper = await mountPage()

    expect(loadWorkflowDetailsMock.mock.calls.some((call) => call[0] === 'wf-1')).toBe(true)
    expect(wrapper.text()).toContain('Workflow Details')
    expect(wrapper.text()).toContain('Health Alert #1')
    expect(wrapper.text()).toContain('Source Entity')
    expect(wrapper.text()).toContain('Approvals')
    expect(wrapper.text()).toContain('Timeline')
    expect(wrapper.text()).toContain('Assign')
    expect(wrapper.text()).toContain('View Source')

    const assignButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Assign')
    await assignButton.trigger('click')
    await flushPromises()

    const dialogButtonsAfterAssign = wrapper.findAll('button')
    await dialogButtonsAfterAssign[dialogButtonsAfterAssign.length - 1].trigger('click')
    await flushPromises()

    expect(assignWorkflowMock).toHaveBeenCalledWith(
      'wf-1',
      { assignedToUserId: null, assignedRole: 'adminpreschool' },
      expect.any(Function),
    )

    const approveButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Approve')
    await approveButton.trigger('click')
    await flushPromises()

    const dialogButtonsAfterApprove = wrapper.findAll('button')
    await dialogButtonsAfterApprove[dialogButtonsAfterApprove.length - 1].trigger('click')
    await flushPromises()

    expect(approveApprovalMock).toHaveBeenCalledWith(
      'approval-1',
      { decisionNotes: null },
      expect.any(Function),
    )
    expect(loadWorkflowDetailsMock.mock.calls.filter((call) => call[0] === 'wf-1')).toHaveLength(3)
  })

  it('hides approval actions for unsupported roles', async () => {
    const wrapper = await mountPage({ id: 'teacher-1', role: 'teacher-preschool' })

    expect(wrapper.text()).not.toContain('Approve')
    expect(wrapper.text()).not.toContain('Reject')
    expect(wrapper.text()).not.toContain('Return')
  })

  it('hides broken source routes and shows source unavailable safely', async () => {
    detailsState.workflow.value = {
      ...detailsState.workflow.value,
      sourceExists: false,
      sourceRouteName: 'dashboard-preschool-admin-health-student',
      sourceRouteParams: { id: 'health-1' },
    }

    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('Source Unavailable')
    expect(wrapper.text()).not.toContain('View Source')
  })
})
