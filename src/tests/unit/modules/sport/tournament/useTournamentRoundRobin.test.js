import { describe, expect, it } from 'vitest'
import { createRoundRobinFixtures } from '@/modules/sport/tournament/composables/useTournamentRoundRobin'

describe('useTournamentRoundRobin', () => {
  it('generates single round robin fixtures without duplicate pairings', () => {
    const result = createRoundRobinFixtures({
      group: { id: 'group-01', name: 'Group A' },
      teams: [
        { id: 'team-1', name: 'Team 1' },
        { id: 'team-2', name: 'Team 2' },
        { id: 'team-3', name: 'Team 3' },
        { id: 'team-4', name: 'Team 4' },
      ],
      roundRobinMode: 'single',
      homeAwayEnabled: true,
      venue: 'Main Stadium',
      baseDate: '2026-05-01',
    })

    const pairings = new Set(result.fixtures.map((fixture) => `${fixture.homeTeamId}-${fixture.awayTeamId}`))

    expect(result.fixtures).toHaveLength(6)
    expect(result.roundsPerLeg).toBe(3)
    expect(result.matchdays).toBe(3)
    expect(pairings.size).toBe(6)
    expect(result.fixtures[0].groupId).toBe('group-01')
    expect(result.fixtures[0].venue).toBe('Main Stadium')
  })

  it('generates double round robin fixtures with swapped legs', () => {
    const result = createRoundRobinFixtures({
      group: { id: 'group-02', name: 'Group B' },
      teams: [
        { id: 'team-1', name: 'Team 1' },
        { id: 'team-2', name: 'Team 2' },
        { id: 'team-3', name: 'Team 3' },
        { id: 'team-4', name: 'Team 4' },
      ],
      roundRobinMode: 'double',
      homeAwayEnabled: true,
    })

    expect(result.fixtures).toHaveLength(12)
    expect(result.matchdays).toBe(6)
    expect(result.fixtures.some((fixture) => fixture.leg === 2)).toBe(true)
  })
})
