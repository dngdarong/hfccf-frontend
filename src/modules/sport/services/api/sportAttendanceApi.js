import http from '@/services/http'
import {
  buildQueryParams,
  normalizePerPage,
  unwrapApiData,
  unwrapApiItems,
  unwrapApiPagination,
} from '@/services/api'
import {
  normalizeText,
  resolveId,
} from './sportApiUtils'

function normalizeAttendanceRow(row = {}) {
  const attendanceType = normalizeText(row.attendanceType || row.attendance_type || 'player')
  const playerName = normalizeText(
    row.playerName
      || row.player_name
      || row.player?.name
      || `${normalizeText(row.player?.firstName || row.player?.first_name)} ${normalizeText(row.player?.lastName || row.player?.last_name)}`,
  )
  const coachName = normalizeText(
    row.coachName
      || row.coach_name
      || row.coach?.fullName
      || row.coach?.name
      || row.coach?.username,
  )

  return {
    id: row.id ?? '',
    attendanceType,
    teamId: row.teamId ?? row.team_id ?? '',
    teamName: normalizeText(row.teamName || row.team_name || row.team?.name),
    playerId: row.playerId ?? row.player_id ?? '',
    playerName,
    coachId: row.coachId ?? row.coach_id ?? '',
    coachName,
    personName: attendanceType === 'coach' ? coachName : playerName,
    recordedByUserId: row.recordedByUserId ?? row.recorded_by_user_id ?? '',
    recordedByName: normalizeText(row.recordedByName || row.recorded_by_name || row.recordedBy?.name),
    attendanceDate: row.attendanceDate || row.attendance_date || '',
    status: normalizeText(row.status || ''),
    note: normalizeText(row.note),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

function normalizeAttendanceListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeAttendanceRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function buildAttendancePayload(payload = {}) {
  return {
    attendance_type: payload.attendanceType || payload.attendance_type || 'player',
    team_id: payload.teamId || payload.team_id || '',
    player_id: payload.playerId || payload.player_id || '',
    coach_id: payload.coachId || payload.coach_id || '',
    attendance_date: payload.attendanceDate || payload.attendance_date || '',
    status: payload.status || '',
    note: payload.note || '',
    recorded_by_user_id: payload.recordedByUserId || payload.recorded_by_user_id || '',
  }
}

export async function fetchSportAttendance(
  {
    page = 1,
    perPage = 10,
    search = '',
    attendanceType = 'player',
    teamId = '',
    playerId = '',
    coachId = '',
    status = '',
    attendanceDate = '',
    dateFrom = '',
    dateTo = '',
  } = {},
  options = {},
) {
  const normalizedPerPage = normalizePerPage(perPage, 25, 100)
  const response = await http.get('/sport/attendance', {
    params: buildQueryParams({
      page,
      per_page: normalizedPerPage,
      search,
      attendance_type: attendanceType,
      team_id: teamId,
      player_id: playerId,
      coach_id: coachId,
      status,
      attendance_date: attendanceDate,
      date_from: dateFrom,
      date_to: dateTo,
    }),
    signal: options.signal,
  })

  return normalizeAttendanceListResponse(response, page, normalizedPerPage)
}

export async function fetchSportPlayerAttendance(params = {}, options = {}) {
  return fetchSportAttendance({ ...params, attendanceType: 'player' }, options)
}

export async function saveSportAttendance(payload = {}) {
  const attendanceId = resolveId(payload)
  const method = attendanceId ? 'put' : 'post'
  const url = attendanceId ? `/sport/attendance/${encodeURIComponent(attendanceId)}` : '/sport/attendance'
  const response = await http[method](url, buildAttendancePayload(payload))
  const responsePayload = unwrapApiData(response) || {}

  return normalizeAttendanceRow(responsePayload.attendance || responsePayload)
}

export async function saveSportPlayerAttendance(payload = {}) {
  return saveSportAttendance({ ...payload, attendanceType: 'player' })
}
