import { unwrapApiData } from '@/services/api'
import { normalizeMembershipRow, normalizePlayerRow, normalizeTeamRow } from './sportApiUtils'

export function normalizeTeamRosterResponse(response) {
  const payload = unwrapApiData(response) || {}

  return {
    team: payload.team ? normalizeTeamRow(payload.team) : null,
    players: Array.isArray(payload.players) ? payload.players.map(normalizePlayerRow) : [],
    memberships: Array.isArray(payload.memberships) ? payload.memberships.map(normalizeMembershipRow) : [],
    raw: payload,
  }
}

export function normalizePlayerHistoryResponse(response) {
  const payload = unwrapApiData(response) || {}

  return {
    player: payload.player ? normalizePlayerRow(payload.player) : null,
    memberships: Array.isArray(payload.memberships) ? payload.memberships.map(normalizeMembershipRow) : [],
    raw: payload,
  }
}
