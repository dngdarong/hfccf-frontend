import { describe, expect, it } from 'vitest'
import tournamentEn from '@/i18n/en/sport/tournament'
import tournamentKh from '@/i18n/kh/sport/tournament'

const knockoutSettingsKeys = [
  'title',
  'subtitle',
  'qualificationSlots',
  'bestThirdPlaceTeams',
  'includeThirdPlaceTeams',
  'thirdPlaceMatchEnabled',
  'extraTimeEnabled',
  'penaltyEnabled',
  'seededMode',
  'autoGenerateBracket',
]

describe('sport tournament knockout locale parity', () => {
  it('exposes knockout settings keys in both locales', () => {
    knockoutSettingsKeys.forEach((key) => {
      expect(tournamentEn.sportTournament.knockout.settings).toHaveProperty(key)
      expect(tournamentKh.sportTournament.knockout.settings).toHaveProperty(key)
      expect(typeof tournamentEn.sportTournament.knockout.settings[key]).toBe('string')
      expect(typeof tournamentKh.sportTournament.knockout.settings[key]).toBe('string')
    })
  })
})
