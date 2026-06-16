import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUnreadNotifications } from '@/modules/notifications/composables/useUnreadNotifications'
import { fetchUnreadNotificationCount } from '@/modules/notifications/services/notificationsApi'

vi.mock('@/modules/notifications/services/notificationsApi', () => ({
  fetchUnreadNotificationCount: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useUnreadNotifications', () => {
  it('loads unread notification count', async () => {
    fetchUnreadNotificationCount.mockResolvedValueOnce({ count: 7 })

    const unread = useUnreadNotifications()
    const count = await unread.loadUnreadCount()

    expect(count).toBe(7)
    expect(unread.unreadCount.value).toBe(7)
    expect(fetchUnreadNotificationCount).toHaveBeenCalled()
  })

  it('keeps the current unread count on failure', async () => {
    fetchUnreadNotificationCount.mockRejectedValueOnce(new Error('Offline'))

    const unread = useUnreadNotifications()
    unread.unreadCount.value = 3
    const count = await unread.loadUnreadCount()

    expect(count).toBe(3)
    expect(unread.error.value).toContain('Offline')
  })
})
