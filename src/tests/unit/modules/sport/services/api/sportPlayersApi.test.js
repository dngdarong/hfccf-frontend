import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchSportPlayers,
  fetchSportPlayer,
  createSportPlayer,
  updateSportPlayer,
  deleteSportPlayer,
} from '@/modules/sport/services/api/sportPlayersApi'

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

describe('sportPlayersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchSportPlayers', () => {
    it('fetches players list with default pagination', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          items: [{ id: 'p1', name: 'Player One', status: 'active' }],
          pagination: { page: 1, per_page: 10, total: 1, total_pages: 1 },
        },
      })

      const result = await fetchSportPlayers()

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/players', expect.objectContaining({
        params: expect.objectContaining({
          page: 1,
          per_page: 10,
          sort_by: 'created_at',
          sort_direction: 'desc',
        }),
      }))
      expect(result.items).toHaveLength(1)
    })

    it('applies search, status, team, and division filters', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 1, per_page: 10, total: 0, total_pages: 0 } },
      })

      await fetchSportPlayers({
        search: 'alex',
        status: 'active',
        teamId: 'team-1',
        division: 'U12',
      })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/players', expect.objectContaining({
        params: expect.objectContaining({
          search: 'alex',
          status: 'active',
          team_id: 'team-1',
          division: 'U12',
        }),
      }))
    })

    it('normalizes perPage parameter', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 1, per_page: 10, total: 0, total_pages: 0 } },
      })

      await fetchSportPlayers({ perPage: 999 })

      const callArgs = mockHttpGet.mock.calls[0][1]
      expect(callArgs.params.per_page).toBeLessThanOrEqual(100)
    })

    it('supports custom sorting', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 1, per_page: 10, total: 0, total_pages: 0 } },
      })

      await fetchSportPlayers({ sortBy: 'name', sortDirection: 'asc' })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/players', expect.objectContaining({
        params: expect.objectContaining({
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
      await fetchSportPlayers({}, { signal })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/players', expect.objectContaining({ signal }))
    })
  })

  describe('fetchSportPlayer', () => {
    it('fetches single player by ID', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { player: { id: 'p1', name: 'John Player', position: 'Forward' } },
      })

      const result = await fetchSportPlayer('p1')

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/players/p1', expect.any(Object))
      expect(result.id).toBe('p1')
      expect(result.name).toBe('John Player')
    })

    it('URL-encodes player ID', async () => {
      mockHttpGet.mockResolvedValueOnce({ data: { player: {} } })

      await fetchSportPlayer('player with spaces')

      expect(mockHttpGet).toHaveBeenCalledWith(
        expect.stringContaining('player'),
        expect.any(Object),
      )
    })

    it('returns null when ID is empty', async () => {
      const result = await fetchSportPlayer('')

      expect(result).toBeNull()
      expect(mockHttpGet).not.toHaveBeenCalled()
    })

    it('unwraps nested player response', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { player: { id: 'p1', name: 'Wrapped Player' } },
      })

      const result = await fetchSportPlayer('p1')

      expect(result.name).toBe('Wrapped Player')
    })

    it('falls back to top-level response', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { id: 'p2', name: 'Direct Player' },
      })

      const result = await fetchSportPlayer('p2')

      expect(result.name).toBe('Direct Player')
    })
  })

  describe('createSportPlayer', () => {
    it('creates player with payload', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { player: { id: 'new-p', name: 'New Player', division: 'U10' } },
      })

      const result = await createSportPlayer({ name: 'New Player', division: 'U10' })

      expect(mockHttpPost).toHaveBeenCalledWith('/sport/players', expect.any(Object))
      expect(result.id).toBe('new-p')
    })

    it('normalizes player from response', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { player: { id: 'p3', name: 'Created' } },
      })

      const result = await createSportPlayer({})

      expect(result.id).toBe('p3')
    })
  })

  describe('updateSportPlayer', () => {
    it('updates player by ID', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { player: { id: 'p1', name: 'Updated Player' } },
      })

      const result = await updateSportPlayer('p1', { name: 'Updated Player' })

      expect(mockHttpPost).toHaveBeenCalledWith(
        expect.stringContaining('p1'),
        expect.any(Object),
      )
      expect(result.name).toBe('Updated Player')
    })

    it('throws error when ID is missing', async () => {
      await expect(updateSportPlayer('', {})).rejects.toThrow('Player id is required')
      expect(mockHttpPost).not.toHaveBeenCalled()
    })
  })

  describe('deleteSportPlayer', () => {
    it('deletes player by ID', async () => {
      mockHttpDelete.mockResolvedValueOnce({})

      const result = await deleteSportPlayer('p1')

      expect(mockHttpDelete).toHaveBeenCalledWith('/sport/players/p1')
      expect(result).toBe(true)
    })

    it('returns false when ID is empty', async () => {
      const result = await deleteSportPlayer('')

      expect(result).toBe(false)
      expect(mockHttpDelete).not.toHaveBeenCalled()
    })
  })
})
