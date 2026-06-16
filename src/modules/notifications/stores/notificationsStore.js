import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { toPositiveInteger } from '@/services/api'
import {
  createNotification as createNotificationRequest,
  dismissNotification as dismissNotificationRequest,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsAsRead as markAllNotificationsAsReadRequest,
  markNotificationAsRead as markNotificationAsReadRequest,
  undismissNotification as undismissNotificationRequest,
} from '@/modules/notifications/services/notificationsApi'

const DEFAULT_PER_PAGE = 10
let activeLoadController = null

function normalizeNotificationItem(item = {}) {
  const status = String(item.status || '').trim().toLowerCase()
  const type = String(item.type || item.level || item.category || 'system')
    .trim()
    .toLowerCase()
  const moduleValue = String(item.module || item.domain || 'global').trim().toLowerCase()

  return {
    ...item,
    id: item.id ?? item.uuid ?? item.key ?? '',
    type,
    module: moduleValue,
    title: String(item.title || item.subject || '').trim(),
    message: String(item.message || item.body || item.content || '').trim(),
    actionUrl: String(item.action_url || item.actionUrl || '').trim(),
    read: Boolean(
      item.read ||
        item.is_read ||
        item.read_at ||
        item.readAt ||
        status === 'read',
    ),
    dismissed: Boolean(
      item.dismissed ||
        item.dismissed_at ||
        item.dismissedAt ||
        status === 'dismissed',
    ),
    createdAt:
      item.created_at ||
      item.createdAt ||
      item.sent_at ||
      item.timestamp ||
      item.created ||
      '',
    metadata: item.metadata || {},
  }
}

function getPayloadCollection(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.notifications)) return payload.notifications
  if (Array.isArray(payload.data)) return payload.data

  return []
}

function getPaginationMeta(payload, fallbackPage, fallbackPerPage, totalItems) {
  if (!payload || typeof payload !== 'object') {
    const total = totalItems

    return {
      page: fallbackPage,
      perPage: fallbackPerPage,
      total,
      lastPage: Math.max(Math.ceil(total / fallbackPerPage), 1),
    }
  }

  const meta = payload.meta || payload.pagination || payload
  const page = toPositiveInteger(meta.current_page || meta.page || payload.page, fallbackPage)
  const perPage = toPositiveInteger(
    meta.per_page || meta.perPage || payload.per_page || payload.perPage,
    fallbackPerPage,
  )
  const total = toPositiveInteger(meta.total || payload.total, totalItems)
  const lastPage = toPositiveInteger(
    meta.last_page ||
      meta.lastPage ||
      payload.last_page ||
      payload.lastPage,
    Math.max(Math.ceil(total / perPage), 1),
  )

  return {
    page,
    perPage,
    total,
    lastPage,
  }
}

function normalizeNotificationResponse(payload, fallbackPage, fallbackPerPage) {
  const items = getPayloadCollection(payload).map(normalizeNotificationItem)
  const pagination = getPaginationMeta(payload, fallbackPage, fallbackPerPage, items.length)

  return {
    items,
    pagination,
  }
}

function resolveUnreadCount(payload) {
  if (typeof payload === 'number') return payload
  if (typeof payload === 'string' && payload.trim()) return Number(payload)

  if (!payload || typeof payload !== 'object') return 0

  const candidate =
    payload.count ??
    payload.unreadCount ??
    payload.unread_count ??
    payload.total ??
    payload.data?.count ??
    payload.data?.unreadCount ??
    payload.data?.unread_count ??
    0

  return Number(candidate) || 0
}

/**
 * Central notification state used by the page and actions.
 */
