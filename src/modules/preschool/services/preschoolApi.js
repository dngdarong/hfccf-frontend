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
    invoiceId: row.invoiceId ?? row.invoice_id ?? '',
    invoiceNumber: normalizeText(row.invoiceNumber || row.invoice_number || row.invoice?.invoice_number),
    paymentReference: normalizeText(row.paymentReference || row.payment_reference),
    amount: Number(row.amount || 0),
    currency: normalizeText(row.currency || 'USD'),
    paymentMethod: normalizeText(row.paymentMethod || row.payment_method),
    paymentStatus: normalizeText(row.paymentStatus || row.payment_status),
    paidAt: row.paidAt || row.paid_at || '',
    dueDate: row.dueDate || row.due_date || '',
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
