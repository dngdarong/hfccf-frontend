import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useTournamentStatistics } from '@/modules/sport/tournament/composables/useTournamentStatistics'

describe('useTournamentStatistics', () => {
  it('recomputes when the tournament fixtures change', () => {
    const tournament = ref({
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
          score: { home: 0, away: 0 },
          events: [],
        },
      ],
    })

    const statistics = useTournamentStatistics(tournament)

    expect(statistics.summary.value.totalGoals).toBe(0)

    tournament.value = {
      ...tournament.value,
      fixtures: [
        {
          ...tournament.value.fixtures[0],
          events: [
            { id: 'event-1', minute: 18, type: 'goal', teamId: 'team-a', playerId: 'player-1', playerName: 'Scorer A' },
          ],
        },
      ],
    }

    expect(statistics.summary.value.totalGoals).toBe(1)
    expect(statistics.summary.value.topScorer.playerName).toBe('Scorer A')
  })
})
