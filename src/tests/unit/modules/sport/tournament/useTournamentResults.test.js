import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { withI18nSetup } from '@/tests/helpers/mount'
import { useTournamentResults } from '@/modules/sport/tournament/composables/useTournamentResults'

describe('useTournamentResults', () => {
  it('updates the selected fixture, recalculates standings, and activates the tournament on the first result', () => {
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

    const updateTournament = vi.fn((id, payload) => {
      tournament.value = {
        ...tournament.value,
        ...payload,
      }
      return tournament.value
    })

    const transitionTournament = vi.fn((id, nextState) => {
      tournament.value = {
        ...tournament.value,
        state: nextState,
      }
      return tournament.value
    })

    const result = withI18nSetup(
      () => useTournamentResults(tournament, { updateTournament, transitionTournament }),
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

    const updated = result.saveResult()

    expect(updated.id).toBe('tournament-1')
    expect(updateTournament).toHaveBeenCalled()
    expect(transitionTournament).toHaveBeenCalledWith('tournament-1', 'active')
    expect(tournament.value.fixtures[0].status).toBe('completed')
    expect(tournament.value.results).toHaveLength(1)
    expect(tournament.value.standings).toHaveLength(1)
    expect(tournament.value.fixtures[0].eventScore.score).toEqual({
      home: 3,
      away: 0,
    })
    expect(tournament.value.standings[0].rows[0].teamId).toBe('team-a')
    expect(tournament.value.standings[0].rows[0].points).toBe(3)
  })
})
