import http from '@/services/http'
import {
  buildQueryParams,
  normalizeEventListResponse,
  normalizeEventRow,
  normalizeMatchListResponse,
  normalizeMatchRow,
  resolveId,
  buildEventPayload,
  buildMatchPayload,
  unwrapApiData,
} from './sportApiUtils'

export async function fetchSportMatches(
  { page = 1, perPage = 10, search = '', status = '', teamId = '', sortBy = 'scheduled_at', sortDirection = 'desc' } = {},
  options = {},
) {
  const response = await http.get('/sport/matches', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      status,
      team_id: teamId,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }),
    signal: options.signal,
  })

  return normalizeMatchListResponse(response, page, perPage)
}

export async function fetchSportMatch(id, options = {}) {
  const matchId = resolveId(id)
  if (!matchId) return null

  const response = await http.get(`/sport/matches/${encodeURIComponent(matchId)}`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizeMatchRow(payload.match || payload)
}

export async function createSportMatch(payload = {}) {
  const response = await http.post('/sport/matches', buildMatchPayload(payload))
  const data = unwrapApiData(response) || {}
  return normalizeMatchRow(data.match || data)
}

export async function updateSportMatch(id, payload = {}) {
  const matchId = resolveId(id)
  if (!matchId) throw new Error('Match id is required.')

  const response = await http.post(
    `/sport/matches/${encodeURIComponent(matchId)}`,
    buildMatchPayload(payload, { method: 'PUT' }),
  )

  const data = unwrapApiData(response) || {}
  return normalizeMatchRow(data.match || data)
}

export async function deleteSportMatch(id) {
  const matchId = resolveId(id)
  if (!matchId) return false

  await http.delete(`/sport/matches/${encodeURIComponent(matchId)}`)
  return true
}

export async function updateMatchStatus(id, payload = {}) {
  const matchId = resolveId(id)
  if (!matchId) throw new Error('Match id is required.')

  const response = await http.patch(`/sport/matches/${encodeURIComponent(matchId)}/status`, {
    status: payload.status,
    current_period: payload.currentPeriod || payload.current_period,
  })

  const data = unwrapApiData(response) || {}
  return normalizeMatchRow(data.match || data)
}

export async function fetchMatchEvents(matchId, options = {}) {
  const targetId = resolveId(matchId)
  if (!targetId) return { items: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 } }

  const response = await http.get(`/sport/matches/${encodeURIComponent(targetId)}/events`, {
    signal: options.signal,
  })
  const payload = unwrapApiData(response) || {}
  const match = payload.match || {}
  const homeTeamId = options.homeTeamId || match.homeTeamId || match.home_team_id
  const awayTeamId = options.awayTeamId || match.awayTeamId || match.away_team_id

  return normalizeEventListResponse(response, homeTeamId, awayTeamId)
}

export async function createMatchEvent(matchId, payload = {}) {
  const targetId = resolveId(matchId)
  if (!targetId) throw new Error('Match id is required.')

  const response = await http.post(
    `/sport/matches/${encodeURIComponent(targetId)}/events`,
    buildEventPayload(payload),
  )

  const data = unwrapApiData(response) || {}
  return normalizeEventRow(data.event || data)
}

export async function updateMatchEvent(id, payload = {}) {
  const eventId = resolveId(id)
  if (!eventId) throw new Error('Event id is required.')

  const response = await http.post(
    `/sport/events/${encodeURIComponent(eventId)}`,
    buildEventPayload(payload, { method: 'PUT' }),
  )

  const data = unwrapApiData(response) || {}
  return normalizeEventRow(data.event || data)
}

export async function deleteMatchEvent(id) {
  const eventId = resolveId(id)
  if (!eventId) return false

  await http.delete(`/sport/events/${encodeURIComponent(eventId)}`)
  return true
}
