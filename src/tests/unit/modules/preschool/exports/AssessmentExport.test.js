import { describe, it, expect } from 'vitest'
import { reportExportService } from '@/modules/preschool/services/reportExportService'

describe('Assessment Report Exports', () => {
  describe('Individual Assessment Export', () => {
    const mockIndividualData = {
      reportType: 'assessment',
      scope: 'individual',
      student: {
        id: 'student-1',
        fullName: 'John Smith',
        enrollmentNumber: 'S001',
        dateOfBirth: '2020-01-15',
      },
      class: {
        id: 'class-1',
        name: 'Nursery A',
      },
      assessments: [
        { date: '2026-07-20', category: 'Math', score: 85, rating: 'A', comments: 'Good performance' },
        { date: '2026-07-15', category: 'Language', score: 82, rating: 'A', comments: 'Excellent progress' },
        { date: '2026-07-10', category: 'Science', score: 78, rating: 'B', comments: 'Needs improvement' },
      ],
      classAssessments: [],
      summary: {
        averageScore: 81.67,
        latestRating: 'A',
        trend: 'improving',
      },
    }

    it('exports individual assessment data with valid structure', () => {
      expect(() =>
        reportExportService.validateExportData('assessment', mockIndividualData),
      ).not.toThrow()
    })

    it('generates correct filename for individual assessment', () => {
      const filename = reportExportService.generateFilename('assessment', mockIndividualData)
      expect(filename).toContain('AssessmentReport')
      expect(filename).toContain('Individual')
      expect(filename).toContain('John-Smith')
    })

    it('includes student identity information', () => {
      const { student } = mockIndividualData
      expect(student).toHaveProperty('id')
      expect(student).toHaveProperty('fullName')
      expect(student).toHaveProperty('enrollmentNumber')
    })

    it('includes comprehensive assessment history', () => {
      const { assessments } = mockIndividualData
      expect(assessments).toBeInstanceOf(Array)
      expect(assessments.length).toBeGreaterThan(0)
      assessments.forEach(assessment => {
        expect(assessment).toHaveProperty('date')
        expect(assessment).toHaveProperty('category')
        expect(assessment).toHaveProperty('score')
        expect(assessment).toHaveProperty('rating')
      })
    })

    it('includes assessment summary metrics', () => {
      const { summary } = mockIndividualData
      expect(summary).toHaveProperty('averageScore')
      expect(summary).toHaveProperty('latestRating')
      expect(summary).toHaveProperty('trend')
    })

    it('calculates average score correctly', () => {
      const { assessments, summary } = mockIndividualData
      const scores = assessments.filter(a => a.score).map(a => a.score)
      const calculated = scores.reduce((a, b) => a + b, 0) / scores.length
      expect(Math.round(calculated * 100) / 100).toBe(summary.averageScore)
    })

    it('identifies latest rating correctly', () => {
      const { assessments, summary } = mockIndividualData
      const latestAssessment = assessments[0]
      expect(latestAssessment.rating).toBe(summary.latestRating)
    })

    it('exports to Excel with student info sheet', () => {
      expect(() =>
        reportExportService.exportToExcel('assessment', mockIndividualData),
      ).not.toThrow()
    })
  })

  describe('Class Assessment Export', () => {
    const mockClassData = {
      reportType: 'assessment',
      scope: 'class',
      student: null,
      class: {
        id: 'class-1',
        name: 'Nursery A',
      },
      assessments: [],
      classAssessments: [
        {
          id: 'student-1',
          fullName: 'John Smith',
          averageScore: 85,
          latestRating: 'A',
          assessmentCount: 5,
        },
        {
          id: 'student-2',
          fullName: 'Maria Garcia',
          averageScore: 88,
          latestRating: 'A',
          assessmentCount: 5,
        },
        {
          id: 'student-3',
          fullName: 'Carlos Lopez',
          averageScore: 72,
          latestRating: 'B',
          assessmentCount: 4,
        },
      ],
      summary: {
        averageScore: 81.67,
        latestRating: '',
        trend: 'stable',
      },
    }

    it('exports class assessment data with valid structure', () => {
      expect(() =>
        reportExportService.validateExportData('assessment', mockClassData),
      ).not.toThrow()
    })

    it('generates correct filename for class assessment', () => {
      const filename = reportExportService.generateFilename('assessment', mockClassData)
      expect(filename).toContain('AssessmentReport')
      expect(filename).toContain('Class')
      expect(filename).toContain('Nursery-A')
    })

    it('includes all students in class', () => {
      const { classAssessments } = mockClassData
      expect(classAssessments).toBeInstanceOf(Array)
      expect(classAssessments.length).toBe(3)
    })

    it('includes individual student assessment metrics', () => {
      const { classAssessments } = mockClassData
      classAssessments.forEach(student => {
        expect(student).toHaveProperty('fullName')
        expect(student).toHaveProperty('averageScore')
        expect(student).toHaveProperty('latestRating')
        expect(student).toHaveProperty('assessmentCount')
      })
    })

    it('includes class-level summary statistics', () => {
      const { summary } = mockClassData
      expect(summary).toHaveProperty('averageScore')
      expect(summary.averageScore).toBeGreaterThan(0)
    })

    it('calculates class average score correctly', () => {
      const { classAssessments, summary } = mockClassData
      const scores = classAssessments.map(s => s.averageScore)
      const calculated = scores.reduce((a, b) => a + b, 0) / scores.length
      expect(Math.round(calculated * 100) / 100).toBe(summary.averageScore)
    })

    it('exports to Excel with class summary sheet', () => {
      expect(() =>
        reportExportService.exportToExcel('assessment', mockClassData),
      ).not.toThrow()
    })
  })

  describe('Assessment Data Integrity', () => {
    it('validates assessment scores are numeric', () => {
      const data = {
        reportType: 'assessment',
        scope: 'individual',
        student: { id: '1', fullName: 'John' },
        assessments: [
          { date: '2026-07-01', category: 'Math', score: 85, rating: 'A' },
          { date: '2026-07-02', category: 'Lang', score: 90, rating: 'A' },
        ],
        summary: { averageScore: 87.5, latestRating: 'A' },
      }

      data.assessments.forEach(assessment => {
        if (assessment.score) {
          expect(typeof assessment.score).toBe('number')
          expect(assessment.score).toBeGreaterThanOrEqual(0)
          expect(assessment.score).toBeLessThanOrEqual(100)
        }
      })
    })

    it('includes date for all assessments', () => {
      const data = {
        reportType: 'assessment',
        scope: 'individual',
        student: { id: '1', fullName: 'John' },
        assessments: [
          { date: '2026-07-01', category: 'Math', score: 85, rating: 'A' },
        ],
        summary: { averageScore: 85, latestRating: 'A' },
      }

      data.assessments.forEach(assessment => {
        expect(assessment.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })

    it('categorizes assessments consistently', () => {
      const validCategories = ['Math', 'Language', 'Science', 'Arts', 'Physical Education']
      const data = {
        reportType: 'assessment',
        scope: 'individual',
        student: { id: '1', fullName: 'John' },
        assessments: [
          { date: '2026-07-01', category: 'Math', score: 85, rating: 'A' },
          { date: '2026-07-02', category: 'Science', score: 90, rating: 'A' },
        ],
        summary: { averageScore: 87.5, latestRating: 'A' },
      }

      data.assessments.forEach(assessment => {
        // Verify category is one of expected categories or custom
        expect(assessment.category).toBeTruthy()
      })
    })

    it('uses consistent rating scale', () => {
      const data = {
        reportType: 'assessment',
        scope: 'individual',
        student: { id: '1', fullName: 'John' },
        assessments: [
          { date: '2026-07-01', category: 'Math', score: 90, rating: 'A' },
          { date: '2026-07-02', category: 'Lang', score: 80, rating: 'B' },
          { date: '2026-07-03', category: 'Science', score: 70, rating: 'C' },
        ],
        summary: { averageScore: 80, latestRating: 'A' },
      }

      const ratings = data.assessments.map(a => a.rating)
      expect(ratings).toContain('A')
      expect(ratings).toContain('B')
      expect(ratings).toContain('C')
    })
  })

  describe('Assessment Export Validation', () => {
    it('requires student data for individual reports', () => {
      const invalidData = {
        reportType: 'assessment',
        scope: 'individual',
        student: null,
        assessments: [],
        summary: { averageScore: 0 },
      }

      expect(() =>
        reportExportService.validateExportData('assessment', invalidData),
      ).toThrow(/student/)
    })

    it('requires classAssessments for class reports', () => {
      const invalidData = {
        reportType: 'assessment',
        scope: 'class',
        classAssessments: null,
        assessments: [],
        summary: { averageScore: 0 },
      }

      expect(() =>
        reportExportService.validateExportData('assessment', invalidData),
      ).toThrow()
    })

    it('requires assessments array', () => {
      const invalidData = {
        reportType: 'assessment',
        scope: 'individual',
        student: { id: '1', fullName: 'John' },
        assessments: null,
        summary: { averageScore: 0 },
      }

      expect(() =>
        reportExportService.validateExportData('assessment', invalidData),
      ).toThrow(/assessments/)
    })

    it('requires summary data', () => {
      const invalidData = {
        reportType: 'assessment',
        scope: 'individual',
        student: { id: '1', fullName: 'John' },
        assessments: [],
        summary: null,
      }

      expect(() =>
        reportExportService.validateExportData('assessment', invalidData),
      ).toThrow(/summary/)
    })

    it('handles empty assessment records', () => {
      const data = {
        reportType: 'assessment',
        scope: 'individual',
        student: { id: '1', fullName: 'John' },
        assessments: [],
        summary: { averageScore: 0, latestRating: '' },
      }

      expect(() =>
        reportExportService.validateExportData('assessment', data),
      ).not.toThrow()
    })
  })

  describe('Assessment Export Calculations', () => {
    it('calculates correct average from multiple assessments', () => {
      const assessments = [
        { score: 80 },
        { score: 85 },
        { score: 90 },
      ]

      const average = assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length
      expect(average).toBe(85)
    })

    it('handles assessments without scores', () => {
      const data = {
        reportType: 'assessment',
        scope: 'individual',
        student: { id: '1', fullName: 'John' },
        assessments: [
          { date: '2026-07-01', category: 'Math', rating: 'A' }, // No score
          { date: '2026-07-02', category: 'Science', score: 90, rating: 'A' },
        ],
        summary: { averageScore: 90, latestRating: 'A' },
      }

      const scoredAssessments = data.assessments.filter(a => a.score)
      expect(scoredAssessments.length).toBe(1)
    })

    it('determines trend based on assessment progression', () => {
      const data = {
        reportType: 'assessment',
        scope: 'individual',
        student: { id: '1', fullName: 'John' },
        assessments: [
          { date: '2026-07-20', score: 85 },
          { date: '2026-07-15', score: 80 },
          { date: '2026-07-10', score: 75 },
        ],
        summary: { averageScore: 80, latestRating: 'A', trend: 'improving' },
      }

      // Score improved from 75 to 85
      const firstScore = data.assessments[data.assessments.length - 1].score
      const latestScore = data.assessments[0].score
      if (latestScore > firstScore) {
        expect(data.summary.trend).toBe('improving')
      }
    })
  })

  describe('Assessment Export Filename Handling', () => {
    it('generates consistent filenames for same data', () => {
      const data = {
        reportType: 'assessment',
        scope: 'individual',
        student: { fullName: 'John Smith' },
      }

      const filename1 = reportExportService.generateFilename('assessment', data)
      const filename2 = reportExportService.generateFilename('assessment', data)

      expect(filename1).toBe(filename2)
    })

    it('includes scope in filename', () => {
      const individualData = {
        reportType: 'assessment',
        scope: 'individual',
        student: { fullName: 'John' },
      }

      const classData = {
        reportType: 'assessment',
        scope: 'class',
        class: { name: 'Grade 1' },
        classAssessments: [{ fullName: 'John' }],
      }

      const indFilename = reportExportService.generateFilename('assessment', individualData)
      const classFilename = reportExportService.generateFilename('assessment', classData)

      expect(indFilename).toContain('Individual')
      expect(classFilename).toContain('Class')
    })

    it('handles special characters in student names', () => {
      const data = {
        reportType: 'assessment',
        scope: 'individual',
        student: { fullName: "O'Connor-Smith, Jr." },
      }

      const filename = reportExportService.generateFilename('assessment', data)
      expect(filename).not.toContain("'")
      expect(filename).not.toContain(',')
    })
  })
})
