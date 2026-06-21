import http from '@/services/http'
import { unwrapApiData } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value
  if (value === 1 || value === '1' || value === 'true') return true
  if (value === 0 || value === '0' || value === 'false') return false
  return fallback
}

function resolveRecord(payload = {}) {
  return payload.settings || payload.preference || payload.preferences || payload.data || payload
}

export function normalizePreferences(record = {}) {
  return {
    id: record.id ?? '',
    timezone: normalizeText(record.timezone || 'Asia/Phnom_Penh'),
    defaultLanguage: normalizeText(record.defaultLanguage ?? record.default_language ?? 'en'),
    dateFormat: normalizeText(record.dateFormat ?? record.date_format ?? 'Y-m-d'),
    timeFormat: normalizeText(record.timeFormat ?? record.time_format ?? 'H:i'),
    minimumEnrollmentAgeMonths: normalizeNumber(record.minimumEnrollmentAgeMonths ?? record.minimum_enrollment_age_months, 24),
    maximumEnrollmentAgeMonths: normalizeNumber(record.maximumEnrollmentAgeMonths ?? record.maximum_enrollment_age_months, 60),
    autoApproveEnrollment: normalizeBoolean(record.autoApproveEnrollment ?? record.auto_approve_enrollment, false),
    studentCodePrefix: normalizeText(record.studentCodePrefix ?? record.student_code_prefix ?? 'PS'),
    studentCodeYearFormat: normalizeText(record.studentCodeYearFormat ?? record.student_code_year_format ?? 'YYYY'),
    studentCodeSequenceLength: normalizeNumber(record.studentCodeSequenceLength ?? record.student_code_sequence_length, 4),
    defaultClassCapacity: normalizeNumber(record.defaultClassCapacity ?? record.default_class_capacity, 18),
    teacherStudentRatio: normalizeNumber(record.teacherStudentRatio ?? record.teacher_student_ratio, 10),
    waitlistEnabled: normalizeBoolean(record.waitlistEnabled ?? record.waitlist_enabled, true),
    minimumGuardians: normalizeNumber(record.minimumGuardians ?? record.minimum_guardians, 1),
    maximumGuardians: normalizeNumber(record.maximumGuardians ?? record.maximum_guardians, 2),
    primaryGuardianRequired: normalizeBoolean(record.primaryGuardianRequired ?? record.primary_guardian_required, true),
    pickupAuthorizationRequired: normalizeBoolean(record.pickupAuthorizationRequired ?? record.pickup_authorization_required, true),
    attendanceAlertEnabled: normalizeBoolean(record.attendanceAlertEnabled ?? record.attendance_alert_enabled, true),
    assessmentAlertEnabled: normalizeBoolean(record.assessmentAlertEnabled ?? record.assessment_alert_enabled, true),
    healthAlertEnabled: normalizeBoolean(record.healthAlertEnabled ?? record.health_alert_enabled, true),
    enrollmentNotificationEnabled: normalizeBoolean(record.enrollmentNotificationEnabled ?? record.enrollment_notification_enabled, true),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    raw: record,
  }
}

function buildPreferencesPayload(preferences = {}) {
  return {
    timezone: normalizeText(preferences.timezone),
    default_language: normalizeText(preferences.defaultLanguage ?? preferences.default_language),
    date_format: normalizeText(preferences.dateFormat ?? preferences.date_format),
    time_format: normalizeText(preferences.timeFormat ?? preferences.time_format),
    minimum_enrollment_age_months: normalizeNumber(preferences.minimumEnrollmentAgeMonths ?? preferences.minimum_enrollment_age_months, 24),
    maximum_enrollment_age_months: normalizeNumber(preferences.maximumEnrollmentAgeMonths ?? preferences.maximum_enrollment_age_months, 60),
    auto_approve_enrollment: normalizeBoolean(preferences.autoApproveEnrollment ?? preferences.auto_approve_enrollment, false),
    student_code_prefix: normalizeText(preferences.studentCodePrefix ?? preferences.student_code_prefix),
    student_code_year_format: normalizeText(preferences.studentCodeYearFormat ?? preferences.student_code_year_format),
    student_code_sequence_length: normalizeNumber(preferences.studentCodeSequenceLength ?? preferences.student_code_sequence_length, 4),
    default_class_capacity: normalizeNumber(preferences.defaultClassCapacity ?? preferences.default_class_capacity, 18),
    teacher_student_ratio: normalizeNumber(preferences.teacherStudentRatio ?? preferences.teacher_student_ratio, 10),
    waitlist_enabled: normalizeBoolean(preferences.waitlistEnabled ?? preferences.waitlist_enabled, true),
    minimum_guardians: normalizeNumber(preferences.minimumGuardians ?? preferences.minimum_guardians, 1),
    maximum_guardians: normalizeNumber(preferences.maximumGuardians ?? preferences.maximum_guardians, 2),
    primary_guardian_required: normalizeBoolean(preferences.primaryGuardianRequired ?? preferences.primary_guardian_required, true),
    pickup_authorization_required: normalizeBoolean(preferences.pickupAuthorizationRequired ?? preferences.pickup_authorization_required, true),
    attendance_alert_enabled: normalizeBoolean(preferences.attendanceAlertEnabled ?? preferences.attendance_alert_enabled, true),
    assessment_alert_enabled: normalizeBoolean(preferences.assessmentAlertEnabled ?? preferences.assessment_alert_enabled, true),
    health_alert_enabled: normalizeBoolean(preferences.healthAlertEnabled ?? preferences.health_alert_enabled, true),
    enrollment_notification_enabled: normalizeBoolean(preferences.enrollmentNotificationEnabled ?? preferences.enrollment_notification_enabled, true),
  }
}

export async function fetchPreferences(options = {}) {
  const response = await http.get('/preschool/settings/preferences', {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizePreferences(resolveRecord(payload))
}

export async function updatePreferences(preferences = {}) {
  const response = await http.put('/preschool/settings/preferences', buildPreferencesPayload(preferences))
  const payload = unwrapApiData(response) || {}
  return normalizePreferences(resolveRecord(payload))
}
