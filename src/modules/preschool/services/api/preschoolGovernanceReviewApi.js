// Governance review and institutional reconstruction stay separate from live
// report editing so admins can inspect immutable history without mutating
// operational Preschool records.
import http from '@/services/http'
import { buildQueryParams, unwrapApiData } from '@/services/api'

function normalizePerson(row = {}) {
  if (!row || typeof row !== 'object') {
    return null
  }

  return {
    id: row.id ?? '',
    firstName: row.firstName || row.first_name || '',
    lastName: row.lastName || row.last_name || '',
    displayName: row.displayName || `${row.firstName || row.first_name || ''} ${row.lastName || row.last_name || ''}`.trim(),
    roleCode: row.roleCode || row.role_code || '',
    raw: row,
  }
}

function normalizeEvent(row = {}) {
  if (!row || typeof row !== 'object') {
    return null
  }

  return {
    id: row.id ?? '',
    source: row.source || '',
    actionType: row.actionType || row.action_type || '',
    entityType: row.entityType || row.entity_type || '',
    entityId: row.entityId || row.entity_id || '',
    title: row.title || '',
    description: row.description || '',
    actor: normalizePerson(row.actor || null),
    context: row.context || {},
    previousState: row.previousState || row.previous_state || null,
    newState: row.newState || row.new_state || null,
    recordedAt: row.recordedAt || row.recorded_at || '',
    raw: row,
  }
}

function normalizeReviewPayload(payload = {}) {
  return {
    overview: payload.overview || {},
    overrideReview: Array.isArray(payload.overrideReview) ? payload.overrideReview.map(normalizeEvent) : [],
    blockedWriteReview: Array.isArray(payload.blockedWriteReview) ? payload.blockedWriteReview.map(normalizeEvent) : [],
    exportReview: Array.isArray(payload.exportReview) ? payload.exportReview.map(normalizeEvent) : [],
    anomalyReview: payload.anomalyReview || {},
    integrityReview: payload.integrityReview || {},
    retentionReview: payload.retentionReview || {},
    timeline: Array.isArray(payload.timeline) ? payload.timeline.map(normalizeEvent) : [],
  }
}

function normalizeAnalyticsPayload(payload = {}) {
  return {
    overview: payload.overview || {},
    overrideActorCounts: Array.isArray(payload.overrideActorCounts) ? payload.overrideActorCounts : [],
    exportActorCounts: Array.isArray(payload.exportActorCounts) ? payload.exportActorCounts : [],
    blockedWriteTrend: Array.isArray(payload.blockedWriteTrend) ? payload.blockedWriteTrend : [],
    replayEventCounts: Array.isArray(payload.replayEventCounts) ? payload.replayEventCounts : [],
    retentionSummary: payload.retentionSummary || {},
  }
}

function normalizeReconstructionPayload(payload = {}) {
  return {
    context: payload.context || {},
    summary: payload.summary || {},
    academicContext: payload.academicContext || {},
    historicalState: payload.historicalState || {},
    timeline: Array.isArray(payload.timeline) ? payload.timeline.map(normalizeEvent) : [],
    references: payload.references || {},
  }
}

function normalizeReplayPayload(payload = {}) {
  return {
    items: Array.isArray(payload.items) ? payload.items.map(normalizeEvent) : [],
    overview: payload.overview || {},
    timeline: Array.isArray(payload.timeline) ? payload.timeline.map(normalizeEvent) : [],
    summary: payload.summary || {},
  }
}

export async function fetchGovernanceReview(params = {}, options = {}) {
  const response = await http.get('/preschool/governance-review', {
    params: buildQueryParams({
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
      report_period_id: params.reportPeriodId || '',
      class_id: params.classId || '',
      student_id: params.studentId || '',
      actor_user_id: params.actorUserId || '',
      action_type: params.actionType || '',
      entity_type: params.entityType || '',
      entity_id: params.entityId || '',
      export_type: params.exportType || '',
      export_format: params.exportFormat || '',
      source: params.source || '',
      generated_from: params.generatedFrom || '',
      generated_to: params.generatedTo || '',
      search: params.search || '',
    }),
    signal: options.signal,
  })

  return normalizeReviewPayload(unwrapApiData(response) || {})
}

export async function fetchGovernanceReviewAnalytics(params = {}, options = {}) {
  const response = await http.get('/preschool/governance-review/analytics', {
    params: buildQueryParams({
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
      report_period_id: params.reportPeriodId || '',
      class_id: params.classId || '',
      student_id: params.studentId || '',
      actor_user_id: params.actorUserId || '',
      action_type: params.actionType || '',
      entity_type: params.entityType || '',
      entity_id: params.entityId || '',
      export_type: params.exportType || '',
      export_format: params.exportFormat || '',
      source: params.source || '',
      generated_from: params.generatedFrom || '',
      generated_to: params.generatedTo || '',
      search: params.search || '',
    }),
    signal: options.signal,
  })

  return normalizeAnalyticsPayload(unwrapApiData(response) || {})
}

export async function fetchInstitutionalReconstruction(params = {}, options = {}) {
  const response = await http.get('/preschool/institutional-reconstruction', {
    params: buildQueryParams({
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
      report_period_id: params.reportPeriodId || '',
      class_id: params.classId || '',
      student_id: params.studentId || '',
      snapshot_type: params.snapshotType || '',
      lifecycle_state: params.lifecycleState || '',
      source: params.source || '',
      search: params.search || '',
    }),
    signal: options.signal,
  })

  return normalizeReconstructionPayload(unwrapApiData(response) || {})
}

export async function fetchInstitutionalReconstructionContext(context, params = {}, options = {}) {
  const response = await http.get(`/preschool/institutional-reconstruction/${encodeURIComponent(String(context || '').trim())}`, {
    params: buildQueryParams({
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
      report_period_id: params.reportPeriodId || '',
      class_id: params.classId || '',
      student_id: params.studentId || '',
      snapshot_type: params.snapshotType || '',
      lifecycle_state: params.lifecycleState || '',
      source: params.source || '',
      search: params.search || '',
    }),
    signal: options.signal,
  })

  return normalizeReconstructionPayload(unwrapApiData(response) || {})
}

export async function fetchInstitutionalReplay(params = {}, options = {}) {
  const response = await http.get('/preschool/institutional-replay', {
    params: buildQueryParams({
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
      report_period_id: params.reportPeriodId || '',
      class_id: params.classId || '',
      student_id: params.studentId || '',
      actor_user_id: params.actorUserId || '',
      action_type: params.actionType || '',
      source: params.source || '',
      search: params.search || '',
    }),
    signal: options.signal,
  })

  return normalizeReplayPayload(unwrapApiData(response) || {})
}
