import http from '@/services/http'
import { resolveId } from './sportApiUtils'
import {
  buildMatchTimelineEventPayload,
  normalizeMatchTimelineEvent,
  normalizeMatchTimelineResponse,
} from './matchTimelineMappers'

export async function getMatchEvents(matchId, options = {}) {
  const id = resolveId(matchId)
  if (!id) {
    return {
      items: [],
      pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 },
      match: null,
      raw: null,
    }
  }

  const response = await http.get(`/sport/matches/${encodeURIComponent(id)}/events`, {
    signal: options.signal,
  })

  const payload = normalizeMatchTimelineResponse(response, options.homeTeamId, options.awayTeamId)
  return payload
}

export async function createMatchEvent(matchId, payload = {}, options = {}) {
  const id = resolveId(matchId)
  if (!id) throw new Error('Match id is required.')

  const response = await http.post(
    `/sport/matches/${encodeURIComponent(id)}/events`,
    buildMatchTimelineEventPayload(payload, options),
  )

  const data = response?.data?.data || response?.data || {}
  return normalizeMatchTimelineEvent(data.event || data, options.homeTeamId, options.awayTeamId)
}

export async function updateMatchEvent(eventId, payload = {}, options = {}) {
  const id = resolveId(eventId)
  if (!id) throw new Error('Event id is required.')

  const response = await http.patch(
    `/sport/match-events/${encodeURIComponent(id)}`,
    buildMatchTimelineEventPayload(payload, { ...options, method: 'PATCH' }),
  )

  const data = response?.data?.data || response?.data || {}
  return normalizeMatchTimelineEvent(data.event || data, options.homeTeamId, options.awayTeamId)
}

export async function deleteMatchEvent(eventId) {
  const id = resolveId(eventId)
  if (!id) return false

  await http.delete(`/sport/match-events/${encodeURIComponent(id)}`)
  return true
}