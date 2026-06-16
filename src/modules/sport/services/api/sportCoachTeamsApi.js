import http from '@/services/http'
import {
  buildFormData,
  buildQueryParams,
  normalizeMatchRow,
  normalizePlayerRow,
  normalizeTeamListResponse,
  normalizeTeamRow,
  resolveId,
  unwrapApiData,
} from './sportApiUtils'

export async function fetchCoachTeams(options = {}) {
  const response = await http.get('/sport/coach/teams', {
    params: buildQueryParams({
      search: options.search || '',
      status: options.status || '',
    }),
    signal: options.signal,
  })

  return normalizeTeamListResponse(response)
}

export async function fetchCoachTeam(teamId, options = {}) {
  const id = resolveId(teamId)
  if (!id) return null

  const response = await http.get(`/sport/coach/teams/${encodeURIComponent(id)}`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return {
    team: normalizeTeamRow(payload.team || payload),
    players: Array.isArray(payload.players) ? payload.players.map(normalizePlayerRow) : [],
  }
}

export async function createCoachPlayerRequest(teamId, payload = {}, options = {}) {
  const id = resolveId(teamId)
  if (!id) throw new Error('Team id is required.')

  const response = await http.post(
    `/sport/coach/teams/${encodeURIComponent(id)}/players`,
    buildFormData(payload, options),
  )

  const data = unwrapApiData(response) || {}
  return normalizePlayerRow(data.player || data)
}

export async function createCoachMatchRequest(payload = {}, options = {}) {
  const response = await http.post('/sport/coach/matches', buildFormData(payload, options))
  const data = unwrapApiData(response) || {}
  return normalizeMatchRow(data.match || data)
}
