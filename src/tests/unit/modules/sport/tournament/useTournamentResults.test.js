import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { withI18nSetup } from '@/tests/helpers/mount'
import { useTournamentResults } from '@/modules/sport/tournament/composables/useTournamentResults'

const apiMocks = vi.hoisted(() => ({ updateTournamentResult: vi.fn(), addTournamentMatchEvent: vi.fn() }))
vi.mock('@/modules/sport/tournament/api/tournamentApi', () => apiMocks)

describe('useTournamentResults', () => {
  it('saves the supported result fields through the backend and reloads', async () => {
    const tournament = ref({
      id: 'tournament-1',
      state: 'fixtures_generated',
      rules: {
        pointsWin: 3,
        pointsDraw: 1,
        pointsLoss: 0,
      },
      groupDraw: {
        groups: [
          {
            id: 'group-01',
            name: 'Group A',
            qualificationSlots: 2,
            teamIds: ['team-a', 'team-b'],
          },
        ],
      },
      teams: [
        { id: 'team-a', name: 'Team A' },
        { id: 'team-b', name: 'Team B' },
      ],
      fixtures: [
        {
          id: 'fixture-1',
          groupId: 'group-01',
          groupName: 'Group A',
          homeTeamId: 'team-a',
          homeTeamName: 'Team A',
          awayTeamId: 'team-b',
          awayTeamName: 'Team B',
          status: 'scheduled',
          score: { home: null, away: null },
          events: [],
        },
      ],
      standings: [],
      statistics: {
        fixturesGenerated: 1,
        matches: 1,
        completedMatches: 0,
      },
    })

    apiMocks.updateTournamentResult.mockResolvedValueOnce({ match: { id: 'fixture-1' }, standings: [] })
    const reloadTournament = vi.fn()

    const result = withI18nSetup(
      () => useTournamentResults(tournament, { reloadTournament }),
      {},
    )

    result.updateDraft({
      status: 'completed',
      score: {
        home: 0,
        away: 0,
      },
      events: [
        { id: 'event-1', minute: 12, type: 'goal', teamId: 'team-a', playerName: 'Player A' },
        { id: 'event-2', minute: 31, type: 'penalty', teamId: 'team-a', playerName: 'Player A' },
        { id: 'event-3', minute: 78, type: 'own_goal', teamId: 'team-b', playerName: 'Player B' },
      ],
    })

    const updated = await result.saveResult()
    expect(updated.id).toBe('tournament-1')
    expect(apiMocks.updateTournamentResult).toHaveBeenCalledWith('tournament-1', 'fixture-1', expect.objectContaining({
      homeScore: 0,
      awayScore: 0,
      status: 'completed',
      notes: '',
    }))
    expect(reloadTournament).toHaveBeenCalledTimes(1)
  })
})
