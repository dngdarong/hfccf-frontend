import http from '@/services/http'
import { normalizeDashboardPayload, unwrapApiData } from './sportApiUtils'

export async function fetchSportDashboard(options = {}) {
  const response = await http.get('/sport/dashboard', {
    signal: options.signal,
  })

  return normalizeDashboardPayload(response)
}

export async function fetchCoachDashboard(options = {}) {
  const response = await http.get('/sport/coach/dashboard', {
    signal: options.signal,
  })

  return unwrapApiData(response) || {}
}
