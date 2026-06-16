import { describe, expect, it } from 'vitest'
import { validateMatchEvents } from '@/modules/sport/tournament/services/validateMatchEvents'

describe('validateMatchEvents', () => {
  it('rejects invalid minute ranges and substitution payloads', () => {
    const result = validateMatchEvents({
      events: [
        {
          id: 'event-1',
          minute: -1,
          type: 'substitution',
          teamId: 'team-a',
        },
      ],
      context: {
        match: {
          homeTeamId: 'team-a',
          awayTeamId: 'team-b',
        },
      },
    })

    const codes = result.issues.map((issue) => issue.code)

    expect(codes).toContain('minuteOutOfRange')
    expect(codes).toContain('substitutionRequiresPlayers')
    expect(result.valid).toBe(false)
  })

  it('rejects own goals that do not belong to the match', () => {
    const result = validateMatchEvents({
      events: [
        {
          id: 'event-2',
          minute: 11,
          type: 'own_goal',
          teamId: 'team-c',
          playerName: 'Player C',
        },
      ],
      context: {
        match: {
          homeTeamId: 'team-a',
          awayTeamId: 'team-b',
        },
      },
    })

    const codes = result.issues.map((issue) => issue.code)

    expect(codes).toContain('ownGoalRequiresOpponent')
    expect(result.valid).toBe(false)
  })
})
