import http from '@/services/http'
import { buildQueryParams, unwrapApiData, unwrapApiItems, unwrapApiPagination } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeStudent(row = {}) {
  const firstName = normalizeText(row.firstName || row.first_name)
  const lastName = normalizeText(row.lastName || row.last_name)
  const fullName = normalizeText(row.fullName || `${firstName} ${lastName}`)

  return {
    id: row.id ?? '',
    studentCode: normalizeText(row.studentCode || row.student_code),
    firstName,
    lastName,
    fullName,
    gender: normalizeText(row.gender),
    dateOfBirth: row.dateOfBirth || row.date_of_birth || '',
    phone: normalizeText(row.phone),
    email: normalizeText(row.email),
    schoolName: normalizeText(row.schoolName || row.school_name),
    gradeLevel: normalizeText(row.gradeLevel || row.grade_level),
    guardianName: normalizeText(row.guardianName || row.guardian_name),
    guardianPhone: normalizeText(row.guardianPhone || row.guardian_phone),
    address: normalizeText(row.address),
    status: normalizeText(row.status || 'active'),
    notes: normalizeText(row.notes),
    applicationsCount: Number(row.applicationsCount ?? row.applications_count ?? 0),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

function normalizeReview(row = {}) {
  return {
    id: row.id ?? '',
    applicationId: row.applicationId ?? row.application_id ?? '',
    reviewerUserId: row.reviewerUserId ?? row.reviewer_user_id ?? '',
    reviewerName: normalizeText(row.reviewerName || row.reviewer_name),
    score: row.score ?? null,
    recommendation: normalizeText(row.recommendation),
    reviewNote: normalizeText(row.reviewNote || row.review_note),
    reviewedAt: row.reviewedAt || row.reviewed_at || '',
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

function normalizeApplication(row = {}) {
  const student = row.student || row.student_data || {}

  return {
    id: row.id ?? '',
    applicationCode: normalizeText(row.applicationCode || row.application_code),
    scholarshipType: normalizeText(row.scholarshipType || row.scholarship_type),
    requestedAmount: Number(row.requestedAmount ?? row.requested_amount ?? 0),
    academicYear: normalizeText(row.academicYear || row.academic_year),
    submissionDate: row.submissionDate || row.submission_date || '',
    applicationStatus: normalizeText(row.applicationStatus || row.application_status || 'draft'),
    assignedReviewerUserId: row.assignedReviewerUserId ?? row.assigned_reviewer_user_id ?? '',
    assignedReviewerName: normalizeText(row.assignedReviewerName || row.assigned_reviewer_name),
    reviewedAt: row.reviewedAt || row.reviewed_at || '',
    approvedAt: row.approvedAt || row.approved_at || '',
    rejectedAt: row.rejectedAt || row.rejected_at || '',
    rejectionReason: normalizeText(row.rejectionReason || row.rejection_reason),
    notes: normalizeText(row.notes),
    student: student && typeof student === 'object' ? normalizeStudent(student) : null,
    reviews: Array.isArray(row.reviews) ? row.reviews.map(normalizeReview) : [],
    statusHistories: Array.isArray(row.statusHistories)
      ? row.statusHistories.map((history) => ({
          id: history.id ?? '',
          previousStatus: normalizeText(history.previousStatus || history.previous_status),
          newStatus: normalizeText(history.newStatus || history.new_status),
          changedByUserId: history.changedByUserId ?? history.changed_by_user_id ?? '',
          note: normalizeText(history.note),
          createdAt: history.createdAt || history.created_at || '',
        }))
      : [],
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

function resolveId(payloadOrId) {
  if (typeof payloadOrId === 'string' || typeof payloadOrId === 'number') {
    return String(payloadOrId).trim()
  }

  return String(payloadOrId?.id || '').trim()
}

function normalizeStudentListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeStudent),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function normalizeApplicationListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeApplication),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function normalizeReviewListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeReview),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

export async function fetchScholarshipDashboard(options = {}) {
  const response = await http.get('/scholarship/dashboard', {
    signal: options.signal,
  })

  return unwrapApiData(response) || {}
}

export async function fetchReviewerDashboard(options = {}) {
  const response = await http.get('/scholarship/reviewer/dashboard', {
    signal: options.signal,
  })

  return unwrapApiData(response) || {}
}

export async function fetchScholarshipStudents(
  { page = 1, perPage = 10, search = '', status = '', gradeLevel = '', gender = '', sortBy = 'created_at', sortDirection = 'desc' } = {},
  options = {},
) {
  const response = await http.get('/scholarship/students', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      status,
      grade_level: gradeLevel,
      gender,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }),
    signal: options.signal,
  })

  return normalizeStudentListResponse(response, page, perPage)
}

