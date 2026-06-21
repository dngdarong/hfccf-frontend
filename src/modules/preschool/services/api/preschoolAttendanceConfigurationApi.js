import http from '@/services/http'
import { buildQueryParams, unwrapApiData, unwrapApiItems, unwrapApiPagination } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value
  if (value === 1 || value === '1' || value === 'true') return true
  if (value === 0 || value === '0' || value === 'false') return false
  return fallback
}

function resolveId(input) {
  if (typeof input === 'string' || typeof input === 'number') {
    return String(input).trim()
  }

  return String(input?.id || '').trim()
}

export function buildSchoolWeekLabel(schoolDaysPerWeek) {
  const count = normalizeNumber(schoolDaysPerWeek, 0)

  if (count >= 7) return 'Mon-Sun'
  if (count === 6) return 'Mon-Sat'
  if (count === 5) return 'Mon-Fri'
  if (count === 4) return 'Mon-Thu'
  if (count === 3) return 'Mon-Wed'
  if (count === 2) return 'Mon-Tue'
  if (count === 1) return 'Mon'

  return ''
}

function countEnabledSchoolDays(settings = {}) {
  return [
    settings.mondayEnabled,
    settings.tuesdayEnabled,
    settings.wednesdayEnabled,
    settings.thursdayEnabled,
    settings.fridayEnabled,
    settings.saturdayEnabled,
    settings.sundayEnabled,
  ].filter(Boolean).length
}

export function normalizeAttendanceSettings(record = {}) {
  const schoolWeek = {
    mondayEnabled: normalizeBoolean(record.mondayEnabled ?? record.monday_enabled),
    tuesdayEnabled: normalizeBoolean(record.tuesdayEnabled ?? record.tuesday_enabled),
    wednesdayEnabled: normalizeBoolean(record.wednesdayEnabled ?? record.wednesday_enabled),
    thursdayEnabled: normalizeBoolean(record.thursdayEnabled ?? record.thursday_enabled),
    fridayEnabled: normalizeBoolean(record.fridayEnabled ?? record.friday_enabled),
    saturdayEnabled: normalizeBoolean(record.saturdayEnabled ?? record.saturday_enabled),
    sundayEnabled: normalizeBoolean(record.sundayEnabled ?? record.sunday_enabled),
  }

  const normalized = {
    id: record.id ?? '',
    lateThresholdMinutes: normalizeNumber(record.lateThresholdMinutes ?? record.late_threshold_minutes, 15),
    halfDayThresholdMinutes: normalizeNumber(record.halfDayThresholdMinutes ?? record.half_day_threshold_minutes, 180),
    absenceAlertDays: normalizeNumber(record.absenceAlertDays ?? record.absence_alert_days, 3),
    guardianAlertEnabled: normalizeBoolean(record.guardianAlertEnabled ?? record.guardian_alert_enabled, true),
    teacherAlertEnabled: normalizeBoolean(record.teacherAlertEnabled ?? record.teacher_alert_enabled, true),
    adminAlertEnabled: normalizeBoolean(record.adminAlertEnabled ?? record.admin_alert_enabled, true),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    raw: record,
  }

  normalized.schoolWeek = schoolWeek
  normalized.schoolDaysPerWeek = countEnabledSchoolDays(schoolWeek)

  return normalized
}

export function normalizeAttendanceSummary(record = {}) {
  const source = record.attendance || record.summary || record

  return {
    lateThresholdMinutes: normalizeNumber(source.lateThresholdMinutes ?? source.late_threshold_minutes, 15),
    halfDayThresholdMinutes: normalizeNumber(source.halfDayThresholdMinutes ?? source.half_day_threshold_minutes, 180),
    absenceAlertDays: normalizeNumber(source.absenceAlertDays ?? source.absence_alert_days, 3),
    schoolDaysPerWeek: normalizeNumber(source.schoolDaysPerWeek ?? source.school_days_per_week, 5),
    calendarEventsCount: normalizeNumber(source.calendarEventsCount ?? source.calendar_events_count, 0),
    schoolWeekLabel: normalizeText(source.schoolWeekLabel ?? source.school_week_label) || buildSchoolWeekLabel(source.schoolDaysPerWeek ?? source.school_days_per_week),
  }
}

export function normalizeCalendarEvent(record = {}) {
  return {
    id: record.id ?? '',
    academicYearId: record.academicYearId ?? record.academic_year_id ?? '',
    title: normalizeText(record.title),
    description: normalizeText(record.description),
    type: normalizeText(record.type || record.eventType || record.event_type || 'holiday'),
    startDate: record.startDate || record.start_date || '',
    endDate: record.endDate || record.end_date || '',
    status: normalizeText(record.status || 'active'),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    deletedAt: record.deletedAt || record.deleted_at || '',
    raw: record,
  }
}

