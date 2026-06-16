import http from '@/services/http'
import { buildFormData, resolveId } from './sportApiUtils'
import { normalizePlayerHistoryResponse, normalizeTeamRosterResponse } from './playerLifecycleMappers'

export async function fetchTeamRoster(teamId, options = {}) {
  const id = resolveId(teamId)
  if (!id) return { team: null, players: [], memberships: [], raw: null }

  const response = await http.get(`/sport/teams/${encodeURIComponent(id)}/roster`, {
    signal: options.signal,
  })

  return normalizeTeamRosterResponse(response)
}

export async function addTeamRosterPlayer(teamId, payload = {}, options = {}) {
  const id = resolveId(teamId)
  if (!id) throw new Error('Team id is required.')

  const response = await http.post(
    `/sport/teams/${encodeURIComponent(id)}/roster`,
    buildFormData(payload, options),
  )

  return normalizeTeamRosterResponse(response)
}

export async function updateRosterMembership(membershipId, payload = {}, options = {}) {
  const id = resolveId(membershipId)
  if (!id) throw new Error('Membership id is required.')

  const response = await http.patch(
    `/sport/roster/${encodeURIComponent(id)}`,
    buildFormData(payload, options),
  )

  return normalizeTeamRosterResponse(response)
}

export async function removeRosterMembership(membershipId) {
  const id = resolveId(membershipId)
  if (!id) throw new Error('Membership id is required.')

  await http.delete(`/sport/roster/${encodeURIComponent(id)}`)
  return true
}

export async function fetchPlayerHistory(playerId, options = {}) {
  const id = resolveId(playerId)
  if (!id) return { player: null, memberships: [], raw: null }

  const response = await http.get(`/sport/players/${encodeURIComponent(id)}/history`, {
    signal: options.signal,
  })

  return normalizePlayerHistoryResponse(response)
}
