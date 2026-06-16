import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchSportTournaments,
  fetchSportTournament,
  createSportTournament,
  updateSportTournament,
  deleteSportTournament,
} from '@/modules/sport/services/api/sportTournamentsApi'

const mockHttpGet = vi.fn()
const mockHttpPost = vi.fn()
const mockHttpDelete = vi.fn()

vi.mock('@/services/http', () => ({
  default: {
    get: (...args) => mockHttpGet(...args),
    post: (...args) => mockHttpPost(...args),
    delete: (...args) => mockHttpDelete(...args),
  },
}))

describe('sportTournamentsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchSportTournaments', () => {
    it('fetches tournaments list with default pagination', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          items: [{ id: 'tour-1', name: 'Summer Cup', status: 'active' }],
          pagination: { page: 1, per_page: 10, total: 1, total_pages: 1 },
        },
      })

      const result = await fetchSportTournaments()

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/tournaments', expect.objectContaining({
        params: expect.objectContaining({
          page: 1,
          per_page: 10,
          sort_by: 'created_at',
          sort_direction: 'desc',
        }),
      }))
      expect(result.items).toHaveLength(1)
    })

    it('applies search, status, and type filters', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 1, per_page: 10, total: 0, total_pages: 0 } },
      })

      await fetchSportTournaments({
        search: 'cup',
        status: 'active',
        type: 'league',
      })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/tournaments', expect.objectContaining({
        params: expect.objectContaining({
          search: 'cup',
          status: 'active',
          type: 'league',
        }),
      }))
    })

    it('supports custom pagination and sorting', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 2, per_page: 20, total: 0, total_pages: 0 } },
      })

      await fetchSportTournaments({
        page: 2,
        perPage: 20,
        sortBy: 'name',
        sortDirection: 'asc',
      })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/tournaments', expect.objectContaining({
        params: expect.objectContaining({
          page: 2,
          per_page: 20,
          sort_by: 'name',
          sort_direction: 'asc',
        }),
      }))
    })

    it('passes abort signal', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 1, per_page: 10, total: 0, total_pages: 0 } },
      })

      const signal = new AbortController().signal
      await fetchSportTournaments({}, { signal })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/tournaments', expect.objectContaining({ signal }))
    })
  })

  describe('fetchSportTournament', () => {
    it('fetches single tournament by ID', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { tournament: { id: 'tour-1', name: 'Summer Cup', type: 'league' } },
      })

      const result = await fetchSportTournament('tour-1')

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/tournaments/tour-1', expect.any(Object))
      expect(result.id).toBe('tour-1')
      expect(result.name).toBe('Summer Cup')
    })

    it('returns null when ID is empty', async () => {
      const result = await fetchSportTournament('')

      expect(result).toBeNull()
      expect(mockHttpGet).not.toHaveBeenCalled()
    })

    it('URL-encodes tournament ID', async () => {
      mockHttpGet.mockResolvedValueOnce({ data: { tournament: {} } })

      await fetchSportTournament('tournament with spaces')

      expect(mockHttpGet).toHaveBeenCalledWith(
        expect.stringContaining('tournament'),
        expect.any(Object),
      )
    })

    it('unwraps nested tournament response', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { tournament: { id: 't2', name: 'Winter Cup' } },
      })

      const result = await fetchSportTournament('t2')

      expect(result.name).toBe('Winter Cup')
    })

    it('falls back to top-level response', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { id: 't3', name: 'Direct Tournament' },
      })

      const result = await fetchSportTournament('t3')

      expect(result.name).toBe('Direct Tournament')
    })
  })

  describe('createSportTournament', () => {
    it('creates tournament with payload', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { tournament: { id: 'new-tour', name: 'New Tournament', type: 'knockout' } },
      })

      const result = await createSportTournament({ name: 'New Tournament', type: 'knockout' })

      expect(mockHttpPost).toHaveBeenCalledWith('/sport/tournaments', expect.any(Object))
      expect(result.id).toBe('new-tour')
    })

    it('normalizes tournament from response', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { tournament: { id: 't4', name: 'Created' } },
      })

      const result = await createSportTournament({})

      expect(result.id).toBe('t4')
    })
  })

  describe('updateSportTournament', () => {
    it('updates tournament by ID', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { tournament: { id: 'tour-1', name: 'Updated Tournament' } },
      })

      const result = await updateSportTournament('tour-1', { name: 'Updated Tournament' })

      expect(mockHttpPost).toHaveBeenCalledWith(
        expect.stringContaining('tour-1'),
        expect.any(Object),
      )
      expect(result.name).toBe('Updated Tournament')
    })

    it('throws error when ID is missing', async () => {
      await expect(updateSportTournament('', {})).rejects.toThrow('Tournament id is required')
      expect(mockHttpPost).not.toHaveBeenCalled()
    })
  })

  describe('deleteSportTournament', () => {
    it('deletes tournament by ID', async () => {
      mockHttpDelete.mockResolvedValueOnce({})

      const result = await deleteSportTournament('tour-1')

      expect(mockHttpDelete).toHaveBeenCalledWith('/sport/tournaments/tour-1')
      expect(result).toBe(true)
    })

    it('returns false when ID is empty', async () => {
      const result = await deleteSportTournament('')

      expect(result).toBe(false)
      expect(mockHttpDelete).not.toHaveBeenCalled()
    })
  })
})
