// Keep snapshot archive HTTP calls separate from live report rendering so
// immutable historical reports can be browsed and exported without mixing the
// archive contract into the operational report pages.
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

  const displayName = normalizeText(row.displayName || `${row.firstName || ''} ${row.lastName || ''}`)

  return {
    id: row.id ?? '',
    firstName: normalizeText(row.firstName || row.first_name),
    lastName: normalizeText(row.lastName || row.last_name),
    displayName,
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
    label: normalizeText(row.label || row.name || row.periodLabel),
    name: normalizeText(row.name),
    status: normalizeText(row.status || ''),
    raw: row,
  }
}

function normalizeSummary(row = {}) {
  return {
    finalizedAssessments: normalizeNumber(row.finalizedAssessments ?? row.finalized_assessments),
    averageScore: row.averageScore ?? row.average_score ?? null,
    latestAssessmentDate: row.latestAssessmentDate || row.latest_assessment_date || '',
    observationCount: normalizeNumber(row.observationCount ?? row.observation_count),
    studentCount: normalizeNumber(row.studentCount ?? row.student_count),
    attendanceCount: normalizeNumber(row.attendanceCount ?? row.attendance_count),
    presentCount: normalizeNumber(row.presentCount ?? row.present_count),
    lateCount: normalizeNumber(row.lateCount ?? row.late_count),
    absentCount: normalizeNumber(row.absentCount ?? row.absent_count),
    excusedCount: normalizeNumber(row.excusedCount ?? row.excused_count),
    categories: Array.isArray(row.categories) ? row.categories : [],
    studentSummaries: Array.isArray(row.studentSummaries) ? row.studentSummaries : [],
    raw: row,
  }
}

function normalizeAssessmentSummary(row = {}) {
  return {
    categoryCount: normalizeNumber(row.categoryCount ?? row.category_count),
    assessmentCount: normalizeNumber(row.assessmentCount ?? row.assessment_count),
    categories: Array.isArray(row.categories) ? row.categories : [],
    raw: row,
  }
}

function normalizeProgressSummary(row = {}) {
  return {
    studentCount: normalizeNumber(row.studentCount ?? row.student_count),
    finalizedAssessments: normalizeNumber(row.finalizedAssessments ?? row.finalized_assessments),
    averageScore: row.averageScore ?? row.average_score ?? null,
    observationCount: normalizeNumber(row.observationCount ?? row.observation_count),
    studentSummaries: Array.isArray(row.studentSummaries) ? row.studentSummaries : [],
    raw: row,
  }
}

function normalizeSnapshotItem(row = {}) {
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
    reportSummary: normalizeSummary(row.reportSummary || row.report_summary || {}),
    attendanceSummary: normalizeSummary(row.attendanceSummary || row.attendance_summary || {}),
    assessmentSummary: normalizeAssessmentSummary(row.assessmentSummary || row.assessment_summary || {}),
    progressSummary: normalizeProgressSummary(row.progressSummary || row.progress_summary || {}),
    summary: normalizeSummary(row.summary || {}),
    contextLabel: normalizeText(row.contextLabel || row.context_label),
    comparison: row.comparison || null,
    auditTrail: Array.isArray(row.auditTrail) ? row.auditTrail : [],
    raw: row,
  }
}

function normalizeAnalyticsPayload(payload = {}) {
  return {
    overview: payload.overview || {},
    typeCounts: Array.isArray(payload.typeCounts) ? payload.typeCounts : [],
    stateCounts: Array.isArray(payload.stateCounts) ? payload.stateCounts : [],
    academicYearCounts: Array.isArray(payload.academicYearCounts) ? payload.academicYearCounts : [],
    termCounts: Array.isArray(payload.termCounts) ? payload.termCounts : [],
    reportPeriodCounts: Array.isArray(payload.reportPeriodCounts) ? payload.reportPeriodCounts : [],
    classComparison: Array.isArray(payload.classComparison) ? payload.classComparison : [],
    generatedByCounts: Array.isArray(payload.generatedByCounts) ? payload.generatedByCounts : [],
    generatedTrend: Array.isArray(payload.generatedTrend) ? payload.generatedTrend : [],
  }
}

function normalizeListPayload(payload = {}) {
  const items = Array.isArray(payload.items) ? payload.items : []

  return {
    items: items.map(normalizeSnapshotItem),
    pagination: payload.pagination || {},
  }
}

export async function fetchSnapshotArchive(params = {}, options = {}) {
  const perPage = normalizePerPage(params.perPage ?? 20, 20, 100)
  const response = await http.get('/preschool/report-snapshots', {
    params: buildQueryParams({
      page: params.page ?? 1,
      per_page: perPage,
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
      report_period_id: params.reportPeriodId || '',
      class_id: params.classId || '',
      student_id: params.studentId || '',
      snapshot_type: params.snapshotType || '',
      lifecycle_state: params.lifecycleState || '',
      generated_from: params.generatedFrom || '',
      generated_to: params.generatedTo || '',
      generated_by: params.generatedBy || '',
      search: params.search || '',
    }),
    signal: options.signal,
  })

  return normalizeListPayload(unwrapApiData(response) || {})
}

export async function fetchSnapshotArchiveItem(snapshotId, options = {}) {
  const response = await http.get(`/preschool/report-snapshots/${encodeURIComponent(String(snapshotId || '').trim())}`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return {
    snapshot: normalizeSnapshotItem(payload.snapshot || {}),
    previousSnapshot: payload.previousSnapshot ? normalizeSnapshotItem(payload.previousSnapshot) : null,
    comparison: payload.comparison || null,
    auditTrail: Array.isArray(payload.auditTrail) ? payload.auditTrail : [],
  }
}

export async function fetchSnapshotArchiveAnalytics(params = {}, options = {}) {
  const response = await http.get('/preschool/report-snapshots/analytics', {
    params: buildQueryParams({
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
      report_period_id: params.reportPeriodId || '',
      class_id: params.classId || '',
      student_id: params.studentId || '',
      snapshot_type: params.snapshotType || '',
      lifecycle_state: params.lifecycleState || '',
      generated_from: params.generatedFrom || '',
      generated_to: params.generatedTo || '',
      generated_by: params.generatedBy || '',
    }),
    signal: options.signal,
  })

  return normalizeAnalyticsPayload(unwrapApiData(response) || {})
}

export async function exportSnapshotArchiveCsv(params = {}, options = {}) {
  const response = await http.get('/preschool/report-snapshots/export.csv', {
    params: buildQueryParams({
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
      report_period_id: params.reportPeriodId || '',
      class_id: params.classId || '',
      student_id: params.studentId || '',
      snapshot_type: params.snapshotType || '',
      lifecycle_state: params.lifecycleState || '',
      generated_from: params.generatedFrom || '',
      generated_to: params.generatedTo || '',
      generated_by: params.generatedBy || '',
      search: params.search || '',
    }),
    responseType: 'blob',
    signal: options.signal,
  })

  return response.data
}
