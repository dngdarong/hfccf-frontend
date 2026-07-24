import http from '@/services/http'
import {
  buildQueryParams,
  formatMatchDateTimeParts,
  normalizePerPage,
  resolveId,
} from './sportApiUtils'
import { unwrapApiData, unwrapApiItems, unwrapApiPagination } from '@/services/api'

function valueOrEmpty(value) {
  return value === undefined || value === null ? '' : value
}

function normalizeUser(user) {
  if (!user || typeof user !== 'object') return null

  const firstName = valueOrEmpty(user.firstName ?? user.first_name)
  const lastName = valueOrEmpty(user.lastName ?? user.last_name)

  return {
    id: valueOrEmpty(user.id),
    firstName,
    lastName,
    fullName: valueOrEmpty(user.fullName ?? user.full_name) || `${firstName} ${lastName}`.trim(),
    username: valueOrEmpty(user.username),
    email: valueOrEmpty(user.email),
  }
}

export function normalizeTrainingSessionRow(row = {}) {
  const team = row.team && typeof row.team === 'object' ? row.team : null
  const startsAt = valueOrEmpty(row.startsAt ?? row.starts_at)
  const endsAt = valueOrEmpty(row.endsAt ?? row.ends_at)
  const dateParts = formatMatchDateTimeParts(startsAt)
  const endParts = formatMatchDateTimeParts(endsAt)

  return {
    id: valueOrEmpty(row.id),
    sessionCode: valueOrEmpty(row.sessionCode ?? row.session_code),
    teamId: valueOrEmpty(row.teamId ?? row.team_id ?? team?.id),
    team: valueOrEmpty(team?.name ?? row.teamName ?? row.team),
    division: valueOrEmpty(team?.division ?? row.division),
    coachUserId: valueOrEmpty(row.coachUserId ?? row.coach_user_id ?? row.coach?.id),
    coach: normalizeUser(row.coach),
    title: valueOrEmpty(row.title),
    trainingType: valueOrEmpty(row.trainingType ?? row.training_type),
    focus: valueOrEmpty(row.focus),
    venue: valueOrEmpty(row.venue),
    startsAt,
    endsAt,
    date: dateParts.date,
    startTime: dateParts.time,
    endTime: endParts.time,
    status: valueOrEmpty(row.status),
    intensity: valueOrEmpty(row.intensity),
    notes: valueOrEmpty(row.notes),
    createdAt: valueOrEmpty(row.createdAt ?? row.created_at),
    updatedAt: valueOrEmpty(row.updatedAt ?? row.updated_at),
  }
}

function normalizeTrainingSessionListResponse(response, fallbackPage, fallbackPerPage) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeTrainingSessionRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function buildTrainingSessionPayload(payload = {}) {
  return {
    ...(payload.sessionCode ? { session_code: payload.sessionCode } : {}),
    team_id: resolveId(payload.teamId ?? payload.team),
    ...(payload.coachUserId ? { coach_user_id: resolveId(payload.coachUserId) } : {}),
    title: payload.title || '',
    training_type: payload.trainingType || 'technical',
    focus: payload.focus || null,
    venue: payload.venue || null,
    starts_at: payload.startsAt || payload.starts_at || '',
    ends_at: payload.endsAt || payload.ends_at || '',
    intensity: payload.intensity || 'medium',
    status: payload.status || 'scheduled',
    notes: payload.notes || null,
  }
}

export async function fetchSportTrainingSessions(
  {
    page = 1,
    perPage = 8,
    search = '',
    teamId = '',
    status = '',
    trainingType = '',
    intensity = '',
    dateFrom = '',
    dateTo = '',
    sortBy = 'starts_at',
    sortDirection = 'asc',
  } = {},
  options = {},
) {
  const safePerPage = normalizePerPage(perPage, 8)
  const response = await http.get('/sport/training-sessions', {
    params: buildQueryParams({
      page,
      per_page: safePerPage,
      search,
      team_id: resolveId(teamId),
      status,
      training_type: trainingType,
      intensity,
      date_from: dateFrom,
      date_to: dateTo,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }),
    signal: options.signal,
  })

  return normalizeTrainingSessionListResponse(response, page, safePerPage)
}

export async function fetchSportTrainingSession(id, options = {}) {
  const sessionId = resolveId(id)
  if (!sessionId) return null

  const response = await http.get(`/sport/training-sessions/${encodeURIComponent(sessionId)}`, {
    signal: options.signal,
  })
  const payload = unwrapApiData(response) || {}

  return normalizeTrainingSessionRow(payload.session || payload)
}

export async function createSportTrainingSession(payload = {}) {
  const response = await http.post('/sport/training-sessions', buildTrainingSessionPayload(payload))
  const data = unwrapApiData(response) || {}

  return normalizeTrainingSessionRow(data.session || data)
}

export async function updateSportTrainingSession(id, payload = {}) {
  const sessionId = resolveId(id)
  if (!sessionId) throw new Error('Training session id is required.')

  const response = await http.put(
    `/sport/training-sessions/${encodeURIComponent(sessionId)}`,
    buildTrainingSessionPayload(payload),
  )
  const data = unwrapApiData(response) || {}

  return normalizeTrainingSessionRow(data.session || data)
}

export async function deleteSportTrainingSession(id) {
  const sessionId = resolveId(id)
  if (!sessionId) return false

  await http.delete(`/sport/training-sessions/${encodeURIComponent(sessionId)}`)
  return true
}
