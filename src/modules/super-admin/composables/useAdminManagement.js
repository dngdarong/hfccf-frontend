import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { deleteAdminUser, listAdminUsers } from '@/modules/super-admin/services/adminUsersApi'
import {
  buildStatusBadges,
  buildSummaryCards,
} from '@/modules/super-admin/utils/adminManagement.helpers'

/**
 * Encapsulate the page state so the ManageAdmins view stays focused on layout only.
 */
export function useAdminManagement({ pageSize = 10 } = {}) {
  const { t } = useI18n()

  const admins = ref([])
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: pageSize,
    total: 0,
    from: null,
    to: null,
  })
  const summary = ref({
    total: 0,
    active: 0,
    pending: 0,
    alerts: 0,
    status_counts: {
      active: 0,
      pending: 0,
      inactive: 0,
      suspended: 0,
    },
  })

  const searchQuery = ref('')
  const roleFilter = ref('')
  const statusFilter = ref('')
  const currentPage = ref(1)
  const sortBy = ref('created_at')
  const sortDirection = ref('desc')
  const isLoading = ref(false)
  const isDeleteOpen = ref(false)
  const selectedUserId = ref('')
  const selectedUserName = ref('')
  const showSuccess = ref(false)
  const successMessage = ref('')
  const showError = ref(false)
  const errorMessage = ref('')

  const pageTitle = computed(() => t('users.manageAdmins.title'))
  const pageSubtitle = computed(() => t('users.manageAdmins.summary'))
  const searchPlaceholder = computed(() => t('users.manageAdmins.searchPlaceholder'))
  const addButtonLabel = computed(() => t('users.manageAdmins.addButton'))
  const toolbarNote = computed(() => t('users.manageAdmins.toolbarNote'))
  const refreshButtonLabel = computed(() => t('common.refresh'))
  const toolbarCountText = computed(() =>
    t('users.manageAdmins.accountsInView', {
      count: Number(summary.value.total ?? pagination.value.total ?? admins.value.length) || 0,
    }),
  )
  const tableEmptyText = computed(() => t('users.manageAdmins.tableEmpty'))
  const loadingLabel = computed(() => t('users.manageAdmins.loading'))

  const deleteConfirmTitle = computed(() => t('users.deleteConfirmTitle') || 'Delete user?')
  const deleteConfirmText = computed(() => t('users.deleteConfirmText') || 'Delete')
  const cancelLabel = computed(() => t('common.cancel') || 'Cancel')
  const deleteConfirmMessage = computed(() => {
    const name = selectedUserName.value || 'this admin'
    const translated = t('users.deleteConfirmMessage', { name })

    return translated !== 'users.deleteConfirmMessage'
      ? translated
      : `Are you sure you want to delete ${name}?`
  })

  const totalPages = computed(() => Math.max(Number(pagination.value.last_page) || 1, 1))
  const visibleRows = computed(() => {
    const start = Number(pagination.value.from) || ((Math.max(currentPage.value, 1) - 1) * pageSize + 1)

    return admins.value.map((user, index) => ({
      ...user,
      rowNumber: start + index,
    }))
  })

  const summaryCards = computed(() =>
    buildSummaryCards(
      t,
      visibleRows.value,
      toolbarNote.value,
      addButtonLabel.value,
      summary.value,
    ),
  )

  const statusBadges = computed(() =>
    buildStatusBadges(t, visibleRows.value, undefined, summary.value),
  )

  let searchDebounceId = null
  let activeController = null
  let requestSeq = 0
  const suppressPageWatcher = ref(false)
  const suppressReloadWatchers = ref(false)

  function clearSearchDebounce() {
    if (searchDebounceId) {
      clearTimeout(searchDebounceId)
      searchDebounceId = null
    }
  }

  function abortActiveRequest() {
    if (activeController) {
      activeController.abort()
      activeController = null
    }
  }

  function resetToFirstPage() {
    if (currentPage.value !== 1) {
      suppressPageWatcher.value = true
      currentPage.value = 1
    }
  }

  function isRequestCanceled(error) {
    return error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError'
  }

  function buildRequestParams() {
    return {
      page: currentPage.value,
      perPage: pageSize,
      search: searchQuery.value.trim(),
      role: roleFilter.value.trim(),
      status: statusFilter.value.trim(),
      sortBy: sortBy.value,
      sortDirection: sortDirection.value,
    }
  }

  async function performLoad() {
    clearSearchDebounce()
    abortActiveRequest()

    const controller = new AbortController()
    activeController = controller
    const requestId = ++requestSeq

    isLoading.value = true
    showError.value = false
    errorMessage.value = ''

    try {
      const response = await listAdminUsers(buildRequestParams(), { signal: controller.signal })

      if (requestId !== requestSeq) {
        return
      }

      admins.value = Array.isArray(response?.items) ? response.items : []
      pagination.value = {
        current_page: Number(response?.pagination?.current_page) || currentPage.value,
        last_page: Number(response?.pagination?.last_page) || 1,
        per_page: Number(response?.pagination?.per_page) || pageSize,
        total: Number(response?.pagination?.total) || 0,
        from: response?.pagination?.from ?? null,
        to: response?.pagination?.to ?? null,
      }

      summary.value = {
        total: Number(response?.summary?.total ?? response?.pagination?.total ?? 0) || 0,
        active: Number(response?.summary?.active ?? 0) || 0,
        pending: Number(response?.summary?.pending ?? 0) || 0,
        alerts: Number(response?.summary?.alerts ?? 0) || 0,
        status_counts: {
          active: Number(response?.summary?.status_counts?.active ?? 0) || 0,
          pending: Number(response?.summary?.status_counts?.pending ?? 0) || 0,
          inactive: Number(response?.summary?.status_counts?.inactive ?? 0) || 0,
          suspended: Number(response?.summary?.status_counts?.suspended ?? 0) || 0,
        },
      }

      const lastPage = Number(pagination.value.last_page) || 1
      if (lastPage > 0 && currentPage.value > lastPage) {
        suppressPageWatcher.value = true
        currentPage.value = lastPage
        await performLoad()
      }
    } catch (error) {
      if (isRequestCanceled(error) || requestId !== requestSeq) {
        return
      }

      errorMessage.value = error?.message || 'Unable to load user accounts right now.'
      showError.value = true
    } finally {
      if (requestId === requestSeq) {
        isLoading.value = false
        if (activeController === controller) {
          activeController = null
        }
      }
    }
  }

  function scheduleLoad(delay = 0) {
    clearSearchDebounce()
    abortActiveRequest()

    if (delay > 0) {
      searchDebounceId = setTimeout(() => {
        void performLoad()
      }, delay)
      return
    }

    void performLoad()
  }

  async function onConfirmDelete() {
    isLoading.value = true
    showError.value = false
    errorMessage.value = ''

    try {
      await deleteAdminUser(selectedUserId.value)
      successMessage.value = t('users.manageAdmins.removeSuccess')
      showSuccess.value = true
      await performLoad()
    } catch (error) {
      errorMessage.value = error?.message || 'Unable to delete user right now.'
      showError.value = true
    } finally {
      isLoading.value = false
    }

    isDeleteOpen.value = false
    selectedUserId.value = ''
    selectedUserName.value = ''
  }

  function onDeleteAdmin(admin) {
    selectedUserId.value = admin?.id || ''
    selectedUserName.value = admin?.name || ''
    isDeleteOpen.value = true
  }

  function onCancelDelete() {
    isDeleteOpen.value = false
    selectedUserId.value = ''
    selectedUserName.value = ''
  }

  function onClearFilters() {
    suppressReloadWatchers.value = true
    searchQuery.value = ''
    roleFilter.value = ''
    statusFilter.value = ''
    resetToFirstPage()
    void performLoad()
    setTimeout(() => {
      suppressReloadWatchers.value = false
    }, 0)
  }

  function onSort(event) {
    const nextField = String(event?.sortField || '').trim() || 'created_at'
    const nextDirection = Number(event?.sortOrder) >= 0 ? 'asc' : 'desc'

    sortBy.value = nextField
    sortDirection.value = nextDirection
    resetToFirstPage()
  }

  watch(currentPage, () => {
    if (suppressPageWatcher.value) {
      suppressPageWatcher.value = false
      return
    }

    scheduleLoad(0)
  })

  watch([roleFilter, statusFilter], () => {
    if (suppressReloadWatchers.value) return
    resetToFirstPage()
    scheduleLoad(0)
  })

  watch(() => [sortBy.value, sortDirection.value], () => {
    if (suppressReloadWatchers.value) return
    resetToFirstPage()
    scheduleLoad(0)
  })

  watch(searchQuery, () => {
    if (suppressReloadWatchers.value) return
    resetToFirstPage()
    scheduleLoad(300)
  })

  onMounted(() => {
    scheduleLoad(0)
  })

  onBeforeUnmount(() => {
    clearSearchDebounce()
    abortActiveRequest()
  })

  return {
    admins,
    searchQuery,
    roleFilter,
    statusFilter,
    currentPage,
    sortBy,
    sortDirection,
    isLoading,
    isDeleteOpen,
    selectedUserId,
    selectedUserName,
    showSuccess,
    successMessage,
    showError,
    errorMessage,
    pageTitle,
    pageSubtitle,
    searchPlaceholder,
    addButtonLabel,
    toolbarNote,
    refreshButtonLabel,
    toolbarCountText,
    tableEmptyText,
    loadingLabel,
    summaryCards,
    statusBadges,
    paginatedAdmins: visibleRows,
    totalPages,
    deleteConfirmTitle,
    deleteConfirmText,
    cancelLabel,
    deleteConfirmMessage,
    loadAdmins: performLoad,
    onConfirmDelete,
    onDeleteAdmin,
    onCancelDelete,
    onClearFilters,
    onSort,
  }
}
