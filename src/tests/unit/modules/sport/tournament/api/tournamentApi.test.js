import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  archiveTournament,
  createTournament,
  deleteTournament,
  getTournament,
  listTournaments,
  fetchTournamentKnockout,
  updateTournament,
} from '@/modules/sport/tournament/api/tournamentApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('tournament api', () => {
  it('lists tournaments with the expected query params and normalized payload', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        items: [
          {
            id: 1,
            tournament_code: 'TRN-001',
            name: 'Foundation Cup',
            tournament_type: 'league',
            visibility: 'public',
            logo_path: 'tournaments/logo.png',
          },
        ],
        pagination: { page: 2, perPage: 5, total: 1, totalPages: 1 },
      }),
    )

    const result = await listTournaments({ page: 2, perPage: 5, search: '  Cup  ', status: 'active' })

    expect(http.get).toHaveBeenCalledWith('/sport/tournaments', {
      params: expect.objectContaining({
        page: 2,
        per_page: 5,
        search: 'Cup',
        status: 'active',
        sort_by: 'created_at',
        sort_direction: 'desc',
      }),
      signal: undefined,
    })
    expect(result.items[0]).toMatchObject({
      id: '1',
      tournamentCode: 'TRN-001',
      name: 'Foundation Cup',
      logoPath: 'tournaments/logo.png',
      visibility: 'public',
    })
  })

  it('creates, updates, fetches, and deletes tournaments with backend CRUD contracts', async () => {
    http.post.mockResolvedValueOnce(
      stubResponse({
        tournament: {
          id: 2,
          tournament_code: 'TRN-002',
          name: 'National Cup',
          tournament_type: 'football',
          logo_path: 'tournaments/2.png',
        },
      }),
    )

    const created = await createTournament({
      name: 'National Cup',
      season: '2026',
      sportType: 'football',
      status: 'draft',
      visibility: 'public',
      logoPath: 'blob:preview',
      rules: { groupCount: 4 },
      settings: { knockoutEnabled: true },
    })

    expect(http.post).toHaveBeenCalledWith('/sport/tournaments', expect.objectContaining({
      name: 'National Cup',
      season: '2026',
      tournament_type: 'football',
      status: 'draft',
      visibility: 'public',
      logo_path: '',
      rules: { groupCount: 4 },
      settings: { knockoutEnabled: true },
    }))
    expect(created).toMatchObject({
      id: '2',
      name: 'National Cup',
      tournamentCode: 'TRN-002',
      logoPath: 'tournaments/2.png',
    })

    http.get.mockResolvedValueOnce(stubResponse({ tournament: { id: 3, name: 'League One', tournament_code: 'T-3' } }))
    await expect(getTournament(3)).resolves.toMatchObject({ id: '3', name: 'League One' })
    expect(http.get).toHaveBeenCalledWith('/sport/tournaments/3', { signal: undefined })

    http.put.mockResolvedValueOnce(stubResponse({ tournament: { id: 4, name: 'League Two' } }))
    await expect(updateTournament(4, { name: 'League Two' })).resolves.toMatchObject({ id: '4', name: 'League Two' })
    expect(http.put).toHaveBeenCalledWith('/sport/tournaments/4', expect.objectContaining({
      name: 'League Two',
      status: 'draft',
    }))

    http.delete.mockResolvedValueOnce(stubResponse(null))
    await expect(deleteTournament(5)).resolves.toBe(true)
    expect(http.delete).toHaveBeenCalledWith('/sport/tournaments/5')

    http.delete.mockResolvedValueOnce(stubResponse(null))
    await expect(archiveTournament(6)).resolves.toBe(true)
    expect(http.delete).toHaveBeenCalledWith('/sport/tournaments/6')
  })

  it('normalizes empty and generated knockout responses without fabricating future teams', async () => {
    http.get.mockResolvedValueOnce(stubResponse({ tournamentId: 7, qualifiers: [], rounds: [] }))
    const empty = await fetchTournamentKnockout(7)
    expect(empty.knockout.rounds).toEqual([])

    http.get.mockResolvedValueOnce(stubResponse({
      tournamentId: 7,
      qualifiers: [{ teamId: 1, teamName: 'A' }],
      rounds: [{ id: 11, name: 'Semifinal', position: 1, status: 'scheduled' }],
      matches: [{ id: 21, knockoutRoundId: 11, homeTeamId: null, awayTeamId: null, status: 'scheduled' }],
    }))
    const generated = await fetchTournamentKnockout(7)
    expect(generated.knockout.rounds[0]).toMatchObject({ id: '11', roundName: 'Semifinal', order: 1 })
    expect(generated.knockout.rounds[0].matches[0]).toMatchObject({ id: '21', homeTeamId: '', awayTeamId: '' })
    expect(generated.knockout.rounds[0].matches[0].homeTeamName).toBe('')
  })
})
