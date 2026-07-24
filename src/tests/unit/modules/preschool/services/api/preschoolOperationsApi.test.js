import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  fetchPreschoolOperationsDashboard,
  normalizeOperationsBundle,
} from '@/modules/preschool/services/api/preschoolOperationsApi'

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

describe('preschool operations api', () => {
  it('sends only supported filters to the operations dashboard endpoint', async () => {
    http.get.mockResolvedValue(stubResponse({}))

    await fetchPreschoolOperationsDashboard({
      academicYearId: 11,
      classId: 'class-1',
      teacherUserId: 'teacher-1',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-02',
      status: 'open',
      ignored: 'value',
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/operations/dashboard', {
      params: {
        academic_year_id: 11,
        class_id: 'class-1',
        teacher_user_id: 'teacher-1',
        date_from: '2026-07-01',
        date_to: '2026-07-02',
        status: 'open',
      },
      signal: undefined,
    })
  })

  it('normalizes the operations response payload and quick actions', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        scope: 'operations',
        summary: {
          attendance_rate: 95,
          open_alerts: 2,
        },
        today: {
          date: '2026-07-02',
          today_sessions: [
            { id: 1, class_name: 'Morning Stars', schedule_label: '8:00 - 10:00' },
          ],
        },
        guardian_communications: {
          summary: {
            outstanding_follow_ups: 1,
          },
          items: [
            { id: 2, subject: 'Call guardian', created_at: '2026-07-02T08:00:00Z' },
          ],
        },
        quick_actions: [
          { route_name: 'dashboard-preschool-admin-attendance', label: 'Take Attendance' },
        ],
        generated_at: '2026-07-02T10:00:00Z',
      }),
    )

    await expect(fetchPreschoolOperationsDashboard()).resolves.toMatchObject({
      scope: 'operations',
      summary: {
        attendanceRate: 95,
        openAlerts: 2,
      },
      today: {
        date: '2026-07-02',
        todaySessions: [
          { id: 1, className: 'Morning Stars', scheduleLabel: '8:00 - 10:00' },
        ],
      },
      guardianCommunications: {
        summary: {
          outstandingFollowUps: 1,
        },
        items: [
          { id: 2, subject: 'Call guardian', createdAt: '2026-07-02T08:00:00Z' },
        ],
      },
      quickActions: [
        {
          routeName: 'dashboard-preschool-admin-attendance',
          label: 'Take Attendance',
          labelKey: 'takeAttendance',
        },
      ],
      generatedAt: '2026-07-02T10:00:00Z',
    })
  })

  it('returns stable empty structures when the backend omits optional sections', async () => {
    expect(normalizeOperationsBundle({})).toMatchObject({
      scope: '',
      summary: {},
      today: {},
      attendance: {},
      sessions: {},
      alerts: {},
      guardianCommunications: {},
      health: {},
      payments: {},
      assessments: {},
      teachers: {},
      students: {},
      risks: {},
      timeline: [],
      quickActions: [],
      generatedAt: '',
    })
  })
})
