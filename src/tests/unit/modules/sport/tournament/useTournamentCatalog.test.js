import { beforeEach, describe, expect, it } from 'vitest'
import { useTournamentCatalog } from '@/modules/sport/tournament/composables/useTournamentCatalog'

describe('useTournamentCatalog', () => {
  beforeEach(() => {
    const catalog = useTournamentCatalog()
    catalog.resetTournamentCatalog()
  })

  it('starts with the seeded mock tournaments', () => {
    const catalog = useTournamentCatalog()
    expect(catalog.tournaments.value).toHaveLength(4)
  })

  it('creates a tournament with a generated id', () => {
    const catalog = useTournamentCatalog()
    const record = catalog.createTournament({
      name: 'HFCCF Spring Cup',
      season: '2026',
      sportType: 'football',
      location: 'Central Stadium',
      organizer: 'HFCCF Sport Office',
      registrationOpenAt: '2026-01-01',
      registrationCloseAt: '2026-01-15',
      startAt: '2026-02-01',
      endAt: '2026-02-28',
    })

    expect(record.id).toMatch(/^tournament-\d{3}$/)
    expect(catalog.getTournamentById(record.id)?.name).toBe('HFCCF Spring Cup')
  })

  it('updates an existing tournament without changing its id', () => {
    const catalog = useTournamentCatalog()
    const existing = catalog.getTournamentById('tournament-001')
    const updated = catalog.updateTournament('tournament-001', {
      name: 'HFCCF National Youth League 2026',
    })

    expect(updated?.id).toBe(existing?.id)
    expect(updated?.name).toBe('HFCCF National Youth League 2026')
  })

  it('transitions tournaments when the move is valid', () => {
    const catalog = useTournamentCatalog()
    const created = catalog.createTournament({
      name: 'HFCCF Spring Cup',
      season: '2026',
      sportType: 'football',
      location: 'Central Stadium',
      organizer: 'HFCCF Sport Office',
      registrationOpenAt: '2026-01-01',
      registrationCloseAt: '2026-01-15',
      startAt: '2026-02-01',
      endAt: '2026-02-28',
    })
    const updated = catalog.transitionTournament(created.id, 'registration_open')

    expect(updated?.state).toBe('registration_open')
    expect(updated?.registrationStatus).toBe('open')
  })

  it('rejects invalid transitions', () => {
    const catalog = useTournamentCatalog()
    const updated = catalog.transitionTournament('tournament-004', 'registration_open')

    expect(updated).toBeNull()
  })

  it('removes tournaments by id', () => {
    const catalog = useTournamentCatalog()
    expect(catalog.removeTournament('tournament-004')).toBe(true)
    expect(catalog.getTournamentById('tournament-004')).toBeNull()
  })
})
