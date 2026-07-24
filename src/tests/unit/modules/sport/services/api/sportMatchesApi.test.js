import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchSportMatches,
  fetchSportMatchesReport,
  downloadSportMatchesReportPdf,
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

  describe('fetchSportMatchesReport', () => {
    it('loads canonical report rows and summary with all filters', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          data: {
            summary: { total_matches: 2, completed_matches: 1, scheduled_matches: 1, total_teams: 2 },
            matches: [{
              id: 'm1',
              homeTeamName: 'QA Home',
              awayTeamName: 'QA Away',
              divisionId: 'd1',
              tournamentName: 'QA Cup',
              scheduledAt: '2026-07-05T00:00:00Z',
              homeScore: 0,
              awayScore: 1,
              status: 'completed',
            }],
          },
        },
      })

      const result = await fetchSportMatchesReport({
        dateFrom: new Date('2026-07-01T00:00:00Z'),
        dateTo: new Date('2026-07-31T00:00:00Z'),
        divisionId: 'd1',
        teamId: 't1',
        tournamentId: 'cup1',
      })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/reports/matches', expect.objectContaining({
        params: expect.objectContaining({
          date_from: '2026-07-01',
          date_to: '2026-07-31',
          division_id: 'd1',
          team_id: 't1',
          tournament_id: 'cup1',
        }),
      }))
      expect(result.summary.totalMatches).toBe(2)
      expect(result.matches[0].homeTeam).toBe('QA Home')
      expect(result.matches[0].date).toContain('2026-07-05')
      expect(result.matches[0].homeScore).toBe(0)
    })
  })

  describe('downloadSportMatchesReportPdf', () => {
    it('requests a Blob from the canonical PDF endpoint', async () => {
      const blob = new Blob(['%PDF-1.4'])
      mockHttpGet.mockResolvedValueOnce({
        data: blob,
        headers: { 'content-disposition': 'attachment; filename="SportReport_matches.pdf"', 'content-type': 'application/pdf' },
      })

      const result = await downloadSportMatchesReportPdf({ dateFrom: '2026-07-01', dateTo: '2026-07-31' })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/reports/matches/download', expect.objectContaining({ responseType: 'blob' }))
      expect(result.blob).toBe(blob)
      expect(result.filename).toBe('SportReport_matches.pdf')
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

      const result = await createSportMatch({
        matchCode: 'MATCH-900',
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        competitionType: 'tournament',
        tournamentId: '7',
        scheduledAt: '2026-05-14T15:00',
        venue: 'Main Stadium',
        status: 'scheduled',
      })

      expect(mockHttpPost).toHaveBeenCalledWith('/sport/matches', expect.any(Object))
      const [, formData] = mockHttpPost.mock.calls[0]

      expect(formData).toBeInstanceOf(FormData)
      expect(formData.get('match_code')).toBe('MATCH-900')
      expect(formData.get('home_team')).toBe('Home FC')
      expect(formData.get('away_team')).toBe('Away FC')
      expect(formData.get('competition_type')).toBe('tournament')
      expect(formData.get('tournament_id')).toBe('7')
      expect(formData.get('scheduled_at')).toBe('2026-05-14T15:00')
      expect(formData.get('venue')).toBe('Main Stadium')
      expect(formData.get('status')).toBe('scheduled')
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
