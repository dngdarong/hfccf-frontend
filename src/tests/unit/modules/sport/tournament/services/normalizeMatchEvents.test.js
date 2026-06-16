import { describe, expect, it } from 'vitest'
import { normalizeMatchEvents } from '@/modules/sport/tournament/services/normalizeMatchEvents'

describe('normalizeMatchEvents', () => {
  it('normalizes legacy penalty aliases and derives the event side from the match context', () => {
    const [event] = normalizeMatchEvents([
      {
        id: 'event-1',
        minute: 45,
        stoppageMinute: -2,
        type: 'penalty',
        teamId: 'team-a',
        playerName: 'Player A',
      },
    ], {
      matchId: 'match-1',
      homeTeamId: 'team-a',
      awayTeamId: 'team-b',
    })

    expect(event.type).toBe('penalty_goal')
    expect(event.side).toBe('home')
    expect(event.stoppageMinute).toBe(0)
    expect(event.matchId).toBe('match-1')
  })
})
