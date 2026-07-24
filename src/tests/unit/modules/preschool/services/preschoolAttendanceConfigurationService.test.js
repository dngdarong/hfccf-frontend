import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getAttendanceConfigurationSnapshot,
  loadAttendanceConfiguration,
} from '@/modules/preschool/services/preschoolAttendanceConfigurationService'
import * as attendanceApi from '@/modules/preschool/services/api/preschoolAttendanceConfigurationApi'

vi.mock('@/modules/preschool/services/api/preschoolAttendanceConfigurationApi', async () => {
  const actual = await vi.importActual('@/modules/preschool/services/api/preschoolAttendanceConfigurationApi')

  return {
    ...actual,
    fetchAttendanceSettings: vi.fn(),
    fetchCalendarEvents: vi.fn(),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('preschoolAttendanceConfigurationService', () => {
  it('loads calendar events across backend-safe pages without truncation', async () => {
    attendanceApi.fetchAttendanceSettings.mockResolvedValue({
      id: 1,
      lateThresholdMinutes: 15,
      halfDayThresholdMinutes: 180,
      absenceAlertDays: 3,
      guardianAlertEnabled: true,
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

    attendanceApi.fetchCalendarEvents
      .mockResolvedValueOnce({
        items: [
          { id: 1, title: 'Event 1', type: 'holiday', startDate: '2026-01-01', endDate: '2026-01-01', status: 'active' },
          { id: 2, title: 'Event 2', type: 'holiday', startDate: '2026-01-02', endDate: '2026-01-02', status: 'active' },
        ],
        pagination: { page: 1, perPage: 100, total: 3, totalPages: 2 },
      })
      .mockResolvedValueOnce({
        items: [
          { id: 3, title: 'Event 3', type: 'holiday', startDate: '2026-01-03', endDate: '2026-01-03', status: 'active' },
        ],
        pagination: { page: 2, perPage: 100, total: 3, totalPages: 2 },
      })

    const snapshot = await loadAttendanceConfiguration()

    expect(attendanceApi.fetchCalendarEvents).toHaveBeenCalledTimes(2)
    expect(attendanceApi.fetchCalendarEvents).toHaveBeenNthCalledWith(1, expect.objectContaining({
      page: 1,
      perPage: 100,
    }))
    expect(attendanceApi.fetchCalendarEvents).toHaveBeenNthCalledWith(2, expect.objectContaining({
      page: 2,
      perPage: 100,
    }))
    expect(snapshot.calendarEvents).toHaveLength(3)
    expect(getAttendanceConfigurationSnapshot().calendarEvents).toHaveLength(3)
  })
})
