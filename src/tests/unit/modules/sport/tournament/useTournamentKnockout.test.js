import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { withI18nSetup } from '@/tests/helpers/mount'
import sportTournamentEn from '@/i18n/en/sport/tournament'
import { useTournamentKnockout } from '@/modules/sport/tournament/composables/useTournamentKnockout'
import { createMockTournaments } from '@/modules/sport/tournament/mocks/tournaments.mock'

const apiMocks = vi.hoisted(() => ({ generateTournamentKnockout: vi.fn(), updateTournamentResult: vi.fn() }))
vi.mock('@/modules/sport/tournament/api/tournamentApi', () => apiMocks)

describe('useTournamentKnockout', () => {
  it('uses local preview only and persists generation through the backend', async () => {
    const tournament = ref({ ...createMockTournaments().find((item) => item.id === 'tournament-004'), state: 'active' })
    const reloadTournament = vi.fn()
    apiMocks.generateTournamentKnockout.mockResolvedValueOnce({ rounds: [], matches: [], qualifiers: [] })
    const knockout = withI18nSetup(() => useTournamentKnockout(tournament, { reloadTournament }), sportTournamentEn)

    expect(knockout.generatePreview().valid).toBe(true)
    await expect(knockout.applyPreview()).resolves.toMatchObject({ id: 'tournament-004' })
    expect(apiMocks.generateTournamentKnockout).toHaveBeenCalledWith('tournament-004', { replace: true })
    expect(reloadTournament).toHaveBeenCalledTimes(1)
  })
})
