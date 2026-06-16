import http from '@/services/http'
import {
  buildQueryParams,
  normalizeStandingRow,
  normalizeTournamentListResponse,
  normalizeTournamentRow,
  resolveId,
  buildTournamentPayload,
  unwrapApiData,
} from './sportApiUtils'

export async function fetchSportTournaments(
  { page = 1, perPage = 10, search = '', status = '', type = '', sortBy = 'created_at', sortDirection = 'desc' } = {},
  options = {},
) {
  const response = await http.get('/sport/tournaments', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      status,
      type,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }),
    signal: options.signal,
  })

  return normalizeTournamentListResponse(response, page, perPage)
}

export async function fetchSportTournament(id, options = {}) {
  const tournamentId = resolveId(id)
  if (!tournamentId) return null

  const response = await http.get(`/sport/tournaments/${encodeURIComponent(tournamentId)}`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizeTournamentRow(payload.tournament || payload)
}

export async function createSportTournament(payload = {}) {
  const response = await http.post('/sport/tournaments', buildTournamentPayload(payload))
  const data = unwrapApiData(response) || {}
  return normalizeTournamentRow(data.tournament || data)
}

export async function updateSportTournament(id, payload = {}) {
  const tournamentId = resolveId(id)
  if (!tournamentId) throw new Error('Tournament id is required.')

  const response = await http.post(
    `/sport/tournaments/${encodeURIComponent(tournamentId)}`,
    buildTournamentPayload(payload, { method: 'PUT' }),
  )

  const data = unwrapApiData(response) || {}
  return normalizeTournamentRow(data.tournament || data)
}

export async function deleteSportTournament(id) {
  const tournamentId = resolveId(id)
  if (!tournamentId) return false

  await http.delete(`/sport/tournaments/${encodeURIComponent(tournamentId)}`)
  return true
}

export async function addTournamentTeam(id, teamId) {
  const tournamentId = resolveId(id)
  if (!tournamentId) throw new Error('Tournament id is required.')

  const response = await http.post(`/sport/tournaments/${encodeURIComponent(tournamentId)}/teams`, {
    team_id: teamId,
  })

  const data = unwrapApiData(response) || {}
  return {
    tournament: data.tournament ? normalizeTournamentRow(data.tournament) : null,
    standings: Array.isArray(data.standings) ? data.standings.map(normalizeStandingRow) : [],
  }
}

export async function removeTournamentTeam(id, teamId) {
  const tournamentId = resolveId(id)
  if (!tournamentId) throw new Error('Tournament id is required.')

  const response = await http.delete(
    `/sport/tournaments/${encodeURIComponent(tournamentId)}/teams/${encodeURIComponent(resolveId(teamId))}`,
  )
  const data = unwrapApiData(response) || {}
  return {
    tournament: data.tournament ? normalizeTournamentRow(data.tournament) : null,
    standings: Array.isArray(data.standings) ? data.standings.map(normalizeStandingRow) : [],
  }
}
