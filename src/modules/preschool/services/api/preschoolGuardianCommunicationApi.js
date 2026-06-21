import http from '@/services/http'
import { buildQueryParams, unwrapApiData, normalizePerPage } from '@/services/api'

function resolveId(input) {
  if (input === null || input === undefined || input === '') {
    return ''
  }

  if (typeof input === 'object') {
    return String(input.id ?? input.studentId ?? input.guardianId ?? '')
  }

  return String(input)
}

function normalizeCommunication(item = {}) {
  return {
    id: item.id ?? '',
    studentId: item.studentId ?? item.student_id ?? '',
    studentName: String(item.studentName ?? item.student_name ?? '').trim(),
    guardianId: item.guardianId ?? item.guardian_id ?? '',
    guardianName: String(item.guardianName ?? item.guardian_name ?? '').trim(),
    sourceType: String(item.sourceType ?? item.source_type ?? '').trim(),
    sourceId: String(item.sourceId ?? item.source_id ?? '').trim(),
    communicationType: String(item.communicationType ?? item.communication_type ?? '').trim(),
    channel: String(item.channel ?? '').trim(),
    subject: String(item.subject ?? '').trim(),
    message: String(item.message ?? '').trim(),
    severity: String(item.severity ?? 'medium').trim(),
    status: String(item.status ?? 'draft').trim(),
    sentAt: item.sentAt ?? item.sent_at ?? '',
    acknowledgedAt: item.acknowledgedAt ?? item.acknowledged_at ?? '',
    failedAt: item.failedAt ?? item.failed_at ?? '',
    createdBy: item.createdBy ?? item.created_by ?? '',
    createdByName: String(item.createdByName ?? item.created_by_name ?? '').trim(),
    sourceLabel: String(item.sourceLabel ?? '').trim(),
    createdAt: item.createdAt ?? item.created_at ?? '',
    updatedAt: item.updatedAt ?? item.updated_at ?? '',
    raw: item,
  }
}

function normalizeTimelineResponse(payload = {}) {
  return {
    student: payload.student || null,
    guardian: payload.guardian || null,
    summary: payload.summary || {
      total: 0,
      queued: 0,
      sent: 0,
      acknowledged: 0,
      failed: 0,
      cancelled: 0,
    },
    items: Array.isArray(payload.items) ? payload.items.map(normalizeCommunication) : [],
    pagination: payload.pagination || null,
    raw: payload,
  }
}

export async function fetchGuardianCommunications(filters = {}, options = {}) {
  const response = await http.get('/preschool/guardian-communications', {
    params: buildQueryParams({
      search: filters.search || undefined,
      status: filters.status || undefined,
      channel: filters.channel || undefined,
      source_type: filters.sourceType || filters.source_type || undefined,
      communication_type: filters.communicationType || filters.communication_type || undefined,
      student_id: resolveId(filters.studentId || filters.student_id || ''),
      guardian_id: resolveId(filters.guardianId || filters.guardian_id || ''),
      page: filters.page ?? 1,
      per_page: normalizePerPage(filters.perPage ?? 20, 1, 100),
    }),
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return {
    items: Array.isArray(payload.items) ? payload.items.map(normalizeCommunication) : [],
    pagination: payload.pagination || null,
  }
}

export async function fetchStudentGuardianCommunications(studentId, filters = {}, options = {}) {
  const id = resolveId(studentId)
  if (!id) return normalizeTimelineResponse()

  const response = await http.get(`/preschool/students/${encodeURIComponent(id)}/guardian-communications`, {
    params: buildQueryParams({
      status: filters.status || undefined,
      channel: filters.channel || undefined,
      search: filters.search || undefined,
      page: filters.page ?? 1,
      per_page: normalizePerPage(filters.perPage ?? 10, 1, 100),
    }),
    signal: options.signal,
  })

  return normalizeTimelineResponse(unwrapApiData(response) || {})
}

export async function fetchGuardianTimeline(guardianId, filters = {}, options = {}) {
  const id = resolveId(guardianId)
  if (!id) return normalizeTimelineResponse()

  const response = await http.get(`/preschool/guardians/${encodeURIComponent(id)}/communications`, {
    params: buildQueryParams({
      status: filters.status || undefined,
      channel: filters.channel || undefined,
      search: filters.search || undefined,
      page: filters.page ?? 1,
      per_page: normalizePerPage(filters.perPage ?? 10, 1, 100),
    }),
    signal: options.signal,
  })

  return normalizeTimelineResponse(unwrapApiData(response) || {})
}

export async function createStudentGuardianCommunication(studentId, payload = {}) {
  const id = resolveId(studentId)
  if (!id) {
    throw new Error('Student id is required.')
  }

  const response = await http.post(`/preschool/students/${encodeURIComponent(id)}/guardian-communications`, payload)
  return normalizeCommunication(unwrapApiData(response)?.communication || {})
}

export async function markGuardianCommunicationSent(communicationId) {
  const id = resolveId(communicationId)
  if (!id) return null

  const response = await http.post(`/preschool/guardian-communications/${encodeURIComponent(id)}/sent`)
  return normalizeCommunication(unwrapApiData(response)?.communication || {})
}

export async function acknowledgeGuardianCommunication(communicationId) {
  const id = resolveId(communicationId)
  if (!id) return null

  const response = await http.post(`/preschool/guardian-communications/${encodeURIComponent(id)}/acknowledge`)
  return normalizeCommunication(unwrapApiData(response)?.communication || {})
}

export async function cancelGuardianCommunication(communicationId) {
  const id = resolveId(communicationId)
  if (!id) return null

  const response = await http.post(`/preschool/guardian-communications/${encodeURIComponent(id)}/cancel`)
  return normalizeCommunication(unwrapApiData(response)?.communication || {})
}
