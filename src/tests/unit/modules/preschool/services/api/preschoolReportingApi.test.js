import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  exportReport,
  fetchAttendanceClassReports,
  fetchAttendanceReports,
  fetchReportsDashboard,
  normalizeReportDashboard,
} from '@/modules/preschool/services/api/preschoolReportingApi'

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

describe('preschool reporting api', () => {
  it('normalizes the operations dashboard payload shape', () => {
    expect(normalizeReportDashboard({
      report: 'dashboard',
      kpis: {
        attendance_rate: 95,
        revenue: 1250,
        open_health_alerts: 2,
        assessment_completion: 88,
      },
      modules: {
        attendance: { attendance_rate: 95 },
      },
    })).toMatchObject({
      report: 'dashboard',
      kpis: {
        attendanceRate: 95,
        revenue: 1250,
        openHealthAlerts: 2,
        assessmentCompletion: 88,
      },
      modules: {
        attendance: { attendance_rate: 95 },
      },
    })
  })

  it('fetches the dashboard report with normalized filters', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      dashboard: {
        report: 'dashboard',
        kpis: {
          attendance_rate: 96,
          revenue: 1800,
        },
      },
      filters: {
        export_formats: [{ label: 'CSV', value: 'csv' }],
      },
    }))

    await expect(fetchReportsDashboard({
      academicYearId: 7,
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
    })).resolves.toMatchObject({
      dashboard: {
        report: 'dashboard',
        kpis: {
          attendanceRate: 96,
          revenue: 1800,
        },
      },
      filters: {
        export_formats: [{ label: 'CSV', value: 'csv' }],
      },
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/reports/dashboard', expect.objectContaining({
      params: expect.objectContaining({
        academicYearId: 7,
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      }),
    }))
  })

  it('fetches individual report sections and export payloads', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      report: 'attendance',
      summary: {
        attendance_rate: 90,
        late_rate: 4,
      },
      cards: [
        { title: 'Attendance rate', value: 90 },
      ],
    }))

    await expect(fetchAttendanceReports({ classId: 2 })).resolves.toMatchObject({
      report: 'attendance',
      summary: {
        attendanceRate: 90,
        lateRate: 4,
      },
      cards: [{ title: 'Attendance rate', value: 90 }],
    })

    http.get.mockResolvedValueOnce(stubResponse({
      report: 'attendance_class',
      rows: [{ label: 'Class A', value: 12 }],
    }))

    await expect(fetchAttendanceClassReports({ teacherId: 8 })).resolves.toMatchObject({
      report: 'attendance_class',
      rows: [{ label: 'Class A', value: 12 }],
    })

    http.get.mockResolvedValueOnce(stubResponse({
      export: {
        section: 'attendance',
        format: 'csv',
        filename: 'preschool-attendance.csv',
        content: 'label,value\nA,1',
      },
    }))

    await expect(exportReport('attendance', 'csv', { academicYearId: 7 })).resolves.toMatchObject({
      section: 'attendance',
      format: 'csv',
      filename: 'preschool-attendance.csv',
      content: 'label,value\nA,1',
    })

    expect(http.get).toHaveBeenNthCalledWith(3, '/preschool/reports/export', expect.objectContaining({
      params: expect.objectContaining({
        section: 'attendance',
        format: 'csv',
        academicYearId: 7,
      }),
    }))
  })
})
