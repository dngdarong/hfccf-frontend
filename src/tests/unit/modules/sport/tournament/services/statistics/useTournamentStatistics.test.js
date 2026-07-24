import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useTournamentStatistics } from '@/modules/sport/tournament/composables/useTournamentStatistics'

const apiMocks = vi.hoisted(() => ({ fetchTournamentStatistics: vi.fn() }))
vi.mock('@/modules/sport/tournament/api/tournamentApi', () => apiMocks)

describe('useTournamentStatistics', () => {
  it('loads and normalizes backend statistics', async () => {
    apiMocks.fetchTournamentStatistics.mockResolvedValueOnce({
      summary: { totalGoals: 3 },
      playerStats: [{ player_name: 'Scorer', goals: 3 }],
      teamStats: [{ team_name: 'Team A', goals_for: 3, goals_against: 0, fair_play_points: 0 }],
    })
    const statistics = useTournamentStatistics(ref({ id: 'tournament-1' }))
    await statistics.loadStatistics()
    expect(apiMocks.fetchTournamentStatistics).toHaveBeenCalledWith('tournament-1', {})
    expect(statistics.summary.value.totalGoals).toBe(3)
    expect(statistics.topScorers.value[0].goals).toBe(3)
  })

  it('surfaces backend statistics failures without local calculation fallback', async () => {
    apiMocks.fetchTournamentStatistics.mockRejectedValueOnce(new Error('Statistics unavailable'))
    const statistics = useTournamentStatistics(ref({ id: 'tournament-1' }))
    await expect(statistics.loadStatistics()).rejects.toThrow('Statistics unavailable')
    expect(statistics.statistics.value).toEqual({})
    expect(statistics.error.value).toBe('Statistics unavailable')
  })
})
