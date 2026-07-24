import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  createAnalyticsFilters,
  createAnalyticsQuery,
} from '../../analyticsInteractionMap'

export function createDefaultAnalyticsDetailFilters(query = {}) {
  return createAnalyticsFilters(query)
}

export function useAnalyticsDetailFilters() {
  const route = useRoute()
  const router = useRouter()
  const filters = ref(createDefaultAnalyticsDetailFilters(route.query))
  const routeQuery = computed(() => createAnalyticsQuery(filters.value))

  watch(
    () => route.query,
    (query) => {
      filters.value = createDefaultAnalyticsDetailFilters(query)
    },
    { deep: true },
  )

  function resetFilters() {
    filters.value = createDefaultAnalyticsDetailFilters()
  }

  function updateFilters(nextFilters = {}) {
    filters.value = {
      ...filters.value,
      ...nextFilters,
    }
  }

  function syncRoute(nextFilters = filters.value) {
    return router.replace({ query: createAnalyticsQuery(nextFilters) })
  }

  return {
    filters,
    resetFilters,
    updateFilters,
    routeQuery,
    syncRoute,
  }
}
