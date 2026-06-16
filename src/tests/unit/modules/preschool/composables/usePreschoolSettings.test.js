import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import {
  createDefaultClassConfiguration,
  createEmptyTermDraft,
  createDefaultPreschoolSettings,
  usePreschoolSettings,
  validatePreschoolSettings,
  validatePreschoolTermDraft,
} from '@/modules/preschool/composables/usePreschoolSettings'

// Keep the settings composable covered so the validation rules and local draft
// mutations do not drift away from the page contract.
describe('usePreschoolSettings', () => {
  it('flags invalid term drafts and date ranges', () => {
    const result = validatePreschoolTermDraft({
      ...createEmptyTermDraft(),
      name: '',
      startDate: new Date(2026, 0, 10),
      endDate: new Date(2026, 0, 5),
      status: '',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.name).toBe('required')
    expect(result.errors.endDate).toBe('range')
    expect(result.errors.status).toBe('required')
  })

  it('keeps the live settings draft in sync with validation and local edits', async () => {
    const {
      settings,
      validationErrors,
      issueCount,
      hasValidationIssues,
      saveSettings,
      resetSettings,
      addTerm,
      updateTerm,
      removeTerm,
      addClassConfiguration,
      updateClassConfiguration,
      removeClassConfiguration,
    } = usePreschoolSettings()

    settings.value.academicYear.currentAcademicYear = ''
    settings.value.academicYear.endDate = new Date(2025, 0, 1)
    await nextTick()

    expect(hasValidationIssues.value).toBe(true)
    expect(issueCount.value).toBeGreaterThan(0)
    expect(validationErrors.value.academicYear.currentAcademicYear).toBe('required')
    expect(validationErrors.value.academicYear.endDate).toBe('range')

    settings.value.academicYear.currentAcademicYear = createDefaultPreschoolSettings().academicYear.currentAcademicYear
    settings.value.academicYear.endDate = createDefaultPreschoolSettings().academicYear.endDate
    await nextTick()

    expect(hasValidationIssues.value).toBe(false)

    addTerm({
      id: 'term-3',
      name: 'Term 3',
      startDate: new Date(2026, 2, 1),
      endDate: new Date(2026, 5, 30),
      status: 'active',
    })
    expect(settings.value.terms).toHaveLength(3)

    updateTerm(2, {
      ...settings.value.terms[2],
      name: 'Term 3 Updated',
    })
    expect(settings.value.terms[2].name).toBe('Term 3 Updated')

    removeTerm(1)
    expect(settings.value.terms).toHaveLength(2)

    addClassConfiguration(createDefaultClassConfiguration('class-4', 'prep', 24, 'lead-teacher', 'Room D', 'active'))
    expect(settings.value.classConfigurations).toHaveLength(4)

    updateClassConfiguration(3, 'capacity', 26)
    expect(settings.value.classConfigurations[3].capacity).toBe(26)

    removeClassConfiguration(3)
    expect(settings.value.classConfigurations).toHaveLength(3)

    const saveResult = saveSettings()
    expect(saveResult.ok).toBe(true)
    expect(validationErrors.value.academicYear.currentAcademicYear).toBeUndefined()

    const invalidSettings = createDefaultPreschoolSettings()
    invalidSettings.payment.dueDay = 32
    expect(validatePreschoolSettings(invalidSettings).isValid).toBe(false)

    resetSettings()
    await nextTick()
    expect(settings.value.payment.dueDay).toBe(5)
  })
})
