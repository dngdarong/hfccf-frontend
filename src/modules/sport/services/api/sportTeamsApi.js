import http from '@/services/http'
import { buildQueryParams, normalizeTeamListResponse, normalizeTeamRow, resolveId, buildTeamPayload, unwrapApiData } from './sportApiUtils'

export async function fetchSportTeams(
  { page = 1, perPage = 10, search = '', status = '', division = '', coachUserId = '', sortBy = 'created_at', sortDirection = 'desc' } = {},
  options = {},
) {
  const response = await http.get('/sport/teams', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      status,
      division,
      coach_user_id: coachUserId,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }),
    signal: options.signal,
  })

  return normalizeTeamListResponse(response, page, perPage)
}

export async function fetchSportTeam(id, options = {}) {
  const teamId = resolveId(id)
  if (!teamId) return null

  const response = await http.get(`/sport/teams/${encodeURIComponent(teamId)}`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizeTeamRow(payload.team || payload)
}

export async function createSportTeam(payload = {}) {
  const response = await http.post('/sport/teams', buildTeamPayload(payload))
  const data = unwrapApiData(response) || {}
  return normalizeTeamRow(data.team || data)
}

export async function updateSportTeam(id, payload = {}) {
  const teamId = resolveId(id)
  if (!teamId) throw new Error('Team id is required.')

  const response = await http.post(`/sport/teams/${encodeURIComponent(teamId)}`, buildTeamPayload(payload, { method: 'PUT' }))
  const data = unwrapApiData(response) || {}
  return normalizeTeamRow(data.team || data)
}

export async function deleteSportTeam(id) {
  const teamId = resolveId(id)
  if (!teamId) return false

  await http.delete(`/sport/teams/${encodeURIComponent(teamId)}`)
  return true
}
