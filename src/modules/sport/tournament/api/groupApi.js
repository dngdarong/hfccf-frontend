import http from '@/services/http'
import {
  buildTournamentGroupsDrawPayload,
  normalizeTournamentGroupsResponse,
} from './groupMappers'

export async function getTournamentGroups(tournamentId, options = {}) {
  const id = String(tournamentId ?? '').trim()
  if (!id) return normalizeTournamentGroupsResponse({}, options.fallbackTournament || null)

  const response = await http.get(`/sport/tournaments/${encodeURIComponent(id)}/groups`, {
    signal: options.signal,
  })

  return normalizeTournamentGroupsResponse(response, options.fallbackTournament || null)
}

export async function drawTournamentGroups(tournamentId, payload = {}, options = {}) {
  const id = String(tournamentId ?? '').trim()
  if (!id) return normalizeTournamentGroupsResponse({}, options.fallbackTournament || null)

  const response = await http.post(
    `/sport/tournaments/${encodeURIComponent(id)}/groups/draw`,
    buildTournamentGroupsDrawPayload(payload),
    {
      signal: options.signal,
    },
  )

  return normalizeTournamentGroupsResponse(response, options.fallbackTournament || null)
}

export async function finalizeTournamentGroups(tournamentId, options = {}) {
  const id = String(tournamentId ?? '').trim()
  if (!id) return normalizeTournamentGroupsResponse({}, options.fallbackTournament || null)

  const response = await http.post(
    `/sport/tournaments/${encodeURIComponent(id)}/groups/finalize`,
    {},
    {
      signal: options.signal,
    },
  )

  return normalizeTournamentGroupsResponse(response, options.fallbackTournament || null)
}
