import { computed, ref, watch } from 'vue'
import {
  createSportTrainingSession,
  deleteSportTrainingSession,
  fetchSportTrainingSession,
  fetchSportTrainingSessions,
  updateSportTrainingSession,
} from '@/modules/sport/services/api/sportTrainingSessionsApi'
import { getApiErrorMessage } from '@/services/api'

const EMPTY_PAGINATION = { page: 1, perPage: 8, total: 0, totalPages: 1 }

export function useTrainingSessions({ readOnly = false, messages = {} } = {}) {
  const items = ref([])
  const pagination = ref({ ...EMPTY_PAGINATION })
  const loading = ref(false)
  const error = ref('')
  const validationErrors = ref({})
  const saving = ref(false)
  const deleting = ref(false)
  const initialized = ref(false)

  const currentPage = ref(1)
  const searchQuery = ref('')
  const intensityFilter = ref('')
  const statusFilter = ref('')
  const trainingTypeFilter = ref('')
  const teamFilter = ref('')

  const hasItems = computed(() => items.value.length > 0)

  const fallbackMessage = (key, fallback) => messages[key] || fallback

  function clearError() {
    error.value = ''
    validationErrors.value = {}
  }

  function requestParams(overrides = {}) {
    return {
      page: overrides.page ?? currentPage.value,
      perPage: overrides.perPage ?? pagination.value.perPage,
      search: overrides.search ?? searchQuery.value,
      intensity: overrides.intensity ?? intensityFilter.value,
      status: overrides.status ?? statusFilter.value,
      teamId: overrides.teamId ?? teamFilter.value,
      trainingType: overrides.trainingType ?? trainingTypeFilter.value,
    }
  }

  async function load(options = {}) {
    loading.value = true
    error.value = ''
    validationErrors.value = {}

    try {
      const response = await fetchSportTrainingSessions(requestParams(options), options)
      items.value = response.items || []
      pagination.value = response.pagination || { ...EMPTY_PAGINATION }
      currentPage.value = pagination.value.page
      initialized.value = true
      return response
    } catch (cause) {
      error.value = getApiErrorMessage(cause, fallbackMessage('load', 'Unable to load training sessions.'))
      items.value = []
      pagination.value = { ...EMPTY_PAGINATION }
      return { items: [], pagination: { ...EMPTY_PAGINATION } }
    } finally {
      loading.value = false
    }
  }

  async function loadDetail(id, options = {}) {
    try {
      return await fetchSportTrainingSession(id, options)
    } catch (cause) {
      error.value = getApiErrorMessage(cause, fallbackMessage('detail', 'Unable to load the training session.'))
      return null
    }
  }

  async function create(payload) {
    if (readOnly || saving.value) return null
    saving.value = true
    error.value = ''
    validationErrors.value = {}

    try {
      const created = await createSportTrainingSession(payload)
      await load({ page: currentPage.value })
      return created
    } catch (cause) {
      validationErrors.value = cause?.validationErrors || cause?.details?.data?.errors || cause?.details?.errors || {}
      error.value = getApiErrorMessage(cause, fallbackMessage('create', 'Unable to create the training session.'))
      return null
    } finally {
      saving.value = false
    }
  }

  async function update(id, payload) {
    if (readOnly || saving.value) return null
    saving.value = true
    error.value = ''
    validationErrors.value = {}

    try {
      const updated = await updateSportTrainingSession(id, payload)
      await load()
      return updated
    } catch (cause) {
      validationErrors.value = cause?.validationErrors || cause?.details?.data?.errors || cause?.details?.errors || {}
      error.value = getApiErrorMessage(cause, fallbackMessage('update', 'Unable to update the training session.'))
      return null
    } finally {
      saving.value = false
    }
  }

  async function remove(id) {
    if (readOnly || deleting.value) return false
    deleting.value = true
    error.value = ''
    validationErrors.value = {}

    try {
      await deleteSportTrainingSession(id)
      const nextPage = items.value.length === 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value
      await load({ page: nextPage })
      return true
    } catch (cause) {
      error.value = getApiErrorMessage(cause, fallbackMessage('delete', 'Unable to delete the training session.'))
      return false
    } finally {
      deleting.value = false
    }
  }

  watch(
    [searchQuery, intensityFilter, statusFilter, trainingTypeFilter, teamFilter],
    () => {
      if (!initialized.value) return
      currentPage.value = 1
      load({ page: 1 })
    },
  )

  watch(currentPage, (page, previousPage) => {
    if (!initialized.value || page === previousPage) return
    load({ page })
  })

  return {
    currentPage,
    clearError,
    deleting,
    error,
    validationErrors,
    hasItems,
    intensityFilter,
    items,
    load,
    loadDetail,
    loading,
    pagination,
    readOnly,
    saving,
    searchQuery,
    statusFilter,
    trainingTypeFilter,
    teamFilter,
    create,
    remove,
    update,
  }
}
