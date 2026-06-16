import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchMatchTeamEligibility } from '@/modules/sport/services/api/matchEligibilityApi'

const mockHttpGet = vi.fn()

vi.mock('@/services/http', () => ({
  default: {
    get: (...args) => mockHttpGet(...args),
  },
}))

vi.mock('@/modules/sport/services/api/matchSquadMappers', () => ({
  normalizeMatchEligibilityResponse: (response) => ({
    match: response?.data?.match,
    team: response?.data?.team,
    items: response?.data?.items || [],
    raw: response?.data || null,
  }),
}))

describe('matchEligibilityApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchMatchTeamEligibility', () => {
    it('fetches eligibility for match and team', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          match: { id: 'm1', homeTeam: 'Team A' },
          team: { id: 't1', name: 'Team A' },
          items: [{ playerId: 'p1', eligible: true }],
        },
      })

      const result = await fetchMatchTeamEligibility('m1', 't1')

      expect(mockHttpGet).toHaveBeenCalledWith(
        '/sport/matches/m1/teams/t1/eligibility',
        expect.any(Object),
      )
      expect(result.items).toHaveLength(1)
      expect(result.match.id).toBe('m1')
    })

    it('URL-encodes both match and team IDs', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [] },
      })

      await fetchMatchTeamEligibility('match with spaces', 'team with spaces')

      expect(mockHttpGet).toHaveBeenCalledWith(
        expect.stringContaining('match'),
        expect.any(Object),
      )
    })

    it('returns empty result when match ID is missing', async () => {
      const result = await fetchMatchTeamEligibility('', 't1')

      expect(result.match).toBeNull()
      expect(result.team).toBeNull()
      expect(result.items).toEqual([])
      expect(mockHttpGet).not.toHaveBeenCalled()
    })

    it('returns empty result when team ID is missing', async () => {
      const result = await fetchMatchTeamEligibility('m1', '')

      expect(result.match).toBeNull()
      expect(result.team).toBeNull()
      expect(result.items).toEqual([])
      expect(mockHttpGet).not.toHaveBeenCalled()
    })

    it('returns empty result when both IDs are missing', async () => {
      const result = await fetchMatchTeamEligibility('', '')

      expect(result.match).toBeNull()
      expect(result.team).toBeNull()
      expect(result.items).toEqual([])
      expect(mockHttpGet).not.toHaveBeenCalled()
    })

    it('passes abort signal', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [] },
      })

      const signal = new AbortController().signal
      await fetchMatchTeamEligibility('m1', 't1', { signal })

      expect(mockHttpGet).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal }),
      )
    })

    it('normalizes match and team from response', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          match: { id: 'm2', status: 'scheduled' },
          team: { id: 't2', code: 'TEAM' },
          items: [
            { playerId: 'p1', eligible: true },
            { playerId: 'p2', eligible: false },
          ],
        },
      })

      const result = await fetchMatchTeamEligibility('m2', 't2')

      expect(result.match.id).toBe('m2')
      expect(result.team.id).toBe('t2')
      expect(result.items).toHaveLength(2)
    })

    it('handles empty eligibility items', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          match: { id: 'm1' },
          team: { id: 't1' },
        },
      })

      const result = await fetchMatchTeamEligibility('m1', 't1')

      expect(result.items).toEqual([])
    })
  })
})
