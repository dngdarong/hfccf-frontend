// Keep institutional export governance requests separate from live report
// rendering so immutable export history, comparison, and timeline views can
// stay admin-only and clearly source-bound.
import http from '@/services/http'
import { buildQueryParams, normalizePerPage, unwrapApiData } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizePerson(row = {}) {
  if (!row || typeof row !== 'object') {
    return null
  }

  return {
    id: row.id ?? '',
    firstName: normalizeText(row.firstName || row.first_name),
    lastName: normalizeText(row.lastName || row.last_name),
    displayName: normalizeText(row.displayName || `${row.firstName || row.first_name || ''} ${row.lastName || row.last_name || ''}`),
    username: normalizeText(row.username),
    email: normalizeText(row.email),
    roleCode: normalizeText(row.roleCode || row.role_code),
    raw: row,
  }
}

function normalizeEntity(row = {}) {
  if (!row || typeof row !== 'object') {
    return null
  }

  return {
    id: row.id ?? '',
    code: normalizeText(row.code),
    name: normalizeText(row.name || row.label),
    label: normalizeText(row.label || row.name || row.periodLabel),
    status: normalizeText(row.status),
    raw: row,
  }
}

function normalizeSnapshot(row = {}) {
  if (!row || typeof row !== 'object') {
    return null
  }

  return {
    id: row.id ?? '',
    snapshotType: normalizeText(row.snapshotType || row.snapshot_type),
    lifecycleState: normalizeText(row.lifecycleState || row.lifecycle_state),
    snapshotVersion: normalizeNumber(row.snapshotVersion ?? row.snapshot_version),
    generatedAt: row.generatedAt || row.generated_at || '',
    generatedBy: normalizePerson(row.generatedBy || row.generated_by || null),
    academicYear: normalizeEntity(row.academicYear || row.academic_year || null),
    term: normalizeEntity(row.term || null),
    reportPeriod: normalizeEntity(row.reportPeriod || row.report_period || null),
    student: normalizeEntity(row.student || null),
    class: normalizeEntity(row.class || null),
    reportSummary: row.reportSummary || row.report_summary || {},
    attendanceSummary: row.attendanceSummary || row.attendance_summary || {},
    assessmentSummary: row.assessmentSummary || row.assessment_summary || {},
    progressSummary: row.progressSummary || row.progress_summary || {},
    summary: row.summary || {},
    contextLabel: normalizeText(row.contextLabel || row.context_label),
    raw: row,
  }
}

function normalizeExportRecord(row = {}) {
  return {
    id: row.id ?? '',
    actorUserId: row.actorUserId ?? row.actor_user_id ?? '',
    actorRole: normalizeText(row.actorRole || row.actor_role),
    actor: normalizePerson(row.actor || null),
    exportType: normalizeText(row.exportType || row.export_type),
    exportFormat: normalizeText(row.exportFormat || row.export_format),
    exportSource: normalizeText(row.exportSource || row.export_source),
    academicYearId: row.academicYearId ?? row.academic_year_id ?? '',
    termId: row.termId ?? row.term_id ?? '',
    reportPeriodId: row.reportPeriodId ?? row.report_period_id ?? '',
    academicYear: normalizeEntity(row.academicYear || row.academic_year || null),
    term: normalizeEntity(row.term || null),
    reportPeriod: normalizeEntity(row.reportPeriod || row.report_period || null),
    filters: row.filters || {},
    snapshotIds: Array.isArray(row.snapshotIds || row.snapshot_ids) ? (row.snapshotIds || row.snapshot_ids) : [],
    snapshotCount: normalizeNumber(row.snapshotCount ?? row.snapshot_count),
    recordCount: normalizeNumber(row.recordCount ?? row.record_count),
    fileName: normalizeText(row.fileName || row.file_name),
    checksum: normalizeText(row.checksum),
    exportReason: normalizeText(row.exportReason || row.export_reason),
    exportedAt: row.exportedAt || row.exported_at || '',
    requestContext: row.requestContext || row.request_context || {},
    downloadable: Boolean(row.downloadable ?? true),
    contextLabel: normalizeText(row.contextLabel || row.context_label),
    raw: row,
  }
}

function normalizeExportListPayload(payload = {}) {
  const items = Array.isArray(payload.items) ? payload.items : []

  return {
    items: items.map(normalizeExportRecord),
    pagination: payload.pagination || {},
  }
}

function normalizeExportAnalyticsPayload(payload = {}) {
  return {
    overview: payload.overview || {},
    actorCounts: Array.isArray(payload.actorCounts) ? payload.actorCounts : [],
    sourceCounts: payload.sourceCounts || {},
    exportTrend: Array.isArray(payload.exportTrend) ? payload.exportTrend : [],
    recentSnapshotCount: normalizeNumber(payload.recentSnapshotCount),
  }
}

