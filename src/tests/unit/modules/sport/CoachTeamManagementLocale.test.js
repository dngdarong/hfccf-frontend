import { describe, expect, it } from 'vitest'
import enSport from '@/i18n/en/sport'
import khSport from '@/i18n/kh/sport'

describe('sport coach team management locale parity', () => {
  const paths = [
    'sportCoachTeamManagement.common.team',
    'sportCoachTeamManagement.common.selectTeam',
    'sportCoachTeamManagement.actions.viewPlayers',
    'sportCoachTeamManagement.myTeams.title',
    'sportCoachTeamManagement.teamPlayers.title',
    'sportCoachTeamManagement.playerRequest.title',
    'sportCoachTeamManagement.matchRequest.title',
    'sportCoachTeamManagement.requests.title',
    'sportCoachTeamManagement.requests.emptyPlayers',
    'sportCoachTeamManagement.requests.emptyMatches',
    'sportCoachTeamManagement.assignments.title',
    'sportCoachTeamManagement.approvals.playersTitle',
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
