import http from '@/services/http'
import { buildFormData, buildQueryParams, normalizeMatchRow, normalizePlayerRow, unwrapApiData } from './sportApiUtils'

export async function fetchPendingPlayers(options = {}) {
  const response = await http.get('/sport/admin/pending-players', {
    params: buildQueryParams({
      search: options.search || '',
      status: options.status || 'pending',
    }),
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  const items = Array.isArray(payload.items) ? payload.items : []
  return {
    items: items.map(normalizePlayerRow),
    pagination: payload.pagination || { page: 1, perPage: 10, total: items.length, totalPages: 1 },
  }
}

export async function fetchPendingMatches(options = {}) {
  const response = await http.get('/sport/admin/pending-matches', {
    params: buildQueryParams({
      search: options.search || '',
      status: options.status || 'pending',
    }),
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  const items = Array.isArray(payload.items) ? payload.items : []
  return {
    items: items.map(normalizeMatchRow),
    pagination: payload.pagination || { page: 1, perPage: 10, total: items.length, totalPages: 1 },
  }
}

export async function approvePendingPlayer(playerId) {
  const response = await http.post(`/sport/admin/players/${encodeURIComponent(playerId)}/approve`)
  const data = unwrapApiData(response) || {}
  return normalizePlayerRow(data.player || data)
}

export async function rejectPendingPlayer(playerId, payload = {}) {
  const response = await http.post(
    `/sport/admin/players/${encodeURIComponent(playerId)}/reject`,
    buildFormData(payload),
  )
  const data = unwrapApiData(response) || {}
  return normalizePlayerRow(data.player || data)
}

export async function approvePendingMatch(matchId) {
  const response = await http.post(`/sport/admin/matches/${encodeURIComponent(matchId)}/approve`)
  const data = unwrapApiData(response) || {}
  return normalizeMatchRow(data.match || data)
}

export async function rejectPendingMatch(matchId, payload = {}) {
  const response = await http.post(
    `/sport/admin/matches/${encodeURIComponent(matchId)}/reject`,
    buildFormData(payload),
  )
  const data = unwrapApiData(response) || {}
  return normalizeMatchRow(data.match || data)
}

export async function listCoachTeamAssignments(options = {}) {
  const response = await http.get('/sport/admin/coach-team-assignments', {
    params: buildQueryParams({
      page: options.page || 1,
      per_page: options.perPage || 100,
      search: options.search || '',
      status: options.status || '',
      coach_user_id: options.coachUserId || options.coach_user_id || '',
      team_id: options.teamId || options.team_id || '',
    }),
    signal: options.signal,
  })

  return unwrapApiData(response) || { items: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 } }
}

export async function createCoachTeamAssignment(payload = {}) {
  const response = await http.post('/sport/admin/coach-team-assignments', buildFormData(payload))
  return unwrapApiData(response) || {}
}

export async function updateCoachTeamAssignment(id, payload = {}) {
  const assignmentId = String(id ?? '').trim()
  if (!assignmentId) throw new Error('Assignment id is required.')

  const { id: _id, assignmentId: _assignmentId, ...requestPayload } = payload
  const response = await http.patch(
    `/sport/admin/coach-team-assignments/${encodeURIComponent(assignmentId)}`,
    buildFormData(requestPayload),
  )
  return unwrapApiData(response) || {}
}

export async function saveCoachTeamAssignment(payload = {}) {
  const id = payload.id || payload.assignmentId
  return id ? updateCoachTeamAssignment(id, payload) : createCoachTeamAssignment(payload)
}

export async function deactivateCoachTeamAssignment(id) {
  await http.delete(`/sport/admin/coach-team-assignments/${encodeURIComponent(id)}`)
  return true
}
