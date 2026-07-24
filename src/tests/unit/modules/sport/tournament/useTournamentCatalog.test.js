import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTournamentCatalog } from '@/modules/sport/tournament/composables/useTournamentCatalog'
import * as api from '@/modules/sport/tournament/api/tournamentApi'

vi.mock('@/modules/sport/tournament/api/tournamentApi', () => ({
  listTournaments: vi.fn(), getTournament: vi.fn(), createTournament: vi.fn(), updateTournament: vi.fn(), deleteTournament: vi.fn(), archiveTournament: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  useTournamentCatalog().resetTournamentCrudCatalog()
})

describe('useTournamentCatalog compatibility wrapper', () => {
  it('delegates direct-route loading to the canonical API catalog', async () => {
    api.getTournament.mockResolvedValueOnce({ id: 9, name: 'Direct Cup', status: 'draft' })
    const catalog = useTournamentCatalog()
    const record = await catalog.loadTournament('9')
    expect(api.getTournament).toHaveBeenCalledWith('9', {})
    expect(record).toMatchObject({ id: '9', name: 'Direct Cup' })
  })

  it('does not expose local create/update behavior', () => {
    const catalog = useTournamentCatalog()
    expect(catalog.createTournament({ name: 'Local Cup' })).toBeInstanceOf(Promise)
    expect(api.createTournament).toHaveBeenCalled()
  })
})