function normalizeExportDetailPayload(payload = {}) {
  return {
    record: normalizeExportRecord(payload.record || {}),
    includedSnapshots: Array.isArray(payload.includedSnapshots) ? payload.includedSnapshots.map(normalizeSnapshot) : [],
    includedSnapshotIds: Array.isArray(payload.includedSnapshotIds) ? payload.includedSnapshotIds : [],
    includedSnapshotCount: normalizeNumber(payload.includedSnapshotCount),
    auditTrail: Array.isArray(payload.auditTrail) ? payload.auditTrail : [],
  }
}

function normalizeComparisonOptionsPayload(payload = {}) {
  return {
    comparisonModes: Array.isArray(payload.comparisonModes) ? payload.comparisonModes : [],
    metricGroups: Array.isArray(payload.metricGroups) ? payload.metricGroups : [],
    filters: payload.filters || {},
  }
}

function normalizeComparisonPayload(payload = {}) {
  return {
    comparisonMode: normalizeText(payload.comparisonMode),
    left: payload.left || {},
    right: payload.right || {},
    metrics: Array.isArray(payload.metrics) ? payload.metrics : [],
    trend: payload.trend || {},
  }
}

function normalizeTimelinePayload(payload = {}) {
  const items = Array.isArray(payload.items) ? payload.items : payload || []

  return items.map((item) => ({
    id: item.id ?? '',
    eventType: normalizeText(item.eventType || item.event_type),
    source: normalizeText(item.source),
    title: normalizeText(item.title),
    description: normalizeText(item.description),
    actor: normalizePerson(item.actor || null),
    context: item.context || {},
    recordedAt: item.recordedAt || item.recorded_at || '',
    raw: item,
  }))
}

export async function fetchExportGovernanceHistory(params = {}, options = {}) {
  const perPage = normalizePerPage(params.perPage ?? 20, 20, 100)
  const response = await http.get('/preschool/report-exports', {
    params: buildQueryParams({
      page: params.page ?? 1,
      per_page: perPage,
      export_type: params.exportType || '',
      export_format: params.exportFormat || '',
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
      report_period_id: params.reportPeriodId || '',
      actor_user_id: params.actorUserId || '',
      source: params.source || '',
      exported_from: params.exportedFrom || '',
      exported_to: params.exportedTo || '',
      search: params.search || '',
    }),
    signal: options.signal,
  })

  return normalizeExportListPayload(unwrapApiData(response) || {})
}

export async function fetchExportGovernanceAnalytics(params = {}, options = {}) {
  const response = await http.get('/preschool/report-exports/analytics', {
    params: buildQueryParams({
      export_type: params.exportType || '',
      export_format: params.exportFormat || '',
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
      report_period_id: params.reportPeriodId || '',
      actor_user_id: params.actorUserId || '',
      source: params.source || '',
      exported_from: params.exportedFrom || '',
      exported_to: params.exportedTo || '',
      search: params.search || '',
    }),
    signal: options.signal,
  })

  return normalizeExportAnalyticsPayload(unwrapApiData(response) || {})
}

export async function fetchExportGovernanceRecord(exportId, options = {}) {
  const response = await http.get(`/preschool/report-exports/${encodeURIComponent(String(exportId || '').trim())}`, {
    signal: options.signal,
  })

  return normalizeExportDetailPayload(unwrapApiData(response) || {})
}

export async function downloadExportGovernanceCsv(exportId, options = {}) {
  const response = await http.get(`/preschool/report-exports/${encodeURIComponent(String(exportId || '').trim())}/download.csv`, {
    responseType: 'blob',
    signal: options.signal,
  })

  return response.data
}

export async function fetchExportGovernanceComparisonOptions(params = {}, options = {}) {
  const response = await http.get('/preschool/report-comparisons/options', {
    params: buildQueryParams({
      export_type: params.exportType || '',
      export_format: params.exportFormat || '',
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
      report_period_id: params.reportPeriodId || '',
      actor_user_id: params.actorUserId || '',
      source: params.source || '',
      exported_from: params.exportedFrom || '',
      exported_to: params.exportedTo || '',
      search: params.search || '',
    }),
    signal: options.signal,
  })

  return normalizeComparisonOptionsPayload(unwrapApiData(response) || {})
}

export async function compareExportGovernanceContexts(payload = {}, options = {}) {
  const response = await http.post('/preschool/report-comparisons', {
    comparison_mode: payload.comparisonMode || payload.comparison_mode || '',
    left_context: payload.leftContext || payload.left_context || {},
    right_context: payload.rightContext || payload.right_context || {},
  }, {
    signal: options.signal,
  })

  return normalizeComparisonPayload(unwrapApiData(response) || {})
}

export async function fetchExportGovernanceTimeline(params = {}, options = {}) {
  const response = await http.get('/preschool/institutional-timeline', {
    params: buildQueryParams({
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
      report_period_id: params.reportPeriodId || '',
      actor_user_id: params.actorUserId || '',
      export_type: params.exportType || '',
      export_format: params.exportFormat || '',
      source: params.source || '',
      limit: params.limit || 50,
    }),
    signal: options.signal,
  })

  return normalizeTimelinePayload(unwrapApiData(response) || {})
}
