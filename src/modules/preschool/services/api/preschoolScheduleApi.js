// Keep Preschool schedule HTTP calls in one module so timetable pages can
// remain thin and the response contract stays easy to audit.
import http from '@/services/http'
import { buildQueryParams, unwrapApiData, unwrapApiItems, unwrapApiPagination } from '@/services/api'
import {
  normalizeScheduleListResponse,
  normalizeScheduleRow,
  normalizeScheduleViewBundle,
} from './preschoolScheduleMappers'

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
      pagination: unwrapApiPagination(payload, fallbackPage, fallbackPerPage, items.length),
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
  const response = await http.get('/preschool/schedules', {
    params: buildQueryParams({
      page,
      per_page: perPage,
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
