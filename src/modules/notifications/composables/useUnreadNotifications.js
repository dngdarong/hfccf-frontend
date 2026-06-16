import { ref } from 'vue'
import { fetchUnreadNotificationCount } from '@/modules/notifications/services/notificationsApi'
import { resolveUnreadNotificationCount } from '@/modules/notifications/services/notificationMappers'

const unreadCount = ref(0)
const loading = ref(false)
const error = ref('')

export function useUnreadNotifications() {
  function setError(message) {
    error.value = String(message || '')
  }

  function clearError() {
    error.value = ''
  }

  async function loadUnreadCount() {
    loading.value = true
    clearError()

    try {
      const response = await fetchUnreadNotificationCount()
      unreadCount.value = Math.max(resolveUnreadNotificationCount(response), 0)

      return unreadCount.value
    } catch (err) {
      setError(err?.message || 'Unable to load unread notifications right now.')
      return unreadCount.value
    } finally {
      loading.value = false
    }
  }

  return {
    unreadCount,
    loading,
    error,
    loadUnreadCount,
  }
}
