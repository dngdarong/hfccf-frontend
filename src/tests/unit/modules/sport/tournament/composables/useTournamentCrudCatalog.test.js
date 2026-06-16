import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  archiveTournament as apiArchiveTournament,
  createTournament as apiCreateTournament,
  deleteTournament as apiDeleteTournament,
  listTournaments as apiListTournaments,
  updateTournament as apiUpdateTournament,
} from '@/modules/sport/tournament/api/tournamentApi'
import { useTournamentCrudCatalog } from '@/modules/sport/tournament/composables/useTournamentCrudCatalog'

vi.mock('@/modules/sport/tournament/api/tournamentApi', () => ({
  listTournaments: vi.fn(),
  getTournament: vi.fn(),
  createTournament: vi.fn(),
  updateTournament: vi.fn(),
  deleteTournament: vi.fn(),
  archiveTournament: vi.fn(),
}))

function networkError(message = 'Network unavailable') {
  const error = new Error(message)
  error.isNetworkError = true
  error.code = 'NETWORK_ERROR'
  return error
}

beforeEach(() => {
  vi.clearAllMocks()
  useTournamentCrudCatalog().resetTournamentCrudCatalog()
})

describe('useTournamentCrudCatalog', () => {
  it('starts with the seeded mock tournaments', () => {
    const catalog = useTournamentCrudCatalog()
    expect(catalog.tournaments.value).toHaveLength(4)
  })

  it('loads tournaments from the backend when available', async () => {
    apiListTournaments.mockResolvedValueOnce({
      items: [
        {
          id: 10,
          tournament_code: 'TRN-API-001',
          name: 'API Cup',
          tournament_type: 'football',
          visibility: 'public',
        },
      ],
      pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
    })

    const catalog = useTournamentCrudCatalog()
    const result = await catalog.loadTournaments()

    expect(apiListTournaments).toHaveBeenCalledTimes(1)
    expect(result.items[0]).toMatchObject({
      id: '10',
      tournamentCode: 'TRN-API-001',
      name: 'API Cup',
      visibility: 'public',
    })
    expect(catalog.tournaments.value).toHaveLength(1)
  })

  it('falls back to the mock catalog when the backend is unavailable', async () => {
    apiListTournaments.mockRejectedValueOnce(networkError())

    const catalog = useTournamentCrudCatalog()
    const result = await catalog.loadTournaments()

    expect(apiListTournaments).toHaveBeenCalledTimes(1)
    expect(result.items).toHaveLength(4)
    expect(catalog.tournaments.value).toHaveLength(4)
  })

  it('creates, updates, deletes, and transitions tournaments through the shared store', async () => {
    apiCreateTournament.mockResolvedValueOnce({
      id: 20,
      tournament_code: 'TRN-API-020',
      name: 'New Cup',
      tournament_type: 'football',
    })
    apiUpdateTournament.mockResolvedValueOnce({
      id: 20,
      tournament_code: 'TRN-API-020',
      name: 'Updated Cup',
      tournament_type: 'football',
      status: 'registration_open',
    })
    apiDeleteTournament.mockResolvedValueOnce(true)

    const catalog = useTournamentCrudCatalog()
    const created = await catalog.createTournament({ name: 'New Cup', season: '2026', sportType: 'football' })
    const updated = await catalog.updateTournament(created.id, { name: 'Updated Cup', state: 'registration_open' })
    const transitioned = catalog.transitionTournament(updated.id, 'registration_closed')
    const deleted = await catalog.deleteTournament(updated.id)

    expect(created.name).toBe('New Cup')
    expect(updated.name).toBe('Updated Cup')
    expect(transitioned?.state).toBe('registration_closed')
    expect(deleted).toBe(true)
    expect(catalog.getTournamentById(updated.id)).toBeNull()
  })

  it('archives through the backend alias when requested', async () => {
    apiArchiveTournament.mockResolvedValueOnce(true)

    const catalog = useTournamentCrudCatalog()
    const deleted = await catalog.archiveTournament('tournament-001')

    expect(apiArchiveTournament).toHaveBeenCalledWith('tournament-001')
    expect(deleted).toBe(true)
  })
})