function normalizeCalendarEventListResponse(response, fallbackPage = 1, fallbackPerPage = 25) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeCalendarEvent),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

export function normalizeAttendanceConfigurationResponse(payload = {}) {
  const settings = normalizeAttendanceSettings(payload.settings || payload)
  const events = Array.isArray(payload.calendarEvents)
    ? payload.calendarEvents.map(normalizeCalendarEvent)
    : Array.isArray(payload.events)
      ? payload.events.map(normalizeCalendarEvent)
      : []

  return {
    settings,
    calendarEvents: events,
    summary: normalizeAttendanceSummary(payload.summary || payload),
  }
}

export function buildAttendanceSettingsPayload(settings = {}) {
  return {
    late_threshold_minutes: normalizeNumber(settings.lateThresholdMinutes ?? settings.late_threshold_minutes, 15),
    half_day_threshold_minutes: normalizeNumber(settings.halfDayThresholdMinutes ?? settings.half_day_threshold_minutes, 180),
    absence_alert_days: normalizeNumber(settings.absenceAlertDays ?? settings.absence_alert_days, 3),
    guardian_alert_enabled: normalizeBoolean(settings.guardianAlertEnabled ?? settings.guardian_alert_enabled, true),
    teacher_alert_enabled: normalizeBoolean(settings.teacherAlertEnabled ?? settings.teacher_alert_enabled, true),
    admin_alert_enabled: normalizeBoolean(settings.adminAlertEnabled ?? settings.admin_alert_enabled, true),
    monday_enabled: normalizeBoolean(settings.mondayEnabled ?? settings.monday_enabled, true),
    tuesday_enabled: normalizeBoolean(settings.tuesdayEnabled ?? settings.tuesday_enabled, true),
    wednesday_enabled: normalizeBoolean(settings.wednesdayEnabled ?? settings.wednesday_enabled, true),
    thursday_enabled: normalizeBoolean(settings.thursdayEnabled ?? settings.thursday_enabled, true),
    friday_enabled: normalizeBoolean(settings.fridayEnabled ?? settings.friday_enabled, true),
    saturday_enabled: normalizeBoolean(settings.saturdayEnabled ?? settings.saturday_enabled, false),
    sunday_enabled: normalizeBoolean(settings.sundayEnabled ?? settings.sunday_enabled, false),
  }
}

export function buildCalendarEventPayload(event = {}) {
  return {
    academic_year_id: event.academicYearId ?? event.academic_year_id ?? '',
    title: normalizeText(event.title),
    description: normalizeText(event.description),
    type: normalizeText(event.type || 'holiday'),
    start_date: event.startDate || event.start_date || '',
    end_date: event.endDate || event.end_date || '',
    status: normalizeText(event.status || 'active'),
  }
}

export async function fetchAttendanceSettings(options = {}) {
  const response = await http.get('/preschool/settings/attendance', {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizeAttendanceConfigurationResponse(payload).settings
}

export async function updateAttendanceSettings(settings = {}) {
  const response = await http.put('/preschool/settings/attendance', buildAttendanceSettingsPayload(settings))
  const payload = unwrapApiData(response) || {}
  return normalizeAttendanceConfigurationResponse(payload).settings
}

export async function fetchCalendarEvents(params = {}, options = {}) {
  const response = await http.get('/preschool/settings/attendance/calendar-events', {
    params: buildQueryParams({
      academic_year_id: params.academicYearId,
      type: params.type,
      status: params.status,
      search: params.search,
      start_date: params.startDate,
      end_date: params.endDate,
      page: params.page,
      per_page: params.perPage,
    }),
    signal: options.signal,
  })

  return normalizeCalendarEventListResponse(response, params.page || 1, params.perPage || 25)
}

export async function createCalendarEvent(event = {}) {
  const response = await http.post('/preschool/settings/attendance/calendar-events', buildCalendarEventPayload(event))
  const payload = unwrapApiData(response) || {}
  return normalizeCalendarEvent(payload.event || payload.calendarEvent || payload)
}

export async function updateCalendarEvent(eventOrId, event = {}) {
  const eventId = resolveId(eventOrId)
  const response = await http.put(
    `/preschool/settings/attendance/calendar-events/${encodeURIComponent(eventId)}`,
    buildCalendarEventPayload(event),
  )
  const payload = unwrapApiData(response) || {}
  return normalizeCalendarEvent(payload.event || payload.calendarEvent || payload)
}

export async function archiveCalendarEvent(eventOrId) {
  const eventId = resolveId(eventOrId)
  const response = await http.post(`/preschool/settings/attendance/calendar-events/${encodeURIComponent(eventId)}/archive`)
  const payload = unwrapApiData(response) || {}
  return normalizeCalendarEvent(payload.event || payload.calendarEvent || payload)
}
