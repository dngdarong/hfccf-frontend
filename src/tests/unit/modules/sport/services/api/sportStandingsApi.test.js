import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchTournamentStandings,
  recalculateTournamentStandings,
} from '@/modules/sport/services/api/sportStandingsApi'

const mockHttpGet = vi.fn()
const mockHttpPost = vi.fn()

vi.mock('@/services/http', () => ({
  default: {
    get: (...args) => mockHttpGet(...args),
    post: (...args) => mockHttpPost(...args),
  },
}))

describe('sportStandingsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchTournamentStandings', () => {
    it('fetches standings for tournament', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          items: [{ id: 't1', teamName: 'Team A', wins: 5, losses: 1 }],
          pagination: { page: 1, per_page: 50, total: 1, total_pages: 1 },
        },
      })

      const result = await fetchTournamentStandings('tour-1')

      expect(mockHttpGet).toHaveBeenCalledWith(
        '/sport/tournaments/tour-1/standings',
        expect.objectContaining({
          params: expect.objectContaining({
            page: 1,
            per_page: 50,
          }),
        }),
      )
      expect(result.items).toHaveLength(1)
    })

    it('supports custom pagination', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 2, per_page: 100, total: 0, total_pages: 0 } },
      })

      await fetchTournamentStandings('tour-1', { page: 2, perPage: 100 })

      expect(mockHttpGet).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            page: 2,
            per_page: 100,
          }),
        }),
      )
    })

    it('URL-encodes tournament ID', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 1, per_page: 50, total: 0, total_pages: 0 } },
      })

      await fetchTournamentStandings('tournament with spaces')

      expect(mockHttpGet).toHaveBeenCalledWith(
        expect.stringContaining('tournament'),
        expect.any(Object),
      )
    })

    it('returns empty standings when tournament ID is empty', async () => {
      const result = await fetchTournamentStandings('')

      expect(result.items).toEqual([])
      expect(result.pagination.total).toBe(0)
      expect(mockHttpGet).not.toHaveBeenCalled()
    })

    it('passes abort signal', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 1, per_page: 50, total: 0, total_pages: 0 } },
      })

      const signal = new AbortController().signal
      await fetchTournamentStandings('tour-1', {}, { signal })

      expect(mockHttpGet).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal }),
      )
    })
  })

  describe('recalculateTournamentStandings', () => {
    it('recalculates standings for tournament', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: {
          tournamentId: 'tour-1',
          standings: [{ id: 't1', teamName: 'Team A', wins: 5 }],
        },
      })

      const result = await recalculateTournamentStandings('tour-1')

      expect(mockHttpPost).toHaveBeenCalledWith('/sport/tournaments/tour-1/recalculate-standings')
      expect(result.tournamentId).toBe('tour-1')
      expect(result.standings).toHaveLength(1)
    })

    it('returns empty standings when calculation returns no data', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { tournamentId: 'tour-1' },
      })

      const result = await recalculateTournamentStandings('tour-1')

      expect(result.standings).toEqual([])
    })

    it('normalizes standings array', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: {
          tournamentId: 'tour-1',
          standings: [
            { id: 't1', teamName: 'Team A' },
            { id: 't2', teamName: 'Team B' },
          ],
        },
      })

      const result = await recalculateTournamentStandings('tour-1')

      expect(result.standings).toHaveLength(2)
    })

    it('throws error when tournament ID is missing', async () => {
      await expect(recalculateTournamentStandings('')).rejects.toThrow('Tournament id is required')
      expect(mockHttpPost).not.toHaveBeenCalled()
    })

    it('uses passed tournament ID when response does not have one', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { standings: [] },
      })

      const result = await recalculateTournamentStandings('tour-1')

      expect(result.tournamentId).toBe('tour-1')
    })

    it('URL-encodes tournament ID', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { tournamentId: 'tour-1', standings: [] },
      })

      await recalculateTournamentStandings('tournament with spaces')

      expect(mockHttpPost).toHaveBeenCalled()
    })
  })
})
