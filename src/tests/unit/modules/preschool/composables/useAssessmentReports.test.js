import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAssessmentStore } from '@/modules/preschool/stores/assessmentStore'
import { useAssessmentReports } from '@/modules/preschool/composables/useAssessmentReports'

describe('useAssessmentReports', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('calculates summary, risk, and export data from the shared store', () => {
    const store = useAssessmentStore()
    store.categories = [
      { id: 1, name: 'Learning Progress' },
      { id: 2, name: 'Health' },
    ]
    store.assessments = [
      {
        id: 1,
        studentId: 7,
        student: { fullName: 'Lina Chan' },
        class: { name: 'Morning Class' },
        categoryId: 1,
        category: { name: 'Learning Progress' },
        periodLabel: 'Q1',
        assessmentDate: '2026-06-01',
        score: 92,
        rating: 'Excellent',
        observation: 'Strong progress',
        teacherComment: 'Keep practicing',
        status: 'finalized',
      },
      {
        id: 2,
        studentId: 8,
        student: { fullName: 'Sok Dara' },
        class: { name: 'Afternoon Class' },
        categoryId: 2,
        category: { name: 'Health' },
        periodLabel: 'Q1',
        assessmentDate: '2026-06-02',
        score: 55,
        rating: 'Needs Improvement',
        observation: 'Needs nutrition support',
        teacherComment: '',
        status: 'finalized',
      },
      {
        id: 3,
        studentId: 7,
        student: { fullName: 'Lina Chan' },
        class: { name: 'Morning Class' },
        categoryId: 1,
        category: { name: 'Learning Progress' },
        periodLabel: 'Q1',
        assessmentDate: '2026-06-03',
        score: 74,
        rating: 'Good',
        observation: 'Draft note',
        teacherComment: '',
        status: 'draft',
      },
    ]

    const reports = useAssessmentReports()

    expect(reports.summaryStats.value).toMatchObject({
      total: 3,
      completed: 2,
      pending: 1,
      average: '73.50',
      highest: 92,
      lowest: 55,
    })
    expect(reports.riskAnalysis.value).toEqual({
      excellent: 1,
      good: 0,
      fair: 0,
      atRisk: 1,
    })
    expect(reports.highRiskStudents.value).toHaveLength(1)
    expect(reports.highRiskStudents.value[0].id).toBe(2)
    expect(reports.categoryPerformanceArray.value[0]).toMatchObject({
      categoryId: 1,
      categoryName: 'Learning Progress',
      count: 1,
      average: '92.00',
    })
    expect(reports.exportData.value[0]).toMatchObject({
      Student: 'Lina Chan',
      Class: 'Morning Class',
      Category: 'Learning Progress',
      Score: 92,
      Rating: 'Excellent',
    })
  })
})
