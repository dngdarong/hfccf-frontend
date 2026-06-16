// Governance diff requests stay separate from live report editing so admins
// can compare immutable historical states without mixing comparison data into
// the operational report contracts.
import http from '@/services/http'
import { buildQueryParams, unwrapApiData } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizePerson(row = {}) {
  if (!row || typeof row !== 'object') return null

  return {
    id: row.id ?? '',
    firstName: normalizeText(row.firstName || row.first_name),
    lastName: normalizeText(row.lastName || row.last_name),
    displayName: normalizeText(row.displayName || `${row.firstName || row.first_name || ''} ${row.lastName || row.last_name || ''}`),
    roleCode: normalizeText(row.roleCode || row.role_code),
    raw: row,
  }
}

function normalizeEntity(row = {}) {
  if (!row || typeof row !== 'object') return null

  return {
    id: row.id ?? '',
    code: normalizeText(row.code),
    label: normalizeText(row.label || row.name || row.periodLabel),
    name: normalizeText(row.name || row.label),
    status: normalizeText(row.status),
    raw: row,
  }
}

function normalizeSnapshot(row = {}) {
  if (!row || typeof row !== 'object') return null

  return {
    id: row.id ?? '',
    snapshotType: normalizeText(row.snapshotType || row.snapshot_type),
    lifecycleState: normalizeText(row.lifecycleState || row.lifecycle_state),
    snapshotVersion: normalizeNumber(row.snapshotVersion ?? row.snapshot_version),
    generatedAt: row.generatedAt || row.generated_at || '',
    lockedAt: row.lockedAt || row.locked_at || '',
    generatedByUserId: row.generatedByUserId ?? row.generated_by_user_id ?? '',
    generatedBy: normalizePerson(row.generatedBy || row.generated_by || null),
    academicYearId: row.academicYearId ?? row.academic_year_id ?? '',
    termId: row.termId ?? row.term_id ?? '',
    reportPeriodId: row.reportPeriodId ?? row.report_period_id ?? '',
    studentId: row.studentId ?? row.student_id ?? '',
    classId: row.classId ?? row.class_id ?? '',
    sourceStatus: normalizeText(row.sourceStatus || row.source_status || 'snapshot'),
    student: normalizeEntity(row.student || null),
    class: normalizeEntity(row.class || null),
    academicYear: normalizeEntity(row.academicYear || row.academic_year || null),
    term: normalizeEntity(row.term || null),
    reportPeriod: normalizeEntity(row.reportPeriod || row.report_period || null),
    reportSummary: row.reportSummary || row.report_summary || {},
    attendanceSummary: row.attendanceSummary || row.attendance_summary || {},
    assessmentSummary: row.assessmentSummary || row.assessment_summary || {},
    progressSummary: row.progressSummary || row.progress_summary || {},
    summary: row.summary || {},
    contextLabel: normalizeText(row.contextLabel || row.context_label),
    raw: row,
  }
}

function normalizeContext(row = {}) {
  return {
    contextType: normalizeText(row.contextType || row.context_type || ''),
    contextKey: normalizeText(row.contextKey || row.context_key || ''),
    reviewKey: normalizeText(row.reviewKey || row.review_key || ''),
    label: normalizeText(row.label || row.contextLabel || row.context_label),
    context: row.context || {},
    summary: row.summary || {},
    snapshots: Array.isArray(row.snapshots) ? row.snapshots.map(normalizeSnapshot) : [],
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    references: row.references || {},
    retentionReview: row.retentionReview || row.retention_review || {},
    raw: row,
  }
}

function normalizeWarning(row = {}) {
  return {
    key: normalizeText(row.key || row.code),
    severity: normalizeText(row.severity || 'LOW').toUpperCase(),
    source: normalizeText(row.source),
    message: normalizeText(row.message),
    reviewAction: normalizeText(row.reviewAction || row.review_action),
    reviewStatus: normalizeText(row.reviewStatus || row.review_status || 'open'),
    detectedAt: row.detectedAt || row.detected_at || '',
    raw: row,
  }
}

function normalizeDiffRow(row = {}) {
  return {
    section: normalizeText(row.section),
    entity: normalizeText(row.entity),
    field: normalizeText(row.field),
    previousValue: row.previousValue ?? row.previous_value ?? '',
    currentValue: row.currentValue ?? row.current_value ?? '',
    differenceType: normalizeText(row.differenceType || row.difference_type),
    severity: normalizeText(row.severity || 'LOW').toUpperCase(),
    governanceImpact: normalizeText(row.governanceImpact || row.governance_impact),
    reviewStatus: normalizeText(row.reviewStatus || row.review_status || 'open'),
    raw: row,
  }
}

function normalizeTimelineEvent(row = {}) {
  return {
    id: row.id ?? '',
    source: normalizeText(row.source),
    actionType: normalizeText(row.actionType || row.action_type),
    entityType: normalizeText(row.entityType || row.entity_type),
    entityId: normalizeText(row.entityId || row.entity_id),
    title: normalizeText(row.title),
    description: normalizeText(row.description),
    actor: normalizePerson(row.actor || null),
    context: row.context || {},
    recordedAt: row.recordedAt || row.recorded_at || row.createdAt || row.created_at || '',
    raw: row,
  }
}

function normalizeSummaryPayload(payload = {}) {
  return {
    overview: payload.overview || {},
    comparisonModes: Array.isArray(payload.comparisonModes) ? payload.comparisonModes : [],
    severityBands: Array.isArray(payload.severityBands) ? payload.severityBands : [],
    reviewActions: Array.isArray(payload.reviewActions) ? payload.reviewActions : [],
    retentionReview: payload.retentionReview || payload.retention_review || {},
    filters: payload.filters || {},
  }
}

