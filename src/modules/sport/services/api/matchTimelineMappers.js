import { unwrapApiData } from '@/services/api'
import { buildFormData, compareMatchEvents, normalizeEventRow } from './sportApiUtils'

function normalizeTimelineEventRow(row = {}, homeTeamId = null, awayTeamId = null) {
  const event = normalizeEventRow(row, homeTeamId, awayTeamId)
  const assistPlayer = row.assistPlayer || {}
  const playerIn = row.playerIn || {}
  const playerOut = row.playerOut || {}

  return {
    ...event,
    assistPlayerId: row.assistPlayerId ?? row.assist_player_id ?? '',
    assistPlayerName: row.assistPlayerName ?? row.assist_player_name ?? (assistPlayer.name || ''),
    playerInId: row.playerInId ?? row.player_in_id ?? '',
    playerInName: row.playerInName ?? row.player_in_name ?? (playerIn.name || ''),
    playerOutId: row.playerOutId ?? row.player_out_id ?? '',
    playerOutName: row.playerOutName ?? row.player_out_name ?? (playerOut.name || ''),
    description: row.description ?? row.notes ?? event.metadata?.description ?? '',
    notes: row.notes ?? row.description ?? event.metadata?.notes ?? '',
  }
}

export function normalizeMatchTimelineEvent(row = {}, homeTeamId = null, awayTeamId = null) {
  return normalizeTimelineEventRow(row, homeTeamId, awayTeamId)
}

export function normalizeMatchTimelineResponse(response, homeTeamId = null, awayTeamId = null) {
  const payload = unwrapApiData(response) || {}
  const items = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.events)
      ? payload.events
      : []

  const normalizedItems = items.map((event) => normalizeTimelineEventRow(event, homeTeamId, awayTeamId)).sort(compareMatchEvents)

  return {
    items: normalizedItems,
    pagination: payload.pagination || {
      page: 1,
      perPage: normalizedItems.length || 10,
      total: normalizedItems.length,
      totalPages: normalizedItems.length ? 1 : 1,
    },
    match: payload.match || null,
    raw: payload,
  }
}

export function buildMatchTimelineEventPayload(payload = {}) {
  return buildFormData({
    team_id: payload.teamId || payload.team_id,
    squad_id: payload.squadId || payload.squad_id,
    squad_player_id: payload.squadPlayerId || payload.squad_player_id,
    related_squad_player_id: payload.relatedSquadPlayerId || payload.related_squad_player_id,
    player_id: payload.playerId || payload.player_id,
    assist_player_id: payload.assistPlayerId || payload.assist_player_id,
    player_in_id: payload.playerInId || payload.player_in_id,
    player_out_id: payload.playerOutId || payload.player_out_id,
    player_name: payload.playerName || payload.player_name,
    event_type: payload.eventType || payload.event_type,
    minute: payload.minute,
    extra_time_minute: payload.extraTimeMinute || payload.extra_time_minute,
    stoppage_minute: payload.stoppageMinute || payload.stoppage_minute,
    period: payload.period,
    side: payload.side,
    player_name_snapshot: payload.playerNameSnapshot || payload.player_name_snapshot,
    jersey_number_snapshot: payload.jerseyNumberSnapshot || payload.jersey_number_snapshot,
    position_snapshot: payload.positionSnapshot || payload.position_snapshot,
    description: payload.description || payload.notes,
    notes: payload.notes,
    metadata: payload.metadata,
  })
}