import { describe, expect, it } from 'vitest'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'

// Keep Preschool settings locale parity covered so the new configuration page
// does not drift into missing keys or mixed EN/KH nesting.
function expectString(source, path) {
  const value = path.split('.').reduce((carry, key) => carry?.[key], source)
  expect(typeof value).toBe('string')
  expect(value).not.toContain('<')
  expect(value).not.toMatch(/[\u00e2\u00e1\u017e\u00c3\uFFFD]/u)
}

describe('preschool settings locale parity', () => {
  it('keeps the settings labels aligned in EN and KH', () => {
    const keys = [
      'preschoolSettingsPage.pageTitle',
      'preschoolSettingsPage.pageSubtitle',
      'preschoolSettingsPage.sections.summary.title',
      'preschoolSettingsPage.sections.academicYear.title',
      'preschoolSettingsPage.sections.terms.title',
      'preschoolSettingsPage.sections.classConfiguration.title',
      'preschoolSettingsPage.sections.attendance.title',
      'preschoolSettingsPage.sections.payment.title',
      'preschoolSettingsPage.fields.currentAcademicYear',
      'preschoolSettingsPage.fields.defaultTuitionFee',
      'preschoolSettingsPage.actions.saveChanges',
      'preschoolSettingsPage.actions.reset',
      'preschoolSettingsPage.validation.required',
      'preschoolSettingsPage.validation.range',
      'preschoolSettingsPage.operationalStates.saved',
    ]

    keys.forEach((key) => {
      expectString(enPreschool, key)
      expectString(khPreschool, key)
    })
  })

  it('keeps the Preschool module export flat', () => {
    expect(Object.prototype.hasOwnProperty.call(enPreschool, 'preschool')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(khPreschool, 'preschool')).toBe(false)
  })
})
