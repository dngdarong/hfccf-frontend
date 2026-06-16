import { describe, expect, it } from 'vitest'
import { calculateTournamentGroupStandings } from '@/modules/sport/tournament/composables/useTournamentStandings'

describe('useTournamentStandings', () => {
  it('sorts teams by points, goal difference, and goals scored', () => {
    const standings = calculateTournamentGroupStandings({
      group: {
        id: 'group-01',
        name: 'Group A',
        qualificationSlots: 2,
        teamIds: ['team-a', 'team-b', 'team-c'],
      },
      teams: [
        { id: 'team-a', name: 'Team A' },
        { id: 'team-b', name: 'Team B' },
        { id: 'team-c', name: 'Team C' },
      ],
      rules: {
        pointsWin: 3,
        pointsDraw: 1,
        pointsLoss: 0,
      },
      fixtures: [
        {
          groupId: 'group-01',
          status: 'completed',
          homeTeamId: 'team-a',
          awayTeamId: 'team-b',
          score: { home: 2, away: 0 },
        },
        {
          groupId: 'group-01',
          status: 'completed',
          homeTeamId: 'team-c',
          awayTeamId: 'team-a',
          score: { home: 1, away: 0 },
        },
        {
          groupId: 'group-01',
          status: 'completed',
          homeTeamId: 'team-b',
          awayTeamId: 'team-c',
          score: { home: 3, away: 1 },
        },
      ],
    })

    expect(standings.rows).toHaveLength(3)
    expect(standings.rows[0].teamId).toBe('team-a')
    expect(standings.rows[0].qualified).toBe(true)
    expect(standings.rows[1].teamId).toBe('team-b')
    expect(standings.rows[2].teamId).toBe('team-c')
    expect(standings.completedMatches).toBe(3)
  })
})
