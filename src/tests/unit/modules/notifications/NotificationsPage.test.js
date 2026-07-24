import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enNotifications from '@/i18n/en/notifications/notifications'
import NotificationsPage from '@/modules/notifications/pages/NotificationsPage.vue'

const loadNotifications = vi.fn()
const loadUnreadCount = vi.fn()
const markAsRead = vi.fn()
const markAllAsRead = vi.fn()
const dismiss = vi.fn()
const undismiss = vi.fn()

const loadUnifiedAlerts = vi.fn()
const loadUnifiedTasks = vi.fn()
const loadUnifiedApprovals = vi.fn()
const markUnifiedNotificationRead = vi.fn()
const markAllUnifiedNotificationsRead = vi.fn()
const dismissUnifiedNotification = vi.fn()
const undismissUnifiedNotification = vi.fn()
const markUnifiedAlertRead = vi.fn()
const archiveUnifiedAlert = vi.fn()
const completeUnifiedTask = vi.fn()
const cancelUnifiedTask = vi.fn()
const approveUnifiedWorkflowApproval = vi.fn()
const rejectUnifiedWorkflowApproval = vi.fn()
const returnUnifiedWorkflowApproval = vi.fn()
const cancelUnifiedWorkflowApproval = vi.fn()
const testUser = reactive({ role_code: 'superadmin' })

vi.mock('@/modules/notifications/composables/useNotifications', () => ({
  useNotifications: () => ({
    items: ref([
      {
        id: 'global-1',
        title: 'Global notice',
        message: 'Platform update',
        type: 'info',
        module: 'global',
        read: false,
        dismissed: false,
        createdAt: '2026-07-04T01:00:00Z',
      },
    ]),
    unreadCount: ref(1),
    loading: ref(false),
    error: ref(''),
    pagination: reactive({ page: 1, perPage: 8, total: 1, lastPage: 1 }),
    filters: reactive({ status: 'all', type: '', module: '', search: '' }),
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    dismiss,
    undismiss,
  }),
}))

vi.mock('@/modules/notifications/composables/useUnreadNotifications', () => ({
  useUnreadNotifications: () => ({
    unreadCount: ref(1),
    loading: ref(false),
    error: ref(''),
    loadUnreadCount,
  }),
}))

vi.mock('@/modules/notifications/services/notificationCenterApi', () => ({
  archiveUnifiedAlert: (...args) => archiveUnifiedAlert(...args),
  cancelUnifiedTask: (...args) => cancelUnifiedTask(...args),
  cancelUnifiedWorkflowApproval: (...args) => cancelUnifiedWorkflowApproval(...args),
  completeUnifiedTask: (...args) => completeUnifiedTask(...args),
  dismissUnifiedNotification: (...args) => dismissUnifiedNotification(...args),
  loadUnifiedAlerts: (...args) => loadUnifiedAlerts(...args),
  loadUnifiedApprovals: (...args) => loadUnifiedApprovals(...args),
  loadUnifiedTasks: (...args) => loadUnifiedTasks(...args),
  markAllUnifiedNotificationsRead: (...args) => markAllUnifiedNotificationsRead(...args),
  markUnifiedAlertRead: (...args) => markUnifiedAlertRead(...args),
  markUnifiedNotificationRead: (...args) => markUnifiedNotificationRead(...args),
  approveUnifiedWorkflowApproval: (...args) => approveUnifiedWorkflowApproval(...args),
  rejectUnifiedWorkflowApproval: (...args) => rejectUnifiedWorkflowApproval(...args),
  returnUnifiedWorkflowApproval: (...args) => returnUnifiedWorkflowApproval(...args),
  undismissUnifiedNotification: (...args) => undismissUnifiedNotification(...args),
}))

vi.mock('@/store/userStore', () => ({
  useUserStore: () => ({ currentUser: testUser }),
}))

function createRoute(name, path, component = { template: '<div />' }) {
  return { name, path, component }
}

