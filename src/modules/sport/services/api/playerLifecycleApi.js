import http from '@/services/http'
import { buildFormData, resolveId } from './sportApiUtils'
import { normalizePlayerHistoryResponse } from './playerLifecycleMappers'

export async function updatePlayerLifecycleStatus(playerId, payload = {}, options = {}) {
  const id = resolveId(playerId)
  if (!id) throw new Error('Player id is required.')

  const response = await http.patch(
    `/sport/players/${encodeURIComponent(id)}/status`,
    buildFormData(payload, options),
  )

  return normalizePlayerHistoryResponse(response)
}

export async function updatePlayerInjury(playerId, payload = {}, options = {}) {
  const id = resolveId(playerId)
  if (!id) throw new Error('Player id is required.')

  const response = await http.patch(
    `/sport/players/${encodeURIComponent(id)}/injury`,
    buildFormData(payload, options),
  )

  return normalizePlayerHistoryResponse(response)
}

export async function updatePlayerSuspension(playerId, payload = {}, options = {}) {
  const id = resolveId(playerId)
  if (!id) throw new Error('Player id is required.')

  const response = await http.patch(
    `/sport/players/${encodeURIComponent(id)}/suspension`,
    buildFormData(payload, options),
  )

  return normalizePlayerHistoryResponse(response)
}

export async function releasePlayer(playerId, payload = {}, options = {}) {
  const id = resolveId(playerId)
  if (!id) throw new Error('Player id is required.')

  const response = await http.patch(
    `/sport/players/${encodeURIComponent(id)}/release`,
    buildFormData(payload, options),
  )

  return normalizePlayerHistoryResponse(response)
}

export async function archivePlayer(playerId, payload = {}, options = {}) {
  const id = resolveId(playerId)
  if (!id) throw new Error('Player id is required.')

  const response = await http.patch(
    `/sport/players/${encodeURIComponent(id)}/archive`,
    buildFormData(payload, options),
  )

  return normalizePlayerHistoryResponse(response)
}

export async function fetchPlayerHistory(playerId, options = {}) {
  const id = resolveId(playerId)
  if (!id) return { player: null, memberships: [], raw: null }

  const response = await http.get(`/sport/players/${encodeURIComponent(id)}/history`, {
    signal: options.signal,
  })

  return normalizePlayerHistoryResponse(response)
}
