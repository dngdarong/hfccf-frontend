import { unwrapApiData } from '@/services/api'
import {
  MATCH_ELIGIBILITY_STATUS,
  MATCH_SQUAD_PLAYER_ROLE,
  MATCH_SQUAD_STATUS,
  normalizeMatchEligibilityStatus,
  normalizeMatchSquadRole,
  normalizeMatchSquadStatus,
} from '@/modules/sport/constants/matchSquad'
import { normalizeMatchRow, normalizePlayerRow, normalizeTeamRow, normalizeText } from './sportApiUtils'

function normalizeMatchSquadPlayerRow(row = {}) {
  const player = row.player || {}

  return {
    id: row.id ?? '',
    squadId: row.squadId ?? row.squad_id ?? '',
    matchId: row.matchId ?? row.match_id ?? '',
    teamId: row.teamId ?? row.team_id ?? '',
    playerId: row.playerId ?? row.player_id ?? '',
    playerNameSnapshot: normalizeText(row.playerNameSnapshot || row.player_name_snapshot || player.name),
    jerseyNumberSnapshot: row.jerseyNumberSnapshot ?? row.jersey_number_snapshot ?? null,
    positionSnapshot: normalizeText(row.positionSnapshot || row.position_snapshot),
    role: normalizeMatchSquadRole(row.role || MATCH_SQUAD_PLAYER_ROLE.RESERVE),
    eligibilityStatus: normalizeMatchEligibilityStatus(row.eligibilityStatus || row.eligibility_status || MATCH_ELIGIBILITY_STATUS.ELIGIBLE),
    isEligible: Boolean(row.isEligible ?? row.is_eligible),
    reason: normalizeText(row.reason),
    selectedAt: row.selectedAt || row.selected_at || '',
    player: row.player ? normalizePlayerRow(row.player) : null,
    raw: row,
  }
}

function normalizeMatchSquadRow(row = {}) {
  const match = row.match || {}
  const team = row.team || {}
  const players = Array.isArray(row.players) ? row.players.map(normalizeMatchSquadPlayerRow) : []

  return {
    id: row.id ?? '',
    matchId: row.matchId ?? row.match_id ?? '',
    teamId: row.teamId ?? row.team_id ?? '',
    selectedByUserId: row.selectedByUserId ?? row.selected_by_user_id ?? '',
    status: normalizeMatchSquadStatus(row.status || MATCH_SQUAD_STATUS.DRAFT),
    lockedAt: row.lockedAt || row.locked_at || '',
    submittedAt: row.submittedAt || row.submitted_at || '',
    approvedByUserId: row.approvedByUserId ?? row.approved_by_user_id ?? '',
    approvedAt: row.approvedAt || row.approved_at || '',
    notes: normalizeText(row.notes),
    match: row.match ? normalizeMatchRow(match) : null,
    team: row.team ? normalizeTeamRow(team) : null,
    selectedBy: row.selectedBy || null,
    approvedBy: row.approvedBy || null,
    players,
    playersCount: Number(row.playersCount ?? row.players_count ?? players.length),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

function normalizeEligibilityRow(row = {}) {
  const player = row.player || {}
  const team = row.team || {}
  const activeMembership = row.activeMembership || {}

  return {
    player: row.player ? normalizePlayerRow(player) : null,
    team: row.team ? normalizeTeamRow(team) : null,
    activeMembership: row.activeMembership
      ? {
          id: activeMembership.id ?? '',
          teamId: activeMembership.teamId ?? activeMembership.team_id ?? '',
          status: normalizeText(activeMembership.status),
          joinedAt: activeMembership.joinedAt || activeMembership.joined_at || '',
          leftAt: activeMembership.leftAt || activeMembership.left_at || '',
        }
      : null,
    eligibilityStatus: normalizeMatchEligibilityStatus(row.eligibilityStatus || row.eligibility_status || MATCH_ELIGIBILITY_STATUS.NOT_MEMBER),
    isEligible: Boolean(row.isEligible ?? row.is_eligible),
    reason: normalizeText(row.reason),
    raw: row,
  }
}

export function normalizeMatchSquadListResponse(response) {
  const payload = unwrapApiData(response) || {}
  const items = Array.isArray(payload.squads)
    ? payload.squads
    : Array.isArray(payload.items)
      ? payload.items
      : []

  return {
    items: items.map(normalizeMatchSquadRow),
    match: payload.match ? normalizeMatchRow(payload.match) : null,
    raw: payload,
  }
}

export function normalizeMatchSquadResponse(response) {
  const payload = unwrapApiData(response) || {}
  const squad = payload.squad ? normalizeMatchSquadRow(payload.squad) : normalizeMatchSquadRow(payload)

  return {
    squad,
    match: payload.match ? normalizeMatchRow(payload.match) : squad.match,
    team: payload.team ? normalizeTeamRow(payload.team) : squad.team,
    players: Array.isArray(payload.players)
      ? payload.players.map(normalizeEligibilityRow)
      : squad.players,
    raw: payload,
  }
}

export function normalizeMatchEligibilityResponse(response) {
  const payload = unwrapApiData(response) || {}
  const items = Array.isArray(payload.players)
    ? payload.players
    : Array.isArray(payload.items)
      ? payload.items
      : []

  return {
    match: payload.match ? normalizeMatchRow(payload.match) : null,
    team: payload.team ? normalizeTeamRow(payload.team) : null,
    items: items.map(normalizeEligibilityRow),
    raw: payload,
  }
}

export function buildMatchSquadPayload(payload = {}) {
  const players = Array.isArray(payload.players) ? payload.players : []

  return {
    notes: normalizeText(payload.notes),
    players: players
      .map((player) => {
        const playerId = player.playerId ?? player.player_id ?? player.id
        if (!playerId) {
          return null
        }

        return {
          player_id: playerId,
          role: normalizeMatchSquadRole(player.role || MATCH_SQUAD_PLAYER_ROLE.RESERVE),
        }
      })
      .filter(Boolean),
  }
}
