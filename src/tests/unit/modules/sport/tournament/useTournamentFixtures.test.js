import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { withI18nSetup } from '@/tests/helpers/mount'
import { useTournamentFixtures } from '@/modules/sport/tournament/composables/useTournamentFixtures'

const apiMocks = vi.hoisted(() => ({ generateTournamentFixtures: vi.fn(), updateTournamentResult: vi.fn() }))
vi.mock('@/modules/sport/tournament/api/tournamentApi', () => apiMocks)

describe('useTournamentFixtures', () => {
  it('previews locally but generates authoritative fixtures through the backend', async () => {
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

    apiMocks.generateTournamentFixtures.mockResolvedValueOnce({ matches: [] })
    const reloadTournament = vi.fn()

    const result = withI18nSetup(
      () => useTournamentFixtures(tournament, { reloadTournament }),
      {},
    )

    result.generatePreview()

    expect(result.previewFixtures.value).toHaveLength(6)
    expect(result.previewVisible.value).toBe(true)

    const applied = await result.applyPreview()

    expect(applied.id).toBe('tournament-1')
    expect(apiMocks.generateTournamentFixtures).toHaveBeenCalledWith('tournament-1', expect.objectContaining({ replace: true }))
    expect(reloadTournament).toHaveBeenCalledTimes(1)

    expect(result.resetFixtures()).toBe(false)
  })
})
