// Keep Preschool lifecycle audit HTTP calls separate from report rendering so
// admin history views can stay small and the audit contract remains explicit.
import http from '@/services/http'
import { buildQueryParams, unwrapApiData } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeAuditLog(row = {}) {
  return {
    id: row.id ?? '',
    actorUserId: row.actorUserId ?? row.actor_user_id ?? '',
    actorRole: normalizeText(row.actorRole || row.actor_role),
    actionType: normalizeText(row.actionType || row.action_type),
    entityType: normalizeText(row.entityType || row.entity_type),
    entityId: normalizeText(row.entityId || row.entity_id),
    academicYearId: row.academicYearId ?? row.academic_year_id ?? '',
    termId: row.termId ?? row.term_id ?? '',
    reportPeriodId: row.reportPeriodId ?? row.report_period_id ?? '',
    previousState: row.previousState || row.previous_state || null,
    newState: row.newState || row.new_state || null,
    overrideReason: normalizeText(row.overrideReason || row.override_reason),
    lockCode: normalizeText(row.lockCode || row.lock_code),
    lockReason: normalizeText(row.lockReason || row.lock_reason),
    requestContext: row.requestContext || row.request_context || null,
    createdAt: row.createdAt || row.created_at || '',
    actor: row.actor || null,
    reportPeriod: row.reportPeriod || row.report_period || null,
    raw: row,
  }
}

function normalizeAuditListPayload(payload = {}) {
  const items = Array.isArray(payload.items) ? payload.items : []

  return {
    items: items.map(normalizeAuditLog),
    pagination: payload.pagination || {},
  }
}

function normalizeAuditAnalyticsPayload(payload = {}) {
  return {
    overview: payload.overview || {},
    actionCounts: Array.isArray(payload.actionCounts) ? payload.actionCounts : [],
    entityCounts: Array.isArray(payload.entityCounts) ? payload.entityCounts : [],
    actorCounts: Array.isArray(payload.actorCounts) ? payload.actorCounts : [],
    blockedWriteTrend: Array.isArray(payload.blockedWriteTrend) ? payload.blockedWriteTrend : [],
    lifecycleTimeline: Array.isArray(payload.lifecycleTimeline) ? payload.lifecycleTimeline : [],
    overrideReasons: Array.isArray(payload.overrideReasons) ? payload.overrideReasons : [],
  }
}

export async function fetchLifecycleAuditLogs(params = {}, options = {}) {
  const response = await http.get('/preschool/lifecycle-audit-logs', {
    params: buildQueryParams({
      page: params.page ?? 1,
      per_page: params.perPage ?? 20,
      action_type: params.actionType || '',
      entity_type: params.entityType || '',
      entity_id: params.entityId || '',
      report_period_id: params.reportPeriodId || '',
      term_id: params.termId || '',
      academic_year_id: params.academicYearId || '',
      actor_user_id: params.actorUserId || '',
    }),
    signal: options.signal,
  })

  return normalizeAuditListPayload(unwrapApiData(response) || {})
}

export async function fetchLifecycleAuditAnalytics(params = {}, options = {}) {
  const response = await http.get('/preschool/lifecycle-audit-analytics', {
    params: buildQueryParams({
      report_period_id: params.reportPeriodId || '',
      term_id: params.termId || '',
      academic_year_id: params.academicYearId || '',
      days: params.days || 30,
    }),
    signal: options.signal,
  })

  return normalizeAuditAnalyticsPayload(unwrapApiData(response) || {})
}
