import { describe, expect, it } from 'vitest'
import {
  buildFixtureSummary,
  buildResultSavePayload,
  calculateScore,
  createDraftEvent,
  createResultValue,
  validateResult,
} from '@/modules/sport/admin/pages/forms/MatchesResultEntry/utils/resultEntryHelpers'

describe('resultEntryHelpers', () => {
  it('formats ISO schedules into display date and time parts', () => {
    const iso = '2026-05-14T15:00:00.000Z'
    const summary = buildFixtureSummary({
      homeTeam: 'Home FC',
      awayTeam: 'Away FC',
      scheduledAt: iso,
      venue: 'Main Stadium',
      tournamentName: 'Foundation Cup',
    })

    const expectedDate = new Date(iso).toLocaleDateString()
    const expectedTime = new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    expect(summary.homeTeam).toBe('Home FC')
    expect(summary.awayTeam).toBe('Away FC')
    expect(summary.matchDate).toBe(expectedDate)
    expect(summary.matchTime).toBe(expectedTime)
    expect(summary.venue).toBe('Main Stadium')
    expect(summary.competition).toBe('Foundation Cup')
  })

  it('falls back safely when the match record is not yet loaded', () => {
    expect(buildFixtureSummary(null)).toEqual({
      homeTeam: '-',
      awayTeam: '-',
      matchDate: '-',
      matchTime: '-',
      venue: '-',
      competition: '-',
    })
  })

  it('calculates score from scoring events only', () => {
    const score = calculateScore(
      [
        { eventType: 'goal', teamId: 1 },
        { eventType: 'own_goal', teamId: 1 },
        { eventType: 'yellow_card', teamId: 2 },
      ],
      { awayTeamId: 2 },
    )

    expect(score).toEqual({ home: 1, away: 1 })
  })

  it('builds a compact result payload', () => {
    expect(buildResultSavePayload({ status: 'completed', report: 'Done' })).toEqual({
      status: 'completed',
      currentPeriod: 'final',
      notes: 'Done',
    })
  })

  it('keeps result validation aligned with the workflow contract', () => {
    const t = (key: string) => key
    expect(validateResult(createResultValue(), null, t)).toBe('sportMatchesManagement.resultsEntry.validation.matchRequired')
    expect(validateResult({ homeScore: -1, awayScore: 0, status: 'completed' }, {}, t)).toBe('sportMatchesManagement.resultsEntry.validation.scoreInvalid')
    expect(validateResult({ homeScore: 0, awayScore: 0, status: '' }, {}, t)).toBe('sportMatchesManagement.resultsEntry.validation.statusRequired')
  })

  it('creates draft events with safe defaults', () => {
    expect(createDraftEvent()).toMatchObject({
      eventType: 'goal',
      minute: 0,
      stoppageMinute: 0,
      period: 'first_half',
    })
  })
})
