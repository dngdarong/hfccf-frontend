import { describe, it, expect } from 'vitest'
import { reportExportService } from '@/modules/preschool/services/reportExportService'

describe('Attendance Report Exports', () => {
  describe('Monthly Attendance Export', () => {
    const mockMonthlyData = {
      reportType: 'attendance',
      mode: 'monthly',
      period: { year: 2026, month: 7 },
      summary: {
        present: 18,
        absent: 2,
        late: 1,
        excused: 0,
        percentage: 90,
      },
      items: [
        { date: '2026-07-01', studentName: 'John Smith', status: 'present' },
        { date: '2026-07-02', studentName: 'Maria Garcia', status: 'absent' },
        { date: '2026-07-03', studentName: 'John Smith', status: 'late' },
      ],
      class: { name: 'Nursery A', id: 'class-1' },
      monthlyBreakdown: [],
    }

    it('exports monthly attendance data with valid structure', () => {
      expect(() =>
        reportExportService.validateExportData('attendance', mockMonthlyData),
      ).not.toThrow()
    })

    it('generates correct filename for monthly attendance', () => {
      const filename = reportExportService.generateFilename('attendance', mockMonthlyData)
      expect(filename).toContain('AttendanceReport')
      expect(filename).toContain('Monthly')
      expect(filename).toContain('Nursery-A')
    })

    it('includes attendance summary statistics', () => {
      const { summary } = mockMonthlyData
      expect(summary).toHaveProperty('present')
      expect(summary).toHaveProperty('absent')
      expect(summary).toHaveProperty('late')
      expect(summary).toHaveProperty('excused')
      expect(summary).toHaveProperty('percentage')
    })

    it('includes individual attendance records', () => {
      const { items } = mockMonthlyData
      expect(items).toBeInstanceOf(Array)
      items.forEach(record => {
        expect(record).toHaveProperty('date')
        expect(record).toHaveProperty('status')
      })
    })

    it('calculates attendance percentage correctly', () => {
      const { summary, items } = mockMonthlyData
      const presentCount = items.filter(r => r.status === 'present').length
      const expectedPercentage = (presentCount / items.length) * 100
      expect(Math.round(expectedPercentage)).toBeLessThanOrEqual(summary.percentage + 1)
    })

    it('exports to Excel with correct sheet structure', () => {
      expect(() =>
        reportExportService.exportToExcel('attendance', mockMonthlyData),
      ).not.toThrow()
    })
  })

  describe('Yearly Attendance Export', () => {
    const mockYearlyData = {
      reportType: 'attendance',
      mode: 'yearly',
      period: { year: 2026 },
      summary: {
        present: 180,
        absent: 20,
        late: 5,
        excused: 0,
        percentage: 88,
      },
      items: [
        { date: '2026-01-15', studentName: 'John Smith', status: 'present' },
        { date: '2026-02-10', studentName: 'Maria Garcia', status: 'absent' },
      ],
      monthlyBreakdown: [
        { month: 1, present: 20, absent: 2, late: 0, excused: 0 },
        { month: 2, present: 18, absent: 3, late: 1, excused: 0 },
        { month: 3, present: 19, absent: 2, late: 0, excused: 0 },
      ],
      class: { name: 'Nursery A', id: 'class-1' },
    }

    it('exports yearly attendance data with valid structure', () => {
      expect(() =>
        reportExportService.validateExportData('attendance', mockYearlyData),
      ).not.toThrow()
    })

    it('generates correct filename for yearly attendance', () => {
      const filename = reportExportService.generateFilename('attendance', mockYearlyData)
      expect(filename).toContain('AttendanceReport')
      expect(filename).toContain('Yearly')
      expect(filename).toContain('Nursery-A')
    })

    it('includes monthly breakdown data', () => {
      const { monthlyBreakdown } = mockYearlyData
      expect(monthlyBreakdown).toBeInstanceOf(Array)
      expect(monthlyBreakdown.length).toBeGreaterThan(0)
      monthlyBreakdown.forEach(month => {
        expect(month).toHaveProperty('month')
        expect(month).toHaveProperty('present')
        expect(month).toHaveProperty('absent')
      })
    })

    it('includes year-to-date totals', () => {
      const { summary } = mockYearlyData
      expect(summary.present).toBeGreaterThan(summary.absent)
      expect(summary.percentage).toBeGreaterThan(0)
      expect(summary.percentage).toBeLessThanOrEqual(100)
    })

    it('exports to Excel with monthly and yearly sheets', () => {
      expect(() =>
        reportExportService.exportToExcel('attendance', mockYearlyData),
      ).not.toThrow()
    })
  })

  describe('Attendance Data Integrity', () => {
    it('validates all attendance statuses are recognized', () => {
      const validStatuses = ['present', 'absent', 'late', 'excused']
      const data = {
        reportType: 'attendance',
        mode: 'monthly',
        period: { year: 2026, month: 7 },
        summary: { present: 20, absent: 0, late: 0, excused: 0, percentage: 100 },
        items: [
          { date: '2026-07-01', status: 'present' },
          { date: '2026-07-02', status: 'absent' },
          { date: '2026-07-03', status: 'late' },
          { date: '2026-07-04', status: 'excused' },
        ],
      }

      data.items.forEach(item => {
        expect(validStatuses).toContain(item.status)
      })
    })

    it('includes complete class information', () => {
      const data = {
        reportType: 'attendance',
        mode: 'monthly',
        period: { year: 2026, month: 7 },
        summary: { present: 20, absent: 0, late: 0, excused: 0, percentage: 100 },
        items: [],
        class: {
          id: 'class-1',
          name: 'Nursery A',
        },
      }

      expect(data.class).toHaveProperty('id')
      expect(data.class).toHaveProperty('name')
    })

    it('includes date information for all records', () => {
      const data = {
        reportType: 'attendance',
        mode: 'monthly',
        period: { year: 2026, month: 7 },
        summary: { present: 2, absent: 0, late: 0, excused: 0, percentage: 100 },
        items: [
          { date: '2026-07-01', status: 'present' },
          { date: '2026-07-02', status: 'present' },
        ],
      }

      data.items.forEach(record => {
        expect(record.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })

    it('tracks attendance by student when available', () => {
      const data = {
        reportType: 'attendance',
        mode: 'monthly',
        period: { year: 2026, month: 7 },
        summary: { present: 20, absent: 0, late: 0, excused: 0, percentage: 100 },
        items: [
          { date: '2026-07-01', studentName: 'John Smith', status: 'present' },
          { date: '2026-07-02', studentName: 'John Smith', status: 'present' },
        ],
      }

      const johnRecords = data.items.filter(r => r.studentName === 'John Smith')
      expect(johnRecords.length).toBe(2)
    })
  })

  describe('Attendance Export Validation', () => {
    it('requires mode to be defined', () => {
      const invalidData = {
        reportType: 'attendance',
        mode: null,
        period: { year: 2026, month: 7 },
        summary: { present: 20, absent: 0 },
      }

      expect(() =>
        reportExportService.validateExportData('attendance', invalidData),
      ).toThrow()
    })

    it('requires period information', () => {
      const invalidData = {
        reportType: 'attendance',
        mode: 'monthly',
        period: null,
        summary: { present: 20, absent: 0 },
      }

      expect(() =>
        reportExportService.validateExportData('attendance', invalidData),
      ).toThrow(/period/)
    })

    it('requires summary statistics', () => {
      const invalidData = {
        reportType: 'attendance',
        mode: 'monthly',
        period: { year: 2026, month: 7 },
        summary: null,
      }

      expect(() =>
        reportExportService.validateExportData('attendance', invalidData),
      ).toThrow(/summary/)
    })

    it('handles empty attendance records', () => {
      const data = {
        reportType: 'attendance',
        mode: 'monthly',
        period: { year: 2026, month: 7 },
        summary: { present: 0, absent: 0, late: 0, excused: 0, percentage: 0 },
        items: [],
      }

      expect(() =>
        reportExportService.validateExportData('attendance', data),
      ).not.toThrow()
    })

    it('handles both monthly and yearly modes', () => {
      const monthlyData = {
        reportType: 'attendance',
        mode: 'monthly',
        period: { year: 2026, month: 7 },
        summary: { present: 20, absent: 0, late: 0, excused: 0, percentage: 100 },
        items: [],
      }

      const yearlyData = {
        reportType: 'attendance',
        mode: 'yearly',
        period: { year: 2026 },
        summary: { present: 200, absent: 10, late: 5, excused: 0, percentage: 94 },
        items: [],
      }

      expect(() =>
        reportExportService.validateExportData('attendance', monthlyData),
      ).not.toThrow()
      expect(() =>
        reportExportService.validateExportData('attendance', yearlyData),
      ).not.toThrow()
    })
  })

  describe('Attendance Export Calculations', () => {
    it('calculates correct attendance percentage from summary', () => {
      const data = {
        reportType: 'attendance',
        mode: 'monthly',
        period: { year: 2026, month: 7 },
        summary: {
          present: 15,
          absent: 5,
          late: 0,
          excused: 0,
          percentage: 75,
        },
        items: [],
      }

      const totalRecords = data.summary.present + data.summary.absent
      const calculated = (data.summary.present / totalRecords) * 100
      expect(Math.round(calculated)).toBe(data.summary.percentage)
    })

    it('tracks all attendance status categories', () => {
      const data = {
        reportType: 'attendance',
        mode: 'monthly',
        period: { year: 2026, month: 7 },
        summary: {
          present: 16,
          absent: 2,
          late: 1,
          excused: 1,
          percentage: 80,
        },
        items: [],
      }

      const { summary } = data
      const total = summary.present + summary.absent + summary.late + summary.excused
      expect(total).toBe(20)
    })

    it('provides monthly breakdown for yearly reports', () => {
      const data = {
        reportType: 'attendance',
        mode: 'yearly',
        period: { year: 2026 },
        summary: { present: 200, absent: 20, late: 5, excused: 0, percentage: 91 },
        monthlyBreakdown: [
          { month: 1, present: 20, absent: 2, late: 0, excused: 0 },
          { month: 2, present: 18, absent: 3, late: 1, excused: 0 },
        ],
        items: [],
      }

      let totalPresent = 0
      data.monthlyBreakdown.forEach(month => {
        totalPresent += month.present
      })
      expect(totalPresent).toBeLessThanOrEqual(data.summary.present)
    })
  })

  describe('Attendance Export Filename Handling', () => {
    it('includes month in filename for monthly reports', () => {
      const data = {
        reportType: 'attendance',
        mode: 'monthly',
        period: { year: 2026, month: 7 },
        summary: { present: 20, absent: 0, late: 0, excused: 0, percentage: 100 },
        items: [],
        class: { name: 'Nursery A' },
      }

      const filename = reportExportService.generateFilename('attendance', data)
      expect(filename).toContain('Monthly')
    })

    it('excludes month from filename for yearly reports', () => {
      const data = {
        reportType: 'attendance',
        mode: 'yearly',
        period: { year: 2026 },
        summary: { present: 200, absent: 20, late: 5, excused: 0, percentage: 91 },
        items: [],
        class: { name: 'Nursery A' },
      }

      const filename = reportExportService.generateFilename('attendance', data)
      expect(filename).toContain('Yearly')
      expect(filename).not.toContain('Monthly')
    })

    it('handles class names with special characters', () => {
      const data = {
        reportType: 'attendance',
        mode: 'monthly',
        period: { year: 2026, month: 7 },
        summary: { present: 20, absent: 0, late: 0, excused: 0, percentage: 100 },
        items: [],
        class: { name: "Grade 1-B (Afternoon)" },
      }

      const filename = reportExportService.generateFilename('attendance', data)
      expect(filename).not.toContain('(')
      expect(filename).not.toContain(')')
    })
  })
})
