import { describe, expect, it } from 'vitest'
import { createMockTournaments } from '@/modules/sport/tournament/mocks/tournaments.mock'
import { selectTournamentQualifiers } from '@/modules/sport/tournament/composables/useTournamentQualification'

describe('useTournamentQualification helpers', () => {
  it('selects qualifiers from standings and resolves a valid bracket size', () => {
    const tournament = createMockTournaments().find((item) => item.id === 'tournament-001')

    const result = selectTournamentQualifiers({
      tournament,
      settings: {
        qualificationSlots: 2,
      },
    })

    expect(result.groupQualifications).toHaveLength(4)
    expect(result.qualifiers).toHaveLength(8)
    expect(result.bracketSize).toBe(8)
    expect(result.ready).toBe(true)
    expect(result.qualifiers[0].role).toBe('winner')
  })

  it('flags tournaments that cannot generate a knockout bracket size', () => {
    const tournament = createMockTournaments().find((item) => item.id === 'tournament-003')

    const result = selectTournamentQualifiers({
      tournament,
      settings: {
        qualificationSlots: 2,
      },
    })

    expect(result.bracketSize).toBe(0)
    expect(result.ready).toBe(false)
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'invalidBracketSize' }),
    ]))
  })
})
