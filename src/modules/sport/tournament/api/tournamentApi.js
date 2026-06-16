import http from '@/services/http'
import { buildQueryParams } from '@/services/api'
import {
  buildTournamentRequestPayload,
  normalizeTournamentDetailResponse,
  normalizeTournamentListResponse,
  normalizeTournamentMutationResponse,
} from './tournamentMappers'

export async function listTournaments(
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

export async function getTournament(id, options = {}) {
  const tournamentId = String(id ?? '').trim()
  if (!tournamentId) return null

  const response = await http.get(`/sport/tournaments/${encodeURIComponent(tournamentId)}`, {
    signal: options.signal,
  })

  return normalizeTournamentDetailResponse(response)
}

export async function createTournament(payload = {}) {
  const response = await http.post('/sport/tournaments', buildTournamentRequestPayload(payload))
  return normalizeTournamentMutationResponse(response, payload)
}

export async function updateTournament(id, payload = {}) {
  const tournamentId = String(id ?? '').trim()
  if (!tournamentId) throw new Error('Tournament id is required.')

  const response = await http.put(`/sport/tournaments/${encodeURIComponent(tournamentId)}`, buildTournamentRequestPayload(payload))
  return normalizeTournamentMutationResponse(response, payload)
}

export async function deleteTournament(id) {
  const tournamentId = String(id ?? '').trim()
  if (!tournamentId) return false

  await http.delete(`/sport/tournaments/${encodeURIComponent(tournamentId)}`)
  return true
}

export async function archiveTournament(id) {
  return deleteTournament(id)
}
