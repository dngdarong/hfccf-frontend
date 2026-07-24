import http from '@/services/http'
import { buildQueryParams, normalizePerPage, unwrapApiData } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeAlert(item = {}) {
  return {
    id: item.id ?? '',
    studentId: item.studentId ?? item.student_id ?? '',
    studentName: normalizeText(item.studentName || item.student_name),
    classId: item.classId ?? item.class_id ?? '',
    className: normalizeText(item.className || item.class_name),
    guardianId: item.guardianId ?? item.guardian_id ?? '',
    guardianName: normalizeText(item.guardianName || item.guardian_name),
    guardianPhone: normalizeText(item.guardianPhone || item.guardian_phone),
    alertType: normalizeText(item.alertType || item.alert_type),
    alertLabel: normalizeText(item.alertLabel || item.alert_label),
    status: normalizeText(item.status || 'queued'),
    severity: normalizeText(item.severity || 'medium'),
    absenceCount: normalizeNumber(item.absenceCount ?? item.absence_count, null),
    threshold: normalizeNumber(item.threshold ?? item.threshold_days, null),
    sourceType: normalizeText(item.sourceType || item.source_type),
    sourceId: normalizeText(item.sourceId || item.source_id),
    message: normalizeText(item.message),
    createdAt: item.createdAt || item.created_at || '',
    updatedAt: item.updatedAt || item.updated_at || '',
    acknowledgedAt: item.acknowledgedAt || item.acknowledged_at || '',
    followUpStatus: normalizeText(item.followUpStatus || item.follow_up_status),
    raw: item,
  }
}

function normalizeSummary(summary = {}) {
  const byClass = Array.isArray(summary.byClass) ? summary.byClass : []
  const bySeverity = Array.isArray(summary.bySeverity) ? summary.bySeverity : []

  return {
    total: normalizeNumber(summary.total, 0) || 0,
    open: normalizeNumber(summary.open, 0) || 0,
    acknowledged: normalizeNumber(summary.acknowledged, 0) || 0,
    overdue: normalizeNumber(summary.overdue, 0) || 0,
    byClass: byClass.map((item = {}) => ({
      classId: item.classId ?? item.class_id ?? null,
      className: normalizeText(item.className || item.class_name),
      total: normalizeNumber(item.total, 0) || 0,
      open: normalizeNumber(item.open, 0) || 0,
      acknowledged: normalizeNumber(item.acknowledged, 0) || 0,
      overdue: normalizeNumber(item.overdue, 0) || 0,
    })),
    bySeverity: bySeverity.map((item = {}) => ({
      severity: normalizeText(item.severity || ''),
      total: normalizeNumber(item.total, 0) || 0,
    })),
  }
}

export async function fetchPreschoolAttendanceAlerts(filters = {}, options = {}) {
  const response = await http.get('/preschool/attendance-alerts', {
    params: buildQueryParams({
      student_id: filters.studentId || filters.student_id || undefined,
      class_id: filters.classId || filters.class_id || undefined,
      status: filters.status || undefined,
      date_from: filters.dateFrom || filters.date_from || undefined,
      date_to: filters.dateTo || filters.date_to || undefined,
      threshold: filters.threshold || undefined,
      communication_type: filters.communicationType || filters.communication_type || undefined,
      page: filters.page ?? 1,
      per_page: normalizePerPage(filters.perPage ?? 20, 1, 100),
    }),
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}

  return {
    items: Array.isArray(payload.items) ? payload.items.map(normalizeAlert) : [],
    summary: normalizeSummary(payload.summary || {}),
    pagination: payload.pagination || null,
  }
}

export async function fetchPreschoolAttendanceAlertSummary(filters = {}, options = {}) {
  const response = await fetchPreschoolAttendanceAlerts({
    ...filters,
    page: 1,
    perPage: filters.perPage ?? 5,
  }, options)

  return {
    summary: response.summary,
    recentAlerts: response.items,
    pagination: response.pagination,
  }
}
