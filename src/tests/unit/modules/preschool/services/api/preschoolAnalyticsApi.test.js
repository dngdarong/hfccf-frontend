import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  fetchPreschoolAnalyticsDashboard,
  fetchPreschoolAlertAnalytics,
  fetchPreschoolAttendanceAnalytics,
  fetchPreschoolAttendanceReportDataset,
  fetchPreschoolGuardianContactAnalytics,
  fetchPreschoolScheduleAnalytics,
  fetchPreschoolScheduleReportDataset,
  fetchPreschoolSessionAnalytics,
  fetchPreschoolSessionReportDataset,
  fetchPreschoolStudentAnalytics,
  fetchPreschoolTeacherAnalytics,
} from '@/modules/preschool/services/api/preschoolAnalyticsApi'

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

describe('preschool analytics api', () => {
  it('sends only supported filters to analytics endpoints', async () => {
    http.get.mockResolvedValue(stubResponse({ scope: 'dashboard', analytics: { summary: {}, trends: {}, breakdowns: {}, charts: {}, datasets: {}, filters: {}, generated_at: '2026-07-01T10:00:00Z' } }))

    await fetchPreschoolAnalyticsDashboard({
      academicYearId: 9,
      classId: 'class-1',
      teacherUserId: 'teacher-1',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-02',
      status: 'open',
      ignored: 'value',
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/analytics/dashboard', {
      params: {
        academic_year_id: 9,
        class_id: 'class-1',
        teacher_user_id: 'teacher-1',
        date_from: '2026-07-01',
        date_to: '2026-07-02',
        status: 'open',
      },
      signal: undefined,
    })
  })

  it('normalizes analytics and report dataset response payloads', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        scope: 'dashboard',
        analytics: {
          summary: {
            attendance_rate: 95,
            sessions_generated: 4,
          },
          trends: {
            attendance_rate: [
              { label: 'Mon', value: 90 },
            ],
          },
          breakdowns: {
            by_class: [
              { class_id: 'class-1', class_name: 'Morning Stars', total: 12 },
            ],
          },
          charts: {
            attendance: [
              { label: 'Present', value: 10 },
            ],
          },
          datasets: {
            rows: [
              { report_label: 'Term 1', report_total: 2 },
            ],
          },
          filters: {
            academic_year_id: 9,
          },
          generated_at: '2026-07-01T10:00:00Z',
        },
      }),
    )

    await expect(fetchPreschoolAnalyticsDashboard()).resolves.toMatchObject({
      scope: 'dashboard',
      summary: {
        attendanceRate: 95,
        sessionsGenerated: 4,
      },
      trends: {
        attendanceRate: [
          { label: 'Mon', value: 90 },
        ],
      },
      breakdowns: {
        byClass: [
          { classId: 'class-1', className: 'Morning Stars', total: 12 },
        ],
      },
      charts: {
        attendance: [
          { label: 'Present', value: 10 },
        ],
      },
      datasets: {
        rows: [
          { reportLabel: 'Term 1', reportTotal: 2 },
        ],
      },
      filters: {
        academicYearId: 9,
      },
      generatedAt: '2026-07-01T10:00:00Z',
    })

    http.get.mockResolvedValueOnce(
      stubResponse({
        analytics: {
          datasets: {
            rows: [
              { report_name: 'Attendance Report', row_count: 3 },
            ],
          },
          filters: {
            status: 'open',
          },
          generated_at: '2026-07-01T10:15:00Z',
        },
      }),
    )

    await expect(fetchPreschoolAttendanceReportDataset({ status: 'open' })).resolves.toMatchObject({
      datasets: {
        rows: [
          { reportName: 'Attendance Report', rowCount: 3 },
        ],
      },
      filters: {
        status: 'open',
      },
      generatedAt: '2026-07-01T10:15:00Z',
    })
  })

  it('keeps the analytics endpoints and report dataset endpoints distinct', async () => {
    http.get.mockResolvedValue(stubResponse({ analytics: { summary: {}, trends: {}, breakdowns: {}, charts: {}, datasets: {} } }))

    await fetchPreschoolAttendanceAnalytics()
    await fetchPreschoolSessionAnalytics()
    await fetchPreschoolScheduleAnalytics()
    await fetchPreschoolAlertAnalytics()
    await fetchPreschoolStudentAnalytics()
    await fetchPreschoolTeacherAnalytics()
    await fetchPreschoolGuardianContactAnalytics()
    await fetchPreschoolSessionReportDataset()
    await fetchPreschoolScheduleReportDataset()

    expect(http.get).toHaveBeenNthCalledWith(1, '/preschool/analytics/attendance', { params: {}, signal: undefined })
    expect(http.get).toHaveBeenNthCalledWith(2, '/preschool/analytics/sessions', { params: {}, signal: undefined })
    expect(http.get).toHaveBeenNthCalledWith(3, '/preschool/analytics/schedules', { params: {}, signal: undefined })
    expect(http.get).toHaveBeenNthCalledWith(4, '/preschool/analytics/alerts', { params: {}, signal: undefined })
    expect(http.get).toHaveBeenNthCalledWith(5, '/preschool/analytics/students', { params: {}, signal: undefined })
    expect(http.get).toHaveBeenNthCalledWith(6, '/preschool/analytics/teachers', { params: {}, signal: undefined })
    expect(http.get).toHaveBeenNthCalledWith(7, '/preschool/analytics/guardian-contacts', { params: {}, signal: undefined })
    expect(http.get).toHaveBeenNthCalledWith(8, '/preschool/analytics/reports/sessions', { params: {}, signal: undefined })
    expect(http.get).toHaveBeenNthCalledWith(9, '/preschool/analytics/reports/schedules', { params: {}, signal: undefined })
  })
})
