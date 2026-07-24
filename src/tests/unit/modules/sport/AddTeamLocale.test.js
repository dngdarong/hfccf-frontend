import { describe, expect, it } from 'vitest'
import enSport from '@/i18n/en/sport'
import khSport from '@/i18n/kh/sport'

describe('sport add team locale parity', () => {
  const paths = [
    'sportAddTeam.players',
    'sportAddTeam.selectedPlayers',
    'sportAddTeam.selectedPlayersCount',
    'sportAddTeam.searchPlayers',
    'sportAddTeam.searchPlayersPlaceholder',
    'sportAddTeam.playerCode',
    'sportAddTeam.playerName',
    'sportAddTeam.position',
    'sportAddTeam.approvalStatus',
    'sportAddTeam.rosterStatus',
    'sportAddTeam.currentTeam',
    'sportAddTeam.noEligiblePlayers',
    'sportAddTeam.failedToLoadPlayers',
    'sportAddTeam.validation.loadFailed',
    'sportAddTeam.validation.rosterUpdateFailed',
    'sportAddTeam.validation.playerAlreadyAssigned',
    'sportAddTeam.validation.failedToLoadPlayers',
  ]

  function resolvePath(source, path) {
    return path.split('.').reduce((accumulator, segment) => accumulator?.[segment], source)
  }

  it('contains matching translation keys in en and kh', () => {
    for (const path of paths) {
      expect(typeof resolvePath(enSport, path)).toBe('string')
      expect(typeof resolvePath(khSport, path)).toBe('string')
    }
  })
})
