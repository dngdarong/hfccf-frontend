import { describe, expect, it } from 'vitest'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'
import enNav from '@/i18n/en/dashboard/nav'
import khNav from '@/i18n/kh/dashboard/nav'

function expectString(source, path) {
  const value = path.split('.').reduce((carry, key) => carry?.[key], source)
  expect(typeof value).toBe('string')
  expect(value).not.toContain('<')
  expect(value).not.toMatch(/[\u00c2\u00c3\u00e2\u017e\uFFFD]/u)
}

describe('preschool analytics locale parity', () => {
  it('keeps the analytics labels aligned in EN and KH', () => {
    const keys = [
      'preschoolAnalyticsPage.title',
      'preschoolAnalyticsPage.subtitle',
      'preschoolAnalyticsPage.generatedAt',
      'preschoolAnalyticsPage.refresh',
      'preschoolAnalyticsPage.filters.title',
      'preschoolAnalyticsPage.filters.dateRange',
      'preschoolAnalyticsPage.filters.academicYear',
      'preschoolAnalyticsPage.filters.class',
      'preschoolAnalyticsPage.filters.teacher',
      'preschoolAnalyticsPage.filters.status',
      'preschoolAnalyticsPage.filters.apply',
      'preschoolAnalyticsPage.filters.reset',
      'preschoolAnalyticsPage.overview',
      'preschoolAnalyticsPage.attendanceAnalytics',
      'preschoolAnalyticsPage.sessionAnalytics',
      'preschoolAnalyticsPage.scheduleAnalytics',
      'preschoolAnalyticsPage.alertAnalytics',
      'preschoolAnalyticsPage.guardianAnalytics',
      'preschoolAnalyticsPage.studentAnalytics',
      'preschoolAnalyticsPage.teacherAnalytics',
      'preschoolAnalyticsPage.reportLauncher',
      'preschoolAnalyticsPage.attendanceRate',
      'preschoolAnalyticsPage.completionRate',
      'preschoolAnalyticsPage.attendanceTrend',
      'preschoolAnalyticsPage.sessionsGenerated',
      'preschoolAnalyticsPage.sessionsCompleted',
      'preschoolAnalyticsPage.missingSessions',
      'preschoolAnalyticsPage.openAlerts',
      'preschoolAnalyticsPage.overdueAlerts',
      'preschoolAnalyticsPage.guardianContacts',
      'preschoolAnalyticsPage.outstandingFollowUps',
      'preschoolAnalyticsPage.noAnalyticsData',
      'preschoolAnalyticsPage.reportDataset',
      'preschoolAnalyticsPage.attendanceReport',
      'preschoolAnalyticsPage.sessionReport',
      'preschoolAnalyticsPage.scheduleReport',
      'preschoolAnalyticsPage.sections.attendance.title',
      'preschoolAnalyticsPage.sections.sessions.title',
      'preschoolAnalyticsPage.sections.schedules.title',
      'preschoolAnalyticsPage.sections.alerts.title',
      'preschoolAnalyticsPage.sections.guardians.title',
      'preschoolAnalyticsPage.sections.students.title',
      'preschoolAnalyticsPage.sections.teachers.title',
    ]

    keys.forEach((key) => {
      expectString(enPreschool, key)
      expectString(khPreschool, key)
    })

    expectString(enNav, 'items.preschoolAnalytics')
    expectString(khNav, 'items.preschoolAnalytics')
  })
})
