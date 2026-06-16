import http from '@/services/http'
import {
  buildPlayerPayload,
  buildQueryParams,
  normalizePerPage,
  normalizePlayerListResponse,
  normalizePlayerRow,
  resolveId,
  unwrapApiData,
} from './sportApiUtils'

export async function fetchSportPlayers(
  { page = 1, perPage = 10, search = '', status = '', teamId = '', division = '', sortBy = 'created_at', sortDirection = 'desc' } = {},
  options = {},
) {
  const normalizedPerPage = normalizePerPage(perPage)

  const response = await http.get('/sport/players', {
    params: buildQueryParams({
      page,
      per_page: normalizedPerPage,
      search,
      status,
      team_id: teamId,
      division,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }),
    signal: options.signal,
  })

  return normalizePlayerListResponse(response, page, normalizedPerPage)
}

export async function fetchSportPlayer(id, options = {}) {
  const playerId = resolveId(id)
  if (!playerId) return null

  const response = await http.get(`/sport/players/${encodeURIComponent(playerId)}`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizePlayerRow(payload.player || payload)
}

export async function createSportPlayer(payload = {}) {
  const response = await http.post('/sport/players', buildPlayerPayload(payload))
  const data = unwrapApiData(response) || {}
  return normalizePlayerRow(data.player || data)
}

export async function updateSportPlayer(id, payload = {}) {
  const playerId = resolveId(id)
  if (!playerId) throw new Error('Player id is required.')

  const response = await http.post(
    `/sport/players/${encodeURIComponent(playerId)}`,
    buildPlayerPayload(payload, { method: 'PUT' }),
  )

  const data = unwrapApiData(response) || {}
  return normalizePlayerRow(data.player || data)
}

export async function deleteSportPlayer(id) {
  const playerId = resolveId(id)
  if (!playerId) return false

  await http.delete(`/sport/players/${encodeURIComponent(playerId)}`)
  return true
}
