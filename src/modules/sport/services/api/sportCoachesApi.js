import http from '@/services/http'
import { buildQueryParams, normalizeCoachListResponse, normalizeCoachRow, resolveId, buildCoachPayload, unwrapApiData } from './sportApiUtils'

export async function fetchSportCoaches(
  { page = 1, perPage = 10, search = '', status = '', sortBy = 'created_at', sortDirection = 'desc' } = {},
  options = {},
) {
  const response = await http.get('/sport/coaches', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      status,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }),
    signal: options.signal,
  })

  return normalizeCoachListResponse(response, page, perPage)
}

export async function fetchSportCoach(id, options = {}) {
  const coachId = resolveId(id)
  if (!coachId) return null

  const response = await http.get(`/sport/coaches/${encodeURIComponent(coachId)}`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizeCoachRow(payload.coach || payload.user || payload)
}

export async function createSportCoach(payload = {}) {
  const response = await http.post('/sport/coaches', buildCoachPayload(payload))
  const data = unwrapApiData(response) || {}
  return normalizeCoachRow(data.coach || data.user || data)
}

export async function updateSportCoach(id, payload = {}) {
  const coachId = resolveId(id)
  if (!coachId) throw new Error('Coach id is required.')

  const response = await http.post(
    `/sport/coaches/${encodeURIComponent(coachId)}`,
    buildCoachPayload(payload, { method: 'PUT' }),
  )

  const data = unwrapApiData(response) || {}
  return normalizeCoachRow(data.coach || data.user || data)
}

export async function deleteSportCoach(id) {
  const coachId = resolveId(id)
  if (!coachId) return false

  await http.delete(`/sport/coaches/${encodeURIComponent(coachId)}`)
  return true
}
