import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import { useUserStore } from '@/store/userStore'
import enCommon from '@/i18n/en/common'
import enPreschool from '@/i18n/en/preschool'
import WorkflowSyncRunDetails from '@/modules/preschool/admin/pages/workflows/WorkflowSyncRunDetails.vue'

const mockFetchPreschoolWorkflowSyncRun = vi.fn()
const mockFetchPreschoolWorkflowSyncRunItems = vi.fn()

vi.mock('@/modules/preschool/services/api/preschoolWorkflowApi', () => ({
  fetchPreschoolWorkflowSyncRun: (...args) => mockFetchPreschoolWorkflowSyncRun(...args),
  fetchPreschoolWorkflowSyncRunItems: (...args) => mockFetchPreschoolWorkflowSyncRunItems(...args),
}))

function createRoute(path, name) {
  return {
    path,
    name,
    component: { template: '<div />' },
  }
}

async function mountPage(routes = []) {
  const wrapper = mountWithPlugins(WorkflowSyncRunDetails, {
    messages: {
      en: { common: enCommon, ...enPreschool },
    },
    routes: [
      createRoute('/module/preschool-admin/workflows/sync/runs/:id', 'dashboard-preschool-admin-workflow-sync-run'),
      createRoute('/module/preschool-admin/workflows/:id', 'dashboard-preschool-admin-workflow-details'),
      createRoute('/module/preschool-admin/payment/invoices/:id', 'dashboard-preschool-admin-invoice-detail'),
      ...routes,
    ],
    piniaSetup(pinia) {
      const userStore = useUserStore(pinia)
      userStore.currentUser = { id: 'user-1', role: 'adminpreschool' }
    },
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
      },
    },
  })

  await wrapper.vm.$router.push({ name: 'dashboard-preschool-admin-workflow-sync-run', params: { id: 10 } })
  await flushPromises()
  await flushPromises()

  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchPreschoolWorkflowSyncRun.mockResolvedValue({
    run: {
      id: 10,
      mode: 'run',
      status: 'completed_with_errors',
      definitionKey: 'invoice_collection',
      sourceType: 'preschool_invoice',
      startedBy: {
        name: 'Admin User',
      },
      startedAt: '2026-07-03T10:00:00Z',
      completedAt: '2026-07-03T10:01:00Z',
      processedCount: 3,
      batchSize: 10,
      failedCount: 1,
    },
  })
  mockFetchPreschoolWorkflowSyncRunItems.mockResolvedValue({
    items: [
      {
        id: 1,
        definitionKey: 'invoice_collection',
        sourceType: 'preschool_invoice',
        sourceId: '55',
        sourceLabel: 'Invoice 55',
        sourceRouteName: 'dashboard-preschool-admin-invoice-detail',
        sourceRouteParams: { id: '55' },
        sourceExists: true,
        resultStatus: 'created',
        reason: 'Workflow created successfully.',
        workflowInstanceId: 88,
        workflowRouteName: 'dashboard-preschool-admin-workflow-details',
        workflowRouteParams: { id: 88 },
        processedAt: '2026-07-03T10:00:30Z',
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

describe('WorkflowSyncRunDetails', () => {
  it('renders run history details and enables safe links when routes exist', async () => {
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('Sync Run Details')
    expect(wrapper.text()).toContain('Completed with Errors')
    expect(wrapper.text()).toContain('Admin User')
    expect(wrapper.text()).toContain('Result Items')
    expect(wrapper.text()).toContain('Invoice 55')

    const buttons = wrapper.findAll('button')
    const sourceButton = buttons.find((button) => button.text() === 'View Source')
    const workflowButton = buttons.find((button) => button.text() === 'View Workflow')

    expect(sourceButton.attributes('disabled')).toBeUndefined()
    expect(workflowButton.attributes('disabled')).toBeUndefined()

    await sourceButton.trigger('click')
    await workflowButton.trigger('click')
    await flushPromises()

    expect(mockFetchPreschoolWorkflowSyncRun).toHaveBeenCalledWith('10')
    expect(mockFetchPreschoolWorkflowSyncRunItems).toHaveBeenCalledWith('10', {
      resultStatus: '',
      page: 1,
      perPage: 20,
    })
  })

  it('shows an empty state when a run has no result items', async () => {
    mockFetchPreschoolWorkflowSyncRunItems.mockResolvedValueOnce({
      items: [],
      pagination: {
        currentPage: 1,
        lastPage: 1,
        perPage: 20,
        total: 0,
      },
    })

    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('No Sync History')
  })

  it('disables safe links when the corresponding routes do not exist', async () => {
    const wrapper = mountWithPlugins(WorkflowSyncRunDetails, {
      messages: {
        en: { common: enCommon, ...enPreschool },
      },
      routes: [
        createRoute('/module/preschool-admin/workflows/sync/runs/:id', 'dashboard-preschool-admin-workflow-sync-run'),
      ],
      piniaSetup(pinia) {
        const userStore = useUserStore(pinia)
        userStore.currentUser = { id: 'user-1', role: 'adminpreschool' }
      },
      global: {
        stubs: {
          MainLayout: { template: '<div><slot /></div>' },
        },
      },
    })

    await wrapper.vm.$router.push({ name: 'dashboard-preschool-admin-workflow-sync-run', params: { id: 10 } })
    await flushPromises()
    await flushPromises()

    const buttons = wrapper.findAll('button')
    const sourceButton = buttons.find((button) => button.text() === 'View Source')
    const workflowButton = buttons.find((button) => button.text() === 'View Workflow')

    expect(sourceButton.attributes('disabled')).toBeDefined()
    expect(workflowButton.attributes('disabled')).toBeDefined()
  })
})
