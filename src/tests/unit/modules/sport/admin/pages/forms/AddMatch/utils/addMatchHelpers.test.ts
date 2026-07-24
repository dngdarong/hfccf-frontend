import { describe, expect, it, vi } from 'vitest'
import {
  getFormPayload,
  inferCompetitionType,
  initializeMatchForm,
  parseSchedule,
  resetMatchForm,
  validateTeams,
} from '@/modules/sport/admin/pages/forms/AddMatch/utils/addMatchHelpers'

describe('addMatchHelpers', () => {
  it('parses ISO schedules into datetime-local values', () => {
    const iso = '2026-05-14T15:00:00.000Z'
    const parsed = parseSchedule(iso)
    const expectedDate = new Date(iso)
    const expected = new Date(expectedDate.getTime() - expectedDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)

    expect(parsed).toBe(expected)
  })

  it('retains legacy space-separated schedules as datetime-local values', () => {
    expect(parseSchedule('2026-05-14 15:00:00')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })

  it('hydrates match form state from backend values', () => {
    const setters = {
      setCompetitionType: vi.fn(),
      setTournamentId: vi.fn(),
      setTournament: vi.fn(),
      setDateTime: vi.fn(),
      setVenue: vi.fn(),
      setStatus: vi.fn(),
      setHomeTeam: vi.fn(),
      setAwayTeam: vi.fn(),
    }

    initializeMatchForm(
      {
        competitionType: 'tournament',
        tournamentId: 99,
        tournamentName: 'Spring Cup',
        scheduledAt: '2026-05-14T15:00:00.000Z',
        venue: 'Main Stadium',
        status: 'draft',
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
      },
      setters,
    )

    expect(setters.setCompetitionType).toHaveBeenCalledWith('tournament')
    expect(setters.setTournamentId).toHaveBeenCalledWith('99')
    expect(setters.setTournament).toHaveBeenCalledWith('Spring Cup')
    expect(setters.setVenue).toHaveBeenCalledWith('Main Stadium')
    expect(setters.setStatus).toHaveBeenCalledWith('draft')
    expect(setters.setHomeTeam).toHaveBeenCalledWith('Home FC')
    expect(setters.setAwayTeam).toHaveBeenCalledWith('Away FC')
    expect(setters.setDateTime).toHaveBeenCalledTimes(1)
  })

  it('resets match form state safely', () => {
    const setters = {
      setCompetitionType: vi.fn(),
      setTournamentId: vi.fn(),
      setTournament: vi.fn(),
      setDateTime: vi.fn(),
      setVenue: vi.fn(),
      setStatus: vi.fn(),
      setHomeTeam: vi.fn(),
      setAwayTeam: vi.fn(),
    }

    resetMatchForm(setters)

    expect(setters.setCompetitionType).toHaveBeenCalledWith('tournament')
    expect(setters.setStatus).toHaveBeenCalledWith('scheduled')
    expect(setters.setHomeTeam).toHaveBeenCalledWith('')
    expect(setters.setAwayTeam).toHaveBeenCalledWith('')
  })

  it('maps local form payload to backend fields', () => {
    const payload = getFormPayload('friendly', '', 'Foundation Cup', '2026-05-14T22:00', 'Main Stadium', 'scheduled', 'Home FC', 'Away FC')

    expect(payload).toEqual({
      competitionType: 'friendly',
      tournamentId: null,
      tournamentName: 'Foundation Cup',
      scheduledAt: '2026-05-14T22:00',
      venue: 'Main Stadium',
      status: 'scheduled',
      homeTeam: 'Home FC',
      awayTeam: 'Away FC',
    })
  })

  it('keeps team validation aligned with backend rejection', () => {
    const message = validateTeams('Home FC', 'Home FC', (key: string) => key)

    expect(message).toBe('sportMatchesManagement.teamSelectionError')
    expect(validateTeams('Home FC', 'Away FC', (key: string) => key)).toBe('')
  })

  it('infers competition type from tournament linkage', () => {
    expect(inferCompetitionType({ tournamentId: 1 })).toBe('tournament')
    expect(inferCompetitionType({ tournamentName: 'Friendly Cup' })).toBe('friendly')
    expect(inferCompetitionType({})).toBe('tournament')
  })
})
