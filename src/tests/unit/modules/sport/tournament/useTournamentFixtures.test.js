import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { withI18nSetup } from '@/tests/helpers/mount'
import { useTournamentFixtures } from '@/modules/sport/tournament/composables/useTournamentFixtures'

describe('useTournamentFixtures', () => {
  it('generates, applies, and resets fixture previews', () => {
    const tournament = ref({
      id: 'tournament-1',
      state: 'group_draw_completed',
      groupDraw: {
        groups: [
          {
            id: 'group-01',
            name: 'Group A',
            qualificationSlots: 2,
            teamIds: ['team-a', 'team-b', 'team-c', 'team-d'],
          },
        ],
      },
      teams: [
        { id: 'team-a', name: 'Team A' },
        { id: 'team-b', name: 'Team B' },
        { id: 'team-c', name: 'Team C' },
        { id: 'team-d', name: 'Team D' },
      ],
      rules: {
        homeAwayEnabled: true,
      },
      fixturesSettings: {
        roundRobinMode: 'single',
        homeAwayEnabled: true,
        matchdaySpacingDays: 7,
        baseDate: '2026-05-01',
        venue: 'Main Stadium',
      },
      fixtures: [],
      standings: [],
      results: [],
      statistics: {
        fixturesGenerated: 0,
        matches: 0,
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
      () => useTournamentFixtures(tournament, { updateTournament, transitionTournament }),
      {},
    )

    result.generatePreview()

    expect(result.previewFixtures.value).toHaveLength(6)
    expect(result.previewVisible.value).toBe(true)

    const applied = result.applyPreview()

    expect(applied.id).toBe('tournament-1')
    expect(updateTournament).toHaveBeenCalled()
    expect(transitionTournament).toHaveBeenCalledWith('tournament-1', 'fixtures_generated')
    expect(tournament.value.fixtures).toHaveLength(6)
    expect(tournament.value.results).toHaveLength(0)
    expect(tournament.value.statistics.matches).toBe(6)

    expect(result.resetFixtures()).toBe(true)
  })
})
