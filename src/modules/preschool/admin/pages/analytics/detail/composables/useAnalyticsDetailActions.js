import { useRouter } from 'vue-router'

export function useAnalyticsDetailActions(backRouteName = 'dashboard-preschool-admin-analytics') {
  const router = useRouter()

  function goBack(query = {}) {
    return router.push({ name: backRouteName, query })
  }

  return {
    goBack,
  }
}
