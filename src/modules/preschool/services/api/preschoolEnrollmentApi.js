import http from '@/services/http'
import { buildQueryParams, unwrapApiData, normalizePerPage } from '@/services/api'

export async function fetchEnrollmentSummary(options = {}) {
  const res = await http.get('/preschool/enrollments/summary', options)
  return unwrapApiData(res)
}

export async function fetchEnrollments(params = {}, options = {}) {
  const query = buildQueryParams({
    status: params.status || undefined,
    search: params.search || undefined,
    level: params.level || undefined,
    academic_year_id: params.academicYearId || undefined,
    page: params.page ?? 1,
    per_page: normalizePerPage(params.perPage ?? 20, 20, 100),
  })
  const res = await http.get(`/preschool/enrollments?${query}`, options)
  return unwrapApiData(res)
}

export async function fetchEnrollment(id, options = {}) {
  const res = await http.get(`/preschool/enrollments/${id}`, options)
  return unwrapApiData(res)
}

export async function createEnrollment(payload, options = {}) {
  const res = await http.post('/preschool/enrollments', payload, options)
  return unwrapApiData(res)
}

export async function updateEnrollment(id, payload, options = {}) {
  const res = await http.patch(`/preschool/enrollments/${id}`, payload, options)
  return unwrapApiData(res)
}

export async function submitEnrollment(id, options = {}) {
  const res = await http.post(`/preschool/enrollments/${id}/submit`, {}, options)
  return unwrapApiData(res)
}

export async function reviewEnrollment(id, payload = {}, options = {}) {
  const res = await http.post(`/preschool/enrollments/${id}/review`, payload, options)
  return unwrapApiData(res)
}

export async function approveEnrollment(id, payload = {}, options = {}) {
  const res = await http.post(`/preschool/enrollments/${id}/approve`, payload, options)
  return unwrapApiData(res)
}

export async function rejectEnrollment(id, payload = {}, options = {}) {
  const res = await http.post(`/preschool/enrollments/${id}/reject`, payload, options)
  return unwrapApiData(res)
}

export async function waitlistEnrollment(id, payload = {}, options = {}) {
  const res = await http.post(`/preschool/enrollments/${id}/waitlist`, payload, options)
  return unwrapApiData(res)
}

export async function cancelEnrollment(id, payload = {}, options = {}) {
  const res = await http.post(`/preschool/enrollments/${id}/cancel`, payload, options)
  return unwrapApiData(res)
}

/**
 * Enroll an approved application, converting it to an active student record.
 * The response includes both the updated application and the auto-created
 * pending payment (null when no class was assigned).
 *
 * @param {string|number} id      - Enrollment application ID
 * @param {Object} [payload={}]
 * @param {number}  [payload.class_id]         - Class to enroll into
 * @param {number}  [payload.academic_year_id] - Override academic year
 * @param {number}  [payload.term_id]          - Override term
 * @param {Object} [options={}]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{application: Object, payment: Object|null}>}
 *   application — updated enrollment application (camelCase fields)
 *   payment     — auto-created pending payment, or null if no class was set
 * @throws {AxiosError} on network, auth, or validation failure
 */
export async function enrollStudent(id, payload = {}, options = {}) {
  // POST /preschool/enrollments/:id/enroll — returns application + payment summary
  const res = await http.post(`/preschool/enrollments/${id}/enroll`, payload, options)
  return unwrapApiData(res)
}

export async function updateEnrollmentDocument(applicationId, documentId, payload, options = {}) {
  const res = await http.patch(
    `/preschool/enrollments/${applicationId}/documents/${documentId}`,
    payload,
    options,
  )
  return unwrapApiData(res)
}
