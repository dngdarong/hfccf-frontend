import { describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import NotificationDropdown from '@/modules/notifications/components/NotificationDropdown.vue'

function mountComponent(props = {}) {
  return mountWithPlugins(NotificationDropdown, {
    props,
    messages: {
      en: {
        common: {
          notifications: {
            title: 'Notifications',
            empty: 'No notifications',
            emptyDescription: 'You are all caught up.',
            loading: 'Loading notifications...',
            error: 'Unable to load notifications',
            retry: 'Retry',
            unreadCount: '{count} unread',
            markAllRead: 'Mark all as read',
            markRead: 'Mark as read',
            dismiss: 'Dismiss',
            undismiss: 'Undismiss',
            viewAll: 'View all',
          },
        },
      },
    },
    global: {
      stubs: {
        Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
        Divider: { template: '<hr />' },
        ScrollPanel: { template: '<div><slot /></div>' },
        Loading: { props: ['label'], template: '<div>{{ label }}</div>' },
        NotificationItem: { template: '<div class="notification-item-stub" />' },
        NotificationEmptyState: { props: ['title'], template: '<div class="empty-state">{{ title }}</div>' },
        NotificationErrorState: { props: ['title', 'description', 'retryLabel'], template: '<div class="error-state">{{ title }} {{ description }} <button @click="$emit(\'retry\')">{{ retryLabel }}</button></div>' },
      },
    },
  })
}

describe('NotificationDropdown', () => {
  it('renders an empty state when there are no notifications', async () => {
    const wrapper = mountComponent({
      notifications: [],
      loading: false,
      unreadCount: 0,
    })

    await flushPromises()

    expect(wrapper.text()).toContain('No notifications')
  })

  it('shows a retryable error state when loading fails', async () => {
    const wrapper = mountComponent({
      notifications: [],
      loading: false,
      unreadCount: 0,
      error: 'Backend unavailable',
    })

    await wrapper.find('.error-state button').trigger('click')

    expect(wrapper.emitted('retry')).toBeTruthy()
    expect(wrapper.text()).toContain('Backend unavailable')
  })
})
