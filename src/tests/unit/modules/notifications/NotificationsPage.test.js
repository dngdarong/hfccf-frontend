import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import NotificationsPage from '@/modules/notifications/pages/NotificationsPage.vue'

const loadNotifications = vi.fn()
const markAllAsRead = vi.fn()
const markAsRead = vi.fn()
const dismiss = vi.fn()
const undismiss = vi.fn()
const loadUnreadCount = vi.fn()

vi.mock('@/modules/notifications/composables/useNotifications', () => ({
  useNotifications: () => ({
    items: ref([
      {
        id: 1,
        title: 'Player approved',
        message: 'The player was approved.',
        type: 'info',
        module: 'sport',
        read: false,
        dismissed: false,
      },
    ]),
    loading: ref(false),
    error: ref(''),
    pagination: reactive({ page: 1, perPage: 10, total: 1, lastPage: 1 }),
    filters: reactive({ status: 'all', type: '', module: '', search: '' }),
    loadNotifications,
    markAllAsRead,
    markAsRead,
    dismiss,
    undismiss,
  }),
}))

vi.mock('@/modules/notifications/composables/useUnreadNotifications', () => ({
  useUnreadNotifications: () => ({
    unreadCount: ref(0),
    loading: ref(false),
    error: ref(''),
    loadUnreadCount,
  }),
}))

vi.mock('@/services/auth', () => ({
  hasPermission: () => true,
}))

vi.mock('@/store/userStore', () => ({
  useUserStore: () => ({
    currentUser: { id: 1, role: 'superadmin' },
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NotificationsPage', () => {
  it('renders notification data and loads on mount', async () => {
    const wrapper = mountWithPlugins(NotificationsPage, {
      messages: {
        en: {
          notifications: {
            title: 'Notifications',
            subtitle: 'Review activity.',
            inbox: 'Inbox',
            inboxSubtitle: 'Latest activity.',
            empty: 'No notifications',
            emptyDescription: 'All caught up.',
            loading: 'Loading notifications...',
            markAllRead: 'Mark all as read',
            viewAll: 'View all',
            unread: 'Unread',
            read: 'Read',
            dismissed: 'Dismissed',
            dismiss: 'Dismiss',
            undismiss: 'Undismiss',
            searchPlaceholder: 'Search',
            unreadCount: '{count} unread',
            filters: { all: 'All' },
            types: { all: 'All types', info: 'Info', success: 'Success', warning: 'Warning', error: 'Error', system: 'System' },
            modules: { all: 'All modules', global: 'Global', english: 'English', preschool: 'Preschool', scholarship: 'Scholarship', sport: 'Sport' },
          },
          common: {
            error: 'Error',
            refresh: 'Refresh',
          },
        },
      },
      global: {
        stubs: {
          MainLayout: { template: '<div><slot /></div>' },
          HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
          SearchInputField: { template: '<input />' },
          Select: { template: '<select />' },
          Button: { template: '<button><slot /></button>' },
          NotificationFilterTabs: { template: '<div />' },
          NotificationInboxCard: {
            props: ['notifications'],
            template: '<div class="inbox-card">{{ notifications?.[0]?.title }}</div>',
          },
          Pagination: { template: '<div />' },
          Card: { template: '<div><slot name="title" /><slot name="content" /></div>' },
        },
      },
    })

    await flushPromises()

    expect(loadNotifications).toHaveBeenCalled()
    expect(loadUnreadCount).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Player approved')
  })
})
