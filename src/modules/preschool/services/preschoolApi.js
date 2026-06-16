import http from '@/services/http'
import { buildQueryParams, normalizePerPage, unwrapApiData, unwrapApiItems, unwrapApiPagination } from '@/services/api'
import { mapUser, mapUsers } from '@/services/mappers/userMapper'
import { fetchReportPeriods as fetchPreschoolReportPeriods } from '@/modules/preschool/services/api/preschoolReportsApi'
import {
  activateAcademicTerm,
  activateAcademicYear,
  closeAcademicTerm,
  closeAcademicYear,
  createAcademicTerm,
  createAcademicYear,
  fetchAcademicLifecycle,
  updateAcademicTerm,
  updateAcademicYear,
} from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeClassAssignmentRow(row = {}) {
  return {
    id: row.id ?? '',
    code: normalizeText(row.code || row.classCode),
    name: normalizeText(row.name || row.className),
    teacherUserId: row.teacherUserId ?? row.teacher_user_id ?? '',
    teacherDisplayName: normalizeText(row.teacherDisplayName || row.teacher_display_name || row.teacher || row.teacherName),
    status: normalizeText(row.status || 'active'),
    enrolledAt: row.enrolledAt || row.enrolled_at || '',
    academicYear: normalizeText(row.academicYear || row.academic_year),
    termLabel: normalizeText(row.termLabel || row.term_label),
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

function normalizeStudentAssignmentRow(row = {}) {
  return {
    id: row.id ?? '',
    studentCode: normalizeText(row.studentCode || row.student_code),
    fullName: normalizeText(row.fullName || row.full_name),
    status: normalizeText(row.status || 'active'),
    enrolledAt: row.enrolledAt || row.enrolled_at || '',
    academicYear: normalizeText(row.academicYear || row.academic_year),
    termLabel: normalizeText(row.termLabel || row.term_label),
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

function normalizeTeacherAssignmentRow(row = {}) {
  return {
    id: row.id ?? '',
    classId: row.classId ?? row.class_id ?? '',
    teacherUserId: row.teacherUserId ?? row.teacher_user_id ?? '',
    teacherDisplayName: normalizeText(row.teacherDisplayName || row.teacher_display_name),
    status: normalizeText(row.status || 'active'),
    assignedAt: row.assignedAt || row.assigned_at || '',
    academicYear: normalizeText(row.academicYear || row.academic_year),
    termLabel: normalizeText(row.termLabel || row.term_label),
    endedAt: row.endedAt || row.ended_at || '',
    notes: normalizeText(row.notes),
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

function normalizeClassRow(row = {}) {
  const studentAssignments = Array.isArray(row.studentAssignments) ? row.studentAssignments.map(normalizeStudentAssignmentRow) : []
  return {
    id: row.id ?? '',
    code: normalizeText(row.code || row.classCode),
    name: normalizeText(row.name || row.className),
    teacherUserId: row.teacherUserId ?? row.teacher_user_id ?? '',
    teacherDisplayName: normalizeText(
      row.teacherDisplayName || row.teacher_display_name || row.teacher || row.teacherName,
    ),
    teacher: normalizeText(
      row.teacherDisplayName || row.teacher_display_name || row.teacher || row.teacherName,
    ),
    level: normalizeText(row.level || row.grade),
    schedule: normalizeText(row.schedule || row.time),
    studentsCount: Number(row.studentsCount ?? row.students_count ?? studentAssignments.filter((item) => item.status === 'active').length ?? row.students ?? row.studentCount ?? 0),
    students: Number(row.studentsCount ?? row.students_count ?? studentAssignments.filter((item) => item.status === 'active').length ?? row.students ?? row.studentCount ?? 0),
    studentAssignments,
    activeStudentAssignments: Array.isArray(row.activeStudentAssignments)
      ? row.activeStudentAssignments.map(normalizeStudentAssignmentRow)
      : studentAssignments.filter((item) => item.status === 'active'),
    teacherAssignments: Array.isArray(row.teacherAssignments) ? row.teacherAssignments.map(normalizeTeacherAssignmentRow) : [],
    status: normalizeText(row.status || 'active'),
    room: normalizeText(row.room),
    notes: normalizeText(row.notes),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

function normalizeStudentRow(row = {}) {
  const firstName = normalizeText(row.firstName || row.first_name)
  const lastName = normalizeText(row.lastName || row.last_name)
  const fullName = normalizeText(row.fullName || row.full_name || `${firstName} ${lastName}`)
  const classAssignments = Array.isArray(row.classAssignments) ? row.classAssignments.map(normalizeClassAssignmentRow) : []
  const activeClasses = Array.isArray(row.classes) ? row.classes.map(normalizeClassAssignmentRow) : classAssignments.filter((item) => item.status === 'active')

  return {
    id: row.id ?? '',
    publicId: normalizeText(row.publicId || row.public_id),
    studentCode: normalizeText(row.studentCode || row.student_code),
    firstName,
    lastName,
    fullName,
    name: normalizeText(row.name || fullName),
    gender: normalizeText(row.gender),
    dateOfBirth: row.dateOfBirth || row.date_of_birth || '',
    guardianName: normalizeText(row.guardianName || row.guardian_name),
    guardianPhone: normalizeText(row.guardianPhone || row.guardian_phone),
    address: normalizeText(row.address),
    status: normalizeText(row.status || 'active'),
    studentType: normalizeText(row.studentType || row.student_type || 'paying'),
    avatarUrl: normalizeText(
      row.avatarUrl || row.avatar_url ||
      row.profile_photo_url || row.profilePhotoUrl ||
      row.profile_photo_path || row.profilePhotoPath ||
      row.photo_url || row.photoUrl ||
      row.image_url || row.imageUrl ||
      row.avatar || row.photo || row.image || row.thumbnail || '',
    ),
    classesCount: Number(row.classesCount ?? row.classes_count ?? activeClasses.length ?? 0),
    classes: activeClasses,
    classAssignments,
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

function normalizeAttendanceRow(row = {}) {
  return {
    id: row.id ?? '',
    classId: row.classId ?? row.class_id ?? '',
    className: normalizeText(row.className || row.class_name || row.preschoolClass?.name),
    studentId: row.studentId ?? row.student_id ?? '',
    studentName: normalizeText(row.studentName || row.student_name || row.student?.fullName || `${row.student?.first_name || ''} ${row.student?.last_name || ''}`),
    teacherId: row.teacherId ?? row.teacher_id ?? row.teacherUserId ?? row.teacher_user_id ?? '',
    teacherName: normalizeText(
      row.teacherName
      || row.teacher_name
      || row.teacherDisplayName
      || row.teacher_display_name
      || row.teacher?.fullName
      || row.teacher?.name,
    ),
    recordedByUserId: row.recordedByUserId ?? row.recorded_by_user_id ?? '',
    recordedByName: normalizeText(row.recordedByName || row.recorded_by_name || row.recordedBy?.name),
    attendanceDate: row.attendanceDate || row.attendance_date || '',
    status: normalizeText(row.status || ''),
    note: normalizeText(row.note),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

function normalizePaymentRow(row = {}) {
  return {
    id: row.id ?? '',
    studentId: row.studentId ?? row.student_id ?? '',
    studentName: normalizeText(row.studentName || row.student_name || row.student?.fullName || `${row.student?.first_name || ''} ${row.student?.last_name || ''}`),
    classId: row.classId ?? row.class_id ?? '',
    className: normalizeText(row.className || row.class_name || row.preschoolClass?.name),
    paymentReference: normalizeText(row.paymentReference || row.payment_reference),
    amount: Number(row.amount || 0),
    currency: normalizeText(row.currency || 'USD'),
    paymentMethod: normalizeText(row.paymentMethod || row.payment_method),
    paymentStatus: normalizeText(row.paymentStatus || row.payment_status),
    paidAt: row.paidAt || row.paid_at || '',
    dueDate: row.dueDate || row.due_date || '',
    note: normalizeText(row.note),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

function buildMultipartPayload(payload = {}, options = {}) {
  const formData = new FormData()
  const includePassword = Boolean(options.includePassword)
  const method = String(options.method || 'POST').toUpperCase()

  const appendIfPresent = (key, value) => {
    if (value === undefined || value === null) return
    if (value instanceof File) {
      formData.append(key, value)
      return
    }
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(`${key}[]`, item))
      return
    }
    formData.append(key, value)
  }

  Object.entries(payload).forEach(([key, value]) => {
    if (['avatar', 'profileImage', 'password', 'confirmPassword', 'removeAvatar', 'studentIds', 'classIds'].includes(key)) {
      return
    }
    appendIfPresent(key, value)
  })

  if (includePassword && normalizeText(payload.password)) {
    formData.append('password', payload.password)
    formData.append('password_confirmation', payload.confirmPassword || payload.password)
  }

  const avatar = payload.avatar instanceof File ? payload.avatar : payload.profileImage instanceof File ? payload.profileImage : null
  if (avatar) {
    formData.append('avatar', avatar)
  } else if (payload.removeAvatar || payload.remove_avatar) {
    formData.append('remove_avatar', '1')
  }

  const studentIds = Array.isArray(payload.studentIds) ? payload.studentIds : Array.isArray(payload.student_ids) ? payload.student_ids : null
  if (studentIds) {
    studentIds.forEach((studentId) => formData.append('student_ids[]', studentId))
  }

  const classIds = Array.isArray(payload.classIds) ? payload.classIds : Array.isArray(payload.class_ids) ? payload.class_ids : null
  if (classIds) {
    classIds.forEach((classId) => formData.append('class_ids[]', classId))
  }

  if (method === 'PUT') {
    formData.append('_method', 'PUT')
  }

  return formData
}

function normalizeTeacherListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)
  return {
    items: mapUsers(items),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function normalizeClassListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)
  return {
    items: items.map(normalizeClassRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function normalizeStudentListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)
  return {
    items: items.map(normalizeStudentRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function normalizeAttendanceListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)
  return {
    items: items.map(normalizeAttendanceRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function normalizePaymentListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)
  return {
    items: items.map(normalizePaymentRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function resolveId(payloadOrId) {
  if (typeof payloadOrId === 'string' || typeof payloadOrId === 'number') {
    return String(payloadOrId).trim()
  }
  return String(payloadOrId?.id || '').trim()
}

export async function fetchPreschoolDashboard(options = {}) {
  const response = await http.get('/preschool/dashboard', {
    signal: options.signal,
  })

  return unwrapApiData(response) || {}
}

export async function fetchReportPeriods(params = {}, options = {}) {
  return fetchPreschoolReportPeriods(params, options)
}

function normalizePreschoolSettingsSnapshot(payload = {}) {
  const academicYear = payload.academicYear || {}
  const terms = Array.isArray(payload.terms) ? payload.terms : []

  return {
    academicYear: {
      currentAcademicYear: normalizeText(academicYear.currentAcademicYear || academicYear.current_academic_year),
      startDate: academicYear.startDate || academicYear.start_date || '',
      endDate: academicYear.endDate || academicYear.end_date || '',
      status: normalizeText(academicYear.status || 'active'),
    },
    terms: terms.map((term, index) => ({
      id: term.id || term.key || `term-${index + 1}`,
      name: normalizeText(term.name),
      startDate: term.startDate || term.start_date || '',
      endDate: term.endDate || term.end_date || '',
      status: normalizeText(term.status || 'active'),
    })),
    classConfigurations: Array.isArray(payload.classConfigurations)
      ? payload.classConfigurations.map((item, index) => ({
        id: item.id || item.key || `class-${index + 1}`,
        classLevel: normalizeText(item.classLevel || item.class_level),
        capacity: Number(item.capacity ?? 0),
        assignedTeacher: normalizeText(item.assignedTeacher || item.assigned_teacher),
        room: normalizeText(item.room),
        status: normalizeText(item.status || 'active'),
      }))
      : [],
    attendance: {
      markingWindow: normalizeText(payload.attendance?.markingWindow || payload.attendance?.marking_window),
      lateThreshold: Number(payload.attendance?.lateThreshold ?? payload.attendance?.late_threshold ?? 0),
      absenceRule: normalizeText(payload.attendance?.absenceRule || payload.attendance?.absence_rule),
      teacherCanEditAttendance: Boolean(payload.attendance?.teacherCanEditAttendance ?? payload.attendance?.teacher_can_edit_attendance),
    },
    assessment: {
      assessmentCycle: normalizeText(payload.assessment?.assessmentCycle || payload.assessment?.assessment_cycle),
      finalizationMode: normalizeText(payload.assessment?.finalizationMode || payload.assessment?.finalization_mode),
      defaultTemplate: normalizeText(payload.assessment?.defaultTemplate || payload.assessment?.default_template),
      requireTeacherNotes: Boolean(payload.assessment?.requireTeacherNotes ?? payload.assessment?.require_teacher_notes),
    },
    schedule: {
      weeklyMode: normalizeText(payload.schedule?.weeklyMode || payload.schedule?.weekly_mode),
      defaultSlotMinutes: Number(payload.schedule?.defaultSlotMinutes ?? payload.schedule?.default_slot_minutes ?? 0),
      planningWindow: normalizeText(payload.schedule?.planningWindow || payload.schedule?.planning_window),
      allowTeacherOverrides: Boolean(payload.schedule?.allowTeacherOverrides ?? payload.schedule?.allow_teacher_overrides),
    },
    enrollment: {
      enrollmentCycle: normalizeText(payload.enrollment?.enrollmentCycle || payload.enrollment?.enrollment_cycle),
      defaultClassLevel: normalizeText(payload.enrollment?.defaultClassLevel || payload.enrollment?.default_class_level),
      transferPolicy: normalizeText(payload.enrollment?.transferPolicy || payload.enrollment?.transfer_policy),
      capacityReviewMode: normalizeText(payload.enrollment?.capacityReviewMode || payload.enrollment?.capacity_review_mode),
    },
  }
}

export async function fetchPreschoolSettingsBackbone(options = {}) {
  const response = await http.get('/preschool/settings/backbone', {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return {
    settings: normalizePreschoolSettingsSnapshot(payload.settings || {}),
    academicContext: payload.academicContext || {},
  }
}

export {
  activateAcademicTerm,
  activateAcademicYear,
  closeAcademicTerm,
  closeAcademicYear,
  createAcademicTerm,
  createAcademicYear,
  fetchAcademicLifecycle,
  updateAcademicTerm,
  updateAcademicYear,
}

export async function updatePreschoolSettingsBackbone(payload = {}) {
  const response = await http.patch('/preschool/settings/backbone', payload)
  const responsePayload = unwrapApiData(response) || {}

  return {
    settings: normalizePreschoolSettingsSnapshot(responsePayload.settings || {}),
    academicContext: responsePayload.academicContext || {},
  }
}

export async function fetchPreschoolTeachers(
  { page = 1, perPage = 10, search = '', status = '', sortBy = 'created_at', sortDirection = 'desc' } = {},
  options = {},
) {
  const response = await http.get('/preschool/teachers', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      status,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }),
    signal: options.signal,
  })

  return normalizeTeacherListResponse(response, page, perPage)
}

export async function fetchPreschoolTeacher(id, options = {}) {
  const teacherId = resolveId(id)
  if (!teacherId) return null

  const response = await http.get(`/preschool/teachers/${encodeURIComponent(teacherId)}`, {
    signal: options.signal,
  })

  const responsePayload = unwrapApiData(response) || {}
  return mapUser(responsePayload.user || responsePayload)
}

export async function createPreschoolTeacher(payload = {}) {
  const response = await http.post('/preschool/teachers', buildMultipartPayload(payload, { includePassword: true }))
  const responsePayload = unwrapApiData(response) || {}
  return mapUser(responsePayload.user || responsePayload)
}

export async function updatePreschoolTeacher(id, payload = {}) {
  const teacherId = resolveId(id)
  if (!teacherId) {
    throw new Error('Teacher id is required.')
  }

  const response = await http.post(
    `/preschool/teachers/${encodeURIComponent(teacherId)}`,
    buildMultipartPayload(payload, { includePassword: Boolean(normalizeText(payload.password)), method: 'PUT' }),
  )

  const responsePayload = unwrapApiData(response) || {}
  return mapUser(responsePayload.user || responsePayload)
}

export async function deletePreschoolTeacher(id) {
  const teacherId = resolveId(id)
  if (!teacherId) return false

  await http.delete(`/preschool/teachers/${encodeURIComponent(teacherId)}`)
  return true
}

export async function fetchPreschoolClasses(
  { page = 1, perPage = 10, search = '', status = '', level = '', teacherUserId = '', sortBy = 'created_at', sortDirection = 'desc' } = {},
  options = {},
) {
  const normalizedPerPage = normalizePerPage(perPage, 10, 100)
  const response = await http.get('/preschool/classes', {
    params: buildQueryParams({
      page,
      per_page: normalizedPerPage,
      search,
      status,
      level,
      teacher_user_id: teacherUserId,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }),
    signal: options.signal,
  })

  return normalizeClassListResponse(response, page, normalizedPerPage)
}

export async function fetchPreschoolClass(id, options = {}) {
  const classId = resolveId(id)
  if (!classId) return null

  const response = await http.get(`/preschool/classes/${encodeURIComponent(classId)}`, {
    signal: options.signal,
  })

  const responsePayload = unwrapApiData(response) || {}
  return normalizeClassRow(responsePayload.class || responsePayload)
}

export async function createPreschoolClass(payload = {}) {
  const response = await http.post('/preschool/classes', buildMultipartPayload(payload))
  const data = unwrapApiData(response) || {}
  return normalizeClassRow(data.class || data)
}

export async function updatePreschoolClass(id, payload = {}) {
  const classId = resolveId(id)
  if (!classId) {
    throw new Error('Class id is required.')
  }

  const response = await http.post(
    `/preschool/classes/${encodeURIComponent(classId)}`,
    buildMultipartPayload(payload, { method: 'PUT' }),
  )

  const data = unwrapApiData(response) || {}
  return normalizeClassRow(data.class || data)
}

export async function deletePreschoolClass(id) {
  const classId = resolveId(id)
  if (!classId) return false

  await http.delete(`/preschool/classes/${encodeURIComponent(classId)}`)
  return true
}

export async function fetchPreschoolStudents(
  { page = 1, perPage = 10, search = '', status = '', gender = '', classId = '', sortBy = 'created_at', sortDirection = 'desc' } = {},
  options = {},
) {
  const normalizedPerPage = normalizePerPage(perPage, 10, 100)
  const response = await http.get('/preschool/students', {
    params: buildQueryParams({
      page,
      per_page: normalizedPerPage,
      search,
      status,
      gender,
      class_id: classId,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }),
    signal: options.signal,
  })

  return normalizeStudentListResponse(response, page, normalizedPerPage)
}

export async function fetchPreschoolStudent(id, options = {}) {
  const studentId = resolveId(id)
  if (!studentId) return null

  const response = await http.get(`/preschool/students/${encodeURIComponent(studentId)}`, {
    signal: options.signal,
  })

  const responsePayload = unwrapApiData(response) || {}
  return normalizeStudentRow(responsePayload.student || responsePayload)
}

export async function createPreschoolStudent(payload = {}) {
  const response = await http.post('/preschool/students', buildMultipartPayload(payload))
  const responsePayload = unwrapApiData(response) || {}
  return normalizeStudentRow(responsePayload.student || responsePayload)
}

export async function updatePreschoolStudent(id, payload = {}) {
  const studentId = resolveId(id)
  if (!studentId) {
    throw new Error('Student id is required.')
  }

  const response = await http.post(
    `/preschool/students/${encodeURIComponent(studentId)}`,
    buildMultipartPayload(payload, { method: 'PUT' }),
  )

  const responsePayload = unwrapApiData(response) || {}
  return normalizeStudentRow(responsePayload.student || responsePayload)
}

export async function deletePreschoolStudent(id) {
  const studentId = resolveId(id)
  if (!studentId) return false

  await http.delete(`/preschool/students/${encodeURIComponent(studentId)}`)
  return true
}

export async function fetchPreschoolAttendance(
  { page = 1, perPage = 10, search = '', classId = '', studentId = '', status = '', attendanceDate = '', dateFrom = '', dateTo = '' } = {},
  options = {},
) {
  const response = await http.get('/preschool/attendance', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      class_id: classId,
      student_id: studentId,
      status,
      attendance_date: attendanceDate,
      date_from: dateFrom,
      date_to: dateTo,
    }),
    signal: options.signal,
  })

  return normalizeAttendanceListResponse(response, page, perPage)
}

export async function savePreschoolAttendance(payload = {}) {
  const attendanceId = resolveId(payload)
  const method = attendanceId ? 'put' : 'post'
  const url = attendanceId ? `/preschool/attendance/${encodeURIComponent(attendanceId)}` : '/preschool/attendance'
  const response = await http[method](url, payload)
  const responsePayload = unwrapApiData(response) || {}
  return normalizeAttendanceRow(responsePayload.attendance || responsePayload)
}

export async function fetchPreschoolPayments(
  { page = 1, perPage = 10, search = '', classId = '', studentId = '', paymentStatus = '', paymentMethod = '' } = {},
  options = {},
) {
  const response = await http.get('/preschool/payments', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      class_id: classId,
      student_id: studentId,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
    }),
    signal: options.signal,
  })

  return normalizePaymentListResponse(response, page, perPage)
}

export async function fetchPreschoolPayment(id, options = {}) {
  const paymentId = resolveId(id)
  if (!paymentId) return null

  const response = await http.get(`/preschool/payments/${encodeURIComponent(paymentId)}`, {
    signal: options.signal,
  })

  const responsePayload = unwrapApiData(response) || {}
  return normalizePaymentRow(responsePayload.payment || responsePayload)
}

export async function createPreschoolPayment(payload = {}) {
  const response = await http.post('/preschool/payments', buildMultipartPayload(payload))
  const data = unwrapApiData(response) || {}
  return normalizePaymentRow(data.payment || data)
}

export async function updatePreschoolPayment(id, payload = {}) {
  const paymentId = resolveId(id)
  if (!paymentId) {
    throw new Error('Payment id is required.')
  }

  const response = await http.post(
    `/preschool/payments/${encodeURIComponent(paymentId)}`,
    buildMultipartPayload(payload, { method: 'PUT' }),
  )

  const data = unwrapApiData(response) || {}
  return normalizePaymentRow(data.payment || data)
}

export async function deletePreschoolPayment(id) {
  const paymentId = resolveId(id)
  if (!paymentId) return false

  await http.delete(`/preschool/payments/${encodeURIComponent(paymentId)}`)
  return true
}

export async function fetchMyPreschoolStudents(
  { page = 1, perPage = 10 } = {},
  options = {},
) {
  const response = await http.get('/preschool/teacher/my-students', {
    params: buildQueryParams({
      page,
      per_page: perPage,
    }),
    signal: options.signal,
  })

  return normalizeStudentListResponse(response, page, perPage)
}

export async function fetchMyPreschoolClasses(
  { page = 1, perPage = 10 } = {},
  options = {},
) {
  const response = await http.get('/preschool/teacher/my-classes', {
    params: buildQueryParams({
      page,
      per_page: perPage,
    }),
    signal: options.signal,
  })

  return normalizeClassListResponse(response, page, perPage)
}

// ── Classroom Resources ───────────────────────────────────────────────────────

function normalizeResourceRow(row = {}) {
  return {
    id: row.id ?? '',
    name: normalizeText(row.name),
    category: normalizeText(row.category || 'supplies'),
    quantity: Number(row.quantity ?? 0),
    condition: normalizeText(row.condition || 'good'),
    notes: normalizeText(row.notes),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

function normalizeResourceListResponse(response, fallbackPage = 1, fallbackPerPage = 20) {
  const items = unwrapApiItems(response)
  return {
    items: items.map(normalizeResourceRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

export async function fetchClassroomResources(
  { page = 1, perPage = 100, search = '', category = '', condition = '', sortBy = 'created_at', sortDirection = 'desc' } = {},
  options = {},
) {
  const response = await http.get('/preschool/classroom-resources', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      category,
      condition,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }),
    signal: options.signal,
  })

  return normalizeResourceListResponse(response, page, perPage)
}

export async function createClassroomResource(payload = {}) {
  const response = await http.post('/preschool/classroom-resources', payload)
  const data = unwrapApiData(response) || {}
  return normalizeResourceRow(data.resource || data)
}

export async function updateClassroomResource(id, payload = {}) {
  const resourceId = resolveId(id)
  if (!resourceId) throw new Error('Resource id is required.')

  const response = await http.put(`/preschool/classroom-resources/${encodeURIComponent(resourceId)}`, payload)
  const data = unwrapApiData(response) || {}
  return normalizeResourceRow(data.resource || data)
}

export async function deleteClassroomResource(id) {
  const resourceId = resolveId(id)
  if (!resourceId) return false

  await http.delete(`/preschool/classroom-resources/${encodeURIComponent(resourceId)}`)
  return true
}
