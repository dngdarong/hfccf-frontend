import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNotifications } from '@/modules/notifications/composables/useNotifications'
import {
  dismissNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  undismissNotification,
} from '@/modules/notifications/services/notificationsApi'

vi.mock('@/modules/notifications/services/notificationsApi', () => ({
  fetchNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  dismissNotification: vi.fn(),
  undismissNotification: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useNotifications', () => {
  it('loads notifications with clamped pagination', async () => {
    fetchNotifications.mockResolvedValueOnce({
      items: [
        {
          id: 1,
          title: 'Player approved',
          message: 'A player was approved.',
          type: 'info',
          module: 'sport',
          created_at: '2026-05-19T12:00:00Z',
        },
      ],
      pagination: {
        current_page: 2,
        per_page: 100,
        total: 1,
        last_page: 1,
      },
    })

    const notifications = useNotifications()
    const result = await notifications.loadNotifications({ page: 2, perPage: 200, search: ' player ' })

    expect(fetchNotifications).toHaveBeenCalledWith(expect.objectContaining({
      page: 2,
      perPage: 100,
      search: ' player ',
    }), expect.any(Object))
    expect(notifications.items.value).toHaveLength(1)
    expect(result.pagination.perPage).toBe(100)
  })

  it('marks notifications as read and updates local state', async () => {
    fetchNotifications.mockResolvedValueOnce({
      items: [
        {
          id: 11,
          title: 'Match request',
          message: 'Ready for review.',
          read: false,
        },
      ],
      pagination: { current_page: 1, per_page: 10, total: 1, last_page: 1 },
    })
    markNotificationRead.mockResolvedValueOnce({ success: true })

    const notifications = useNotifications()
    await notifications.loadNotifications()
    await notifications.markAsRead(11)

    expect(markNotificationRead).toHaveBeenCalledWith(11)
    expect(notifications.items.value[0].read).toBe(true)
    expect(notifications.items.value[0].status).toBe('read')
  })

  it('marks all notifications as read', async () => {
    fetchNotifications.mockResolvedValueOnce({
      items: [
        { id: 21, title: 'One', message: 'First', read: false },
        { id: 22, title: 'Two', message: 'Second', read: false },
      ],
      pagination: { current_page: 1, per_page: 10, total: 2, last_page: 1 },
    })
    markAllNotificationsRead.mockResolvedValueOnce({ success: true })

    const notifications = useNotifications()
    await notifications.loadNotifications()
    await notifications.markAllAsRead()

    expect(markAllNotificationsRead).toHaveBeenCalled()
    expect(notifications.items.value.every((item) => item.read)).toBe(true)
  })

  it('dismisses and restores notifications', async () => {
    fetchNotifications.mockResolvedValueOnce({
      items: [
        { id: 31, title: 'Dismiss me', message: 'Soon gone', read: false },
      ],
      pagination: { current_page: 1, per_page: 10, total: 1, last_page: 1 },
    })
    dismissNotification.mockResolvedValueOnce({ success: true })
    undismissNotification.mockResolvedValueOnce({ success: true })
    fetchNotifications.mockResolvedValueOnce({
      items: [
        { id: 31, title: 'Dismiss me', message: 'Soon gone', read: false },
      ],
      pagination: { current_page: 1, per_page: 10, total: 1, last_page: 1 },
    })

    const notifications = useNotifications()
    await notifications.loadNotifications()
    await notifications.dismiss(31)
    await notifications.undismiss(31)

    expect(dismissNotification).toHaveBeenCalledWith(31)
    expect(undismissNotification).toHaveBeenCalledWith(31)
    expect(notifications.items.value).toHaveLength(1)
  })

  it('returns a safe fallback on API failure', async () => {
    fetchNotifications.mockRejectedValueOnce(new Error('Network down'))

    const notifications = useNotifications()
    const result = await notifications.loadNotifications()

    expect(result.items).toEqual([])
    expect(notifications.error.value).toContain('Network down')
  })
})
