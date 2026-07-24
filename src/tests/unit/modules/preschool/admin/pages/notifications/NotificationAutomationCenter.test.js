import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import NotificationAutomationCenter from '@/modules/preschool/admin/pages/notifications/NotificationAutomationCenter.vue'

const mockFetchPreschoolNotifications = vi.fn()
const mockFetchPreschoolNotificationSummary = vi.fn()
const mockFetchPreschoolAutomationTasks = vi.fn()
const mockFetchPreschoolAutomationTaskSummary = vi.fn()
const mockMarkPreschoolNotificationRead = vi.fn()
const mockArchivePreschoolNotification = vi.fn()
const mockCompletePreschoolAutomationTask = vi.fn()
const mockCancelPreschoolAutomationTask = vi.fn()
const mockAssignPreschoolAutomationTask = vi.fn()
const mockRunPreschoolDailyAutomationChecks = vi.fn()
let mockCurrentUser = { role_code: 'adminpreschool' }

vi.mock('@/modules/preschool/services/api/preschoolNotificationApi', () => ({
  archivePreschoolNotification: (...args) => mockArchivePreschoolNotification(...args),
  assignPreschoolAutomationTask: (...args) => mockAssignPreschoolAutomationTask(...args),
  cancelPreschoolAutomationTask: (...args) => mockCancelPreschoolAutomationTask(...args),
  completePreschoolAutomationTask: (...args) => mockCompletePreschoolAutomationTask(...args),
  fetchPreschoolAutomationTaskSummary: (...args) => mockFetchPreschoolAutomationTaskSummary(...args),
  fetchPreschoolAutomationTasks: (...args) => mockFetchPreschoolAutomationTasks(...args),
  fetchPreschoolNotificationSummary: (...args) => mockFetchPreschoolNotificationSummary(...args),
  fetchPreschoolNotifications: (...args) => mockFetchPreschoolNotifications(...args),
  markPreschoolNotificationRead: (...args) => mockMarkPreschoolNotificationRead(...args),
  runPreschoolDailyAutomationChecks: (...args) => mockRunPreschoolDailyAutomationChecks(...args),
}))

vi.mock('@/store/userStore', () => ({
  useUserStore: () => ({
    currentUser: mockCurrentUser,
  }),
}))

function createRoute() {
  return {
    path: '/module/preschool-admin/notifications',
    name: 'dashboard-preschool-admin-notifications',
    component: { template: '<div />' },
  }
}

function createWorkflowRoute() {
  return {
    path: '/module/preschool-admin/workflows/:id',
    name: 'dashboard-preschool-admin-workflow-details',
    component: { template: '<div />' },
  }
}

function baseMessages() {
  return {
    ...enPreschool,
    common: {
      loading: 'Loading',
      refresh: 'Refresh',
      cancel: 'Cancel',
      errorOccurred: 'An error occurred.',
      role: {
        adminpreschool: 'Admin Preschool',
        teacher_preschool: 'Teacher Preschool',
      },
    },
  }
}

async function mountPage() {
  const wrapper = mountWithPlugins(NotificationAutomationCenter, {
    messages: baseMessages(),
    routes: [createRoute(), createWorkflowRoute()],
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: {
          props: ['title', 'subtitle'],
          template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>',
        },
        Card: { template: '<section><slot name="title" /><slot name="content" /><slot /></section>' },
        Dialog: { template: '<div><slot /><slot name="footer" /></div>' },
        InputText: { template: '<input />' },
        Select: { props: ['modelValue', 'options', 'optionLabel', 'optionValue'], template: '<select />' },
        Textarea: { template: '<textarea />' },
        Button: {
          props: ['type', 'loading', 'disabled'],
          emits: ['click'],
          template: '<button :type="type" :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
        },
      },
    },
  })

  await wrapper.vm.$router.push({ name: 'dashboard-preschool-admin-notifications' })
  await flushPromises()
  await flushPromises()

  return wrapper
}

function findButton(wrapper, label) {
  return wrapper.findAll('button').find((button) => button.text().includes(label))
}

