import http from '@/services/http'
import { resolveId } from './sportApiUtils'
import {
  buildMatchSquadPayload,
  normalizeMatchSquadListResponse,
  normalizeMatchSquadResponse,
} from './matchSquadMappers'

export async function fetchMatchSquads(matchId, options = {}) {
  const targetMatchId = resolveId(matchId)
  if (!targetMatchId) {
    return { items: [], match: null, raw: null }
  }

  const response = await http.get(`/sport/matches/${encodeURIComponent(targetMatchId)}/squads`, {
    signal: options.signal,
  })

  return normalizeMatchSquadListResponse(response)
}

export async function fetchMatchTeamSquad(matchId, teamId, options = {}) {
  const targetMatchId = resolveId(matchId)
  const targetTeamId = resolveId(teamId)

  if (!targetMatchId || !targetTeamId) {
    return { squad: null, match: null, team: null, players: [], raw: null }
  }

  const response = await http.get(
    `/sport/matches/${encodeURIComponent(targetMatchId)}/teams/${encodeURIComponent(targetTeamId)}/squad`,
    {
      signal: options.signal,
    },
  )

  return normalizeMatchSquadResponse(response)
}

export async function saveMatchTeamSquad(matchId, teamId, payload = {}, options = {}) {
  const targetMatchId = resolveId(matchId)
  const targetTeamId = resolveId(teamId)

  if (!targetMatchId || !targetTeamId) {
    throw new Error('Match and team ids are required.')
  }

  const response = await http.post(
    `/sport/matches/${encodeURIComponent(targetMatchId)}/teams/${encodeURIComponent(targetTeamId)}/squad`,
    buildMatchSquadPayload(payload, options),
  )

  return normalizeMatchSquadResponse(response)
}

export async function updateMatchSquad(squadId, payload = {}, options = {}) {
  const targetSquadId = resolveId(squadId)

  if (!targetSquadId) {
    throw new Error('Squad id is required.')
  }

  const response = await http.patch(
    `/sport/match-squads/${encodeURIComponent(targetSquadId)}`,
    buildMatchSquadPayload(payload, options),
  )

  return normalizeMatchSquadResponse(response)
}

export async function submitMatchSquad(squadId) {
  const targetSquadId = resolveId(squadId)

  if (!targetSquadId) {
    throw new Error('Squad id is required.')
  }

  const response = await http.post(`/sport/match-squads/${encodeURIComponent(targetSquadId)}/submit`)
  return normalizeMatchSquadResponse(response)
}

export async function approveMatchSquad(squadId) {
  const targetSquadId = resolveId(squadId)

  if (!targetSquadId) {
    throw new Error('Squad id is required.')
  }

  const response = await http.post(`/sport/match-squads/${encodeURIComponent(targetSquadId)}/approve`)
  return normalizeMatchSquadResponse(response)
}

export async function lockMatchSquad(squadId) {
  const targetSquadId = resolveId(squadId)

  if (!targetSquadId) {
    throw new Error('Squad id is required.')
  }

  const response = await http.post(`/sport/match-squads/${encodeURIComponent(targetSquadId)}/lock`)
  return normalizeMatchSquadResponse(response)
}
