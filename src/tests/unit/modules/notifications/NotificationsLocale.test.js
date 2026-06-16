import { describe, expect, it } from 'vitest'
import enCommonNotifications from '@/i18n/en/common/notifications'
import khCommonNotifications from '@/i18n/kh/common/notifications'
import enNotifications from '@/i18n/en/notifications/notifications'
import khNotifications from '@/i18n/kh/notifications/notifications'

function assertStringValues(source, keys) {
  keys.forEach((key) => {
    expect(typeof source[key]).toBe('string')
    expect(source[key]).not.toContain('<')
  })
}

describe('notification locale parity', () => {
  it('keeps common notification keys aligned', () => {
    const keys = ['title', 'empty', 'emptyDescription', 'loading', 'error', 'errorDescription', 'retry', 'unreadCount', 'markRead', 'markAllRead', 'viewAll', 'dismiss', 'undismiss', 'clearAll', 'filters']

    assertStringValues(enCommonNotifications, keys.filter((key) => typeof enCommonNotifications[key] === 'string'))
    assertStringValues(khCommonNotifications, keys.filter((key) => typeof khCommonNotifications[key] === 'string'))

    keys.forEach((key) => {
      expect(Object.prototype.hasOwnProperty.call(enCommonNotifications, key)).toBe(true)
      expect(Object.prototype.hasOwnProperty.call(khCommonNotifications, key)).toBe(true)
    })
  })

  it('keeps notifications page keys aligned', () => {
    const keys = ['title', 'subtitle', 'inbox', 'inboxSubtitle', 'empty', 'emptyDescription', 'loading', 'error', 'errorDescription', 'retry', 'markAllRead', 'viewAll', 'unread', 'read', 'dismissed', 'dismiss', 'undismiss', 'searchPlaceholder', 'unreadCount', 'filters', 'fields', 'types', 'modules', 'targets']

    keys.forEach((key) => {
      expect(Object.prototype.hasOwnProperty.call(enNotifications, key)).toBe(true)
      expect(Object.prototype.hasOwnProperty.call(khNotifications, key)).toBe(true)
    })
  })
})