function baseMessages() {
  return {
    notifications: enNotifications,
    common: {
      errorOccurred: 'An error occurred.',
      notifications: {
        filters: 'Filters',
      },
    },
  }
}

async function mountPage(query = {}) {
  const wrapper = mountWithPlugins(NotificationsPage, {
    messages: {
      en: baseMessages(),
    },
    routes: [
      createRoute('dashboard-notifications', '/module/notifications'),
      createRoute('dashboard-preschool-admin-workflow-details', '/module/preschool-admin/workflows/:id'),
    ],
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: {
          props: ['title', 'subtitle'],
          template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>',
        },
        Card: {
          template: '<section><slot name="title" /><slot name="content" /><slot /></section>',
        },
        Button: {
          props: ['type', 'severity', 'outlined', 'text', 'size', 'disabled'],
          emits: ['click'],
          template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
        },
        NotificationInboxCard: {
          props: ['title', 'subtitle', 'notifications'],
          emits: ['read', 'dismiss', 'undismiss', 'mark-all-read'],
          template: `
            <section class="inbox-card">
              <h2>{{ title }}</h2>
              <p>{{ subtitle }}</p>
              <div class="inbox-card__title">{{ notifications?.[0]?.title }}</div>
              <button class="inbox-card__mark-all" @click="$emit('mark-all-read')">Mark all</button>
              <button class="inbox-card__read" @click="$emit('read', notifications?.[0])">Read</button>
              <button class="inbox-card__dismiss" @click="$emit('dismiss', notifications?.[0])">Dismiss</button>
              <button class="inbox-card__undismiss" @click="$emit('undismiss', notifications?.[0])">Undismiss</button>
            </section>
          `,
        },
      },
    },
  })

  await wrapper.vm.$router.push({
    name: 'dashboard-notifications',
    query,
  })
  await flushPromises()
  await flushPromises()

  return wrapper
}

function findButton(wrapper, label) {
  return wrapper.findAll('button').find((button) => button.text().includes(label))
}

function findActionButton(wrapper, label) {
  return wrapper
    .findAll('.notifications-center__actions button')
    .find((button) => button.text().trim() === label)
}

beforeEach(() => {
  vi.clearAllMocks()
  testUser.role_code = 'superadmin'

  loadUnifiedAlerts.mockResolvedValue({
    items: [
      {
        id: 'alert-1',
        title: 'Health alert',
        summary: 'Check temperature',
        message: 'Check temperature',
        severity: 'high',
        status: 'unread',
        module: 'preschool',
        sourceType: 'health_alert',
        createdAt: '2026-07-04T02:00:00Z',
      },
    ],
    summary: {
      total: 1,
      unread: 1,
      read: 0,
      archived: 0,
      critical: 1,
      byType: [],
      bySeverity: [],
    },
    pagination: { currentPage: 1, lastPage: 1, perPage: 8, total: 1 },
  })

  loadUnifiedTasks.mockResolvedValue({
    items: [
      {
        id: 'task-1',
        title: 'Follow up',
        summary: 'Call guardian',
        priority: 'high',
        status: 'open',
        module: 'preschool',
        sourceType: 'attendance_follow_up',
        dueAt: '2026-07-04T08:00:00Z',
        createdAt: '2026-07-04T03:00:00Z',
      },
    ],
    summary: {
      total: 1,
      open: 1,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0,
      today: 1,
      byType: [],
      byPriority: [],
    },
    pagination: { currentPage: 1, lastPage: 1, perPage: 8, total: 1 },
  })

  loadUnifiedApprovals.mockResolvedValue({
    items: [
      {
        id: 'approval-1',
        title: 'Approve intake',
        summary: 'Review the form',
        status: 'pending',
        module: 'preschool',
        sourceType: 'preschool_enrollment_application',
        actionRouteName: 'dashboard-preschool-admin-workflow-details',
        actionRouteParams: { id: 'wf-1' },
        canAct: true,
        createdAt: '2026-07-04T04:00:00Z',
      },
    ],
    summary: {
      total: 1,
      pendingApprovals: 1,
      approved: 0,
      rejected: 0,
      returned: 0,
      cancelled: 0,
      overdue: 0,
    },
    pagination: { currentPage: 1, lastPage: 1, perPage: 8, total: 1 },
  })

  loadNotifications.mockResolvedValue({
    items: [],
    pagination: { page: 1, perPage: 8, total: 1, lastPage: 1 },
  })
  loadUnreadCount.mockResolvedValue(1)
  markAsRead.mockResolvedValue({})
  markAllAsRead.mockResolvedValue({})
  dismiss.mockResolvedValue({})
  undismiss.mockResolvedValue({})
  markUnifiedNotificationRead.mockResolvedValue({})
  markAllUnifiedNotificationsRead.mockResolvedValue({})
  dismissUnifiedNotification.mockResolvedValue({})
  undismissUnifiedNotification.mockResolvedValue({})
  markUnifiedAlertRead.mockResolvedValue({})
  archiveUnifiedAlert.mockResolvedValue({})
  completeUnifiedTask.mockResolvedValue({})
  cancelUnifiedTask.mockResolvedValue({})
  approveUnifiedWorkflowApproval.mockResolvedValue({})
  rejectUnifiedWorkflowApproval.mockResolvedValue({})
  returnUnifiedWorkflowApproval.mockResolvedValue({})
  cancelUnifiedWorkflowApproval.mockResolvedValue({})
})

