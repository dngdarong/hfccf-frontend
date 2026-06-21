import { describe, expect, it } from 'vitest'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'

function expectString(source, path) {
  const value = path.split('.').reduce((carry, key) => carry?.[key], source)
  expect(typeof value).toBe('string')
  expect(value).not.toContain('<')
  expect(value).not.toMatch(/[\u00c2\u00c3\u00e2\u017e\uFFFD]/u)
}

describe('preschool reports locale parity', () => {
  it('keeps the reports hub labels aligned in EN and KH', () => {
    const keys = [
      'preschoolReportsCenterPage.pageTitle',
      'preschoolReportsCenterPage.pageSubtitle',
      'preschoolReportsCenterPage.loading',
      'preschoolReportsCenterPage.messages.loadFailed',
      'preschoolReportsCenterPage.messages.exportFailed',
      'preschoolReportsCenterPage.filters.academicYear',
      'preschoolReportsCenterPage.filters.term',
      'preschoolReportsCenterPage.filters.dateFrom',
      'preschoolReportsCenterPage.filters.dateTo',
      'preschoolReportsCenterPage.filters.class',
      'preschoolReportsCenterPage.filters.teacher',
      'preschoolReportsCenterPage.filters.status',
      'preschoolReportsCenterPage.filters.apply',
      'preschoolReportsCenterPage.filters.reset',
      'preschoolReportsCenterPage.exports.title',
      'preschoolReportsCenterPage.exports.export',
      'preschoolReportsCenterPage.exports.formats.pdf',
      'preschoolReportsCenterPage.exports.formats.excel',
      'preschoolReportsCenterPage.exports.formats.csv',
      'preschoolReportsCenterPage.dashboard.title',
      'preschoolReportsCenterPage.dashboard.subtitle',
      'preschoolReportsCenterPage.dashboard.cards.attendanceRate',
      'preschoolReportsCenterPage.dashboard.cards.revenue',
      'preschoolReportsCenterPage.dashboard.cards.openHealthAlerts',
      'preschoolReportsCenterPage.dashboard.cards.assessmentCompletion',
      'preschoolReportsCenterPage.dashboard.moduleCards.attendance',
      'preschoolReportsCenterPage.dashboard.moduleCards.assessments',
      'preschoolReportsCenterPage.dashboard.moduleCards.health',
      'preschoolReportsCenterPage.dashboard.moduleCards.payments',
      'preschoolReportsCenterPage.dashboard.moduleCards.enrollments',
      'preschoolReportsCenterPage.dashboard.moduleCards.guardians',
      'preschoolReportsCenterPage.dashboard.actions.attendance',
      'preschoolReportsCenterPage.dashboard.actions.assessments',
      'preschoolReportsCenterPage.dashboard.actions.health',
      'preschoolReportsCenterPage.dashboard.actions.payments',
      'preschoolReportsCenterPage.dashboard.actions.enrollments',
      'preschoolReportsCenterPage.dashboard.actions.guardians',
      'preschoolReportsCenterPage.sections.attendance.title',
      'preschoolReportsCenterPage.sections.assessments.title',
      'preschoolReportsCenterPage.sections.health.title',
      'preschoolReportsCenterPage.sections.payments.title',
      'preschoolReportsCenterPage.sections.enrollments.title',
      'preschoolReportsCenterPage.sections.guardians.title',
      'preschoolDashboardPage.cards.reports.title',
      'preschoolDashboardPage.cards.reports.subtitle',
      'preschoolDashboardPage.cards.reports.action',
      'preschoolDashboardPage.cards.reports.label',
      'preschoolDashboardPage.cards.reports.revenue',
      'preschoolDashboardPage.cards.reports.revenueLabel',
      'preschoolDashboardPage.cards.reports.health',
      'preschoolDashboardPage.cards.reports.healthLabel',
      'preschoolDashboardPage.cards.reports.assessments',
      'preschoolDashboardPage.cards.reports.assessmentsLabel',
    ]

    keys.forEach((key) => {
      expectString(enPreschool, key)
      expectString(khPreschool, key)
    })
  })
})
