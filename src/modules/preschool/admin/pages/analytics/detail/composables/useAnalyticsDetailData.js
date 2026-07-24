import { computed, ref } from 'vue'

function createEmptyBundle() {
  return {
    scope: '',
    summary: {},
    trends: {},
    breakdowns: {},
    charts: {},
    datasets: {},
    filters: {},
    generatedAt: '',
  }
}

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Unable to load analytics detail.'
}

export function useAnalyticsDetailData(fetcher) {
  const loading = ref(false)
  const errorMessage = ref('')
  const detail = ref(createEmptyBundle())
  const filterOptions = ref({})

  const hasDetailData = computed(() => Boolean(
    detail.value.generatedAt
    || Object.keys(detail.value.summary || {}).length
    || Object.keys(detail.value.trends || {}).length
    || Object.keys(detail.value.breakdowns || {}).length
    || Object.keys(detail.value.charts || {}).length
    || Object.keys(detail.value.datasets || {}).length
  ))

  async function loadDetail(filters = {}, options = {}) {
    loading.value = true
    errorMessage.value = ''

    try {
      const payload = await fetcher(filters, options)
      detail.value = payload || createEmptyBundle()
      filterOptions.value = payload?.filters || {}
    } catch (error) {
      errorMessage.value = getErrorMessage(error)
      detail.value = createEmptyBundle()
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    errorMessage,
    detail,
    filterOptions,
    hasDetailData,
    loadDetail,
  }
}
