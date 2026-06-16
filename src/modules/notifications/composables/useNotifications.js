import { computed, reactive, ref } from 'vue'
import {
  dismissNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  undismissNotification,
} from '@/modules/notifications/services/notificationsApi'
import {
  normalizeNotificationResponse,
  normalizePerPage,
} from '@/modules/notifications/services/notificationMappers'
import { toPositiveInteger } from '@/services/api'

const DEFAULT_PAGE = 1
const DEFAULT_PER_PAGE = 10
const MAX_PER_PAGE = 100

function buildQuery(filters, page, perPage) {
  const query = {
    page,
    perPage: normalizePerPage(perPage, DEFAULT_PER_PAGE, MAX_PER_PAGE),
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

  return query
}

function patchItem(itemsRef, id, updater) {
  const index = itemsRef.value.findIndex((item) => String(item.id) === String(id))

  if (index < 0) return null

  const current = itemsRef.value[index]
  const nextItem = typeof updater === 'function' ? updater(current) : { ...current, ...updater }

  itemsRef.value = [
    ...itemsRef.value.slice(0, index),
    nextItem,
    ...itemsRef.value.slice(index + 1),
  ]

  return nextItem
}

export function useNotifications(options = {}) {
  let activeLoadController = null
  const defaultPerPage = normalizePerPage(
    options.defaultPerPage ?? DEFAULT_PER_PAGE,
    DEFAULT_PER_PAGE,
    MAX_PER_PAGE,
  )

  const items = ref([])
  const loading = ref(false)
  const error = ref('')
  const pagination = reactive({
    page: DEFAULT_PAGE,
    perPage: defaultPerPage,
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
    pagination.perPage = normalizePerPage(nextPagination.perPage, pagination.perPage, MAX_PER_PAGE)
    pagination.total = toPositiveInteger(nextPagination.total, pagination.total)
    pagination.lastPage = toPositiveInteger(nextPagination.lastPage, pagination.lastPage)
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
    const nextPerPage = normalizePerPage(params.perPage, pagination.perPage, MAX_PER_PAGE)

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
      const response = await fetchNotifications(
        buildQuery(filters, nextPage, nextPerPage),
        {
          signal: controller?.signal,
        },
      )

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

  async function markAsRead(id) {
    if (!id) return null

    loading.value = true
    clearError()

    try {
      const response = await markNotificationRead(id)
      patchItem(items, id, (item) => ({
        ...item,
        read: true,
        read_at: item.read_at || new Date().toISOString(),
        status: 'read',
      }))

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
      const response = await markAllNotificationsRead()
      items.value = items.value.map((item) => ({
        ...item,
        read: true,
        read_at: item.read_at || new Date().toISOString(),
        status: 'read',
      }))

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
      const response = await dismissNotification(id)
      items.value = items.value.filter((item) => String(item.id) !== String(id))
      pagination.total = Math.max(pagination.total - 1, 0)

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
      const response = await undismissNotification(id)
      await loadNotifications({
        page: pagination.page,
        perPage: pagination.perPage,
      })

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
    loading.value = false
    clearError()
    setPagination({
      page: DEFAULT_PAGE,
      perPage: defaultPerPage,
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
    loading,
    error,
    pagination,
    filters,
    hasItems,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    dismiss,
    undismiss,
    resetState,
    setError,
    clearError,
  }
}
