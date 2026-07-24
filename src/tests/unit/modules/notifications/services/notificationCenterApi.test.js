import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  loadUnifiedAlerts,
  loadUnifiedApprovals,
  loadUnifiedNotifications,
  loadUnifiedTasks,
  normalizeUnifiedItem,
} from '@/modules/notifications/services/notificationCenterApi'

const mockFetchNotifications = vi.fn()
const mockFetchUnreadCount = vi.fn()
const mockFetchPreschoolNotifications = vi.fn()
const mockFetchPreschoolNotificationSummary = vi.fn()
const mockFetchPreschoolAutomationTasks = vi.fn()
const mockFetchPreschoolAutomationTaskSummary = vi.fn()
const mockFetchPreschoolWorkflowApprovals = vi.fn()

vi.mock('@/modules/notifications/services/notificationsApi', () => ({
  dismissNotification: vi.fn(),
  fetchNotifications: (...args) => mockFetchNotifications(...args),
  fetchUnreadCount: (...args) => mockFetchUnreadCount(...args),
  markAllNotificationsAsRead: vi.fn(),
  markNotificationAsRead: vi.fn(),
  undismissNotification: vi.fn(),
}))

vi.mock('@/modules/preschool/services/api/preschoolNotificationApi', () => ({
  archivePreschoolNotification: vi.fn(),
  cancelPreschoolAutomationTask: vi.fn(),
  completePreschoolAutomationTask: vi.fn(),
  fetchPreschoolAutomationTaskSummary: (...args) => mockFetchPreschoolAutomationTaskSummary(...args),
  fetchPreschoolAutomationTasks: (...args) => mockFetchPreschoolAutomationTasks(...args),
  fetchPreschoolNotificationSummary: (...args) => mockFetchPreschoolNotificationSummary(...args),
  fetchPreschoolNotifications: (...args) => mockFetchPreschoolNotifications(...args),
  markPreschoolNotificationRead: vi.fn(),
}))

vi.mock('@/modules/preschool/services/api/preschoolWorkflowApi', () => ({
  approvePreschoolWorkflowApproval: vi.fn(),
  cancelPreschoolWorkflowApproval: vi.fn(),
  fetchPreschoolWorkflowApprovals: (...args) => mockFetchPreschoolWorkflowApprovals(...args),
  rejectPreschoolWorkflowApproval: vi.fn(),
  returnPreschoolWorkflowApproval: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('notificationCenterApi', () => {
  it('normalizes the core notification shape for display', () => {
    const item = normalizeUnifiedItem({
      id: 7,
      title: 'Follow up',
      message: 'Check the guardian',
      sourceType: 'attendance_alert',
      sourceId: 'alert-7',
      actionRouteName: 'dashboard-preschool-admin-students',
      actionRouteParams: { id: 7 },
    }, {
      module: 'preschool',
      itemType: 'alert',
      canAct: true,
    })

    expect(item).toMatchObject({
      id: 7,
      module: 'preschool',
      itemType: 'alert',
      title: 'Follow up',
      summary: 'Check the guardian',
      message: 'Check the guardian',
      sourceType: 'attendance_alert',
      sourceId: 'alert-7',
      actionRouteName: 'dashboard-preschool-admin-students',
      actionRouteParams: { id: 7 },
      canAct: true,
    })
  })

  it('loads and normalizes global notifications', async () => {
    mockFetchNotifications.mockResolvedValue({
      items: [
        {
          id: 'n-1',
          title: 'System notice',
          message: 'Message body',
          type: 'info',
          module: 'global',
          read: false,
          dismissed: false,
          createdAt: '2026-07-04T01:00:00Z',
        },
      ],
      pagination: { page: 1, perPage: 8, total: 1, lastPage: 1 },
    })
    mockFetchUnreadCount.mockResolvedValue({ count: 5 })

    const response = await loadUnifiedNotifications({ page: 1, perPage: 8 })

    expect(response.unreadCount).toBe(5)
    expect(response.items[0]).toMatchObject({
      itemType: 'notification',
      module: 'global',
      title: 'System notice',
      summary: 'Message body',
      message: 'Message body',
      status: 'unread',
    })
  })

  it('loads and normalizes Preschool alerts, tasks, and approvals', async () => {
    mockFetchPreschoolNotificationSummary.mockResolvedValue({
      total: 1,
      unread: 1,
      read: 0,
      archived: 0,
      critical: 1,
      byType: [],
      bySeverity: [],
    })
    mockFetchPreschoolNotifications.mockResolvedValue({
      items: [
        {
          id: 'a-1',
          title: 'Health alert',
          body: 'Check student temperature',
          severity: 'high',
          status: 'unread',
          sourceType: 'health_alert',
          createdAt: '2026-07-04T01:30:00Z',
        },
      ],
      summary: {},
      pagination: { currentPage: 1, lastPage: 1, perPage: 8, total: 1 },
    })
    mockFetchPreschoolAutomationTaskSummary.mockResolvedValue({
      total: 1,
      open: 1,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0,
      today: 1,
      byType: [],
      byPriority: [],
    })
    mockFetchPreschoolAutomationTasks.mockResolvedValue({
      items: [
        {
          id: 't-1',
          title: 'Follow up',
          description: 'Call guardian',
          priority: 'high',
          status: 'open',
          dueAt: '2026-07-04T08:00:00Z',
          sourceType: 'attendance_follow_up',
          createdAt: '2026-07-04T02:00:00Z',
        },
      ],
      summary: {},
      pagination: { currentPage: 1, lastPage: 1, perPage: 8, total: 1 },
    })
    mockFetchPreschoolWorkflowApprovals.mockResolvedValue({
      summary: {
        total: 1,
        pendingApprovals: 1,
        approved: 0,
        rejected: 0,
        returned: 0,
        cancelled: 0,
        overdue: 0,
      },
      items: [
        {
          id: 'p-1',
          title: 'Approve intake',
          decisionNotes: 'Review the form',
          status: 'pending',
          instance: {
            id: 'wf-1',
            priority: 'normal',
            sourceRouteName: 'dashboard-preschool-admin-workflow-details',
            sourceRouteParams: { id: 'wf-1' },
            sourceType: 'preschool_enrollment_application',
          },
        },
      ],
      pagination: { currentPage: 1, lastPage: 1, perPage: 8, total: 1 },
    })

    const [alerts, tasks, approvals] = await Promise.all([
      loadUnifiedAlerts({}),
      loadUnifiedTasks({}),
      loadUnifiedApprovals({}),
    ])

    expect(alerts.items[0]).toMatchObject({
      itemType: 'alert',
      module: 'preschool',
      title: 'Health alert',
      summary: 'Check student temperature',
      message: 'Check student temperature',
    })

    expect(tasks.items[0]).toMatchObject({
      itemType: 'task',
      module: 'preschool',
      title: 'Follow up',
      summary: 'Call guardian',
      priority: 'high',
    })

    expect(approvals.items[0]).toMatchObject({
      itemType: 'approval',
      module: 'preschool',
      title: 'Approve intake',
      summary: 'Review the form',
      actionRouteName: 'dashboard-preschool-admin-workflow-details',
      actionRouteParams: { id: 'wf-1' },
      canAct: true,
    })
  })
})
