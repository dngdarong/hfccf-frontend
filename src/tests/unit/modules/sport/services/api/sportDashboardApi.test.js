import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchSportDashboard,
  fetchCoachDashboard,
} from '@/modules/sport/services/api/sportDashboardApi'

const mockHttpGet = vi.fn()

vi.mock('@/services/http', () => ({
  default: {
    get: (...args) => mockHttpGet(...args),
  },
}))

vi.mock('@/modules/sport/services/api/sportApiUtils', () => ({
  normalizeDashboardPayload: (response) => ({
    stats: response?.data?.stats || {},
    recentMatches: response?.data?.recentMatches || [],
    standings: response?.data?.standings || [],
    upcomingMatches: response?.data?.upcomingMatches || [],
  }),
  unwrapApiData: (response) => response?.data || {},
}))

describe('sportDashboardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchSportDashboard', () => {
    it('fetches sport dashboard data', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          stats: { totalMatches: 10, totalTeams: 5 },
          recentMatches: [{ id: 'm1', status: 'completed' }],
          standings: [{ teamId: 't1', wins: 5 }],
          upcomingMatches: [{ id: 'm2', status: 'scheduled' }],
        },
      })

      const result = await fetchSportDashboard()

      expect(mockHttpGet).toHaveBeenCalledWith(
        '/sport/dashboard',
        expect.any(Object),
      )
      expect(result.stats).toEqual({ totalMatches: 10, totalTeams: 5 })
      expect(result.recentMatches).toHaveLength(1)
      expect(result.standings).toHaveLength(1)
      expect(result.upcomingMatches).toHaveLength(1)
    })

    it('normalizes dashboard with default empty values', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {},
      })

      const result = await fetchSportDashboard()

      expect(result.stats).toEqual({})
      expect(result.recentMatches).toEqual([])
      expect(result.standings).toEqual([])
      expect(result.upcomingMatches).toEqual([])
    })

    it('handles partial dashboard data', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          stats: { totalMatches: 15 },
          recentMatches: [{ id: 'm1' }, { id: 'm2' }],
        },
      })

      const result = await fetchSportDashboard()

      expect(result.stats).toEqual({ totalMatches: 15 })
      expect(result.recentMatches).toHaveLength(2)
      expect(result.standings).toEqual([])
    })

    it('passes abort signal', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {},
      })

      const signal = new AbortController().signal
      await fetchSportDashboard({ signal })

      expect(mockHttpGet).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal }),
      )
    })

    it('unwraps complex nested data structures', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          stats: {
            totalMatches: 20,
            totalTeams: 8,
            activeTournaments: 3,
          },
          recentMatches: [
            { id: 'm1', homeTeam: 'A', awayTeam: 'B', score: '2-1' },
            { id: 'm2', homeTeam: 'C', awayTeam: 'D', score: '0-0' },
          ],
          standings: [
            { teamId: 't1', name: 'Team A', wins: 6, losses: 1 },
            { teamId: 't2', name: 'Team B', wins: 5, losses: 2 },
          ],
          upcomingMatches: [
            { id: 'm3', homeTeam: 'E', awayTeam: 'F', scheduledAt: '2026-06-15' },
          ],
        },
      })

      const result = await fetchSportDashboard()

      expect(result.stats.totalMatches).toBe(20)
      expect(result.recentMatches).toHaveLength(2)
      expect(result.standings).toHaveLength(2)
      expect(result.upcomingMatches).toHaveLength(1)
    })
  })

  describe('fetchCoachDashboard', () => {
    it('fetches coach dashboard data', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          myTeams: [{ id: 't1', name: 'My Team' }],
          upcomingMatches: [{ id: 'm1', status: 'scheduled' }],
          players: [{ id: 'p1', name: 'Player 1' }],
        },
      })

      const result = await fetchCoachDashboard()

      expect(mockHttpGet).toHaveBeenCalledWith(
        '/sport/coach/dashboard',
        expect.any(Object),
      )
      expect(result.myTeams).toHaveLength(1)
      expect(result.upcomingMatches).toHaveLength(1)
      expect(result.players).toHaveLength(1)
    })

    it('returns empty object for missing data', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {},
      })

      const result = await fetchCoachDashboard()

      expect(result).toEqual({})
    })

    it('unwraps top-level API data', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          coachId: 'coach-1',
          teamAssignments: [{ teamId: 't1', role: 'head' }],
          playerRoster: [{ playerId: 'p1' }, { playerId: 'p2' }],
          recentResults: [{ matchId: 'm1', result: 'win' }],
        },
      })

      const result = await fetchCoachDashboard()

      expect(result.coachId).toBe('coach-1')
      expect(result.teamAssignments).toHaveLength(1)
      expect(result.playerRoster).toHaveLength(2)
      expect(result.recentResults).toHaveLength(1)
    })

    it('passes abort signal', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {},
      })

      const signal = new AbortController().signal
      await fetchCoachDashboard({ signal })

      expect(mockHttpGet).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal }),
      )
    })

    it('handles large coach dashboard payload', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          myTeams: Array.from({ length: 3 }, (_, i) => ({
            id: `t${i}`,
            name: `Team ${i}`,
          })),
          players: Array.from({ length: 20 }, (_, i) => ({
            id: `p${i}`,
            name: `Player ${i}`,
          })),
          matches: Array.from({ length: 5 }, (_, i) => ({
            id: `m${i}`,
            status: i < 3 ? 'completed' : 'scheduled',
          })),
        },
      })

      const result = await fetchCoachDashboard()

      expect(result.myTeams).toHaveLength(3)
      expect(result.players).toHaveLength(20)
      expect(result.matches).toHaveLength(5)
    })
  })
})
