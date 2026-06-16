import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchSportMatches,
  fetchSportMatch,
  createSportMatch,
  updateSportMatch,
  deleteSportMatch,
  updateMatchStatus,
  fetchMatchEvents,
  createMatchEvent,
  updateMatchEvent,
  deleteMatchEvent,
} from '@/modules/sport/services/api/sportMatchesApi'

const mockHttpGet = vi.fn()
const mockHttpPost = vi.fn()
const mockHttpPatch = vi.fn()
const mockHttpDelete = vi.fn()

vi.mock('@/services/http', () => ({
  default: {
    get: (...args) => mockHttpGet(...args),
    post: (...args) => mockHttpPost(...args),
    patch: (...args) => mockHttpPatch(...args),
    delete: (...args) => mockHttpDelete(...args),
  },
}))

describe('sportMatchesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchSportMatches', () => {
    it('fetches matches list with default pagination', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          items: [{ id: 'm1', homeTeam: 'Team A', awayTeam: 'Team B' }],
          pagination: { page: 1, per_page: 10, total: 1, total_pages: 1 },
        },
      })

      const result = await fetchSportMatches()

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/matches', expect.objectContaining({
        params: expect.objectContaining({
          page: 1,
          per_page: 10,
          sort_by: 'scheduled_at',
          sort_direction: 'desc',
        }),
      }))
      expect(result.items).toHaveLength(1)
    })

    it('applies search, status, and team filters', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 1, per_page: 10, total: 0, total_pages: 0 } },
      })

      await fetchSportMatches({
        search: 'semi-final',
        status: 'completed',
        teamId: 'team-1',
      })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/matches', expect.objectContaining({
        params: expect.objectContaining({
          search: 'semi-final',
          status: 'completed',
          team_id: 'team-1',
        }),
      }))
    })

    it('supports custom sorting', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 1, per_page: 10, total: 0, total_pages: 0 } },
      })

      await fetchSportMatches({
        sortBy: 'scheduled_at',
        sortDirection: 'asc',
      })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/matches', expect.objectContaining({
        params: expect.objectContaining({
          sort_by: 'scheduled_at',
          sort_direction: 'asc',
        }),
      }))
    })
  })

  describe('fetchSportMatch', () => {
    it('fetches single match by ID', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { match: { id: 'm1', homeTeam: 'Team A', awayTeam: 'Team B' } },
      })

      const result = await fetchSportMatch('m1')

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/matches/m1', expect.any(Object))
      expect(result.id).toBe('m1')
    })

    it('returns null when ID is empty', async () => {
      const result = await fetchSportMatch('')

      expect(result).toBeNull()
      expect(mockHttpGet).not.toHaveBeenCalled()
    })
  })

  describe('createSportMatch', () => {
    it('creates match with payload', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { match: { id: 'new-m', homeTeamId: 't1', awayTeamId: 't2' } },
      })

      const result = await createSportMatch({ homeTeamId: 't1', awayTeamId: 't2' })

      expect(mockHttpPost).toHaveBeenCalledWith('/sport/matches', expect.any(Object))
      expect(result.id).toBe('new-m')
    })
  })

  describe('updateSportMatch', () => {
    it('updates match by ID', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { match: { id: 'm1', status: 'completed' } },
      })

      const result = await updateSportMatch('m1', { status: 'completed' })

      expect(mockHttpPost).toHaveBeenCalledWith(
        expect.stringContaining('m1'),
        expect.any(Object),
      )
      expect(result.id).toBe('m1')
    })

    it('throws error when ID is missing', async () => {
      await expect(updateSportMatch('', {})).rejects.toThrow('Match id is required')
      expect(mockHttpPost).not.toHaveBeenCalled()
    })
  })

  describe('deleteSportMatch', () => {
    it('deletes match by ID', async () => {
      mockHttpDelete.mockResolvedValueOnce({})

      const result = await deleteSportMatch('m1')

      expect(mockHttpDelete).toHaveBeenCalledWith('/sport/matches/m1')
      expect(result).toBe(true)
    })

    it('returns false when ID is empty', async () => {
      const result = await deleteSportMatch('')

      expect(result).toBe(false)
      expect(mockHttpDelete).not.toHaveBeenCalled()
    })
  })

  describe('updateMatchStatus', () => {
    it('updates match status via PATCH', async () => {
      mockHttpPatch.mockResolvedValueOnce({
        data: { match: { id: 'm1', status: 'live', currentPeriod: 2 } },
      })

      const result = await updateMatchStatus('m1', { status: 'live', currentPeriod: 2 })

      expect(mockHttpPatch).toHaveBeenCalledWith(
        '/sport/matches/m1/status',
        expect.objectContaining({
          status: 'live',
          current_period: 2,
        }),
      )
      expect(result.id).toBe('m1')
    })

    it('throws error when match ID is missing', async () => {
      await expect(updateMatchStatus('', { status: 'live' })).rejects.toThrow('Match id is required')
      expect(mockHttpPatch).not.toHaveBeenCalled()
    })

    it('handles snake_case current_period', async () => {
      mockHttpPatch.mockResolvedValueOnce({
        data: { match: { id: 'm1' } },
      })

      await updateMatchStatus('m1', { status: 'live', current_period: 1 })

      expect(mockHttpPatch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ current_period: 1 }),
      )
    })
  })

  describe('fetchMatchEvents', () => {
    it('fetches match events with team IDs from response', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          match: { id: 'm1', homeTeamId: 'h1', awayTeamId: 'a1' },
          items: [{ id: 'e1', type: 'goal' }],
        },
      })

      const result = await fetchMatchEvents('m1')

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/matches/m1/events', expect.any(Object))
      expect(result.items).toHaveLength(1)
    })

    it('uses provided team IDs from options', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [{ id: 'e1', type: 'goal' }] },
      })

      const result = await fetchMatchEvents('m1', {
        homeTeamId: 'h2',
        awayTeamId: 'a2',
      })

      expect(result.items).toHaveLength(1)
    })

    it('returns empty list when match ID is empty', async () => {
      const result = await fetchMatchEvents('')

      expect(result.items).toEqual([])
      expect(mockHttpGet).not.toHaveBeenCalled()
    })

    it('handles snake_case team IDs from response', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          match: { id: 'm1', home_team_id: 'h3', away_team_id: 'a3' },
          items: [],
        },
      })

      await fetchMatchEvents('m1')

      expect(mockHttpGet).toHaveBeenCalledWith(
        expect.stringContaining('m1'),
        expect.any(Object),
      )
    })
  })

  describe('createMatchEvent', () => {
    it('creates event for match', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { event: { id: 'e1', matchId: 'm1', type: 'goal' } },
      })

      const result = await createMatchEvent('m1', { type: 'goal', minute: 45 })

      expect(mockHttpPost).toHaveBeenCalledWith(
        '/sport/matches/m1/events',
        expect.any(Object),
      )
      expect(result.id).toBe('e1')
    })

    it('throws error when match ID is missing', async () => {
      await expect(createMatchEvent('', { type: 'goal' })).rejects.toThrow('Match id is required')
      expect(mockHttpPost).not.toHaveBeenCalled()
    })
  })

  describe('updateMatchEvent', () => {
    it('updates event by ID', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { event: { id: 'e1', type: 'goal', minute: 50 } },
      })

      const result = await updateMatchEvent('e1', { minute: 50 })

      expect(mockHttpPost).toHaveBeenCalledWith(
        '/sport/events/e1',
        expect.any(Object),
      )
      expect(result.id).toBe('e1')
    })

    it('throws error when event ID is missing', async () => {
      await expect(updateMatchEvent('', { minute: 50 })).rejects.toThrow('Event id is required')
      expect(mockHttpPost).not.toHaveBeenCalled()
    })
  })

  describe('deleteMatchEvent', () => {
    it('deletes event by ID', async () => {
      mockHttpDelete.mockResolvedValueOnce({})

      const result = await deleteMatchEvent('e1')

      expect(mockHttpDelete).toHaveBeenCalledWith('/sport/events/e1')
      expect(result).toBe(true)
    })

    it('returns false when event ID is empty', async () => {
      const result = await deleteMatchEvent('')

      expect(result).toBe(false)
      expect(mockHttpDelete).not.toHaveBeenCalled()
    })
  })
})
