import { describe, expect, it } from 'vitest'
import { calculateTeamStats } from '@/modules/sport/tournament/services/statistics/calculateTeamStats'

describe('calculateTeamStats', () => {
  it('calculates wins, clean sheets, cards, and fair play points', () => {
    const stats = calculateTeamStats({
      tournament: {
        rules: {
          pointsWin: 3,
          pointsDraw: 1,
          pointsLoss: 0,
        },
        teams: [
          { id: 'team-a', name: 'Team A' },
          { id: 'team-b', name: 'Team B' },
        ],
        fixtures: [
          {
            id: 'match-1',
            homeTeamId: 'team-a',
            homeTeamName: 'Team A',
            awayTeamId: 'team-b',
            awayTeamName: 'Team B',
            status: 'completed',
            score: { home: 2, away: 0 },
            events: [
              { id: 'event-1', minute: 10, type: 'yellow_card', teamId: 'team-a', playerId: 'player-1', playerName: 'Player 1' },
              { id: 'event-2', minute: 40, type: 'red_card', teamId: 'team-b', playerId: 'player-2', playerName: 'Player 2' },
            ],
          },
        ],
      },
    })

    const teamA = stats.find((row) => row.teamId === 'team-a')
    const teamB = stats.find((row) => row.teamId === 'team-b')

    expect(teamA.wins).toBe(1)
    expect(teamA.cleanSheets).toBe(1)
    expect(teamA.yellowCards).toBe(1)
    expect(teamA.redCards).toBe(0)
    expect(teamA.fairPlayPoints).toBe(1)
    expect(teamA.points).toBe(3)
    expect(teamB.losses).toBe(1)
    expect(teamB.cleanSheets).toBe(0)
    expect(teamB.redCards).toBe(1)
    expect(teamB.fairPlayPoints).toBe(3)
  })
})
