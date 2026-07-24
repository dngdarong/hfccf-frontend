import http from '@/services/http'
import {
  buildCoachMatchPayload,
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

export async function fetchCoachOpponentTeams(options = {}) {
  const response = await http.get('/sport/coach/opponent-teams', {
    params: buildQueryParams({
      search: options.search || '',
      division: options.division || '',
    }),
    signal: options.signal,
  })

  return normalizeTeamListResponse(response)
}

export async function fetchCoachRequests(options = {}) {
  const response = await http.get('/sport/coach/requests', {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  const playerRequests = Array.isArray(payload.playerRequests) ? payload.playerRequests : []
  const matchRequests = Array.isArray(payload.matchRequests) ? payload.matchRequests : []

  return {
    playerRequests: playerRequests.map(normalizePlayerRow),
    matchRequests: matchRequests.map(normalizeMatchRow),
    summary: payload.summary || {
      playerRequests: playerRequests.length,
      matchRequests: matchRequests.length,
      total: playerRequests.length + matchRequests.length,
    },
    raw: payload,
  }
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
  const response = await http.post('/sport/coach/matches', buildCoachMatchPayload(payload, options))
  const data = unwrapApiData(response) || {}
  return normalizeMatchRow(data.match || data)
}
