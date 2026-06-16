import { computed, reactive, ref } from 'vue'
import { toPositiveInteger } from '@/services/api'
import { fetchAuditLogs } from '@/modules/reports/services/auditLogApi'

const DEFAULT_PER_PAGE = 20
let activeLoadController = null

export function useAuditLogs() {
  const items = ref([])
  const loading = ref(false)
  const error = ref('')
  const pagination = reactive({
    page: 1,
    perPage: DEFAULT_PER_PAGE,
    total: 0,
    lastPage: 1,
  })
  const filters = reactive({
    domain: '',
    action: '',
    actorUserId: '',
    search: '',
    dateFrom: '',
    dateTo: '',
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

  async function loadAuditLogs(params = {}) {
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

    if (Object.prototype.hasOwnProperty.call(params, 'domain')) {
      filters.domain = String(params.domain || '')
    }

    if (Object.prototype.hasOwnProperty.call(params, 'action')) {
      filters.action = String(params.action || '')
    }

    if (Object.prototype.hasOwnProperty.call(params, 'actorUserId')) {
      filters.actorUserId = String(params.actorUserId || '')
    }

    if (Object.prototype.hasOwnProperty.call(params, 'search')) {
      filters.search = String(params.search || '')
    }

    if (Object.prototype.hasOwnProperty.call(params, 'dateFrom')) {
      filters.dateFrom = String(params.dateFrom || '')
    }

    if (Object.prototype.hasOwnProperty.call(params, 'dateTo')) {
      filters.dateTo = String(params.dateTo || '')
    }

    try {
      const response = await fetchAuditLogs({
        page: nextPage,
        perPage: nextPerPage,
        domain: filters.domain,
        action: filters.action,
        actorUserId: filters.actorUserId,
        search: filters.search,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
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

      items.value = response.items
      setPagination(response.pagination)

      return response
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

      setError(err?.message || 'Unable to load audit logs right now.')
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

  function resetFilters() {
    filters.domain = ''
    filters.action = ''
    filters.actorUserId = ''
    filters.search = ''
    filters.dateFrom = ''
    filters.dateTo = ''
  }

  function resetState() {
    items.value = []
    loading.value = false
    clearError()
    setPagination({
      page: 1,
      perPage: DEFAULT_PER_PAGE,
      total: 0,
      lastPage: 1,
    })
    resetFilters()
  }

  return {
    items,
    loading,
    error,
    pagination,
    filters,
    hasItems,
    loadAuditLogs,
    resetFilters,
    resetState,
  }
}