beforeEach(() => {
  vi.clearAllMocks()
  mockCurrentUser = { role_code: 'adminpreschool' }

  mockFetchPreschoolNotificationSummary.mockResolvedValue({
    total: 3,
    unread: 2,
    read: 1,
    archived: 0,
    critical: 1,
    byType: [
      { notificationType: 'attendance.follow_up', total: 1 },
      { notificationType: 'payments.overdue_invoice', total: 1 },
    ],
    bySeverity: [
      { severity: 'high', total: 1 },
      { severity: 'medium', total: 1 },
    ],
  })

  mockFetchPreschoolNotifications.mockResolvedValue({
    items: [
      {
        id: 1,
        notificationType: 'attendance.follow_up',
        title: 'Attendance follow-up required',
        body: 'Contact the guardian.',
        severity: 'high',
        status: 'unread',
        sourceType: 'attendance_communication',
        workflowInstanceId: 'wf-1',
        workflowStatus: 'open',
        workflowRoute: 'dashboard-preschool-admin-workflow-details',
        workflowActionParams: { id: 'wf-1' },
        createdAt: '2026-07-02T08:00:00Z',
      },
      {
        id: 2,
        notificationType: 'health.alert',
        title: 'Health alert created',
        body: 'Monitor the student.',
        severity: 'medium',
        status: 'unread',
        sourceType: 'health_alert',
        createdAt: '2026-07-02T07:30:00Z',
      },
    ],
    summary: {
      total: 2,
      unread: 2,
      read: 0,
      archived: 0,
      critical: 1,
      byType: [{ notificationType: 'attendance.follow_up', total: 1 }],
      bySeverity: [{ severity: 'high', total: 1 }],
    },
    pagination: { currentPage: 1, lastPage: 1, perPage: 20, total: 1 },
  })

  mockFetchPreschoolAutomationTaskSummary.mockResolvedValue({
    total: 2,
    open: 1,
    inProgress: 0,
    completed: 1,
    cancelled: 0,
    overdue: 1,
    today: 1,
    byType: [
      { taskType: 'attendance.follow_up', total: 1 },
      { taskType: 'payments.follow_up', total: 1 },
    ],
    byPriority: [
      { priority: 'high', total: 1 },
      { priority: 'urgent', total: 1 },
    ],
  })

  mockFetchPreschoolAutomationTasks.mockResolvedValue({
    items: [
      {
        id: 10,
        taskType: 'attendance.follow_up',
        title: 'Follow up with guardian',
        description: 'Call the guardian',
        priority: 'high',
        status: 'open',
        dueAt: '2026-07-02T12:00:00Z',
        workflowInstanceId: 'wf-2',
        workflowStatus: 'in_progress',
        workflowRoute: 'dashboard-preschool-admin-workflow-details',
        workflowActionParams: { id: 'wf-2' },
      },
      {
        id: 11,
        taskType: 'payments.follow_up',
        title: 'Review invoice',
        description: 'Check the invoice status',
        priority: 'normal',
        status: 'open',
        dueAt: '2026-07-02T15:00:00Z',
      },
    ],
    summary: {
      total: 2,
      open: 2,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0,
      today: 2,
      byType: [
        { taskType: 'attendance.follow_up', total: 1 },
        { taskType: 'payments.follow_up', total: 1 },
      ],
      byPriority: [
        { priority: 'high', total: 1 },
        { priority: 'normal', total: 1 },
      ],
    },
    pagination: { currentPage: 1, lastPage: 1, perPage: 20, total: 2 },
  })

  mockMarkPreschoolNotificationRead.mockResolvedValue({})
  mockArchivePreschoolNotification.mockResolvedValue({})
  mockCompletePreschoolAutomationTask.mockResolvedValue({})
  mockCancelPreschoolAutomationTask.mockResolvedValue({})
  mockAssignPreschoolAutomationTask.mockResolvedValue({})
  mockRunPreschoolDailyAutomationChecks.mockResolvedValue({})
})

describe('NotificationAutomationCenter', () => {
  it('renders summary cards and triggers the expected actions', async () => {
    const wrapper = await mountPage()

    expect(mockFetchPreschoolNotificationSummary).toHaveBeenCalled()
    expect(mockFetchPreschoolAutomationTaskSummary).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Notification & Automation Center')
    expect(wrapper.text()).toContain('Unread Notifications')
    expect(wrapper.text()).toContain('Automation Tasks')
    expect(wrapper.text()).toContain('Overdue Tasks')
    expect(wrapper.text()).toContain('Today’s Tasks')
    expect(wrapper.text()).toContain('Related Workflow')
    expect(wrapper.findAll('button').filter((button) => button.text().includes('Open Workflow'))).toHaveLength(2)

    await findButton(wrapper, 'Mark as Read').trigger('click')
    await flushPromises()
    expect(mockMarkPreschoolNotificationRead).toHaveBeenCalledWith(1)

    await findButton(wrapper, 'Complete Task').trigger('click')
    await flushPromises()
    expect(mockCompletePreschoolAutomationTask).toHaveBeenCalledWith(10)

    await findButton(wrapper, 'Run Daily Checks').trigger('click')
    await flushPromises()
    expect(mockRunPreschoolDailyAutomationChecks).toHaveBeenCalled()
  })

  it('renders loading, empty, and error states', async () => {
    mockFetchPreschoolNotificationSummary.mockRejectedValueOnce(new Error('Failed to load notifications.'))
    mockFetchPreschoolNotifications.mockRejectedValueOnce(new Error('Failed to load notifications.'))
    mockFetchPreschoolAutomationTaskSummary.mockRejectedValueOnce(new Error('Failed to load notifications.'))
    mockFetchPreschoolAutomationTasks.mockRejectedValueOnce(new Error('Failed to load notifications.'))

    const wrapper = await mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to load notifications.')

    mockFetchPreschoolNotificationSummary.mockResolvedValue({
      total: 0,
      unread: 0,
      read: 0,
      archived: 0,
      critical: 0,
      byType: [],
      bySeverity: [],
    })
    mockFetchPreschoolNotifications.mockResolvedValue({
      items: [],
      summary: {
        total: 0,
        unread: 0,
        read: 0,
        archived: 0,
        critical: 0,
        byType: [],
        bySeverity: [],
      },
      pagination: { currentPage: 1, lastPage: 1, perPage: 20, total: 0 },
    })
    mockFetchPreschoolAutomationTaskSummary.mockResolvedValue({
      total: 0,
      open: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0,
      today: 0,
      byType: [],
      byPriority: [],
    })
    mockFetchPreschoolAutomationTasks.mockResolvedValue({
      items: [],
      summary: {
        total: 0,
        open: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0,
        today: 0,
        byType: [],
        byPriority: [],
      },
      pagination: { currentPage: 1, lastPage: 1, perPage: 20, total: 0 },
    })

    const emptyWrapper = await mountPage()
    expect(emptyWrapper.text()).toContain('No Notifications')
    expect(emptyWrapper.text()).toContain('No Automation Tasks')
  })
})
