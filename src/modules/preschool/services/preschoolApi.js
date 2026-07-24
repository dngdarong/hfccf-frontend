import http from '@/services/http'
import { buildQueryParams, normalizePerPage, unwrapApiData, unwrapApiItems, unwrapApiPagination } from '@/services/api'
import { mapUser, mapUsers } from '@/services/mappers/userMapper'
import { fetchReportPeriods as fetchPreschoolReportPeriods } from '@/modules/preschool/services/api/preschoolReportsApi'
import {
  archiveAcademicTerm,
  archiveAcademicYear,
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
import {
  archiveCalendarEvent,
  buildSchoolWeekLabel,
  createCalendarEvent,
  fetchAttendanceSettings,
  fetchCalendarEvents,
  updateAttendanceSettings,
  updateCalendarEvent,
} from '@/modules/preschool/services/api/preschoolAttendanceConfigurationApi'
import { saveAttendanceSessionRecord } from '@/modules/preschool/services/api/preschoolAttendanceSessionApi'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function firstNonEmpty(...values) {
  const value = values.find((item) => {
    if (item === null || item === undefined) return false
    return String(item).trim() !== ''
  })

  return value === undefined ? '' : value
}

function resolveStudentAvatarUrl(row = {}) {
  const media = row.media || {}
  const nestedMediaUrl = Array.isArray(media)
    ? firstNonEmpty(media[0]?.url, media[0]?.path)
    : firstNonEmpty(media.url, media.path)

  return normalizeText(firstNonEmpty(
    row.avatarUrl,
    row.avatar_url,
    row.profilePhotoUrl,
    row.profile_photo_url,
    row.profileImageUrl,
    row.profile_image_url,
    row.profilePhoto,
    row.profile_photo,
    row.photoUrl,
    row.photo_url,
    row.imageUrl,
    row.image_url,
    row.avatar,
    row.profileImage,
    row.profile_image,
    row.photo,
    row.image,
    row.thumbnail,
    nestedMediaUrl,
  ))
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
    classLevelId: row.classLevelId ?? row.class_level_id ?? row.classLevel?.id ?? '',
    classLevel: row.classLevel || row.class_level || null,
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
  const avatarUrl = resolveStudentAvatarUrl(row)
  const birthProvince = row.birthProvince || row.birth_province || null
  const birthDistrict = row.birthDistrict || row.birth_district || null
  const birthCommune = row.birthCommune || row.birth_commune || null
  const birthVillage = row.birthVillage || row.birth_village || null
  const residenceProvince = row.residenceProvince || row.residence_province || null
  const residenceDistrict = row.residenceDistrict || row.residence_district || null
  const residenceCommune = row.residenceCommune || row.residence_commune || null
  const residenceVillage = row.residenceVillage || row.residence_village || null

  return {
    id: row.id ?? '',
    publicId: normalizeText(row.publicId || row.public_id),
    studentCode: normalizeText(row.studentCode || row.student_code),
    firstName,
    lastName,
    fullName,
    name: normalizeText(row.name || fullName),
    latinName: normalizeText(row.latinName || row.latin_name),
    nationality: normalizeText(row.nationality),
    ethnicity: normalizeText(row.ethnicity),
    gender: normalizeText(row.gender),
    dateOfBirth: row.dateOfBirth || row.date_of_birth || '',
    guardianName: normalizeText(row.guardianName || row.guardian_name),
    guardianPhone: normalizeText(row.guardianPhone || row.guardian_phone),
    guardianType: normalizeText(
      row.guardianType
      || row.guardian_type
      || row.relationshipType
      || row.relationship_type,
    ),
    placeOfBirth: normalizeText(row.placeOfBirth || row.place_of_birth),
    birthProvinceId: row.birthProvinceId ?? row.birth_province_id ?? birthProvince?.id ?? '',
    birthDistrictId: row.birthDistrictId ?? row.birth_district_id ?? birthDistrict?.id ?? '',
    birthCommuneId: row.birthCommuneId ?? row.birth_commune_id ?? birthCommune?.id ?? '',
    birthVillageId: row.birthVillageId ?? row.birth_village_id ?? birthVillage?.id ?? '',
    birthProvince,
    birthDistrict,
    birthCommune,
    birthVillage,
    birthLocationDisplay: normalizeText(row.birthLocationDisplay || row.birth_location_display),
    residenceProvinceId: row.residenceProvinceId ?? row.residence_province_id ?? residenceProvince?.id ?? '',
    residenceDistrictId: row.residenceDistrictId ?? row.residence_district_id ?? residenceDistrict?.id ?? '',
    residenceCommuneId: row.residenceCommuneId ?? row.residence_commune_id ?? residenceCommune?.id ?? '',
    residenceVillageId: row.residenceVillageId ?? row.residence_village_id ?? residenceVillage?.id ?? '',
    residenceProvince,
    residenceDistrict,
    residenceCommune,
    residenceVillage,
    currentResidenceDisplay: normalizeText(row.currentResidenceDisplay || row.current_residence_display),
    address: normalizeText(row.address),
    status: normalizeText(row.status || 'active'),
    studentType: normalizeText(row.studentType || row.student_type || 'paying'),
    avatarUrl,
    avatar: avatarUrl,
    profilePhotoUrl: avatarUrl,
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
    attendanceSessionId: row.attendanceSessionId ?? row.attendance_session_id ?? '',
    attendanceSession: row.attendanceSession || row.attendance_session || null,
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
    invoiceId: row.invoiceId ?? row.invoice_id ?? '',
    invoiceNumber: normalizeText(row.invoiceNumber || row.invoice_number || row.invoice?.invoice_number),
    paymentReference: normalizeText(row.paymentReference || row.payment_reference),
    amount: Number(row.amount || 0),
    currency: normalizeText(row.currency || 'USD'),
    paymentMethod: normalizeText(row.paymentMethod || row.payment_method),
    paymentStatus: normalizeText(row.paymentStatus || row.payment_status),
    paidAt: row.paidAt || row.paid_at || '',
    dueDate: row.dueDate || row.due_date || '',
    description: normalizeText(row.description || row.payment_description),
    note: normalizeText(row.note),
    receiptCount: Number(row.receiptCount ?? row.receipt_count ?? 0),
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
    if ([
      'avatar',
      'profileImage',
      'password',
      'confirmPassword',
      'removeAvatar',
      'studentIds',
      'student_ids',
      'classIds',
      'class_ids',
    ].includes(key)) {
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

function normalizeClassLevelRow(row = {}) {
  return {
    id: row.id ?? '',
    nameEn: normalizeText(row.nameEn || row.name_en || row.name || row.label),
    nameKh: normalizeText(row.nameKh || row.name_kh),
    code: normalizeText(row.code || row.classLevelCode || row.class_level_code).toUpperCase(),
    sortOrder: Number(row.sortOrder ?? row.sort_order ?? 0),
    isActive: Boolean(row.isActive ?? row.is_active ?? true),
    status: row.status || (row.isActive ?? row.is_active ?? true ? 'active' : 'inactive'),
    deletedAt: row.deletedAt || row.deleted_at || '',
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

function normalizeClassLevelListResponse(response) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeClassLevelRow),
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

function normalizeTextList(values = []) {
  if (!Array.isArray(values)) return []

  return values
    .map((value) => normalizeText(value))
    .filter(Boolean)
}

function normalizeDashboardSectionFlags(section = {}, keys = []) {
  return Boolean(
    section.isConfigured
    ?? section.is_configured
    ?? keys.some((key) => normalizeText(section[key]).length > 0),
  )
}

function normalizePreschoolSettingsDashboardSection(section = {}, fieldMap = {}) {
  const normalized = {}

  Object.entries(fieldMap).forEach(([targetKey, sourceKeys]) => {
    const candidates = Array.isArray(sourceKeys) ? sourceKeys : [sourceKeys]
    const rawValue = candidates.reduce((carry, key) => (
      carry !== undefined && carry !== null && carry !== ''
        ? carry
        : section?.[key]
    ), '')

    if (Array.isArray(rawValue)) {
      normalized[targetKey] = normalizeTextList(rawValue)
      return
    }

    normalized[targetKey] = typeof rawValue === 'number'
      ? rawValue
      : normalizeText(rawValue)
  })

  return normalized
}

function formatBooleanStatus(value) {
  return value ? 'On' : 'Off'
}

export function normalizePreschoolSettingsDashboard(payload = {}) {
  const academic = payload.academic || {}
  const attendance = payload.attendance || {}
  const payments = payload.payments || {}
  const assessments = payload.assessments || {}
  const health = payload.health || {}
  const preferences = payload.preferences || {}

  const normalizedAcademic = normalizePreschoolSettingsDashboardSection(academic, {
    activeAcademicYear: ['activeAcademicYear', 'active_academic_year'],
    activeAcademicYearDateRange: ['activeAcademicYearDateRange', 'active_academic_year_date_range'],
    activeTerm: ['activeTerm', 'active_term'],
    activeTermDateRange: ['activeTermDateRange', 'active_term_date_range'],
    academicStatus: ['academicStatus', 'academic_status'],
  })
  normalizedAcademic.isConfigured = normalizeDashboardSectionFlags(academic, ['activeAcademicYear', 'activeAcademicYearDateRange', 'activeTerm', 'activeTermDateRange', 'academicStatus'])

  const normalizedAttendance = normalizePreschoolSettingsDashboardSection(attendance, {
    lateThresholdMinutes: ['lateThresholdMinutes', 'late_threshold_minutes'],
    halfDayThresholdMinutes: ['halfDayThresholdMinutes', 'half_day_threshold_minutes'],
    absenceAlertDays: ['absenceAlertDays', 'absence_alert_days'],
    schoolDaysPerWeek: ['schoolDaysPerWeek', 'school_days_per_week'],
    schoolWeekLabel: ['schoolWeekLabel', 'school_week_label'],
    calendarEventsCount: ['calendarEventsCount', 'calendar_events_count'],
  })
  normalizedAttendance.schoolWeekLabel = normalizeText(normalizedAttendance.schoolWeekLabel) || buildSchoolWeekLabel(normalizedAttendance.schoolDaysPerWeek)
  normalizedAttendance.isConfigured = normalizeDashboardSectionFlags(attendance, ['lateThresholdMinutes', 'absenceAlertDays', 'schoolDaysPerWeek', 'schoolWeekLabel', 'calendarEventsCount'])

  const normalizedPayments = normalizePreschoolSettingsDashboardSection(payments, {
    feeTypesCount: ['feeTypesCount', 'fee_types_count'],
    paymentMethodsCount: ['paymentMethodsCount', 'payment_methods_count'],
    lateFeeEnabled: ['lateFeeEnabled', 'late_fee_enabled'],
    gracePeriodDays: ['gracePeriodDays', 'grace_period_days'],
    invoicePrefix: ['invoicePrefix', 'invoice_prefix'],
    receiptPrefix: ['receiptPrefix', 'receipt_prefix'],
    lateFeeType: ['lateFeeType', 'late_fee_type'],
    lateFeeAmount: ['lateFeeAmount', 'late_fee_amount'],
    prorationEnabled: ['prorationEnabled', 'proration_enabled'],
  })
  normalizedPayments.feeTypesCount = Number(payments.feeTypesCount ?? payments.fee_types_count ?? 0)
  normalizedPayments.paymentMethodsCount = Number(payments.paymentMethodsCount ?? payments.payment_methods_count ?? 0)
  normalizedPayments.lateFeeEnabled = Boolean(payments.lateFeeEnabled ?? payments.late_fee_enabled ?? false)
  normalizedPayments.gracePeriodDays = Number(payments.gracePeriodDays ?? payments.grace_period_days ?? 0)
  normalizedPayments.lateFeeType = normalizeText(payments.lateFeeType ?? payments.late_fee_type ?? '')
  normalizedPayments.lateFeeAmount = Number(payments.lateFeeAmount ?? payments.late_fee_amount ?? 0)
  normalizedPayments.prorationEnabled = Boolean(payments.prorationEnabled ?? payments.proration_enabled ?? false)
  normalizedPayments.isConfigured = normalizeDashboardSectionFlags(payments, ['feeTypesCount', 'paymentMethodsCount', 'lateFeeEnabled', 'gracePeriodDays', 'invoicePrefix', 'receiptPrefix'])

  const normalizedAssessments = normalizePreschoolSettingsDashboardSection(assessments, {
    passingScore: ['passingScore', 'passing_score'],
    weightingEnabled: ['weightingEnabled', 'weighting_enabled'],
    gradeBandsCount: ['gradeBandsCount', 'grade_bands_count'],
    assessmentCategoriesCount: ['assessmentCategoriesCount', 'assessment_categories_count'],
    reportPeriodsCount: ['reportPeriodsCount', 'report_periods_count'],
    schoolWeek: ['schoolWeek', 'school_week'],
  })
  normalizedAssessments.passingScore = Number(
    assessments.passingScore
    ?? assessments.passing_score
    ?? 0,
  )
  normalizedAssessments.weightingEnabled = Boolean(
    assessments.weightingEnabled
    ?? assessments.weighting_enabled
    ?? false,
  )
  normalizedAssessments.gradeBandsCount = Number(
    assessments.gradeBandsCount
    ?? assessments.grade_bands_count
    ?? 0,
  )
  normalizedAssessments.assessmentCategoriesCount = Number(
    assessments.assessmentCategoriesCount
    ?? assessments.assessment_categories_count
    ?? 0,
  )
  normalizedAssessments.reportPeriodsCount = Number(
    assessments.reportPeriodsCount
    ?? assessments.report_periods_count
    ?? 0,
  )
  normalizedAssessments.schoolWeek = normalizeTextList(assessments.schoolWeek || assessments.school_week || [])
  normalizedAssessments.isConfigured = normalizeDashboardSectionFlags(assessments, ['passingScore', 'weightingEnabled', 'gradeBandsCount', 'assessmentCategoriesCount', 'reportPeriodsCount'])

  const normalizedHealth = normalizePreschoolSettingsDashboardSection(health, {
    criticalAlertEnabled: ['criticalAlertEnabled', 'critical_alert_enabled'],
    severityLevelsCount: ['severityLevelsCount', 'severity_levels_count'],
    incidentCategoriesCount: ['incidentCategoriesCount', 'incident_categories_count'],
    vaccinationCategoriesCount: ['vaccinationCategoriesCount', 'vaccination_categories_count'],
    healthCheckCategoriesCount: ['healthCheckCategoriesCount', 'health_check_categories_count'],
    medicationReminderEnabled: ['medicationReminderEnabled', 'medication_reminder_enabled'],
    vaccinationReminderEnabled: ['vaccinationReminderEnabled', 'vaccination_reminder_enabled'],
  })
  normalizedHealth.criticalAlertEnabled = Boolean(
    health.criticalAlertEnabled
    ?? health.critical_alert_enabled
    ?? false,
  )
  normalizedHealth.severityLevelsCount = Number(
    health.severityLevelsCount
    ?? health.severity_levels_count
    ?? (Array.isArray(health.severityLevels) ? health.severityLevels.length : 0)
    ?? (Array.isArray(health.severity_levels) ? health.severity_levels.length : 0)
    ?? 0,
  )
  normalizedHealth.incidentCategoriesCount = Number(
    health.incidentCategoriesCount
    ?? health.incident_categories_count
    ?? (Array.isArray(health.incidentCategories) ? health.incidentCategories.length : 0)
    ?? (Array.isArray(health.incident_categories) ? health.incident_categories.length : 0)
    ?? 0,
  )
  normalizedHealth.vaccinationCategoriesCount = Number(
    health.vaccinationCategoriesCount
    ?? health.vaccination_categories_count
    ?? (Array.isArray(health.vaccinationCategories) ? health.vaccinationCategories.length : 0)
    ?? (Array.isArray(health.vaccination_categories) ? health.vaccination_categories.length : 0)
    ?? 0,
  )
  normalizedHealth.healthCheckCategoriesCount = Number(
    health.healthCheckCategoriesCount
    ?? health.health_check_categories_count
    ?? (Array.isArray(health.healthCheckCategories) ? health.healthCheckCategories.length : 0)
    ?? (Array.isArray(health.health_check_categories) ? health.health_check_categories.length : 0)
    ?? 0,
  )
  normalizedHealth.medicationReminderEnabled = Boolean(
    health.medicationReminderEnabled
    ?? health.medication_reminder_enabled
    ?? false,
  )
  normalizedHealth.vaccinationReminderEnabled = Boolean(
    health.vaccinationReminderEnabled
    ?? health.vaccination_reminder_enabled
    ?? false,
  )
  normalizedHealth.alertSeverityLevels = normalizeTextList(health.alertSeverityLevels || health.alert_severity_levels || health.severityLevels || health.severity_levels || [])
  normalizedHealth.healthCategories = normalizeTextList(health.healthCategories || health.health_categories || [])
  normalizedHealth.isConfigured = normalizeDashboardSectionFlags(health, [
    'criticalAlertEnabled',
    'severityLevelsCount',
    'incidentCategoriesCount',
    'vaccinationCategoriesCount',
    'healthCheckCategoriesCount',
    'medicationReminderEnabled',
    'vaccinationReminderEnabled',
  ])

  const normalizedPreferences = normalizePreschoolSettingsDashboardSection(preferences, {
    timezone: ['timezone'],
    defaultLanguage: ['defaultLanguage', 'default_language'],
    dateFormat: ['dateFormat', 'date_format'],
    timeFormat: ['timeFormat', 'time_format'],
    minimumEnrollmentAgeMonths: ['minimumEnrollmentAgeMonths', 'minimum_enrollment_age_months'],
    maximumEnrollmentAgeMonths: ['maximumEnrollmentAgeMonths', 'maximum_enrollment_age_months'],
    autoApproveEnrollment: ['autoApproveEnrollment', 'auto_approve_enrollment'],
    studentCodePrefix: ['studentCodePrefix', 'student_code_prefix'],
    studentCodeYearFormat: ['studentCodeYearFormat', 'student_code_year_format'],
    studentCodeSequenceLength: ['studentCodeSequenceLength', 'student_code_sequence_length'],
    studentCodePreview: ['studentCodePreview', 'student_code_preview'],
    defaultClassCapacity: ['defaultClassCapacity', 'default_class_capacity'],
    teacherStudentRatio: ['teacherStudentRatio', 'teacher_student_ratio'],
    waitlistEnabled: ['waitlistEnabled', 'waitlist_enabled'],
    minimumGuardians: ['minimumGuardians', 'minimum_guardians'],
    maximumGuardians: ['maximumGuardians', 'maximum_guardians'],
    primaryGuardianRequired: ['primaryGuardianRequired', 'primary_guardian_required'],
    pickupAuthorizationRequired: ['pickupAuthorizationRequired', 'pickup_authorization_required'],
    attendanceAlertEnabled: ['attendanceAlertEnabled', 'attendance_alert_enabled'],
    assessmentAlertEnabled: ['assessmentAlertEnabled', 'assessment_alert_enabled'],
    healthAlertEnabled: ['healthAlertEnabled', 'health_alert_enabled'],
    enrollmentNotificationEnabled: ['enrollmentNotificationEnabled', 'enrollment_notification_enabled'],
    enrollmentRulesLabel: ['enrollmentRulesLabel', 'enrollment_rules_label'],
    studentCodeFormatLabel: ['studentCodeFormatLabel', 'student_code_format_label'],
    classCapacityLabel: ['classCapacityLabel', 'class_capacity_label'],
    guardianRulesLabel: ['guardianRulesLabel', 'guardian_rules_label'],
    communicationRulesLabel: ['communicationRulesLabel', 'communication_rules_label'],
  })
  normalizedPreferences.minimumEnrollmentAgeMonths = Number(preferences.minimumEnrollmentAgeMonths ?? preferences.minimum_enrollment_age_months ?? 24)
  normalizedPreferences.maximumEnrollmentAgeMonths = Number(preferences.maximumEnrollmentAgeMonths ?? preferences.maximum_enrollment_age_months ?? 60)
  normalizedPreferences.autoApproveEnrollment = Boolean(preferences.autoApproveEnrollment ?? preferences.auto_approve_enrollment ?? false)
  normalizedPreferences.studentCodePrefix = normalizeText(preferences.studentCodePrefix ?? preferences.student_code_prefix ?? 'PS')
  normalizedPreferences.studentCodeYearFormat = normalizeText(preferences.studentCodeYearFormat ?? preferences.student_code_year_format ?? 'YYYY')
  normalizedPreferences.studentCodeSequenceLength = Number(preferences.studentCodeSequenceLength ?? preferences.student_code_sequence_length ?? 4)
  normalizedPreferences.studentCodePreview = normalizeText(preferences.studentCodePreview ?? preferences.student_code_preview ?? '')
  normalizedPreferences.defaultClassCapacity = Number(preferences.defaultClassCapacity ?? preferences.default_class_capacity ?? 18)
  normalizedPreferences.teacherStudentRatio = Number(preferences.teacherStudentRatio ?? preferences.teacher_student_ratio ?? 10)
  normalizedPreferences.waitlistEnabled = Boolean(preferences.waitlistEnabled ?? preferences.waitlist_enabled ?? true)
  normalizedPreferences.minimumGuardians = Number(preferences.minimumGuardians ?? preferences.minimum_guardians ?? 1)
  normalizedPreferences.maximumGuardians = Number(preferences.maximumGuardians ?? preferences.maximum_guardians ?? 2)
  normalizedPreferences.primaryGuardianRequired = Boolean(preferences.primaryGuardianRequired ?? preferences.primary_guardian_required ?? true)
  normalizedPreferences.pickupAuthorizationRequired = Boolean(preferences.pickupAuthorizationRequired ?? preferences.pickup_authorization_required ?? true)
  normalizedPreferences.attendanceAlertEnabled = Boolean(preferences.attendanceAlertEnabled ?? preferences.attendance_alert_enabled ?? true)
  normalizedPreferences.assessmentAlertEnabled = Boolean(preferences.assessmentAlertEnabled ?? preferences.assessment_alert_enabled ?? true)
  normalizedPreferences.healthAlertEnabled = Boolean(preferences.healthAlertEnabled ?? preferences.health_alert_enabled ?? true)
  normalizedPreferences.enrollmentNotificationEnabled = Boolean(preferences.enrollmentNotificationEnabled ?? preferences.enrollment_notification_enabled ?? true)
  normalizedPreferences.enrollmentRulesLabel = normalizeText(preferences.enrollmentRulesLabel ?? preferences.enrollment_rules_label ?? `${normalizedPreferences.minimumEnrollmentAgeMonths}-${normalizedPreferences.maximumEnrollmentAgeMonths} months • Auto-approve: ${formatBooleanStatus(normalizedPreferences.autoApproveEnrollment)}`)
  normalizedPreferences.studentCodeFormatLabel = normalizeText(preferences.studentCodeFormatLabel ?? preferences.student_code_format_label ?? `${normalizedPreferences.studentCodePrefix}-${normalizedPreferences.studentCodeYearFormat}-${String(1).padStart(normalizedPreferences.studentCodeSequenceLength || 4, '0')}`)
  normalizedPreferences.classCapacityLabel = normalizeText(preferences.classCapacityLabel ?? preferences.class_capacity_label ?? `${normalizedPreferences.defaultClassCapacity} students • 1:${normalizedPreferences.teacherStudentRatio} ratio • ${normalizedPreferences.waitlistEnabled ? 'Waitlist enabled' : 'Waitlist disabled'}`)
  normalizedPreferences.guardianRulesLabel = normalizeText(preferences.guardianRulesLabel ?? preferences.guardian_rules_label ?? `Min ${normalizedPreferences.minimumGuardians} • Max ${normalizedPreferences.maximumGuardians}`)
  normalizedPreferences.communicationRulesLabel = normalizeText(preferences.communicationRulesLabel ?? preferences.communication_rules_label ?? `Attendance: ${formatBooleanStatus(normalizedPreferences.attendanceAlertEnabled)} • Assessment: ${formatBooleanStatus(normalizedPreferences.assessmentAlertEnabled)} • Health: ${formatBooleanStatus(normalizedPreferences.healthAlertEnabled)} • Enrollment: ${formatBooleanStatus(normalizedPreferences.enrollmentNotificationEnabled)}`)
  normalizedPreferences.isConfigured = normalizeDashboardSectionFlags(preferences, ['timezone', 'defaultLanguage', 'minimumEnrollmentAgeMonths', 'studentCodePrefix', 'defaultClassCapacity', 'minimumGuardians', 'attendanceAlertEnabled'])

  return {
    academic: normalizedAcademic,
    attendance: normalizedAttendance,
    payments: normalizedPayments,
    assessments: normalizedAssessments,
    health: normalizedHealth,
    preferences: normalizedPreferences,
  }
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
  const groups = payload.groups && typeof payload.groups === 'object' ? payload.groups : {}
  const metadata = payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}

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
    health: {
      criticalAlertsEnabled: Boolean(payload.health?.criticalAlertsEnabled ?? payload.health?.critical_alerts_enabled ?? true),
      guardianNotifications: Boolean(payload.health?.guardianNotifications ?? payload.health?.guardian_notifications ?? true),
      teacherNotifications: Boolean(payload.health?.teacherNotifications ?? payload.health?.teacher_notifications ?? true),
      adminNotifications: Boolean(payload.health?.adminNotifications ?? payload.health?.admin_notifications ?? true),
      medicationReminders: Boolean(payload.health?.medicationReminders ?? payload.health?.medication_reminders ?? true),
      vaccinationReminders: Boolean(payload.health?.vaccinationReminders ?? payload.health?.vaccination_reminders ?? true),
      overdueVaccinationAlertDays: Number(payload.health?.overdueVaccinationAlertDays ?? payload.health?.overdue_vaccination_alert_days ?? 7),
      medicationReminderMinutesBefore: Number(payload.health?.medicationReminderMinutesBefore ?? payload.health?.medication_reminder_minutes_before ?? 30),
    },
    preferences: {
      timezone: normalizeText(payload.preferences?.timezone || 'Asia/Phnom_Penh'),
      defaultLanguage: normalizeText(payload.preferences?.defaultLanguage || payload.preferences?.default_language || 'en'),
      dateFormat: normalizeText(payload.preferences?.dateFormat || payload.preferences?.date_format || 'DD/MM/YYYY'),
      timeFormat: normalizeText(payload.preferences?.timeFormat || payload.preferences?.time_format || 'HH:mm'),
      minimumEnrollmentAgeMonths: Number(payload.preferences?.minimumEnrollmentAgeMonths ?? payload.preferences?.minimum_enrollment_age_months ?? 24),
      maximumEnrollmentAgeMonths: Number(payload.preferences?.maximumEnrollmentAgeMonths ?? payload.preferences?.maximum_enrollment_age_months ?? 60),
      autoApproveEnrollment: Boolean(payload.preferences?.autoApproveEnrollment ?? payload.preferences?.auto_approve_enrollment ?? false),
      studentCodePrefix: normalizeText(payload.preferences?.studentCodePrefix || payload.preferences?.student_code_prefix || 'PS'),
      studentCodeYearFormat: normalizeText(payload.preferences?.studentCodeYearFormat || payload.preferences?.student_code_year_format || 'YYYY'),
      studentCodeSequenceLength: Number(payload.preferences?.studentCodeSequenceLength ?? payload.preferences?.student_code_sequence_length ?? 4),
      defaultClassCapacity: Number(payload.preferences?.defaultClassCapacity ?? payload.preferences?.default_class_capacity ?? 18),
      teacherStudentRatio: Number(payload.preferences?.teacherStudentRatio ?? payload.preferences?.teacher_student_ratio ?? 10),
      waitlistEnabled: Boolean(payload.preferences?.waitlistEnabled ?? payload.preferences?.waitlist_enabled ?? true),
      minimumGuardians: Number(payload.preferences?.minimumGuardians ?? payload.preferences?.minimum_guardians ?? 1),
      maximumGuardians: Number(payload.preferences?.maximumGuardians ?? payload.preferences?.maximum_guardians ?? 2),
      primaryGuardianRequired: Boolean(payload.preferences?.primaryGuardianRequired ?? payload.preferences?.primary_guardian_required ?? true),
      pickupAuthorizationRequired: Boolean(payload.preferences?.pickupAuthorizationRequired ?? payload.preferences?.pickup_authorization_required ?? true),
      attendanceAlertEnabled: Boolean(payload.preferences?.attendanceAlertEnabled ?? payload.preferences?.attendance_alert_enabled ?? true),
      assessmentAlertEnabled: Boolean(payload.preferences?.assessmentAlertEnabled ?? payload.preferences?.assessment_alert_enabled ?? true),
      healthAlertEnabled: Boolean(payload.preferences?.healthAlertEnabled ?? payload.preferences?.health_alert_enabled ?? true),
      enrollmentNotificationEnabled: Boolean(payload.preferences?.enrollmentNotificationEnabled ?? payload.preferences?.enrollment_notification_enabled ?? true),
    },
    groups,
    metadata,
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

export async function fetchPreschoolSettingsDashboard(options = {}) {
  const response = await http.get('/preschool/settings/dashboard', {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizePreschoolSettingsDashboard(payload.dashboard || payload)
}

export {
  archiveAcademicTerm,
  archiveAcademicYear,
  archiveCalendarEvent,
  activateAcademicTerm,
  activateAcademicYear,
  closeAcademicTerm,
  closeAcademicYear,
  createAcademicTerm,
  createAcademicYear,
  createCalendarEvent,
  fetchAttendanceSettings,
  fetchCalendarEvents,
  fetchAcademicLifecycle,
  updateAttendanceSettings,
  updateCalendarEvent,
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
  {
    page = 1,
    perPage = 10,
    search = '',
    status = '',
    level = '',
    classLevelId = '',
    teacherUserId = '',
    sortBy = 'created_at',
    sortDirection = 'desc',
  } = {},
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
      class_level_id: classLevelId,
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

export async function fetchPreschoolClassLevels(options = {}) {
  const response = await http.get('/preschool/class-levels', {
    signal: options.signal,
  })

  return normalizeClassLevelListResponse(response)
}

export async function createPreschoolClassLevel(payload = {}) {
  const response = await http.post('/preschool/class-levels', payload)
  const data = unwrapApiData(response) || {}
  return normalizeClassLevelRow(data.classLevel || data.class_level || data)
}

export async function updatePreschoolClassLevel(id, payload = {}) {
  const classLevelId = resolveId(id)
  if (!classLevelId) {
    throw new Error('Class level id is required.')
  }

  const response = await http.put(`/preschool/class-levels/${encodeURIComponent(classLevelId)}`, payload)
  const data = unwrapApiData(response) || {}
  return normalizeClassLevelRow(data.classLevel || data.class_level || data)
}

export async function deactivatePreschoolClassLevel(id) {
  const classLevelId = resolveId(id)
  if (!classLevelId) return false

  await http.patch(`/preschool/class-levels/${encodeURIComponent(classLevelId)}/deactivate`)
  return true
}

export async function restorePreschoolClassLevel(id) {
  const classLevelId = resolveId(id)
  if (!classLevelId) return false

  await http.patch(`/preschool/class-levels/${encodeURIComponent(classLevelId)}/restore`)
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
  { page = 1, perPage = 10, search = '', classId = '', studentId = '', status = '', attendanceDate = '', attendanceSessionId = '', dateFrom = '', dateTo = '' } = {},
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
      attendance_session_id: attendanceSessionId,
      date_from: dateFrom,
      date_to: dateTo,
    }),
    signal: options.signal,
  })

  return normalizeAttendanceListResponse(response, page, perPage)
}

export async function savePreschoolAttendance(payload = {}) {
  const attendanceSessionId = String(payload.attendance_session_id || payload.attendanceSessionId || '').trim()

  if (attendanceSessionId) {
    const response = await saveAttendanceSessionRecord(attendanceSessionId, payload)
    return normalizeAttendanceRow(response.attendance || response)
  }

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

export async function fetchMyPreschoolClass(id, options = {}) {
  const classId = resolveId(id)
  if (!classId) return null

  const response = await http.get(`/preschool/teacher/my-classes/${encodeURIComponent(classId)}`, {
    signal: options.signal,
  })

  const responsePayload = unwrapApiData(response) || {}
  return normalizeClassRow(responsePayload.class || responsePayload)
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

export async function fetchClassroomResourceRequests(
  { page = 1, perPage = 100, status = '', sortBy = 'created_at', sortDirection = 'desc' } = {},
  options = {},
) {
  const response = await http.get('/preschool/classroom-resource-requests', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      status,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }),
    signal: options.signal,
  })

  return normalizeResourceRequestListResponse(response, page, perPage)
}

export async function createClassroomResourceRequest(payload = {}) {
  const response = await http.post('/preschool/classroom-resource-requests', payload)
  const data = unwrapApiData(response) || {}
  return normalizeResourceRequestRow(data.request || data)
}

export async function approveClassroomResourceRequest(id, payload = {}) {
  const requestId = resolveId(id)
  if (!requestId) throw new Error('Request id is required.')

  const response = await http.put(`/preschool/classroom-resource-requests/${encodeURIComponent(requestId)}/approve`, payload)
  const data = unwrapApiData(response) || {}
  return normalizeResourceRequestRow(data.request || data)
}

export async function rejectClassroomResourceRequest(id, payload = {}) {
  const requestId = resolveId(id)
  if (!requestId) throw new Error('Request id is required.')

  const response = await http.put(`/preschool/classroom-resource-requests/${encodeURIComponent(requestId)}/reject`, payload)
  const data = unwrapApiData(response) || {}
  return normalizeResourceRequestRow(data.request || data)
}

function normalizeResourceRequestRow(row = {}) {
  return {
    id: row.id ?? '',
    resource_id: row.resource_id ?? '',
    resource_name: row.resource_name ?? '',
    teacher_id: row.teacher_id ?? '',
    teacher_name: row.teacher_name ?? '',
    class_id: row.class_id ?? '',
    class_name: row.class_name ?? '',
    status: row.status ?? 'pending',
    notes: row.notes ?? '',
    rejection_reason: row.rejection_reason ?? '',
    requested_at: row.requested_at ?? '',
    approved_at: row.approved_at ?? '',
    approved_by: row.approved_by ?? '',
  }
}

function normalizeResourceRequestListResponse(response = {}, page = 1, perPage = 100) {
  const data = unwrapApiData(response) || {}
  const items = Array.isArray(data.requests) ? data.requests.map(normalizeResourceRequestRow) : []
  const pagination = data.pagination || {}

  return {
    items,
    pagination: {
      page: pagination.page ?? page,
      perPage: pagination.per_page ?? perPage,
      total: pagination.total ?? items.length,
      totalPages: pagination.total_pages ?? Math.ceil(items.length / perPage),
    },
  }
}

// ── Monthly Assessment Submissions ────────────────────────────────────────────

function normalizeMonthlySubmissionRow(row = {}) {
  return {
    id: row.id ?? '',
    academic_year_id: row.academic_year_id ?? '',
    class_id: row.class_id ?? '',
    assessment_category_id: row.assessment_category_id ?? '',
    submission_month: row.submission_month || '',
    status: normalizeText(row.status || 'draft'),
    student_assessments: Array.isArray(row.student_assessments) ? row.student_assessments : [],
    academicYear: row.academic_year || row.academicYear || null,
    class: row.class || null,
    category: row.assessment_category || row.category || null,
    submitted_at: row.submitted_at || '',
    submitted_by_user_id: row.submitted_by_user_id || '',
    reviewed_at: row.reviewed_at || '',
    reviewed_by_user_id: row.reviewed_by_user_id || '',
    returned_at: row.returned_at || '',
    returned_by_user_id: row.returned_by_user_id || '',
    return_reason: normalizeText(row.return_reason || ''),
    review_comment: normalizeText(row.review_comment || ''),
    finalized_at: row.finalized_at || '',
    finalized_by_user_id: row.finalized_by_user_id || '',
    created_at: row.created_at || '',
    updated_at: row.updated_at || '',
    raw: row,
  }
}

function normalizeMonthlySubmissionListResponse(response, fallbackPage = 1, fallbackPerPage = 20) {
  const items = unwrapApiItems(response)
  return {
    items: items.map(normalizeMonthlySubmissionRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

export async function fetchMonthlySubmissions(
  { page = 1, perPage = 20, status = '', academicYearId = '' } = {},
  options = {},
) {
  const normalizedPerPage = normalizePerPage(perPage, 10, 100)
  const response = await http.get('/api/preschool/monthly-submissions', {
    params: buildQueryParams({
      page,
      per_page: normalizedPerPage,
      status,
      academic_year_id: academicYearId,
    }),
    signal: options.signal,
  })

  return normalizeMonthlySubmissionListResponse(response, page, normalizedPerPage)
}

export async function fetchMonthlySubmission(id, options = {}) {
  const submissionId = resolveId(id)
  if (!submissionId) return null

  const response = await http.get(`/api/preschool/monthly-submissions/${encodeURIComponent(submissionId)}`, {
    signal: options.signal,
  })

  const responsePayload = unwrapApiData(response) || {}
  return normalizeMonthlySubmissionRow(responsePayload.submission || responsePayload)
}

export async function createMonthlySubmission(payload = {}) {
  const response = await http.post('/api/preschool/monthly-submissions', payload)
  const data = unwrapApiData(response) || {}
  return normalizeMonthlySubmissionRow(data.submission || data)
}

export async function updateMonthlySubmissionScore(submissionId, studentId, payload = {}) {
  const response = await http.put(
    `/api/preschool/monthly-submissions/${encodeURIComponent(submissionId)}/students/${encodeURIComponent(studentId)}/score`,
    payload
  )
  const data = unwrapApiData(response) || {}
  return data.assessment || data
}

export async function submitMonthlySubmission(id) {
  const submissionId = resolveId(id)
  if (!submissionId) throw new Error('Submission id is required.')

  const response = await http.post(`/api/preschool/monthly-submissions/${encodeURIComponent(submissionId)}/submit`)
  const data = unwrapApiData(response) || {}
  return normalizeMonthlySubmissionRow(data.submission || data)
}

export async function returnMonthlySubmission(id, payload = {}) {
  const submissionId = resolveId(id)
  if (!submissionId) throw new Error('Submission id is required.')

  const response = await http.post(
    `/api/preschool/monthly-submissions/${encodeURIComponent(submissionId)}/return`,
    payload
  )
  const data = unwrapApiData(response) || {}
  return normalizeMonthlySubmissionRow(data.submission || data)
}

export async function finalizeMonthlySubmission(id, payload = {}) {
  const submissionId = resolveId(id)
  if (!submissionId) throw new Error('Submission id is required.')

  const response = await http.post(
    `/api/preschool/monthly-submissions/${encodeURIComponent(submissionId)}/finalize`,
    payload
  )
  const data = unwrapApiData(response) || {}
  return normalizeMonthlySubmissionRow(data.submission || data)
}

export async function archiveMonthlySubmission(id) {
  const submissionId = resolveId(id)
  if (!submissionId) throw new Error('Submission id is required.')

  const response = await http.post(`/api/preschool/monthly-submissions/${encodeURIComponent(submissionId)}/archive`)
  const data = unwrapApiData(response) || {}
  return normalizeMonthlySubmissionRow(data.submission || data)
}
