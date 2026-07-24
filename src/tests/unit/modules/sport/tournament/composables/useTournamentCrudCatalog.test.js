import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '@/modules/sport/tournament/api/tournamentApi'
import { useTournamentCrudCatalog } from '@/modules/sport/tournament/composables/useTournamentCrudCatalog'

vi.mock('@/modules/sport/tournament/api/tournamentApi', () => ({
  listTournaments: vi.fn(),
  getTournament: vi.fn(),
  createTournament: vi.fn(),
  updateTournament: vi.fn(),
  deleteTournament: vi.fn(),
  archiveTournament: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  useTournamentCrudCatalog().resetTournamentCrudCatalog()
})

describe('useTournamentCrudCatalog', () => {
  it('starts empty and loads backend records', async () => {
    api.listTournaments.mockResolvedValueOnce({ items: [{ id: 10, name: 'API Cup', status: 'draft' }], pagination: { total: 1 } })
    const catalog = useTournamentCrudCatalog()
    expect(catalog.tournaments.value).toHaveLength(0)
    await catalog.loadTournaments()
    expect(catalog.tournaments.value[0]).toMatchObject({ id: '10', name: 'API Cup', state: 'draft' })
  })

  it('propagates list failures without creating local records', async () => {
    api.listTournaments.mockRejectedValueOnce(Object.assign(new Error('Unavailable'), { status: 500 }))
    const catalog = useTournamentCrudCatalog()
    await expect(catalog.loadTournaments()).rejects.toThrow('Unavailable')
    expect(catalog.tournaments.value).toHaveLength(0)
    expect(catalog.error.value).toBe('Unavailable')
  })

  it('persists CRUD mutations through the backend API', async () => {
    api.createTournament.mockResolvedValueOnce({ id: 20, name: 'New Cup', status: 'draft' })
    api.updateTournament.mockResolvedValueOnce({ id: 20, name: 'Updated Cup', status: 'active' })
    api.deleteTournament.mockResolvedValueOnce(true)
    const catalog = useTournamentCrudCatalog()
    const created = await catalog.createTournament({ name: 'New Cup' })
    const updated = await catalog.updateTournament(created.id, { name: 'Updated Cup' })
    expect(api.updateTournament).toHaveBeenCalledWith('20', { name: 'Updated Cup' })
    expect(updated.name).toBe('Updated Cup')
    expect(await catalog.deleteTournament('20')).toBe(true)
    expect(catalog.getTournamentById('20')).toBeNull()
  })
})