describe('NotificationsPage', () => {
  it('loads the unified inbox when the tab query is missing', async () => {
    const wrapper = await mountPage()

    expect(loadNotifications).toHaveBeenCalled()
    expect(loadUnreadCount).toHaveBeenCalled()
    expect(loadUnifiedAlerts).toHaveBeenCalled()
    expect(loadUnifiedTasks).toHaveBeenCalled()
    expect(loadUnifiedApprovals).toHaveBeenCalled()

    expect(wrapper.text()).toContain('My Notifications')
    expect(wrapper.text()).toContain('Tasks')
    expect(wrapper.text()).toContain('Alerts')
    expect(wrapper.text()).toContain('Approvals')
    expect(wrapper.text()).toContain('Global notice')
  })

  it('accepts the legacy my-notifications tab query', async () => {
    const wrapper = await mountPage({ tab: 'my-notifications' })

    expect(wrapper.text()).toContain('Global notice')
    expect(wrapper.text()).toContain('My Notifications')
    expect(wrapper.vm.$router.currentRoute.value.query.tab).toBe('my-notifications')
  })

  it('loads tasks from tab=tasks', async () => {
    const wrapper = await mountPage({ tab: 'tasks' })

    expect(wrapper.text()).toContain('Follow up')
    expect(wrapper.vm.$router.currentRoute.value.query.tab).toBe('tasks')
  })

  it('loads alerts from tab=alerts', async () => {
    const wrapper = await mountPage({ tab: 'alerts' })

    expect(wrapper.text()).toContain('Health alert')
    expect(wrapper.vm.$router.currentRoute.value.query.tab).toBe('alerts')
  })

  it('loads approvals from tab=approvals', async () => {
    const wrapper = await mountPage({ tab: 'approvals' })

    expect(wrapper.text()).toContain('Approve intake')
    expect(wrapper.vm.$router.currentRoute.value.query.tab).toBe('approvals')
  })

  it('falls back safely for an invalid tab query', async () => {
    const wrapper = await mountPage({ tab: 'invalid' })

    expect(wrapper.text()).toContain('Global notice')
    expect(wrapper.text()).not.toContain('Follow up')
    expect(wrapper.text()).not.toContain('Approve intake')
  })

  it.each(['adminsport', 'coach'])('shows only My Notifications for %s', async (role) => {
    testUser.role_code = role

    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('My Notifications')
    expect(wrapper.text()).not.toContain('Tasks')
    expect(wrapper.text()).not.toContain('Alerts')
    expect(wrapper.text()).not.toContain('Approvals')
    expect(loadUnifiedTasks).not.toHaveBeenCalled()
    expect(loadUnifiedAlerts).not.toHaveBeenCalled()
    expect(loadUnifiedApprovals).not.toHaveBeenCalled()
  })

  it('falls back to My Notifications and skips unsupported loaders for Sport query tabs', async () => {
    testUser.role_code = 'adminsport'

    const wrapper = await mountPage({ tab: 'tasks' })

    expect(wrapper.text()).toContain('My Notifications')
    expect(wrapper.text()).not.toContain('Tasks')
    expect(wrapper.vm.$router.currentRoute.value.query.tab).toBeUndefined()
    expect(loadUnifiedTasks).not.toHaveBeenCalled()
    expect(loadUnifiedAlerts).not.toHaveBeenCalled()
    expect(loadUnifiedApprovals).not.toHaveBeenCalled()
  })

  it('keeps all notification sections for an Admin Preschool user', async () => {
    testUser.role_code = 'adminpreschool'

    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('My Notifications')
    expect(wrapper.text()).toContain('Tasks')
    expect(wrapper.text()).toContain('Alerts')
    expect(wrapper.text()).toContain('Approvals')
    expect(loadUnifiedTasks).toHaveBeenCalled()
    expect(loadUnifiedAlerts).toHaveBeenCalled()
    expect(loadUnifiedApprovals).toHaveBeenCalled()
  })

  it('switches tabs and exposes task and approval actions', async () => {
    const wrapper = await mountPage()
    const tabButtons = wrapper.findAll('button').filter((button) => ['My Notifications', 'Tasks', 'Alerts', 'Approvals'].some((label) => button.text().includes(label)))

    await wrapper.find('.inbox-card__mark-all').trigger('click')
    await flushPromises()
    expect(markAllUnifiedNotificationsRead).toHaveBeenCalled()

    await wrapper.find('.inbox-card__read').trigger('click')
    await flushPromises()
    expect(markUnifiedNotificationRead).toHaveBeenCalledWith('global-1')

    await wrapper.find('.inbox-card__dismiss').trigger('click')
    await flushPromises()
    expect(dismissUnifiedNotification).toHaveBeenCalledWith('global-1')

    await tabButtons.find((button) => button.text().includes('Tasks')).trigger('click')
    await flushPromises()
    expect(wrapper.vm.$router.currentRoute.value.query.tab).toBe('tasks')
    expect(wrapper.text()).toContain('Follow up')

    await findButton(wrapper, 'Complete task').trigger('click')
    await flushPromises()
    expect(completeUnifiedTask).toHaveBeenCalledWith('task-1')

    await tabButtons.find((button) => button.text().includes('Alerts')).trigger('click')
    await flushPromises()
    expect(wrapper.vm.$router.currentRoute.value.query.tab).toBe('alerts')
    expect(wrapper.text()).toContain('Health alert')

    await findButton(wrapper, 'Mark as read').trigger('click')
    await flushPromises()
    expect(markUnifiedAlertRead).toHaveBeenCalledWith('alert-1')

    await findButton(wrapper, 'Archive').trigger('click')
    await flushPromises()
    expect(archiveUnifiedAlert).toHaveBeenCalledWith('alert-1')

    await tabButtons.find((button) => button.text().includes('Approvals')).trigger('click')
    await flushPromises()
    expect(wrapper.vm.$router.currentRoute.value.query.tab).toBe('approvals')
    expect(wrapper.text()).toContain('Approve intake')

    await findActionButton(wrapper, 'Open workflow').trigger('click')
    await flushPromises()
    expect(wrapper.vm.$router.currentRoute.value.name).toBe('dashboard-preschool-admin-workflow-details')
    expect(wrapper.vm.$router.currentRoute.value.params.id).toBe('wf-1')
  })
})
