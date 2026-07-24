import { describe, expect, it } from 'vitest'
import {
  createAnalyticsFilters,
  createAnalyticsPresetFilters,
  createAnalyticsQuery,
  createAnalyticsRoute,
  resolveAnalyticsBreakdownTo,
  resolveAnalyticsDatasetRowTo,
  resolveAnalyticsMetricTo,
} from '@/modules/preschool/admin/pages/analytics/analyticsInteractionMap'

describe('analyticsInteractionMap', () => {
  it('normalizes filters to route query params', () => {
    expect(createAnalyticsFilters({
      academic_year_id: 7,
      class_id: 'class-1',
      teacher_user_id: 'teacher-1',
      date_from: '2026-07-01',
      date_to: '2026-07-02',
      status: 'open',
    })).toEqual({
      academicYearId: '7',
      classId: 'class-1',
      teacherUserId: 'teacher-1',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-02',
      status: 'open',
    })

    expect(createAnalyticsQuery({
      academicYearId: '7',
      classId: 'class-1',
      teacherUserId: 'teacher-1',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-02',
      status: 'open',
    })).toEqual({
      academic_year_id: '7',
      class_id: 'class-1',
      teacher_user_id: 'teacher-1',
      date_from: '2026-07-01',
      date_to: '2026-07-02',
      status: 'open',
    })
  })

  it('builds preset filters without computing analytics', () => {
    const today = new Date('2026-07-02T00:00:00Z')
    expect(createAnalyticsPresetFilters('today', {}, today)).toMatchObject({
      dateFrom: '2026-07-02',
      dateTo: '2026-07-02',
    })
    expect(createAnalyticsPresetFilters('currentAcademicYear', { classId: 'class-1' }, today)).toMatchObject({
      classId: 'class-1',
    })
  })

  it('maps KPI and breakdown interactions to backend-backed routes', () => {
    expect(createAnalyticsRoute('dashboard-preschool-admin-analytics-attendance', { classId: 'class-1' })).toEqual({
      name: 'dashboard-preschool-admin-analytics-attendance',
      query: { class_id: 'class-1' },
    })

    expect(resolveAnalyticsMetricTo('sessions', 'sessionsCompleted', { status: 'open' })).toEqual({
      name: 'dashboard-preschool-admin-analytics-sessions',
      query: { status: 'completed' },
    })

    expect(resolveAnalyticsBreakdownTo('attendance', { classId: 'class-1' }, { teacherUserId: 'teacher-1' })).toEqual({
      name: 'dashboard-preschool-admin-analytics-attendance',
      query: {
        class_id: 'class-1',
        teacher_user_id: 'teacher-1',
      },
    })

    expect(resolveAnalyticsDatasetRowTo('attendance', 'topStudents', { studentId: 3 }, {})).toEqual({
      name: 'dashboard-preschool-admin-student-profile',
      query: { studentId: '3' },
    })
  })
})
