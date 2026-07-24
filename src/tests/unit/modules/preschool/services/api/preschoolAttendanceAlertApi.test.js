import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  fetchPreschoolAttendanceAlertSummary,
  fetchPreschoolAttendanceAlerts,
} from '@/modules/preschool/services/api/preschoolAttendanceAlertApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('preschool attendance alert api', () => {
  it('normalizes canonical attendance alerts and summary payloads', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        items: [
          {
            id: 'alert-1',
            student_id: 'student-1',
            student_name: 'Alice Student',
            class_id: 'class-1',
            class_name: 'Morning Stars',
            guardian_id: 'guardian-1',
            guardian_name: 'Guardian One',
            guardian_phone: '+855 12 333 333',
            alert_type: 'repeated_absence',
            alert_label: 'Repeated Absence',
            status: 'queued',
            severity: 'high',
            absence_count: 3,
            threshold_days: 3,
            source_type: 'attendance',
            source_id: 'attendance-1',
            message: 'Follow up required',
            created_at: '2026-07-02T08:00:00+07:00',
            updated_at: '2026-07-02T08:10:00+07:00',
            acknowledged_at: null,
            follow_up_status: 'open',
          },
        ],
        summary: {
          total: 1,
          open: 1,
          acknowledged: 0,
          overdue: 0,
          byClass: [
            {
              class_id: 'class-1',
              class_name: 'Morning Stars',
              total: 1,
              open: 1,
              acknowledged: 0,
              overdue: 0,
            },
          ],
          bySeverity: [
            { severity: 'high', total: 1 },
          ],
        },
        pagination: { currentPage: 2, lastPage: 3, perPage: 25, total: 62 },
      }),
    )

    await expect(
      fetchPreschoolAttendanceAlerts({
        studentId: 'student-1',
        classId: 'class-1',
        status: 'queued',
        dateFrom: '2026-07-01',
        dateTo: '2026-07-02',
        threshold: 3,
        communicationType: 'repeated_absence',
        page: 2,
        perPage: 25,
      }),
    ).resolves.toMatchObject({
      items: [
        {
          id: 'alert-1',
          studentId: 'student-1',
          classId: 'class-1',
          guardianName: 'Guardian One',
          alertType: 'repeated_absence',
          threshold: 3,
          followUpStatus: 'open',
        },
      ],
      summary: {
        total: 1,
        open: 1,
        acknowledged: 0,
        overdue: 0,
        byClass: [
          {
            classId: 'class-1',
            className: 'Morning Stars',
            total: 1,
          },
        ],
        bySeverity: [
          { severity: 'high', total: 1 },
        ],
      },
      pagination: { currentPage: 2, lastPage: 3, perPage: 25, total: 62 },
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/attendance-alerts', {
      params: {
        student_id: 'student-1',
        class_id: 'class-1',
        status: 'queued',
        date_from: '2026-07-01',
        date_to: '2026-07-02',
        threshold: 3,
        communication_type: 'repeated_absence',
        page: 2,
        per_page: 25,
      },
      signal: undefined,
    })

    http.get.mockResolvedValueOnce(
      stubResponse({
        items: [
          {
            id: 'alert-2',
            alert_type: 'late_pattern',
            status: 'sent',
          },
        ],
        summary: {
          total: 1,
          open: 1,
          acknowledged: 0,
          overdue: 0,
          byClass: [],
          bySeverity: [],
        },
        pagination: { currentPage: 1, lastPage: 1, perPage: 5, total: 1 },
      }),
    )

    await expect(
      fetchPreschoolAttendanceAlertSummary({
        page: 1,
        perPage: 5,
      }),
    ).resolves.toMatchObject({
      summary: {
        total: 1,
        open: 1,
        acknowledged: 0,
        overdue: 0,
      },
      recentAlerts: [
        {
          id: 'alert-2',
          alertType: 'late_pattern',
          status: 'sent',
        },
      ],
      pagination: { currentPage: 1, lastPage: 1, perPage: 5, total: 1 },
    })
  })
})