function normalizeComparePayload(payload = {}) {
  return {
    comparisonMode: normalizeText(payload.comparisonMode || payload.comparison_mode),
    reviewKey: normalizeText(payload.reviewKey || payload.review_key),
    left: normalizeContext(payload.left || {}),
    right: normalizeContext(payload.right || {}),
    summary: payload.summary || {},
    rows: Array.isArray(payload.rows) ? payload.rows.map(normalizeDiffRow) : [],
    warnings: Array.isArray(payload.warnings) ? payload.warnings.map(normalizeWarning) : [],
    mismatches: Array.isArray(payload.mismatches) ? payload.mismatches.map(normalizeWarning) : [],
    integrityWarnings: Array.isArray(payload.integrityWarnings) ? payload.integrityWarnings.map(normalizeWarning) : [],
    riskScore: normalizeNumber(payload.riskScore ?? payload.risk_score),
    riskLevel: normalizeText(payload.riskLevel || payload.risk_level),
    timeline: Array.isArray(payload.timeline) ? payload.timeline.map(normalizeTimelineEvent) : [],
    auditEvidence: payload.auditEvidence || payload.audit_evidence || {},
    reviewStatus: normalizeText(payload.reviewStatus || payload.review_status || 'open'),
    reviewTrail: Array.isArray(payload.reviewTrail) ? payload.reviewTrail.map(normalizeTimelineEvent) : [],
  }
}

function normalizeIntegrityPayload(payload = {}) {
  return {
    context: normalizeContext(payload.context || {}),
    overview: payload.overview || {},
    warnings: Array.isArray(payload.warnings) ? payload.warnings.map(normalizeWarning) : [],
    mismatches: Array.isArray(payload.mismatches) ? payload.mismatches.map(normalizeWarning) : [],
    integrityWarnings: Array.isArray(payload.integrityWarnings) ? payload.integrityWarnings.map(normalizeWarning) : [],
    riskScore: normalizeNumber(payload.riskScore ?? payload.risk_score),
    riskLevel: normalizeText(payload.riskLevel || payload.risk_level),
    timeline: Array.isArray(payload.timeline) ? payload.timeline.map(normalizeTimelineEvent) : [],
    retentionReview: payload.retentionReview || payload.retention_review || {},
    reviewKey: normalizeText(payload.reviewKey || payload.review_key),
    reviewStatus: normalizeText(payload.reviewStatus || payload.review_status || 'open'),
    reviewTrail: Array.isArray(payload.reviewTrail) ? payload.reviewTrail.map(normalizeTimelineEvent) : [],
  }
}

function buildContextParams(prefix, context = {}) {
  return {
    [`${prefix}_context_type`]: context.contextType || '',
    [`${prefix}_snapshot_id`]: context.snapshotId || '',
    [`${prefix}_export_record_id`]: context.exportRecordId || '',
    [`${prefix}_academic_year_id`]: context.academicYearId || '',
    [`${prefix}_term_id`]: context.termId || '',
    [`${prefix}_report_period_id`]: context.reportPeriodId || '',
    [`${prefix}_class_id`]: context.classId || '',
    [`${prefix}_student_id`]: context.studentId || '',
    [`${prefix}_search`]: context.search || '',
  }
}

export async function fetchGovernanceDiffSummary(params = {}, options = {}) {
  const response = await http.get('/preschool/governance-diff/summary', {
    params: buildQueryParams({
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
      report_period_id: params.reportPeriodId || '',
      class_id: params.classId || '',
      student_id: params.studentId || '',
      export_type: params.exportType || '',
      export_format: params.exportFormat || '',
      source: params.source || '',
      search: params.search || '',
    }),
    signal: options.signal,
  })

  return normalizeSummaryPayload(unwrapApiData(response) || {})
}

export async function compareGovernanceDiffContexts(payload = {}, options = {}) {
  const response = await http.get('/preschool/governance-diff', {
    params: buildQueryParams({
      comparison_mode: payload.comparisonMode || payload.comparison_mode || '',
      metric_group: payload.metricGroup || payload.metric_group || '',
      ...buildContextParams('left', payload.leftContext || payload.left_context || {}),
      ...buildContextParams('right', payload.rightContext || payload.right_context || {}),
    }),
    signal: options.signal,
  })

  return normalizeComparePayload(unwrapApiData(response) || {})
}

export async function fetchIntegrityReview(params = {}, options = {}) {
  const response = await http.get('/preschool/integrity-review', {
    params: buildQueryParams({
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
      report_period_id: params.reportPeriodId || '',
      class_id: params.classId || '',
      student_id: params.studentId || '',
      export_type: params.exportType || '',
      export_format: params.exportFormat || '',
      source: params.source || '',
      search: params.search || '',
    }),
    signal: options.signal,
  })

  return normalizeIntegrityPayload(unwrapApiData(response) || {})
}

export async function fetchIntegrityReviewContext(context, params = {}, options = {}) {
  const response = await http.get(`/preschool/integrity-review/${encodeURIComponent(String(context || '').trim())}`, {
    params: buildQueryParams({
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
      report_period_id: params.reportPeriodId || '',
      class_id: params.classId || '',
      student_id: params.studentId || '',
      search: params.search || '',
    }),
    signal: options.signal,
  })

  return normalizeIntegrityPayload(unwrapApiData(response) || {})
}

export async function submitIntegrityReviewAction(context, payload = {}, options = {}) {
  const response = await http.post(`/preschool/integrity-review/${encodeURIComponent(String(context || '').trim())}`, {
    review_action: payload.reviewAction || payload.review_action || '',
    review_note: payload.reviewNote || payload.review_note || '',
    severity: payload.severity || '',
  }, {
    signal: options.signal,
  })

  return unwrapApiData(response) || {}
}
