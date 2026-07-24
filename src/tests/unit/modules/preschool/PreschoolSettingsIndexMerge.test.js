import { describe, expect, it } from 'vitest'
import khPreschool from '@/i18n/kh/preschool'

function expectString(source, path) {
  const value = path.split('.').reduce((carry, key) => carry?.[key], source)
  expect(typeof value).toBe('string')
  expect(value).not.toContain('<')
}

describe('kh preschool settings locale merge', () => {
  it('keeps the runtime Preschool settings dashboard keys alongside backbone settings', () => {
    const keys = [
      'preschoolSettingsPage.dashboard.sections.preferences.subtitle',
      'preschoolSettingsPage.dashboard.sections.preferences.action',
      'preschoolSettingsPage.dashboard.fields.enrollmentRules',
      'preschoolSettingsPage.dashboard.emptyStates.enrollmentRules',
      'preschoolSettingsPage.dashboard.fields.studentCodeFormat',
      'preschoolSettingsPage.dashboard.emptyStates.studentCodeFormat',
      'preschoolSettingsPage.dashboard.fields.classCapacity',
      'preschoolSettingsPage.dashboard.emptyStates.classCapacity',
      'preschoolSettingsPage.dashboard.fields.guardianRules',
      'preschoolSettingsPage.dashboard.emptyStates.guardianRules',
      'preschoolSettingsPage.dashboard.fields.communicationRules',
      'preschoolSettingsPage.dashboard.emptyStates.communicationRules',
      'preschoolSettingsPage.dashboard.statuses.configured',
      'preschoolSettingsPage.sections.reporting.title',
      'preschoolSettingsPage.sections.assessment.title',
      'preschoolSettingsPage.sections.schedule.title',
      'preschoolSettingsPage.sections.enrollment.title',
      'preschoolSettingsPage.summary.reportPeriods',
      'preschoolSettingsPage.fields.assessmentCycle',
      'preschoolSettingsPage.fields.finalizationMode',
      'preschoolSettingsPage.fields.defaultTemplate',
      'preschoolSettingsPage.fields.requireTeacherNotes',
      'preschoolSettingsPage.emptyStates.reportPeriods',
      'preschoolSettingsPage.reporting.assessments',
    ]

    keys.forEach((key) => expectString(khPreschool, key))
  })
})
