import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchSportTeams,
  fetchSportTeam,
  createSportTeam,
  updateSportTeam,
  deleteSportTeam,
} from '@/modules/sport/services/api/sportTeamsApi'

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

describe('sportTeamsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchSportTeams', () => {
    it('fetches teams list with default pagination', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          items: [{ id: 't1', name: 'Team A', status: 'active' }],
          pagination: { page: 1, per_page: 10, total: 1, total_pages: 1 },
        },
      })

      const result = await fetchSportTeams()

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/teams', expect.objectContaining({
        params: expect.objectContaining({
          page: 1,
          per_page: 10,
          sort_by: 'created_at',
          sort_direction: 'desc',
        }),
      }))
      expect(result.items).toHaveLength(1)
    })

    it('applies search, status, division, and coach filters', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 1, per_page: 10, total: 0, total_pages: 0 } },
      })

      await fetchSportTeams({
        search: 'u12',
        status: 'active',
        division: 'U12',
        coachUserId: 'coach-1',
      })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/teams', expect.objectContaining({
        params: expect.objectContaining({
          search: 'u12',
          status: 'active',
          division: 'U12',
          coach_user_id: 'coach-1',
        }),
      }))
    })

    it('supports pagination and custom sorting', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 2, per_page: 20, total: 0, total_pages: 0 } },
      })

      await fetchSportTeams({
        page: 2,
        perPage: 20,
        sortBy: 'name',
        sortDirection: 'asc',
      })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/teams', expect.objectContaining({
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
      await fetchSportTeams({}, { signal })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/teams', expect.objectContaining({ signal }))
    })
  })

  describe('fetchSportTeam', () => {
    it('fetches single team by ID', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { team: { id: 't1', name: 'Team A', division: 'U10' } },
      })

      const result = await fetchSportTeam('t1')

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/teams/t1', expect.any(Object))
      expect(result.id).toBe('t1')
      expect(result.name).toBe('Team A')
    })

    it('URL-encodes team ID', async () => {
      mockHttpGet.mockResolvedValueOnce({ data: { team: {} } })

      await fetchSportTeam('team with spaces')

      expect(mockHttpGet).toHaveBeenCalledWith(
        expect.stringContaining('team'),
        expect.any(Object),
      )
    })

    it('returns null when ID is empty', async () => {
      const result = await fetchSportTeam('')

      expect(result).toBeNull()
      expect(mockHttpGet).not.toHaveBeenCalled()
    })

    it('unwraps nested team response', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { team: { id: 't2', name: 'Wrapped Team' } },
      })

      const result = await fetchSportTeam('t2')

      expect(result.name).toBe('Wrapped Team')
    })

    it('falls back to top-level response', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { id: 't3', name: 'Direct Team' },
      })

      const result = await fetchSportTeam('t3')

      expect(result.name).toBe('Direct Team')
    })
  })

  describe('createSportTeam', () => {
    it('creates team with payload', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { team: { id: 'new-t', name: 'New Team', division: 'U12' } },
      })

      const result = await createSportTeam({ name: 'New Team', division: 'U12' })

      expect(mockHttpPost).toHaveBeenCalledWith('/sport/teams', expect.any(Object))
      expect(result.id).toBe('new-t')
    })

    it('normalizes team from response', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { team: { id: 't4', name: 'Created' } },
      })

      const result = await createSportTeam({})

      expect(result.id).toBe('t4')
    })
  })

  describe('updateSportTeam', () => {
    it('updates team by ID', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { team: { id: 't1', name: 'Updated Team' } },
      })

      const result = await updateSportTeam('t1', { name: 'Updated Team' })

      expect(mockHttpPost).toHaveBeenCalledWith(
        expect.stringContaining('t1'),
        expect.any(Object),
      )
      expect(result.name).toBe('Updated Team')
    })

    it('throws error when ID is missing', async () => {
      await expect(updateSportTeam('', {})).rejects.toThrow('Team id is required')
      expect(mockHttpPost).not.toHaveBeenCalled()
    })

    it('URL-encodes team ID in path', async () => {
      mockHttpPost.mockResolvedValueOnce({ data: { team: {} } })

      await updateSportTeam('team with spaces', {})

      expect(mockHttpPost).toHaveBeenCalled()
    })
  })

  describe('deleteSportTeam', () => {
    it('deletes team by ID', async () => {
      mockHttpDelete.mockResolvedValueOnce({})

      const result = await deleteSportTeam('t1')

      expect(mockHttpDelete).toHaveBeenCalledWith('/sport/teams/t1')
      expect(result).toBe(true)
    })

    it('returns false when ID is empty', async () => {
      const result = await deleteSportTeam('')

      expect(result).toBe(false)
      expect(mockHttpDelete).not.toHaveBeenCalled()
    })
  })
})
