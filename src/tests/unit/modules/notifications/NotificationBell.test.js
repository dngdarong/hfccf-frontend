import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import NotificationBell from '@/modules/notifications/components/NotificationBell.vue'

const loadUnreadCount = vi.fn()

vi.mock('@/modules/notifications/composables/useUnreadNotifications', () => ({
  useUnreadNotifications: () => ({
    unreadCount: ref(4),
    loading: ref(false),
    error: ref(''),
    loadUnreadCount,
  }),
}))

vi.mock('@/modules/notifications/composables/useNotifications', () => ({
  useNotifications: () => ({
    items: ref([]),
    loading: ref(false),
    error: ref(''),
    loadNotifications: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    dismiss: vi.fn(),
    undismiss: vi.fn(),
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NotificationBell', () => {
  it('shows the unread badge and loads the unread count on mount', async () => {
    const wrapper = mountWithPlugins(NotificationBell, {
      messages: {
        en: {
          common: {
            notifications: {
              title: 'Notifications',
            },
          },
        },
      },
      global: {
        stubs: {
          Button: { template: '<button><slot name="icon" /></button>' },
          Badge: { props: ['value'], template: '<span class="badge">{{ value }}</span>' },
          Popover: { template: '<div><slot /></div>' },
          NotificationDropdown: { template: '<div />' },
          NotificationTypeIcon: { template: '<span />' },
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('4')
    expect(loadUnreadCount).toHaveBeenCalled()
  })
})
