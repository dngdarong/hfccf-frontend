import { describe, expect, it } from 'vitest'
import enDivision from '@/i18n/en/sport/admin/division-management'
import khDivision from '@/i18n/kh/sport/admin/sport-division-management'
import enPlayingStyle from '@/i18n/en/sport/admin/playing-style-management'
import khPlayingStyle from '@/i18n/kh/sport/admin/sport-playing-style-management'

describe('Sport form localization', () => {
  it('provides matching Division form coverage in English and Khmer', () => {
    expect(enDivision.sportDivisionManagement.form.nameRequired).toBeTruthy()
    expect(khDivision.sportDivisionManagement.form.nameRequired).toBeTruthy()
    expect(enDivision.sportDivisionManagement.form.saveFailed).not.toBe(
      khDivision.sportDivisionManagement.form.saveFailed,
    )
  })

  it('provides matching Playing Style form coverage in English and Khmer', () => {
    expect(enPlayingStyle.sportPlayingStyleManagement.form.create).toBeTruthy()
    expect(khPlayingStyle.sportPlayingStyleManagement.form.create).toBeTruthy()
    expect(enPlayingStyle.sportPlayingStyleManagement.form.createFailed).not.toBe(
      khPlayingStyle.sportPlayingStyleManagement.form.createFailed,
    )
  })
})
