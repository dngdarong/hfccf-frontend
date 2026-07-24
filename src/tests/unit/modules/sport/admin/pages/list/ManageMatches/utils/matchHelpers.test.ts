import { describe, expect, it } from 'vitest'
import {
  formatDisplayScore,
  getCompetitionOptions,
  getTournamentOptions,
  matchTournamentLabel,
  normalize,
  toTableMatch,
} from '@/modules/sport/admin/pages/list/ManageMatches/utils/matchHelpers'

describe('matchHelpers', () => {
  it('formats match schedules for the table using local display strings', () => {
    const iso = '2026-05-14T15:00:00.000Z'
    const tableRow = toTableMatch({
      id: 1,
      schedule: iso,
      homeScore: 2,
      awayScore: 1,
    })

    expect(tableRow.schedule).toBe(new Date(iso).toLocaleString())
    expect(tableRow.score).toBe('2 - 1')
  })

  it('formats scores from snake_case values when needed', () => {
    expect(formatDisplayScore({ home_score: 3, away_score: 0 })).toBe('3 - 0')
  })

  it('collects unique competition and tournament filters', () => {
    const matches = [
      { competitionType: 'friendly', tournamentName: 'Cup A' },
      { competition: 'friendly', tournament: { name: 'Cup B' } },
      { competitionType: 'tournament', tournamentName: 'Cup A' },
    ]

    expect(getCompetitionOptions(matches)).toEqual(['friendly', 'tournament'])
    expect(getTournamentOptions(matches)).toEqual(['Cup A', 'Cup B'])
  })

  it('normalizes and labels tournament names consistently', () => {
    expect(normalize('  Live  ')).toBe('live')
    expect(matchTournamentLabel({ tournament: { name: 'Foundation Cup' } })).toBe('Foundation Cup')
  })
})
