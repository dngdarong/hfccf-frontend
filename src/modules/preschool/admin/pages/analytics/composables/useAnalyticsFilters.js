import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  createAnalyticsFilters,
  createAnalyticsQuery,
} from '../analyticsInteractionMap'

export function createDefaultAnalyticsFilters() {
  return createAnalyticsFilters()
}

export function useAnalyticsFilters(initialFilters = {}) {
  const route = useRoute()
  const router = useRouter()
  const filters = ref({
    ...createDefaultAnalyticsFilters(),
    ...createAnalyticsFilters(route.query),
    ...initialFilters,
  })

  const routeQuery = computed(() => createAnalyticsQuery(filters.value))

  watch(
    () => route.query,
    (query) => {
      filters.value = {
        ...createDefaultAnalyticsFilters(),
        ...createAnalyticsFilters(query),
      }
    },
    { deep: true },
  )

  function resetFilters() {
    filters.value = createDefaultAnalyticsFilters()
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
