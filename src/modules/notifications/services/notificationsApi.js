import http from '@/services/http'
import { buildQueryParams, unwrapApiData } from '@/services/api'
import { normalizePerPage } from '@/modules/notifications/services/notificationMappers'

function normalizeListParams(params = {}) {
  const page = Number(params.page || 1) || 1
  const perPage = normalizePerPage(params.perPage ?? params.per_page, 10, 100)

  return buildQueryParams({
    page,
    per_page: perPage,
    status: params.status,
    type: params.type,
    module: params.module,
    search: params.search,
  })
}

function normalizeCreatePayload(payload = {}) {
  const metadata = payload.metadata

  return {
    type: String(payload.type || '').trim().toLowerCase(),
    title: String(payload.title || '').trim(),
    message: String(payload.message || '').trim(),
    module: String(payload.module || '').trim().toLowerCase(),
    action_url: String(payload.actionUrl || payload.action_url || '').trim() || null,
    metadata: metadata && typeof metadata === 'object' ? metadata : null,
    target_type: String(payload.targetType || payload.target_type || '').trim().toLowerCase(),
    target_value: String(payload.targetValue || payload.target_value || '').trim() || null,
  }
}

/**
 * Shared notification API client.
 *
 * The app already owns the Axios instance and auth token flow, so this service
 * only maps domain-specific requests to the backend endpoints.
 */
export async function fetchNotifications(params = {}, options = {}) {
  const response = await http.get('/notifications', {
    params: normalizeListParams(params),
    signal: options.signal,
  })

  return unwrapApiData(response)
}

/**
 * Load the current unread count for the navbar badge.
 */
export async function fetchUnreadCount() {
  const response = await http.get('/notifications/unread-count')

  return unwrapApiData(response)
}

/**
 * Keep the API naming explicit for UI composables that read like a user story.
 * The backend still exposes the same unread-count endpoint, so this alias is
 * only a frontend ergonomics layer.
 */
export async function fetchUnreadNotificationCount() {
  return fetchUnreadCount()
}

/**
 * Create a new notification.
 */
export async function createNotification(payload = {}) {
  const response = await http.post('/notifications', normalizeCreatePayload(payload))

  return unwrapApiData(response)
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(id) {
  const response = await http.patch(`/notifications/${id}/read`)

  return unwrapApiData(response)
}

export async function markNotificationRead(id) {
  return markNotificationAsRead(id)
}

/**
 * Mark every notification as read.
 */
export async function markAllNotificationsAsRead() {
  const response = await http.patch('/notifications/read-all')

  return unwrapApiData(response)
}

export async function markAllNotificationsRead() {
  return markAllNotificationsAsRead()
}

/**
 * Dismiss a notification from the user's list.
 */
export async function dismissNotification(id) {
  const response = await http.delete(`/notifications/${id}/dismiss`)

  return unwrapApiData(response)
}

/**
 * Restore a previously dismissed notification.
 */
export async function undismissNotification(id) {
  const response = await http.patch(`/notifications/${id}/undismiss`)

  return unwrapApiData(response)
}
