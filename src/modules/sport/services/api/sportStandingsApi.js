import http from '@/services/http'
import { buildQueryParams, normalizeStandingListResponse, normalizeStandingRow, resolveId, unwrapApiData } from './sportApiUtils'

export async function fetchTournamentStandings(id, { page = 1, perPage = 50 } = {}, options = {}) {
  const tournamentId = resolveId(id)
  if (!tournamentId) {
    return { items: [], pagination: { page: 1, perPage: 50, total: 0, totalPages: 1 } }
  }

  const response = await http.get(`/sport/tournaments/${encodeURIComponent(tournamentId)}/standings`, {
    params: buildQueryParams({
      page,
      per_page: perPage,
    }),
    signal: options.signal,
  })

  return normalizeStandingListResponse(response, page, perPage)
}

export async function recalculateTournamentStandings(id) {
  const tournamentId = resolveId(id)
  if (!tournamentId) throw new Error('Tournament id is required.')

  const response = await http.post(`/sport/tournaments/${encodeURIComponent(tournamentId)}/recalculate-standings`)
  const data = unwrapApiData(response) || {}

  return {
    tournamentId: data.tournamentId ?? tournamentId,
    standings: Array.isArray(data.standings) ? data.standings.map(normalizeStandingRow) : [],
  }
}
