import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  archivePreschoolNotification,
  assignPreschoolAutomationTask,
  cancelPreschoolAutomationTask,
  completePreschoolAutomationTask,
  fetchPreschoolAutomationTaskSummary,
  fetchPreschoolAutomationTasks,
  fetchPreschoolNotificationSummary,
  fetchPreschoolNotifications,
  markPreschoolNotificationRead,
  runPreschoolDailyAutomationChecks,
} from '@/modules/preschool/services/api/preschoolNotificationApi'

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

describe('preschool notification automation api', () => {
  it('normalizes notification lists and summary payloads', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        items: [
          {
            id: 1,
            notification_type: 'attendance.follow_up',
            title: 'Attendance follow-up required',
            body: 'Call the guardian',
            severity: 'high',
            status: 'unread',
            target_user_id: 'usr_1',
            target_role: 'adminpreschool',
            source_type: 'attendance_communication',
            source_id: 'comm-1',
            preschool_student_id: 7,
            preschool_class_id: 3,
            action_route: 'dashboard-preschool-admin-notifications',
            action_params: { studentId: 7 },
            created_at: '2026-07-02T08:00:00Z',
          },
        ],
        summary: {
          total: 1,
          unread: 1,
          read: 0,
          archived: 0,
          critical: 1,
          byType: [{ notification_type: 'attendance.follow_up', total: 1 }],
          bySeverity: [{ severity: 'high', total: 1 }],
        },
        pagination: { currentPage: 1, lastPage: 1, perPage: 20, total: 1 },
      }),
    )

    await expect(fetchPreschoolNotifications({ page: 1, perPage: 20, status: 'unread', studentId: 7 })).resolves.toMatchObject({
      items: [
        {
          id: 1,
          notificationType: 'attendance.follow_up',
          title: 'Attendance follow-up required',
          severity: 'high',
          status: 'unread',
          targetUserId: 'usr_1',
        },
      ],
      summary: {
        total: 1,
        unread: 1,
        critical: 1,
      },
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/notifications', expect.objectContaining({
      params: expect.objectContaining({
        page: 1,
        per_page: 20,
        status: 'unread',
        student_id: 7,
      }),
    }))

    http.get.mockResolvedValueOnce(
      stubResponse({
        total: 1,
        unread: 1,
        read: 0,
        archived: 0,
        critical: 1,
        byType: [{ notificationType: 'attendance.follow_up', total: 1 }],
        bySeverity: [{ severity: 'high', total: 1 }],
      }),
    )

    await expect(fetchPreschoolNotificationSummary({ status: 'unread' })).resolves.toMatchObject({
      unread: 1,
      critical: 1,
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/notifications/summary', {
      params: {
        status: 'unread',
      },
      signal: undefined,
    })
  })

  it('normalizes task lists and summary payloads', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        items: [
          {
            id: 2,
            task_type: 'attendance.follow_up',
            title: 'Follow up with guardian',
            description: 'Call the parent',
            priority: 'high',
            status: 'open',
            assigned_to_user_id: 'usr_2',
            assigned_role: 'adminpreschool',
            due_at: '2026-07-02T12:00:00Z',
            source_type: 'attendance_communication',
            source_id: 'comm-2',
            preschool_student_id: 7,
            preschool_class_id: 3,
            created_at: '2026-07-02T08:00:00Z',
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
          byType: [{ task_type: 'attendance.follow_up', total: 1 }],
          byPriority: [{ priority: 'high', total: 1 }],
        },
        pagination: { currentPage: 1, lastPage: 1, perPage: 20, total: 1 },
      }),
    )

    await expect(fetchPreschoolAutomationTasks({ page: 1, perPage: 20, priority: 'high' })).resolves.toMatchObject({
      items: [
        {
          id: 2,
          taskType: 'attendance.follow_up',
          title: 'Follow up with guardian',
          priority: 'high',
          status: 'open',
        },
      ],
      summary: {
        total: 1,
        open: 1,
        today: 1,
      },
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/automation-tasks', expect.objectContaining({
      params: expect.objectContaining({
        page: 1,
        per_page: 20,
        priority: 'high',
      }),
    }))

    http.get.mockResolvedValueOnce(
      stubResponse({
        total: 1,
        open: 1,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0,
        today: 1,
        byType: [{ taskType: 'attendance.follow_up', total: 1 }],
        byPriority: [{ priority: 'high', total: 1 }],
      }),
    )

    await expect(fetchPreschoolAutomationTaskSummary({})).resolves.toMatchObject({
      open: 1,
      today: 1,
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/automation-tasks/summary', {
      params: {},
      signal: undefined,
    })
  })

  it('calls the write endpoints for task and notification actions', async () => {
    http.patch.mockResolvedValue({ data: { success: true, data: {} } })
    http.post.mockResolvedValue({ data: { success: true, data: {} } })

    await markPreschoolNotificationRead(10)
    await archivePreschoolNotification(10)
    await completePreschoolAutomationTask(20)
    await cancelPreschoolAutomationTask(20)
    await assignPreschoolAutomationTask(20, { assignedToUserId: 'usr_20', assignedRole: 'teacher-preschool' })
    await runPreschoolDailyAutomationChecks()

    expect(http.patch).toHaveBeenCalledWith('/preschool/notifications/10/read')
    expect(http.patch).toHaveBeenCalledWith('/preschool/notifications/10/archive')
    expect(http.patch).toHaveBeenCalledWith('/preschool/automation-tasks/20/complete')
    expect(http.patch).toHaveBeenCalledWith('/preschool/automation-tasks/20/cancel')
    expect(http.patch).toHaveBeenCalledWith('/preschool/automation-tasks/20/assign', {
      assigned_to_user_id: 'usr_20',
      assigned_role: 'teacher-preschool',
    })
    expect(http.post).toHaveBeenCalledWith('/preschool/automation/run-daily-checks')
  })
})
