import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  archiveAssessmentCategory,
  archiveReportPeriod,
  createAssessmentCategory,
  createGradeBand,
  createReportPeriod,
  deleteGradeBand,
  fetchAssessmentCategories,
  fetchAssessmentSettings,
  fetchAssessmentWeights,
  fetchGradingScale,
  fetchReportPeriods,
  normalizeAssessmentCategory,
  normalizeAssessmentSettings,
  normalizeAssessmentWeight,
  normalizeGradeBand,
  normalizeReportPeriod,
  updateAssessmentCategory,
  updateAssessmentSettings,
  updateAssessmentWeights,
  updateGradeBand,
  updateReportPeriod,
} from '@/modules/preschool/services/api/preschoolAssessmentConfigurationApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('preschool assessment configuration api', () => {
  it('normalizes the assessment settings payload', () => {
    expect(normalizeAssessmentSettings({
      late_threshold_minutes: 15,
      half_day_threshold_minutes: 180,
      absence_alert_days: 3,
      guardian_alert_enabled: true,
      teacher_alert_enabled: false,
      admin_alert_enabled: true,
      monday_enabled: true,
      friday_enabled: true,
      weighting_enabled: true,
    })).toMatchObject({
      lateThresholdMinutes: 15,
      absenceAlertDays: 3,
      weightingEnabled: true,
      fridayEnabled: true,
    })

    expect(normalizeGradeBand({
      grade: 'A',
      minimum_score: 90,
      maximum_score: 100,
      is_passing: true,
    })).toMatchObject({
      grade: 'A',
      minimumScore: 90,
      maximumScore: 100,
      isPassing: true,
    })

    expect(normalizeAssessmentCategory({
      name: 'Quiz',
      code: 'QZ',
      is_active: true,
    })).toMatchObject({
      name: 'Quiz',
      code: 'QZ',
      isActive: true,
      status: 'active',
    })

    expect(normalizeReportPeriod({
      period_type: 'monthly',
      academic_year_id: 9,
      term_id: 3,
      name: 'Term 1',
      is_active: true,
    })).toMatchObject({
      periodType: 'monthly',
      academicYearId: 9,
      termId: 3,
      name: 'Term 1',
      status: 'active',
    })

    expect(normalizeAssessmentWeight({
      category_id: 2,
      percentage: 30,
    })).toMatchObject({
      categoryId: 2,
      percentage: 30,
    })
  })

  it('fetches and updates settings with normalized response data', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      settings: {
        id: 4,
        passing_score: 60,
        weighting_enabled: true,
      },
    }))

    await expect(fetchAssessmentSettings()).resolves.toMatchObject({
      id: 4,
      lateThresholdMinutes: 15,
      weightingEnabled: true,
    })
    expect(http.get).toHaveBeenCalledWith('/preschool/settings/assessments', expect.any(Object))

    http.put.mockResolvedValueOnce(stubResponse({
      settings: {
        passing_score: 65,
        weighting_enabled: false,
      },
    }))

    await expect(updateAssessmentSettings({
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
    })).resolves.toMatchObject({
      lateThresholdMinutes: 15,
      weightingEnabled: false,
    })

    expect(http.put).toHaveBeenCalledWith('/preschool/settings/assessments', expect.objectContaining({
      late_threshold_minutes: 20,
      half_day_threshold_minutes: 200,
      absence_alert_days: 4,
      guardian_alert_enabled: false,
    }))
  })

  it('handles grading scale CRUD', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      items: [
        { id: 1, grade: 'A', minimum_score: 90, maximum_score: 100, is_passing: true },
      ],
    }))

    await expect(fetchGradingScale()).resolves.toMatchObject({
      items: [{ grade: 'A', minimumScore: 90, maximumScore: 100, isPassing: true }],
    })

    http.post.mockResolvedValueOnce(stubResponse({
      band: { id: 2, grade: 'B', minimum_score: 80, maximum_score: 89 },
    }))
    await expect(createGradeBand({ grade: 'B', minimumScore: 80, maximumScore: 89 })).resolves.toMatchObject({
      id: 2,
      grade: 'B',
    })

    http.put.mockResolvedValueOnce(stubResponse({
      gradeBand: { id: 2, grade: 'B', minimum_score: 82, maximum_score: 89 },
    }))
    await expect(updateGradeBand(2, { grade: 'B', minimumScore: 82, maximumScore: 89 })).resolves.toMatchObject({
      id: 2,
      minimumScore: 82,
    })

    await deleteGradeBand(2)
    expect(http.delete).toHaveBeenCalledWith('/preschool/settings/assessments/grading-scale/2')
  })

  it('handles category CRUD and archive flows', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      items: [
        { id: 1, name: 'Quiz', code: 'QZ', is_active: true },
      ],
    }))
    await expect(fetchAssessmentCategories()).resolves.toMatchObject([
      { id: 1, name: 'Quiz', code: 'QZ', isActive: true },
    ])

    http.post.mockResolvedValueOnce(stubResponse({
      category: { id: 2, name: 'Assignment', code: 'ASG', is_active: true },
    }))
    await expect(createAssessmentCategory({ name: 'Assignment', code: 'ASG' })).resolves.toMatchObject({
      id: 2,
      name: 'Assignment',
    })

    http.put.mockResolvedValueOnce(stubResponse({
      assessmentCategory: { id: 2, name: 'Assignment', code: 'ASG-2', is_active: true },
    }))
    await expect(updateAssessmentCategory(2, { name: 'Assignment', code: 'ASG-2' })).resolves.toMatchObject({
      id: 2,
      code: 'ASG-2',
    })

    http.post.mockResolvedValueOnce(stubResponse({
      category: { id: 2, name: 'Assignment', is_active: false, status: 'archived' },
    }))
    await expect(archiveAssessmentCategory(2)).resolves.toMatchObject({
      id: 2,
      status: 'archived',
    })
    expect(http.post).toHaveBeenCalledWith('/preschool/settings/assessments/categories/2/archive')
  })

  it('handles report period CRUD and weight updates', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      items: [
        { id: 1, period_type: 'term', academic_year_id: 3, term_id: 2, name: 'Term 1', is_active: true },
      ],
    }))
    await expect(fetchReportPeriods()).resolves.toMatchObject({
      items: [{ periodType: 'term', academicYearId: 3, termId: 2, name: 'Term 1', isActive: true }],
    })

    http.post.mockResolvedValueOnce(stubResponse({
      reportPeriod: { id: 2, period_type: 'annual', academic_year_id: 3, term_id: 2, name: 'Term 2', is_active: true },
    }))
    await expect(createReportPeriod({ periodType: 'annual', academicYearId: 3, termId: 2, name: 'Term 2' })).resolves.toMatchObject({
      id: 2,
      periodType: 'annual',
      name: 'Term 2',
    })

    http.put.mockResolvedValueOnce(stubResponse({
      period: { id: 2, period_type: 'monthly', academic_year_id: 3, term_id: 2, name: 'Term 2 Updated', is_active: true },
    }))
    await expect(updateReportPeriod(2, { periodType: 'monthly', academicYearId: 3, termId: 2, name: 'Term 2 Updated' })).resolves.toMatchObject({
      id: 2,
      periodType: 'monthly',
      name: 'Term 2 Updated',
    })

    http.post.mockResolvedValueOnce(stubResponse({
      reportPeriod: { id: 2, period_type: 'monthly', academic_year_id: 3, term_id: 2, name: 'Term 2 Updated', is_active: false, status: 'archived' },
    }))
    await expect(archiveReportPeriod(2)).resolves.toMatchObject({
      id: 2,
      periodType: 'monthly',
      status: 'archived',
    })

    http.get.mockResolvedValueOnce(stubResponse({
      items: [{ id: 1, category_id: 9, percentage: 60 }],
    }))
    await expect(fetchAssessmentWeights()).resolves.toMatchObject({
      items: [{ categoryId: 9, percentage: 60 }],
    })

    http.put.mockResolvedValueOnce(stubResponse({
      weights: [{ id: 1, category_id: 9, percentage: 50 }],
    }))
    await expect(updateAssessmentWeights([
      { categoryId: 9, percentage: 50 },
    ])).resolves.toMatchObject([
      { categoryId: 9, percentage: 50 },
    ])
    expect(http.put).toHaveBeenCalledWith('/preschool/settings/assessments/weights', {
      weights: [{ category_id: 9, percentage: 50 }],
    })
  })
})
