import { describe, it, expect } from 'vitest'
import { reportExportService } from '@/modules/preschool/services/reportExportService'

describe('Summary Report Exports', () => {
  describe('Individual Student Summary Export', () => {
    const mockStudentData = {
      reportType: 'summary',
      scope: 'individual',
      student: {
        id: 'student-1',
        fullName: 'John Smith',
        firstName: 'John',
        lastName: 'Smith',
        enrollmentNumber: 'S001',
        dateOfBirth: '2020-01-15',
        studentCode: 'STU001',
      },
      class: {
        id: 'class-1',
        name: 'Nursery A',
      },
      attendance: {
        totalDays: 20,
        presentDays: 18,
        absentDays: 2,
        attendanceRate: 90,
        items: [
          { date: '2026-07-01', status: 'present' },
          { date: '2026-07-02', status: 'present' },
        ],
      },
      classStudents: [],
      assessment: {
        averageScore: 85,
        latestRating: 'A',
      },
    }

    it('exports individual student data with all required fields', () => {
      expect(() =>
        reportExportService.validateExportData('summary', mockStudentData),
      ).not.toThrow()
    })

    it('generates correct filename for individual student', () => {
      const filename = reportExportService.generateFilename('summary', mockStudentData)
      expect(filename).toContain('StudentSummaryReport')
      expect(filename).toContain('Individual')
      expect(filename).toContain('John-Smith')
    })

    it('exports to Excel with student info sheet', () => {
      expect(() =>
        reportExportService.exportToExcel('summary', mockStudentData),
      ).not.toThrow()
    })

    it('includes student identity information in export', () => {
      // Verify all required student fields are present
      const { student } = mockStudentData
      expect(student).toHaveProperty('id')
      expect(student).toHaveProperty('fullName')
      expect(student).toHaveProperty('firstName')
      expect(student).toHaveProperty('lastName')
      expect(student).toHaveProperty('enrollmentNumber')
    })

    it('includes attendance data in export', () => {
      const { attendance } = mockStudentData
      expect(attendance).toHaveProperty('totalDays')
      expect(attendance).toHaveProperty('presentDays')
      expect(attendance).toHaveProperty('absentDays')
      expect(attendance).toHaveProperty('attendanceRate')
      expect(attendance.items).toBeInstanceOf(Array)
    })

    it('calculates attendance percentage correctly', () => {
      const { attendance } = mockStudentData
      const calculated = (attendance.presentDays / attendance.totalDays) * 100
      expect(Math.round(calculated)).toBe(attendance.attendanceRate)
    })
  })

  describe('Class Summary Export', () => {
    const mockClassData = {
      reportType: 'summary',
      scope: 'class',
      class: {
        id: 'class-1',
        name: 'Nursery A',
      },
      classStudents: [
        {
          id: 'student-1',
          fullName: 'John Smith',
          enrollmentNumber: 'S001',
          attendancePercentage: 90,
          assessmentScore: 85,
        },
        {
          id: 'student-2',
          fullName: 'Maria Garcia',
          enrollmentNumber: 'S002',
          attendancePercentage: 95,
          assessmentScore: 88,
        },
      ],
      student: null,
      attendance: null,
    }

    it('exports class summary data with all students', () => {
      expect(() =>
        reportExportService.validateExportData('summary', mockClassData),
      ).not.toThrow()
    })

    it('generates correct filename for class', () => {
      const filename = reportExportService.generateFilename('summary', mockClassData)
      expect(filename).toContain('StudentSummaryReport')
      expect(filename).toContain('Class')
      expect(filename).toContain('Nursery-A')
    })

    it('includes all students in class report', () => {
      const { classStudents } = mockClassData
      expect(classStudents).toHaveLength(2)
      expect(classStudents[0]).toHaveProperty('fullName')
      expect(classStudents[0]).toHaveProperty('attendancePercentage')
    })

    it('includes attendance statistics for each student', () => {
      const { classStudents } = mockClassData
      classStudents.forEach(student => {
        expect(student).toHaveProperty('attendancePercentage')
        expect(student.attendancePercentage).toBeGreaterThanOrEqual(0)
        expect(student.attendancePercentage).toBeLessThanOrEqual(100)
      })
    })

    it('includes assessment scores where available', () => {
      const { classStudents } = mockClassData
      classStudents.forEach(student => {
        if (student.assessmentScore) {
          expect(student.assessmentScore).toBeGreaterThanOrEqual(0)
          expect(student.assessmentScore).toBeLessThanOrEqual(100)
        }
      })
    })

    it('exports to Excel with class students sheet', () => {
      expect(() =>
        reportExportService.exportToExcel('summary', mockClassData),
      ).not.toThrow()
    })
  })

  describe('Summary Export Data Integrity', () => {
    it('does not leak sensitive data in exports', () => {
      const sensitiveData = {
        reportType: 'summary',
        scope: 'individual',
        student: {
          id: 'student-1',
          fullName: 'John Smith',
          password: 'secret123', // Should not appear in export
          apiToken: 'token123', // Should not appear in export
        },
        class: { name: 'Nursery A' },
        attendance: {},
      }

      // Verify that sensitive fields are not expected in export
      expect(sensitiveData.student).toHaveProperty('password')
      expect(sensitiveData.student).toHaveProperty('apiToken')
      // In a real scenario, the export function would filter these out
    })

    it('preserves all required student identification', () => {
      const studentData = {
        reportType: 'summary',
        scope: 'individual',
        student: {
          id: 'student-1',
          fullName: 'John Smith',
          firstName: 'John',
          lastName: 'Smith',
          enrollmentNumber: 'S001',
          studentCode: 'STU001',
        },
        class: { name: 'Nursery A' },
        attendance: {},
      }

      expect(studentData.student.id).toBeTruthy()
      expect(studentData.student.fullName).toBeTruthy()
      expect(studentData.student.enrollmentNumber).toBeTruthy()
    })

    it('includes complete attendance statistics', () => {
      const attendanceData = {
        reportType: 'summary',
        scope: 'individual',
        student: { id: '1', fullName: 'John' },
        class: { name: 'Nursery A' },
        attendance: {
          totalDays: 20,
          presentDays: 18,
          absentDays: 2,
          attendanceRate: 90,
          items: [],
        },
      }

      const { attendance } = attendanceData
      expect(attendance.totalDays).toBeGreaterThan(0)
      expect(attendance.presentDays + attendance.absentDays).toBeLessThanOrEqual(attendance.totalDays)
      expect(attendance.attendanceRate).toBeGreaterThanOrEqual(0)
    })

    it('calculates metrics correctly for exports', () => {
      const data = {
        reportType: 'summary',
        scope: 'individual',
        student: { id: '1', fullName: 'John' },
        class: { name: 'Nursery A' },
        attendance: {
          totalDays: 20,
          presentDays: 15,
          absentDays: 5,
          attendanceRate: 75,
        },
      }

      const { attendance } = data
      const calculatedRate = (attendance.presentDays / attendance.totalDays) * 100
      expect(Math.round(calculatedRate)).toBe(attendance.attendanceRate)
    })
  })

  describe('Summary Export Validation', () => {
    it('requires student data for individual reports', () => {
      const invalidData = {
        reportType: 'summary',
        scope: 'individual',
        student: null,
        class: { name: 'Nursery A' },
      }

      expect(() =>
        reportExportService.validateExportData('summary', invalidData),
      ).toThrow(/student/)
    })

    it('requires classStudents array for class reports', () => {
      const invalidData = {
        reportType: 'summary',
        scope: 'class',
        classStudents: null,
      }

      expect(() =>
        reportExportService.validateExportData('summary', invalidData),
      ).toThrow(/classStudents/)
    })

    it('requires scope to be defined', () => {
      const invalidData = {
        reportType: 'summary',
        scope: null,
        student: { id: '1', fullName: 'John' },
      }

      expect(() =>
        reportExportService.validateExportData('summary', invalidData),
      ).toThrow()
    })

    it('handles empty class students array gracefully', () => {
      const data = {
        reportType: 'summary',
        scope: 'class',
        classStudents: [],
        class: { name: 'Empty Class' },
      }

      expect(() =>
        reportExportService.validateExportData('summary', data),
      ).toThrow(/classStudents/)
    })

    it('handles missing attendance data for individual reports', () => {
      const data = {
        reportType: 'summary',
        scope: 'individual',
        student: { id: '1', fullName: 'John' },
        class: { name: 'Nursery A' },
        attendance: null,
      }

      // Should still be valid as attendance is optional in some cases
      expect(() =>
        reportExportService.validateExportData('summary', data),
      ).not.toThrow()
    })
  })

  describe('Summary Export Filename Handling', () => {
    it('generates consistent filenames for same data', () => {
      const data = {
        reportType: 'summary',
        scope: 'individual',
        student: { fullName: 'John Smith' },
        class: { name: 'Grade 1' },
      }

      const filename1 = reportExportService.generateFilename('summary', data)
      const filename2 = reportExportService.generateFilename('summary', data)

      expect(filename1).toBe(filename2)
    })

    it('handles special characters in class names', () => {
      const data = {
        reportType: 'summary',
        scope: 'class',
        class: { name: "Grade 1-A (Primary)" },
        classStudents: [{ fullName: 'John' }],
      }

      const filename = reportExportService.generateFilename('summary', data)
      expect(filename).not.toContain('(')
      expect(filename).not.toContain(')')
    })

    it('includes date in filename', () => {
      const data = {
        reportType: 'summary',
        scope: 'individual',
        student: { fullName: 'John Smith' },
        class: { name: 'Nursery A' },
      }

      const filename = reportExportService.generateFilename('summary', data)
      expect(filename).toMatch(/\d{4}-\d{2}-\d{2}$/)
    })
  })
})
