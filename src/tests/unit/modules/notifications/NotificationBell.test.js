import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import NotificationBell from '@/modules/notifications/components/NotificationBell.vue'

const loadUnreadCount = vi.fn()

function createRoute(name, path, component = { template: '<div />' }) {
  return { name, path, component }
}

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
      routes: [
        createRoute('dashboard-notifications', '/module/notifications'),
      ],
      global: {
        stubs: {
          Button: { template: '<button><slot name="icon" /></button>' },
          Badge: { props: ['value'], template: '<span class="badge">{{ value }}</span>' },
          Popover: { template: '<div><slot /></div>', methods: { hide() {}, toggle() {} } },
          NotificationDropdown: { template: '<div />' },
          NotificationTypeIcon: { template: '<span />' },
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('4')
    expect(loadUnreadCount).toHaveBeenCalled()
  })

  it('routes the view-all action to the unified notifications page', async () => {
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
      routes: [
        createRoute('dashboard-notifications', '/module/notifications'),
      ],
      global: {
        stubs: {
          Button: { template: '<button><slot name="icon" /></button>' },
          Badge: { props: ['value'], template: '<span class="badge">{{ value }}</span>' },
          Popover: { template: '<div><slot /></div>', methods: { hide() {}, toggle() {} } },
          NotificationDropdown: { template: '<button class="view-all" @click="$emit(\'view-all\')">View all</button>' },
          NotificationTypeIcon: { template: '<span />' },
        },
      },
    })

    await flushPromises()

    await wrapper.find('.view-all').trigger('click')
    await flushPromises()

    expect(wrapper.vm.$router.currentRoute.value.name).toBe('dashboard-notifications')
    expect(wrapper.vm.$router.currentRoute.value.query.tab).toBe('notifications')
  })
})
