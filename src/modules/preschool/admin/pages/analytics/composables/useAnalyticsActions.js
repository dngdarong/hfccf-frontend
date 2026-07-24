import { useRouter } from 'vue-router'

const REPORT_ROUTE_BY_KEY = {
  attendance: 'dashboard-preschool-admin-reports-attendance',
  sessions: 'dashboard-preschool-admin-reports',
  schedules: 'dashboard-preschool-admin-reports',
}

export function useAnalyticsActions() {
  const router = useRouter()

  function refreshAnalytics(callback) {
    return typeof callback === 'function' ? callback() : Promise.resolve()
  }

  function openReportDataset(datasetKey) {
    const routeName = REPORT_ROUTE_BY_KEY[datasetKey] || 'dashboard-preschool-admin-reports'

    return router.push({
      name: routeName,
      query: datasetKey ? { analyticsDataset: datasetKey } : undefined,
    })
  }

  return {
    openReportDataset,
    refreshAnalytics,
  }
}
