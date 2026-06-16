import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/modules/notifications/services/notificationsApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('notifications api', () => {
  it('clamps list pagination and queries the notifications endpoint', async () => {
    http.get.mockResolvedValueOnce({ data: { success: true, data: { items: [] } } })

    await fetchNotifications({ page: 3, perPage: 250, search: '  Sport  ' })

    expect(http.get).toHaveBeenCalledWith('/notifications', expect.objectContaining({
      params: expect.objectContaining({
        page: 3,
        per_page: 100,
        search: 'Sport',
      }),
    }))
  })

  it('calls the unread count endpoint', async () => {
    http.get.mockResolvedValueOnce({ data: { success: true, data: { count: 4 } } })

    await fetchUnreadNotificationCount()

    expect(http.get).toHaveBeenCalledWith('/notifications/unread-count')
  })

  it('marks a notification as read using the dedicated endpoint', async () => {
    http.patch.mockResolvedValueOnce({ data: { success: true } })

    await markNotificationRead(17)

    expect(http.patch).toHaveBeenCalledWith('/notifications/17/read')
  })

  it('marks all notifications as read using the bulk endpoint', async () => {
    http.patch.mockResolvedValueOnce({ data: { success: true } })

    await markAllNotificationsRead()

    expect(http.patch).toHaveBeenCalledWith('/notifications/read-all')
  })
})
