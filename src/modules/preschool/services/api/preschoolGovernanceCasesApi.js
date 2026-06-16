// Governance case requests stay separate from live report editing so admins
// can manage institutional review work without mutating immutable history.
import http from '@/services/http'
import { buildQueryParams, unwrapApiData } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeUser(row = {}) {
  if (!row || typeof row !== 'object') return null

  return {
    id: row.id ?? '',
    firstName: normalizeText(row.firstName || row.first_name),
    lastName: normalizeText(row.lastName || row.last_name),
    displayName: normalizeText(row.displayName || row.name || `${row.firstName || row.first_name || ''} ${row.lastName || row.last_name || ''}`),
    username: normalizeText(row.username),
    email: normalizeText(row.email),
    roleCode: normalizeText(row.roleCode || row.role_code),
    status: normalizeText(row.status),
    raw: row,
  }
}

function normalizeEntity(row = {}) {
  if (!row || typeof row !== 'object') return null

  return {
    id: row.id ?? '',
    code: normalizeText(row.code),
    label: normalizeText(row.label || row.name),
    name: normalizeText(row.name || row.label),
    status: normalizeText(row.status),
    raw: row,
  }
}

function normalizeCaseRecord(row = {}) {
  if (!row || typeof row !== 'object') return null

  return {
    id: row.id ?? '',
    caseKey: normalizeText(row.caseKey || row.case_key),
    title: normalizeText(row.title),
    summary: normalizeText(row.summary),
    sourceType: normalizeText(row.sourceType || row.source_type),
    sourceReference: normalizeText(row.sourceReference || row.source_reference),
    sourceContext: row.sourceContext || row.source_context || {},
    severity: normalizeText(row.severity || 'medium').toLowerCase(),
    riskScore: Number(row.riskScore ?? row.risk_score ?? 0),
    status: normalizeText(row.status || 'open').toLowerCase(),
    isUrgent: Boolean(row.isUrgent ?? row.is_urgent),
    urgentReason: normalizeText(row.urgentReason || row.urgent_reason),
    owner: normalizeUser(row.owner || null),
    reviewer: normalizeUser(row.reviewer || null),
    escalationOfficer: normalizeUser(row.escalationOfficer || row.escalation_officer || null),
    dueDate: row.dueDate || row.due_date || '',
    academicYear: normalizeEntity(row.academicYear || row.academic_year || null),
    term: normalizeEntity(row.term || null),
    reportPeriod: normalizeEntity(row.reportPeriod || row.report_period || null),
    class: normalizeEntity(row.class || row.preschoolClass || row.preschool_class || null),
    student: normalizeEntity(row.student || null),
    createdBy: normalizeUser(row.createdBy || row.created_by || null),
    resolvedBy: normalizeUser(row.resolvedBy || row.resolved_by || null),
    closedBy: normalizeUser(row.closedBy || row.closed_by || null),
    resolvedAt: row.resolvedAt || row.resolved_at || '',
    closedAt: row.closedAt || row.closed_at || '',
    resolutionNote: normalizeText(row.resolutionNote || row.resolution_note),
    latestNote: normalizeText(row.latestNote || row.latest_note),
    eventsCount: Number(row.eventsCount ?? row.events_count ?? 0),
    evidenceCount: Number(row.evidenceCount ?? row.evidence_count ?? 0),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

function normalizeEvent(row = {}) {
  return {
    id: row.id ?? '',
    eventType: normalizeText(row.eventType || row.event_type),
    actorUserId: row.actorUserId ?? row.actor_user_id ?? '',
    actorRole: normalizeText(row.actorRole || row.actor_role),
    previousStatus: normalizeText(row.previousStatus || row.previous_status),
    newStatus: normalizeText(row.newStatus || row.new_status),
    note: normalizeText(row.note),
    metadata: row.metadata || {},
    actor: normalizeUser(row.actor || null),
    recordedAt: row.recordedAt || row.recorded_at || '',
    raw: row,
  }
}

function normalizeEvidence(row = {}) {
  return {
    id: row.id ?? '',
    evidenceType: normalizeText(row.evidenceType || row.evidence_type),
    evidenceReference: normalizeText(row.evidenceReference || row.evidence_reference),
    evidenceLabel: normalizeText(row.evidenceLabel || row.evidence_label),
    evidenceDescription: normalizeText(row.evidenceDescription || row.evidence_description),
    metadata: row.metadata || {},
    creator: normalizeUser(row.creator || null),
    recordedAt: row.recordedAt || row.recorded_at || '',
    raw: row,
  }
}

function normalizeDetailPayload(payload = {}) {
  return {
    record: normalizeCaseRecord(payload.record || {}),
    events: Array.isArray(payload.events) ? payload.events.map(normalizeEvent) : [],
    evidence: Array.isArray(payload.evidence) ? payload.evidence.map(normalizeEvidence) : [],
    timeline: Array.isArray(payload.timeline) ? payload.timeline.map((row) => ({
      id: row.id ?? '',
      source: normalizeText(row.source),
      eventType: normalizeText(row.eventType || row.event_type),
      actionType: normalizeText(row.actionType || row.action_type),
      entityType: normalizeText(row.entityType || row.entity_type),
      entityId: normalizeText(row.entityId || row.entity_id),
      title: normalizeText(row.title),
      description: normalizeText(row.description),
      previousStatus: normalizeText(row.previousStatus || row.previous_status),
      newStatus: normalizeText(row.newStatus || row.new_status),
      actor: normalizeUser(row.actor || null),
      context: row.context || {},
      recordedAt: row.recordedAt || row.recorded_at || '',
      raw: row,
    })) : [],
    summary: payload.summary || {},
    options: payload.options || {},
  }
}

function normalizeListPayload(payload = {}) {
  return {
    items: Array.isArray(payload.items) ? payload.items.map(normalizeCaseRecord) : [],
    pagination: payload.pagination || {},
    summary: payload.summary || {},
    options: payload.options || {},
  }
}

function normalizeAssigneePayload(payload = {}) {
  return {
    items: Array.isArray(payload.items) ? payload.items.map(normalizeUser) : [],
  }
}

async function requestJson(method, url, data = {}, options = {}) {
  const response = await http.request({
    method,
    url,
    data,
    params: method.toLowerCase() === 'get' ? buildQueryParams(data) : undefined,
    signal: options.signal,
  })

  return unwrapApiData(response) || {}
}

export async function fetchGovernanceCases(params = {}, options = {}) {
  return normalizeListPayload(await requestJson('get', '/preschool/governance-cases', {
    page: params.page ?? 1,
    per_page: params.perPage ?? 20,
    academic_year_id: params.academicYearId || '',
    term_id: params.termId || '',
    report_period_id: params.reportPeriodId || '',
    class_id: params.classId || '',
    student_id: params.studentId || '',
    owner_user_id: params.ownerUserId || '',
    reviewer_user_id: params.reviewerUserId || '',
    escalation_officer_user_id: params.escalationOfficerUserId || '',
    status: params.status || '',
    severity: params.severity || '',
    source_type: params.sourceType || '',
    source_reference: params.sourceReference || '',
    is_urgent: params.isUrgent ?? '',
    due_from: params.dueFrom || '',
    due_to: params.dueTo || '',
    created_from: params.createdFrom || '',
    created_to: params.createdTo || '',
    updated_from: params.updatedFrom || '',
    updated_to: params.updatedTo || '',
    search: params.search || '',
  }, options))
}

export async function fetchGovernanceCase(caseId, options = {}) {
  return normalizeDetailPayload(await requestJson('get', `/preschool/governance-cases/${encodeURIComponent(String(caseId || '').trim())}`, {}, options))
}

export async function fetchGovernanceCaseAssignees(params = {}, options = {}) {
  return normalizeAssigneePayload(await requestJson('get', '/preschool/governance-cases/assignees', {
    search: params.search || '',
  }, options))
}

export async function createGovernanceCase(payload = {}, options = {}) {
  return normalizeDetailPayload(await requestJson('post', '/preschool/governance-cases', payload, options))
}

export async function updateGovernanceCase(caseId, payload = {}, options = {}) {
  return normalizeDetailPayload(await requestJson('patch', `/preschool/governance-cases/${encodeURIComponent(String(caseId || '').trim())}`, payload, options))
}

export async function assignGovernanceCase(caseId, payload = {}, options = {}) {
  return normalizeDetailPayload(await requestJson('post', `/preschool/governance-cases/${encodeURIComponent(String(caseId || '').trim())}/assign`, payload, options))
}

export async function addGovernanceCaseEvidence(caseId, payload = {}, options = {}) {
  return normalizeDetailPayload(await requestJson('post', `/preschool/governance-cases/${encodeURIComponent(String(caseId || '').trim())}/evidence`, payload, options))
}

export async function escalateGovernanceCase(caseId, payload = {}, options = {}) {
  return normalizeDetailPayload(await requestJson('post', `/preschool/governance-cases/${encodeURIComponent(String(caseId || '').trim())}/escalate`, payload, options))
}

export async function resolveGovernanceCase(caseId, payload = {}, options = {}) {
  return normalizeDetailPayload(await requestJson('post', `/preschool/governance-cases/${encodeURIComponent(String(caseId || '').trim())}/resolve`, payload, options))
}

export async function closeGovernanceCase(caseId, payload = {}, options = {}) {
  return normalizeDetailPayload(await requestJson('post', `/preschool/governance-cases/${encodeURIComponent(String(caseId || '').trim())}/close`, payload, options))
}

export async function reopenGovernanceCase(caseId, payload = {}, options = {}) {
  return normalizeDetailPayload(await requestJson('post', `/preschool/governance-cases/${encodeURIComponent(String(caseId || '').trim())}/reopen`, payload, options))
}
