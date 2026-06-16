import { LIST_PAGINATION } from '../constants/governanceCasesConstants'

export function normalizeNullableBoolean(value: any): boolean | string {
  if (value === '' || value === null || typeof value === 'undefined') {
    return ''
  }

  return value === true || value === 'true' || value === 1 || value === '1'
}

export function toNullableNumber(value: any): number | null {
  if (value === '' || value === null || typeof value === 'undefined') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function normalizeAssigneeItem(item: any) {
  return {
    label: item.displayName || item.username || item.email || `#${item.id}`,
    value: item.id,
    raw: item,
  }
}

export function parseMetadataText(text: string): Record<string, any> {
  const value = String(text || '').trim()
  if (!value) {
    return {}
  }

  try {
    return JSON.parse(value)
  } catch {
    return { note: value }
  }
}

export function sourceContextPayload(form: Record<string, any> = {}) {
  return {
    academicYearId: form.academicYearId || '',
    termId: form.termId || '',
    reportPeriodId: form.reportPeriodId || '',
    classId: form.classId || '',
    studentId: form.studentId || '',
  }
}

export function buildListQuery(filters: Record<string, any>) {
  return {
    ...LIST_PAGINATION,
    academicYearId: filters.academicYearId,
    termId: filters.termId,
    reportPeriodId: filters.reportPeriodId,
    classId: filters.classId,
    studentId: filters.studentId,
    ownerUserId: filters.ownerUserId,
    reviewerUserId: filters.reviewerUserId,
    escalationOfficerUserId: filters.escalationOfficerUserId,
    status: filters.status,
    severity: filters.severity,
    sourceType: filters.sourceType,
    sourceReference: filters.sourceReference,
    isUrgent: filters.isUrgent,
    dueFrom: filters.dueFrom,
    dueTo: filters.dueTo,
    createdFrom: filters.createdFrom,
    createdTo: filters.createdTo,
    updatedFrom: filters.updatedFrom,
    updatedTo: filters.updatedTo,
    search: filters.search,
  }
}

export function buildCreatePayload(form: Record<string, any>) {
  return {
    title: form.title,
    summary: form.summary,
    source_type: form.sourceType,
    source_reference: form.sourceReference,
    source_context: sourceContextPayload(form),
    severity: form.severity,
    risk_score: toNullableNumber(form.riskScore) ?? 0,
    status: form.status,
    is_urgent: normalizeNullableBoolean(form.isUrgent),
    urgent_reason: form.urgentReason,
    owner_user_id: form.ownerUserId || null,
    reviewer_user_id: form.reviewerUserId || null,
    escalation_officer_user_id: form.escalationOfficerUserId || null,
    due_date: form.dueDate || null,
    academic_year_id: form.academicYearId || null,
    term_id: form.termId || null,
    report_period_id: form.reportPeriodId || null,
    class_id: form.classId || null,
    student_id: form.studentId || null,
    latest_note: form.latestNote,
    resolution_note: form.resolutionNote,
  }
}

export function buildAssignmentPayload(form: Record<string, any>) {
  return {
    owner_user_id: form.ownerUserId || null,
    reviewer_user_id: form.reviewerUserId || null,
    escalation_officer_user_id: form.escalationOfficerUserId || null,
    due_date: form.dueDate || null,
    status: form.status || null,
    note: form.note || null,
  }
}

export function buildEvidencePayload(form: Record<string, any>) {
  return {
    evidence_type: form.evidenceType,
    evidence_reference: form.evidenceReference || null,
    evidence_label: form.evidenceLabel || null,
    evidence_description: form.evidenceDescription || null,
    metadata: parseMetadataText(form.metadataText),
  }
}

export function buildResolutionPayload(form: Record<string, any>, action: string, assignmentForm: Record<string, any> = {}) {
  if (action === 'resolve') {
    return {
      resolution_note: form.resolutionNote,
    }
  }

  if (action === 'close') {
    return {
      note: form.closureNote,
    }
  }

  if (action === 'escalate') {
    return {
      reason: form.escalationReason || form.resolutionNote || '',
      escalation_officer_user_id: assignmentForm.escalationOfficerUserId || null,
      due_date: assignmentForm.dueDate || null,
    }
  }

  if (action === 'reopen') {
    return {
      reason: form.reopenReason,
    }
  }

  return {}
}

export function normalizeClassItem(item: any) {
  return {
    label: item.name || item.code || `#${item.id}`,
    value: item.id,
    raw: item,
  }
}

export function normalizeStudentItem(item: any) {
  return {
    label: `${item.fullName || item.name}${(item.publicId || item.studentCode) ? ` (${item.publicId || item.studentCode})` : ''}`,
    value: item.id,
    raw: item,
  }
}

export function normalizeReportPeriodItem(item: any) {
  return {
    label: `${item.label || item.periodLabel || item.period_label}${item.status ? ` (${item.status})` : ''}`,
    value: item.id,
    raw: item,
  }
}

export function initializeAssignmentFormFromRecord(record: any) {
  return {
    ownerUserId: record?.owner?.id || '',
    reviewerUserId: record?.reviewer?.id || '',
    escalationOfficerUserId: record?.escalationOfficer?.id || '',
    status: record?.status || '',
    dueDate: record?.dueDate || '',
    note: record?.latestNote || '',
  }
}

export function initializeResolutionFormFromRecord(record: any) {
  return {
    resolutionNote: record?.resolutionNote || '',
    closureNote: record?.latestNote || '',
    reopenReason: '',
    escalationReason: '',
  }
}

export function buildSourceLabelMap(t: any) {
  return {
    governance_diff: t('preschoolGovernanceCasesPage.sources.governanceDiff'),
    integrity_warning: t('preschoolGovernanceCasesPage.sources.integrityWarning'),
    export_mismatch: t('preschoolGovernanceCasesPage.sources.exportMismatch'),
    lifecycle_anomaly: t('preschoolGovernanceCasesPage.sources.lifecycleAnomaly'),
    reconstruction_inconsistency: t('preschoolGovernanceCasesPage.sources.reconstructionInconsistency'),
    manual_review: t('preschoolGovernanceCasesPage.sources.manualReview'),
  }
}

export function buildSeverityLabelMap(t: any) {
  return {
    low: t('preschoolGovernanceCasesPage.severities.low'),
    medium: t('preschoolGovernanceCasesPage.severities.medium'),
    high: t('preschoolGovernanceCasesPage.severities.high'),
    critical: t('preschoolGovernanceCasesPage.severities.critical'),
  }
}

export function buildStatusLabelMap(t: any) {
  return {
    open: t('preschoolGovernanceCasesPage.statuses.open'),
    under_review: t('preschoolGovernanceCasesPage.statuses.underReview'),
    investigating: t('preschoolGovernanceCasesPage.statuses.investigating'),
    awaiting_evidence: t('preschoolGovernanceCasesPage.statuses.awaitingEvidence'),
    escalated: t('preschoolGovernanceCasesPage.statuses.escalated'),
    resolved: t('preschoolGovernanceCasesPage.statuses.resolved'),
    closed: t('preschoolGovernanceCasesPage.statuses.closed'),
  }
}