export async function fetchScholarshipStudent(id, options = {}) {
  const studentId = resolveId(id)
  if (!studentId) return null

  const response = await http.get(`/scholarship/students/${encodeURIComponent(studentId)}`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizeStudent(payload.student || payload)
}

export async function createScholarshipStudent(payload = {}) {
  const response = await http.post('/scholarship/students', payload)
  const data = unwrapApiData(response) || {}
  return normalizeStudent(data.student || data)
}

export async function updateScholarshipStudent(id, payload = {}) {
  const studentId = resolveId(id)
  if (!studentId) {
    throw new Error('Student id is required.')
  }

  const response = await http.post(`/scholarship/students/${encodeURIComponent(studentId)}`, {
    ...payload,
    _method: 'PUT',
  })

  const data = unwrapApiData(response) || {}
  return normalizeStudent(data.student || data)
}

export async function deleteScholarshipStudent(id) {
  const studentId = resolveId(id)
  if (!studentId) return false

  await http.delete(`/scholarship/students/${encodeURIComponent(studentId)}`)
  return true
}

export async function fetchScholarshipApplications(
  { page = 1, perPage = 10, search = '', status = '', scholarshipType = '', academicYear = '', studentId = '', reviewerUserId = '', sortBy = 'created_at', sortDirection = 'desc' } = {},
  options = {},
) {
  const response = await http.get('/scholarship/applications', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      status,
      scholarship_type: scholarshipType,
      academic_year: academicYear,
      student_id: studentId,
      assigned_reviewer_user_id: reviewerUserId,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }),
    signal: options.signal,
  })

  return normalizeApplicationListResponse(response, page, perPage)
}

export async function fetchReviewerApplications(
  { page = 1, perPage = 10, search = '', status = '' } = {},
  options = {},
) {
  const response = await http.get('/scholarship/reviewer/my-applications', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      status,
    }),
    signal: options.signal,
  })

  return normalizeApplicationListResponse(response, page, perPage)
}

export async function fetchScholarshipApplication(id, options = {}) {
  const applicationId = resolveId(id)
  if (!applicationId) return null

  const response = await http.get(`/scholarship/applications/${encodeURIComponent(applicationId)}`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizeApplication(payload.application || payload)
}

export async function createScholarshipApplication(payload = {}) {
  const response = await http.post('/scholarship/applications', payload)
  const data = unwrapApiData(response) || {}
  return normalizeApplication(data.application || data)
}

export async function updateScholarshipApplication(id, payload = {}) {
  const applicationId = resolveId(id)
  if (!applicationId) {
    throw new Error('Application id is required.')
  }

  const response = await http.post(`/scholarship/applications/${encodeURIComponent(applicationId)}`, {
    ...payload,
    _method: 'PUT',
  })

  const data = unwrapApiData(response) || {}
  return normalizeApplication(data.application || data)
}

export async function deleteScholarshipApplication(id) {
  const applicationId = resolveId(id)
  if (!applicationId) return false

  await http.delete(`/scholarship/applications/${encodeURIComponent(applicationId)}`)
  return true
}

export async function approveScholarshipApplication(id, payload = {}) {
  const applicationId = resolveId(id)
  const response = await http.patch(`/scholarship/applications/${encodeURIComponent(applicationId)}/approve`, payload)
  const data = unwrapApiData(response) || {}
  return normalizeApplication(data.application || data)
}

export async function rejectScholarshipApplication(id, payload = {}) {
  const applicationId = resolveId(id)
  const response = await http.patch(`/scholarship/applications/${encodeURIComponent(applicationId)}/reject`, payload)
  const data = unwrapApiData(response) || {}
  return normalizeApplication(data.application || data)
}

export async function updateScholarshipApplicationStatus(id, payload = {}) {
  const applicationId = resolveId(id)
  const response = await http.patch(`/scholarship/applications/${encodeURIComponent(applicationId)}/status`, payload)
  const data = unwrapApiData(response) || {}
  return normalizeApplication(data.application || data)
}

export async function fetchScholarshipReviews(
  { page = 1, perPage = 10, search = '', recommendation = '' } = {},
  options = {},
) {
  const response = await http.get('/scholarship/reviews', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      recommendation,
    }),
    signal: options.signal,
  })

  return normalizeReviewListResponse(response, page, perPage)
}

export async function createScholarshipReview(payload = {}) {
  const response = await http.post('/scholarship/reviews', payload)
  const data = unwrapApiData(response) || {}
  return normalizeReview(data.review || data)
}

export async function updateScholarshipReview(id, payload = {}) {
  const reviewId = resolveId(id)
  const response = await http.post(`/scholarship/reviews/${encodeURIComponent(reviewId)}`, {
    ...payload,
    _method: 'PUT',
  })
  const data = unwrapApiData(response) || {}
  return normalizeReview(data.review || data)
}