export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref('')
  const pagination = reactive({
    page: 1,
    perPage: DEFAULT_PER_PAGE,
    total: 0,
    lastPage: 1,
  })
  const filters = reactive({
    status: 'all',
    type: '',
    module: '',
    search: '',
  })

  const hasItems = computed(() => items.value.length > 0)

  function setError(message) {
    error.value = String(message || '')
  }

  function clearError() {
    error.value = ''
  }

  function setPagination(nextPagination = {}) {
    pagination.page = toPositiveInteger(nextPagination.page, pagination.page)
    pagination.perPage = toPositiveInteger(nextPagination.perPage, pagination.perPage)
    pagination.total = toPositiveInteger(nextPagination.total, pagination.total)
    pagination.lastPage = toPositiveInteger(nextPagination.lastPage, pagination.lastPage)
  }

  function getNotificationIndex(id) {
    return items.value.findIndex((item) => String(item.id) === String(id))
  }

  function patchNotification(id, updater) {
    const index = getNotificationIndex(id)

    if (index < 0) return null

    const current = items.value[index]
    const nextItem = typeof updater === 'function' ? updater(current) : { ...current, ...updater }

    items.value = [
      ...items.value.slice(0, index),
      nextItem,
      ...items.value.slice(index + 1),
    ]

    return nextItem
  }

  function removeNotification(id) {
    items.value = items.value.filter((item) => String(item.id) !== String(id))
  }

  async function loadNotifications(params = {}) {
    if (activeLoadController) {
      activeLoadController.abort()
    }

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    activeLoadController = controller
    loading.value = true
    clearError()

    const nextPage = toPositiveInteger(params.page, pagination.page)
    const nextPerPage = toPositiveInteger(params.perPage, pagination.perPage)

    if (Object.prototype.hasOwnProperty.call(params, 'page')) {
      pagination.page = nextPage
    }

    if (Object.prototype.hasOwnProperty.call(params, 'perPage')) {
      pagination.perPage = nextPerPage
    }

    if (Object.prototype.hasOwnProperty.call(params, 'status')) {
      filters.status = String(params.status || 'all')
    }

    if (Object.prototype.hasOwnProperty.call(params, 'type')) {
      filters.type = String(params.type || '')
    }

    if (Object.prototype.hasOwnProperty.call(params, 'module')) {
      filters.module = String(params.module || '')
    }

    if (Object.prototype.hasOwnProperty.call(params, 'search')) {
      filters.search = String(params.search || '')
    }

    try {
      const query = {
        page: nextPage,
        perPage: nextPerPage,
      }

      if (filters.status && filters.status !== 'all') {
        query.status = filters.status
      }

      if (filters.type) {
        query.type = filters.type
      }

      if (filters.module) {
        query.module = filters.module
      }

      if (filters.search) {
        query.search = filters.search
      }

      const response = await fetchNotifications({
        ...query,
      }, {
        signal: controller?.signal,
      })

      if (controller && controller.signal.aborted) {
        return {
          items: items.value,
          pagination: {
            page: pagination.page,
            perPage: pagination.perPage,
            total: pagination.total,
            lastPage: pagination.lastPage,
          },
        }
      }

      const normalized = normalizeNotificationResponse(response, nextPage, nextPerPage)

      items.value = normalized.items
      setPagination(normalized.pagination)

      return normalized
    } catch (err) {
      if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') {
        return {
          items: items.value,
          pagination: {
            page: pagination.page,
            perPage: pagination.perPage,
            total: pagination.total,
            lastPage: pagination.lastPage,
          },
        }
      }

      setError(err?.message || 'Unable to load notifications right now.')
      return {
        items: [],
        pagination: {
          page: pagination.page,
          perPage: pagination.perPage,
          total: 0,
          lastPage: 1,
        },
      }
    } finally {
      if (activeLoadController === controller) {
        activeLoadController = null
      }
      loading.value = false
    }
  }

  async function loadUnreadCount() {
    try {
      const response = await fetchUnreadCount()
      unreadCount.value = Math.max(resolveUnreadCount(response), 0)

      return unreadCount.value
    } catch {
      return unreadCount.value
    }
  }

  async function createNotification(payload = {}) {
    loading.value = true
    clearError()

    try {
      return await createNotificationRequest(payload)
    } catch (err) {
      setError(err?.message || 'Unable to create notification right now.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id) {
    if (!id) return null

    loading.value = true
    clearError()

    try {
      const response = await markNotificationAsReadRequest(id)
      patchNotification(id, (item) => ({
        ...item,
        read: true,
        read_at: item.read_at || new Date().toISOString(),
        status: 'read',
      }))
      await loadUnreadCount()

      return response
    } catch (err) {
      setError(err?.message || 'Unable to mark the notification as read.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function markAllAsRead() {
    loading.value = true
    clearError()

    try {
      const response = await markAllNotificationsAsReadRequest()
      items.value = items.value.map((item) => ({
        ...item,
        read: true,
        read_at: item.read_at || new Date().toISOString(),
        status: 'read',
      }))
      unreadCount.value = 0
      await loadUnreadCount()

      return response
    } catch (err) {
      setError(err?.message || 'Unable to mark all notifications as read.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function dismiss(id) {
    if (!id) return null

    loading.value = true
    clearError()

    try {
      const target = items.value.find((item) => String(item.id) === String(id))
      const response = await dismissNotificationRequest(id)

      removeNotification(id)

      if (target && !target.read) {
        unreadCount.value = Math.max(unreadCount.value - 1, 0)
      }

      await loadUnreadCount()

      return response
    } catch (err) {
      setError(err?.message || 'Unable to dismiss the notification.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function undismiss(id) {
    if (!id) return null

    loading.value = true
    clearError()

    try {
      const response = await undismissNotificationRequest(id)

      await loadNotifications({
        page: pagination.page,
        perPage: pagination.perPage,
      })
      await loadUnreadCount()

      return response
    } catch (err) {
      setError(err?.message || 'Unable to restore the notification.')
      throw err
    } finally {
      loading.value = false
    }
  }

  function resetState() {
    items.value = []
    unreadCount.value = 0
    loading.value = false
    clearError()
    setPagination({
      page: 1,
      perPage: DEFAULT_PER_PAGE,
      total: 0,
      lastPage: 1,
    })

    filters.status = 'all'
    filters.type = ''
    filters.module = ''
    filters.search = ''
  }

  return {
    items,
    unreadCount,
    loading,
    error,
    pagination,
    filters,
    hasItems,
    loadNotifications,
    loadUnreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    dismiss,
    undismiss,
    resetState,
    patchNotification,
  }
})
