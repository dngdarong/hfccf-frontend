import http from '@/services/http'
import { buildQueryParams, unwrapApiData } from '@/services/api'

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function normalizeText(value) {
  return String(value ?? '').trim()
}

function toCamelCase(key) {
  return String(key)
    .replace(/[-_](\w)/g, (_, letter) => letter.toUpperCase())
}

function normalizePrimitive(value) {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) return value.map(normalizePrimitive)
  if (!isPlainObject(value)) return value

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [toCamelCase(key), normalizePrimitive(entry)]),
  )
}

function normalizeAnalyticsBundle(payload = {}) {
  const analyticsPayload = isPlainObject(payload.analytics) ? payload.analytics : payload
  const datasetSource = analyticsPayload.datasets ?? analyticsPayload.dataset ?? analyticsPayload.report ?? {}

  return {
    scope: normalizeText(payload.scope || analyticsPayload.scope),
    summary: normalizePrimitive(analyticsPayload.summary || payload.summary || {}),
    trends: normalizePrimitive(analyticsPayload.trends || payload.trends || {}),
    breakdowns: normalizePrimitive(analyticsPayload.breakdowns || payload.breakdowns || {}),
    charts: normalizePrimitive(analyticsPayload.charts || payload.charts || {}),
    datasets: normalizePrimitive(datasetSource),
    filters: normalizePrimitive(payload.filters || analyticsPayload.filters || {}),
    generatedAt: normalizeText(
      payload.generatedAt
      || payload.generated_at
      || analyticsPayload.generatedAt
      || analyticsPayload.generated_at
      || '',
    ),
  }
}

function pickFilterValue(filters = {}, snakeKey, camelKey) {
  return filters[snakeKey] ?? filters[camelKey] ?? filters[toCamelCase(snakeKey)] ?? undefined
}

function buildAnalyticsQuery(filters = {}) {
  return buildQueryParams({
    academic_year_id: pickFilterValue(filters, 'academic_year_id', 'academicYearId'),
    class_id: pickFilterValue(filters, 'class_id', 'classId'),
    teacher_user_id: pickFilterValue(filters, 'teacher_user_id', 'teacherUserId'),
    date_from: pickFilterValue(filters, 'date_from', 'dateFrom'),
    date_to: pickFilterValue(filters, 'date_to', 'dateTo'),
    status: pickFilterValue(filters, 'status', 'status'),
  })
}

async function fetchAnalytics(path, filters = {}, options = {}) {
  const response = await http.get(path, {
    params: buildAnalyticsQuery(filters),
    signal: options.signal,
  })

  return normalizeAnalyticsBundle(unwrapApiData(response) || {})
}

export async function fetchPreschoolAnalyticsDashboard(filters = {}, options = {}) {
  return fetchAnalytics('/preschool/analytics/dashboard', filters, options)
}

export async function fetchPreschoolAttendanceAnalytics(filters = {}, options = {}) {
  return fetchAnalytics('/preschool/analytics/attendance', filters, options)
}

export async function fetchPreschoolSessionAnalytics(filters = {}, options = {}) {
  return fetchAnalytics('/preschool/analytics/sessions', filters, options)
}

export async function fetchPreschoolScheduleAnalytics(filters = {}, options = {}) {
  return fetchAnalytics('/preschool/analytics/schedules', filters, options)
}

export async function fetchPreschoolAlertAnalytics(filters = {}, options = {}) {
  return fetchAnalytics('/preschool/analytics/alerts', filters, options)
}

export async function fetchPreschoolStudentAnalytics(filters = {}, options = {}) {
  return fetchAnalytics('/preschool/analytics/students', filters, options)
}

export async function fetchPreschoolTeacherAnalytics(filters = {}, options = {}) {
  return fetchAnalytics('/preschool/analytics/teachers', filters, options)
}

export async function fetchPreschoolGuardianContactAnalytics(filters = {}, options = {}) {
  return fetchAnalytics('/preschool/analytics/guardian-contacts', filters, options)
}

export async function fetchPreschoolAttendanceReportDataset(filters = {}, options = {}) {
  return fetchAnalytics('/preschool/analytics/reports/attendance', filters, options)
}

export async function fetchPreschoolSessionReportDataset(filters = {}, options = {}) {
  return fetchAnalytics('/preschool/analytics/reports/sessions', filters, options)
}

export async function fetchPreschoolScheduleReportDataset(filters = {}, options = {}) {
  return fetchAnalytics('/preschool/analytics/reports/schedules', filters, options)
}

export { normalizeAnalyticsBundle }
