import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  fetchPreferences,
  normalizePreferences,
  updatePreferences,
} from '@/modules/preschool/services/api/preschoolPreferencesApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('preschool preferences api', () => {
  it('normalizes preference payloads', () => {
    expect(normalizePreferences({
      timezone: 'Asia/Phnom_Penh',
      default_language: 'kh',
      minimum_enrollment_age_months: 30,
      maximum_enrollment_age_months: 72,
      student_code_prefix: 'PRE',
      student_code_year_format: 'YYYY',
      student_code_sequence_length: 5,
      default_class_capacity: 20,
      teacher_student_ratio: 12,
      waitlist_enabled: false,
      minimum_guardians: 1,
      maximum_guardians: 3,
      primary_guardian_required: true,
      pickup_authorization_required: true,
      attendance_alert_enabled: true,
      assessment_alert_enabled: false,
      health_alert_enabled: true,
      enrollment_notification_enabled: false,
    })).toMatchObject({
      timezone: 'Asia/Phnom_Penh',
      defaultLanguage: 'kh',
      minimumEnrollmentAgeMonths: 30,
      maximumEnrollmentAgeMonths: 72,
      studentCodePrefix: 'PRE',
      studentCodeYearFormat: 'YYYY',
      studentCodeSequenceLength: 5,
      defaultClassCapacity: 20,
      teacherStudentRatio: 12,
      waitlistEnabled: false,
      minimumGuardians: 1,
      maximumGuardians: 3,
      primaryGuardianRequired: true,
      pickupAuthorizationRequired: true,
      attendanceAlertEnabled: true,
      assessmentAlertEnabled: false,
      healthAlertEnabled: true,
      enrollmentNotificationEnabled: false,
    })
  })

  it('fetches and updates preferences with normalized payloads', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      settings: {
        id: 1,
        timezone: 'Asia/Phnom_Penh',
        default_language: 'en',
        minimum_enrollment_age_months: 24,
        student_code_prefix: 'PS',
        student_code_year_format: 'YYYY',
        student_code_sequence_length: 4,
      },
    }))

    await expect(fetchPreferences()).resolves.toMatchObject({
      timezone: 'Asia/Phnom_Penh',
      defaultLanguage: 'en',
      studentCodePrefix: 'PS',
    })

    http.put.mockResolvedValueOnce(stubResponse({
      settings: {
        timezone: 'Asia/Phnom_Penh',
        default_language: 'kh',
        minimum_enrollment_age_months: 30,
        maximum_enrollment_age_months: 72,
        student_code_prefix: 'PRE',
        student_code_year_format: 'YY',
        student_code_sequence_length: 6,
        default_class_capacity: 22,
      },
    }))

    await expect(updatePreferences({
      timezone: 'Asia/Phnom_Penh',
      defaultLanguage: 'kh',
      dateFormat: 'd/m/Y',
      timeFormat: 'H:i',
      minimumEnrollmentAgeMonths: 30,
      maximumEnrollmentAgeMonths: 72,
      autoApproveEnrollment: true,
      studentCodePrefix: 'PRE',
      studentCodeYearFormat: 'YY',
      studentCodeSequenceLength: 6,
      defaultClassCapacity: 22,
      teacherStudentRatio: 11,
      waitlistEnabled: false,
      minimumGuardians: 1,
      maximumGuardians: 3,
      primaryGuardianRequired: true,
      pickupAuthorizationRequired: true,
      attendanceAlertEnabled: true,
      assessmentAlertEnabled: true,
      healthAlertEnabled: true,
      enrollmentNotificationEnabled: false,
    })).resolves.toMatchObject({
      defaultLanguage: 'kh',
      studentCodePrefix: 'PRE',
      defaultClassCapacity: 22,
    })

    expect(http.put).toHaveBeenCalledWith('/preschool/settings/preferences', expect.objectContaining({
      default_language: 'kh',
      student_code_prefix: 'PRE',
      student_code_year_format: 'YY',
      student_code_sequence_length: 6,
      default_class_capacity: 22,
      teacher_student_ratio: 11,
      waitlist_enabled: false,
    }))
  })
})
