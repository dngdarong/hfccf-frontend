import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getMatchEvents,
  createMatchEvent,
  updateMatchEvent,
  deleteMatchEvent,
} from '@/modules/sport/services/api/matchEventApi'

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

vi.mock('@/modules/sport/services/api/matchTimelineMappers', () => ({
  normalizeMatchTimelineResponse: (response, _homeTeamId, _awayTeamId) => ({
    items: response?.data?.items || [],
    pagination: response?.data?.pagination || { page: 1, perPage: 10, total: 0, totalPages: 1 },
    match: response?.data?.match,
    raw: response?.data || null,
  }),
  normalizeMatchTimelineEvent: (data, _homeTeamId, _awayTeamId) => ({
    id: data.id,
    type: data.type,
    minute: data.minute,
    teamId: data.teamId,
  }),
  buildMatchTimelineEventPayload: (payload, _options) => ({
    type: payload.type,
    minute: payload.minute,
    teamId: payload.teamId,
  }),
}))

describe('matchEventApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMatchEvents', () => {
    it('fetches match events', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          match: { id: 'm1' },
          items: [{ id: 'e1', type: 'goal', minute: 45 }],
          pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
        },
      })

      const result = await getMatchEvents('m1')

      expect(mockHttpGet).toHaveBeenCalledWith(
        '/sport/matches/m1/events',
        expect.any(Object),
      )
      expect(result.items).toHaveLength(1)
      expect(result.match.id).toBe('m1')
    })

    it('passes team IDs to normalizer', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          items: [{ id: 'e1', type: 'goal' }],
        },
      })

      await getMatchEvents('m1', {
        homeTeamId: 'h1',
        awayTeamId: 'a1',
      })

      expect(mockHttpGet).toHaveBeenCalled()
    })

    it('returns empty events when match ID is missing', async () => {
      const result = await getMatchEvents('')

      expect(result.items).toEqual([])
      expect(result.pagination.total).toBe(0)
      expect(result.match).toBeNull()
      expect(mockHttpGet).not.toHaveBeenCalled()
    })

    it('URL-encodes match ID', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [] },
      })

      await getMatchEvents('match with spaces')

      expect(mockHttpGet).toHaveBeenCalledWith(
        expect.stringContaining('match'),
        expect.any(Object),
      )
    })

    it('passes abort signal', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [] },
      })

      const signal = new AbortController().signal
      await getMatchEvents('m1', { signal })

      expect(mockHttpGet).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal }),
      )
    })
  })

  describe('createMatchEvent', () => {
    it('creates event for match', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { data: { event: { id: 'e1', type: 'goal', minute: 45 } } },
      })

      const result = await createMatchEvent('m1', { type: 'goal', minute: 45 })

      expect(mockHttpPost).toHaveBeenCalledWith(
        '/sport/matches/m1/events',
        expect.any(Object),
      )
      expect(result.id).toBe('e1')
      expect(result.type).toBe('goal')
    })

    it('handles response with nested data wrapper', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { data: { event: { id: 'e2', type: 'red-card', minute: 60 } } },
      })

      const result = await createMatchEvent('m1', { type: 'red-card', minute: 60 })

      expect(result.id).toBe('e2')
    })

    it('handles response with top-level event', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { event: { id: 'e3', type: 'substitution', minute: 70 } },
      })

      const result = await createMatchEvent('m1', { type: 'substitution', minute: 70 })

      expect(result.id).toBe('e3')
    })

    it('throws error when match ID is missing', async () => {
      await expect(createMatchEvent('', { type: 'goal' })).rejects.toThrow('Match id is required')
      expect(mockHttpPost).not.toHaveBeenCalled()
    })

    it('passes team IDs to payload builder', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { event: { id: 'e1', type: 'goal' } },
      })

      await createMatchEvent('m1', { type: 'goal' }, {
        homeTeamId: 'h1',
        awayTeamId: 'a1',
      })

      expect(mockHttpPost).toHaveBeenCalled()
    })
  })

  describe('updateMatchEvent', () => {
    it('updates match event via PATCH', async () => {
      mockHttpPatch.mockResolvedValueOnce({
        data: { event: { id: 'e1', type: 'goal', minute: 50 } },
      })

      const result = await updateMatchEvent('e1', { minute: 50 })

      expect(mockHttpPatch).toHaveBeenCalledWith(
        '/sport/match-events/e1',
        expect.any(Object),
      )
      expect(result.id).toBe('e1')
      expect(result.minute).toBe(50)
    })

    it('handles nested data response', async () => {
      mockHttpPatch.mockResolvedValueOnce({
        data: { data: { event: { id: 'e2', type: 'goal', minute: 55 } } },
      })

      const result = await updateMatchEvent('e2', { minute: 55 })

      expect(result.id).toBe('e2')
    })

    it('throws error when event ID is missing', async () => {
      await expect(updateMatchEvent('', { minute: 50 })).rejects.toThrow('Event id is required')
      expect(mockHttpPatch).not.toHaveBeenCalled()
    })

    it('URL-encodes event ID', async () => {
      mockHttpPatch.mockResolvedValueOnce({
        data: { event: { id: 'e1' } },
      })

      await updateMatchEvent('event with spaces', { minute: 50 })

      expect(mockHttpPatch).toHaveBeenCalled()
    })
  })

  describe('deleteMatchEvent', () => {
    it('deletes match event', async () => {
      mockHttpDelete.mockResolvedValueOnce({})

      const result = await deleteMatchEvent('e1')

      expect(mockHttpDelete).toHaveBeenCalledWith('/sport/match-events/e1')
      expect(result).toBe(true)
    })

    it('returns false when event ID is missing', async () => {
      const result = await deleteMatchEvent('')

      expect(result).toBe(false)
      expect(mockHttpDelete).not.toHaveBeenCalled()
    })

    it('URL-encodes event ID', async () => {
      mockHttpDelete.mockResolvedValueOnce({})

      await deleteMatchEvent('event with spaces')

      expect(mockHttpDelete).toHaveBeenCalled()
    })
  })
})
