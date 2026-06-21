import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  archiveCalendarEvent,
  buildSchoolWeekLabel,
  createCalendarEvent,
  fetchAttendanceSettings,
  fetchCalendarEvents,
  normalizeAttendanceSettings,
  normalizeAttendanceSummary,
  updateAttendanceSettings,
  updateCalendarEvent,
} from '@/modules/preschool/services/api/preschoolAttendanceConfigurationApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('preschool attendance configuration api', () => {
  it('normalizes attendance settings and school week labels', () => {
    const settings = normalizeAttendanceSettings({
      late_threshold_minutes: 15,
      half_day_threshold_minutes: 180,
      absence_alert_days: 3,
      monday_enabled: true,
      tuesday_enabled: true,
      wednesday_enabled: true,
      thursday_enabled: true,
      friday_enabled: true,
      saturday_enabled: false,
      sunday_enabled: false,
    })

    expect(settings.lateThresholdMinutes).toBe(15)
    expect(settings.halfDayThresholdMinutes).toBe(180)
    expect(settings.absenceAlertDays).toBe(3)
    expect(settings.schoolDaysPerWeek).toBe(5)
    expect(buildSchoolWeekLabel(settings.schoolDaysPerWeek)).toBe('Mon-Fri')
    expect(normalizeAttendanceSummary({ attendance: { calendar_events_count: 12, school_days_per_week: 5 } })).toMatchObject({
      calendarEventsCount: 12,
      schoolWeekLabel: 'Mon-Fri',
    })
  })

  it('fetches and updates attendance settings with normalized payloads', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      settings: {
        id: 9,
        late_threshold_minutes: 15,
        half_day_threshold_minutes: 180,
        absence_alert_days: 3,
        guardian_alert_enabled: true,
        teacher_alert_enabled: false,
        admin_alert_enabled: true,
        monday_enabled: true,
        tuesday_enabled: true,
        wednesday_enabled: true,
        thursday_enabled: true,
        friday_enabled: true,
        saturday_enabled: false,
        sunday_enabled: false,
      },
    }))

    await expect(fetchAttendanceSettings()).resolves.toMatchObject({
      id: 9,
      lateThresholdMinutes: 15,
      absenceAlertDays: 3,
      schoolDaysPerWeek: 5,
      schoolWeek: {
        mondayEnabled: true,
        fridayEnabled: true,
      },
    })
    expect(http.get).toHaveBeenCalledWith('/preschool/settings/attendance', expect.any(Object))

    http.put.mockResolvedValueOnce(stubResponse({
      settings: {
        late_threshold_minutes: 20,
        half_day_threshold_minutes: 200,
        absence_alert_days: 4,
      },
    }))

    await updateAttendanceSettings({
      lateThresholdMinutes: 20,
      halfDayThresholdMinutes: 200,
      absenceAlertDays: 4,
      guardianAlertEnabled: false,
      teacherAlertEnabled: true,
      adminAlertEnabled: true,
      mondayEnabled: true,
      tuesdayEnabled: true,
      wednesdayEnabled: true,
      thursdayEnabled: true,
      fridayEnabled: true,
      saturdayEnabled: false,
      sundayEnabled: false,
    })

    expect(http.put).toHaveBeenCalledWith('/preschool/settings/attendance', expect.objectContaining({
      late_threshold_minutes: 20,
      half_day_threshold_minutes: 200,
      absence_alert_days: 4,
      guardian_alert_enabled: false,
    }))
  })

  it('fetches and mutates calendar events through the dedicated endpoints', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      items: [
        {
          id: 1,
          academic_year_id: 5,
          title: 'National Holiday',
          type: 'holiday',
          start_date: '2026-01-01',
          end_date: '2026-01-01',
          status: 'active',
        },
      ],
    }))

    await expect(fetchCalendarEvents({ academicYearId: 5, status: 'active' })).resolves.toMatchObject({
      items: [
        {
          id: 1,
          academicYearId: 5,
          title: 'National Holiday',
          type: 'holiday',
          status: 'active',
        },
      ],
    })
    expect(http.get).toHaveBeenCalledWith('/preschool/settings/attendance/calendar-events', expect.objectContaining({
      params: expect.objectContaining({
        academic_year_id: 5,
        status: 'active',
      }),
    }))

    http.post.mockResolvedValueOnce(stubResponse({
      event: {
        id: 2,
        academic_year_id: 5,
        title: 'Teacher Training',
        type: 'teacher_training',
        start_date: '2026-02-05',
        end_date: '2026-02-05',
        status: 'active',
      },
    }))

    await expect(createCalendarEvent({
      academicYearId: 5,
      title: 'Teacher Training',
      type: 'teacher_training',
      startDate: '2026-02-05',
      endDate: '2026-02-05',
    })).resolves.toMatchObject({
      id: 2,
      title: 'Teacher Training',
      type: 'teacher_training',
    })

    expect(http.post).toHaveBeenCalledWith('/preschool/settings/attendance/calendar-events', expect.objectContaining({
      academic_year_id: 5,
      title: 'Teacher Training',
      type: 'teacher_training',
      start_date: '2026-02-05',
      end_date: '2026-02-05',
    }))

    http.put.mockResolvedValueOnce(stubResponse({
      event: {
        id: 2,
        academic_year_id: 5,
        title: 'Teacher Training Updated',
        type: 'teacher_training',
        start_date: '2026-02-05',
        end_date: '2026-02-06',
        status: 'active',
      },
    }))

    await expect(updateCalendarEvent(2, {
      academicYearId: 5,
      title: 'Teacher Training Updated',
      type: 'teacher_training',
      startDate: '2026-02-05',
      endDate: '2026-02-06',
    })).resolves.toMatchObject({
      id: 2,
      title: 'Teacher Training Updated',
    })

    expect(http.put).toHaveBeenCalledWith('/preschool/settings/attendance/calendar-events/2', expect.objectContaining({
      title: 'Teacher Training Updated',
      end_date: '2026-02-06',
    }))

    http.post.mockResolvedValueOnce(stubResponse({
      event: {
        id: 2,
        academic_year_id: 5,
        title: 'Teacher Training Updated',
        type: 'teacher_training',
        status: 'archived',
      },
    }))

    await expect(archiveCalendarEvent(2)).resolves.toMatchObject({
      id: 2,
      status: 'archived',
    })
    expect(http.post).toHaveBeenCalledWith('/preschool/settings/attendance/calendar-events/2/archive')
  })
})
