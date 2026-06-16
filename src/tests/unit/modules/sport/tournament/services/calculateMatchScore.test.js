import { describe, expect, it } from 'vitest'
import { calculateMatchScore } from '@/modules/sport/tournament/services/calculateMatchScore'

describe('calculateMatchScore', () => {
  it('counts goals, penalty goals, and own goals while ignoring disciplinary events', () => {
    const result = calculateMatchScore({
      match: {
        homeTeamId: 'team-a',
        awayTeamId: 'team-b',
      },
      events: [
        { minute: 12, type: 'goal', teamId: 'team-a', playerName: 'Player A' },
        { minute: 23, type: 'penalty', teamId: 'team-b', playerName: 'Player B' },
        { minute: 44, type: 'own_goal', teamId: 'team-b', playerName: 'Player C' },
        { minute: 51, type: 'yellow_card', teamId: 'team-a', playerName: 'Player D' },
      ],
    })

    expect(result.hasScoringEvents).toBe(true)
    expect(result.scoringEventCount).toBe(3)
    expect(result.score).toEqual({
      home: 2,
      away: 1,
    })
  })
})
