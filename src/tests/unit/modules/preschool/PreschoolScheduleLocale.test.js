// Keep Preschool schedule locale parity covered so timetable views do not
// regress into missing-key warnings when EN/KH files are split further later.
import { describe, expect, it } from 'vitest'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'

describe('Preschool schedule locale', () => {
  it('exposes nested schedule keys for both locales', () => {
    expect(enPreschool.preschoolSchedulesPage.management.title).toBeTruthy()
    expect(enPreschool.preschoolSchedulesPage.actions.refresh).toBeTruthy()
    expect(enPreschool.preschoolSchedulesShared.days.monday).toBeTruthy()
    expect(enPreschool.preschoolSchedulesShared.statuses.active).toBeTruthy()

    expect(khPreschool.preschoolSchedulesPage.management.title).toBeTruthy()
    expect(khPreschool.preschoolSchedulesPage.actions.refresh).toBeTruthy()
    expect(khPreschool.preschoolSchedulesShared.days.monday).toBeTruthy()
    expect(khPreschool.preschoolSchedulesShared.statuses.active).toBeTruthy()
  })
})
