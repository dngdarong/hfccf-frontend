// Keep Preschool schedule HTTP calls in one module so timetable pages can
// remain thin and the response contract stays easy to audit.
import http from '@/services/http'
import { buildQueryParams, unwrapApiData, unwrapApiItems, unwrapApiPagination } from '@/services/api'
import {
  normalizeScheduleListResponse,
  normalizeScheduleRow,
  normalizeScheduleViewBundle,
} from './preschoolScheduleMappers'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeSchedulePageSize(perPage) {
  const parsed = Number(perPage)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 10
  }

  return Math.min(Math.trunc(parsed), 100)
}

function normalizeScheduleSession(row = {}) {
  return {
    id: row.id ?? '',
    scheduleId: row.scheduleId ?? row.schedule_id ?? '',
    classId: row.classId ?? row.class_id ?? '',
    className: normalizeText(row.className || row.class_name),
    teacherUserId: row.teacherUserId ?? row.teacher_user_id ?? '',
    teacherName: normalizeText(row.teacherName || row.teacher_name),
    room: normalizeText(row.room || row.roomName || row.room_name),
    roomName: normalizeText(row.roomName || row.room_name || row.room),
    attendanceDate: row.attendanceDate || row.attendance_date || '',
    status: normalizeText(row.status || ''),
    openedAt: row.openedAt || row.opened_at || '',
    completedAt: row.completedAt || row.completed_at || '',
    closedAt: row.closedAt || row.closed_at || '',
    lockedAt: row.lockedAt || row.locked_at || '',
    cancelledAt: row.cancelledAt || row.cancelled_at || '',
    generatedFromSchedule: Boolean(row.generatedFromSchedule ?? row.generated_from_schedule ?? false),
    pendingCount: Number(row.pendingCount ?? row.pending_count ?? 0) || 0,
    studentCount: Number(row.studentCount ?? row.student_count ?? 0) || 0,
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

function normalizeScheduleSessionSummary(summary = {}) {
  return {
    ...summary,
  }
}

function normalizeScheduleSessionList(response, fallbackPage = 1, fallbackPerPage = 10) {
  const payload = unwrapApiData(response) || {}
  const items = Array.isArray(payload.items)
    ? payload.items.map(normalizeScheduleSession)
    : Array.isArray(payload.sessions)
      ? payload.sessions.map(normalizeScheduleSession)
      : []

  return {
    items,
    pagination: unwrapApiPagination({ data: payload }, fallbackPage, fallbackPerPage, items.length),
    summary: normalizeScheduleSessionSummary(payload.summary || {}),
  }
}

function normalizeScheduleTodaySession(response) {
  const payload = unwrapApiData(response) || {}
  const session = payload.session || payload.todaySession || payload.data || null

  return {
    session: session ? normalizeScheduleSession(session) : null,
  }
}

function normalizeScheduleHistory(response) {
  const payload = unwrapApiData(response) || {}

  return {
    schedule: payload.schedule ? normalizeScheduleRow(payload.schedule) : null,
    todaySession: payload.todaySession || payload.today_session
      ? normalizeScheduleSession(payload.todaySession || payload.today_session)
      : null,
    recentSessions: Array.isArray(payload.recentSessions)
      ? payload.recentSessions.map(normalizeScheduleSession)
      : Array.isArray(payload.recent_sessions)
        ? payload.recent_sessions.map(normalizeScheduleSession)
        : [],
    summary: normalizeScheduleSessionSummary(payload.summary || {}),
    alerts: Array.isArray(payload.alerts) ? payload.alerts : Array.isArray(payload.data?.alerts) ? payload.data.alerts : [],
    guardianContacts: Array.isArray(payload.guardianContacts)
      ? payload.guardianContacts
      : Array.isArray(payload.guardian_contacts)
        ? payload.guardian_contacts
        : [],
  }
}

function normalizeScheduleList(response, fallbackPage = 1, fallbackPerPage = 10) {
  const payload = unwrapApiData(response) || {}
  // Preserve the backend payload when the first unwrap path resolves to an
  // empty array, otherwise the timetable page would silently render nothing.
  const responseItems = unwrapApiItems(response)
  const items = Array.isArray(payload.items) && payload.items.length > 0
    ? payload.items
    : responseItems

  return normalizeScheduleListResponse(
    {
      items,
      pagination: unwrapApiPagination({ data: payload }, fallbackPage, fallbackPerPage, items.length),
    },
    fallbackPage,
    fallbackPerPage,
  )
}

function normalizeScheduleBundle(response, contextKey) {
  const payload = unwrapApiData(response) || {}

  return normalizeScheduleViewBundle({
    ...payload,
    items: Array.isArray(payload.items) ? payload.items : [],
  }, contextKey)
}

export async function fetchSchedules(
  { page = 1, perPage = 10, search = '', status = '', classId = '', teacherUserId = '', dayOfWeek = '' } = {},
  options = {},
) {
  const normalizedPerPage = normalizeSchedulePageSize(perPage)

  const response = await http.get('/preschool/schedules', {
    params: buildQueryParams({
      page,
      per_page: normalizedPerPage,
      search,
      status,
      class_id: classId,
      teacher_user_id: teacherUserId,
      day_of_week: dayOfWeek,
    }),
    signal: options.signal,
  })

  return normalizeScheduleList(response, page, perPage)
}

export async function createSchedule(payload = {}) {
  const response = await http.post('/preschool/schedules', payload)
  const data = unwrapApiData(response) || {}

  return normalizeScheduleRow(data.schedule || data)
}

export async function fetchSchedule(scheduleId, options = {}) {
  const id = String(scheduleId || '').trim()
  if (!id) return null

  const response = await http.get(`/preschool/schedules/${encodeURIComponent(id)}`, {
    signal: options.signal,
  })

  const data = unwrapApiData(response) || {}
  return normalizeScheduleRow(data.schedule || data)
}

export async function fetchScheduleSessions(scheduleId, filters = {}, options = {}) {
  const id = String(scheduleId || '').trim()
  if (!id) {
    return {
      items: [],
      pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 },
      summary: {},
    }
  }

  const response = await http.get(`/preschool/schedules/${encodeURIComponent(id)}/sessions`, {
    params: buildQueryParams({
      page: filters.page ?? 1,
      per_page: filters.perPage ?? 10,
      status: filters.status ?? '',
      date_from: filters.dateFrom ?? filters.date_from ?? '',
      date_to: filters.dateTo ?? filters.date_to ?? '',
    }),
    signal: options.signal,
  })

  return normalizeScheduleSessionList(response, filters.page ?? 1, filters.perPage ?? 10)
}

export async function fetchScheduleTodaySession(scheduleId, options = {}) {
  const id = String(scheduleId || '').trim()
  if (!id) {
    return { session: null }
  }

  const response = await http.get(`/preschool/schedules/${encodeURIComponent(id)}/today-session`, {
    signal: options.signal,
  })

  return normalizeScheduleTodaySession(response)
}

export async function fetchScheduleSessionHistory(scheduleId, filters = {}, options = {}) {
  const id = String(scheduleId || '').trim()
  if (!id) {
    return {
      schedule: null,
      todaySession: null,
      recentSessions: [],
      summary: {},
      alerts: [],
      guardianContacts: [],
    }
  }

  const response = await http.get(`/preschool/schedules/${encodeURIComponent(id)}/history`, {
    signal: options.signal,
  })

  return normalizeScheduleHistory(response)
}

export async function updateSchedule(scheduleId, payload = {}) {
  const id = String(scheduleId || '').trim()
  if (!id) {
    throw new Error('Schedule id is required.')
  }

  const response = await http.patch(`/preschool/schedules/${encodeURIComponent(id)}`, payload)
  const data = unwrapApiData(response) || {}

  return normalizeScheduleRow(data.schedule || data)
}

export async function archiveSchedule(scheduleId) {
  const id = String(scheduleId || '').trim()
  if (!id) return false

  await http.delete(`/preschool/schedules/${encodeURIComponent(id)}`)
  return true
}

export async function fetchClassSchedule(classId, options = {}) {
  const id = String(classId || '').trim()
  if (!id) return { class: null, items: [] }

  const response = await http.get(`/preschool/classes/${encodeURIComponent(id)}/schedule`, {
    signal: options.signal,
  })

  return normalizeScheduleBundle(response, 'class')
}

export async function fetchTeacherSchedule(teacherId, options = {}) {
  const id = String(teacherId || '').trim()
  if (!id) return { teacher: null, items: [] }

  const response = await http.get(`/preschool/teachers/${encodeURIComponent(id)}/schedule`, {
    signal: options.signal,
  })

  return normalizeScheduleBundle(response, 'teacher')
}

export async function fetchMySchedule(options = {}) {
  const response = await http.get('/preschool/me/schedule', {
    signal: options.signal,
  })

  return normalizeScheduleBundle(response, 'teacher')
}
