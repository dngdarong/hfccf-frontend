import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useMatchSquad } from '@/modules/sport/match-squads/composables/useMatchSquad'
import * as api from '@/modules/sport/services/api/matchSquadApi'
import * as matchesApi from '@/modules/sport/services/api/sportMatchesApi'

vi.mock('@/modules/sport/services/api/matchSquadApi', () => ({
  fetchMatchSquads: vi.fn(),
  fetchMatchTeamSquad: vi.fn(),
  saveMatchTeamSquad: vi.fn(),
  updateMatchSquad: vi.fn(),
  submitMatchSquad: vi.fn(),
  approveMatchSquad: vi.fn(),
  lockMatchSquad: vi.fn(),
}))

vi.mock('@/modules/sport/services/api/sportMatchesApi', () => ({
  fetchSportMatch: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useMatchSquad', () => {
  it('loads match and squad snapshots and performs squad actions', async () => {
    matchesApi.fetchSportMatch.mockResolvedValueOnce({
      id: 1,
      matchCode: 'M-1',
      homeTeam: 'Assigned FC',
      awayTeam: 'Rival FC',
      homeTeamData: { id: 11, name: 'Assigned FC' },
      awayTeamData: { id: 12, name: 'Rival FC' },
    })

    api.fetchMatchSquads.mockResolvedValueOnce({ items: [{ id: 31, status: 'draft' }], match: null })
    api.fetchMatchTeamSquad.mockResolvedValueOnce({
      squad: { id: 41, status: 'draft', team: { id: 11, name: 'Assigned FC' }, players: [] },
      match: { id: 1 },
      team: { id: 11, name: 'Assigned FC' },
      players: [],
    })
    api.saveMatchTeamSquad.mockResolvedValueOnce({
      squad: { id: 41, status: 'draft', team: { id: 11, name: 'Assigned FC' }, players: [] },
      players: [],
    })
    api.submitMatchSquad.mockResolvedValueOnce({ squad: { id: 41, status: 'submitted', players: [] } })
    api.approveMatchSquad.mockResolvedValueOnce({ squad: { id: 41, status: 'approved', players: [] } })
    api.lockMatchSquad.mockResolvedValueOnce({ squad: { id: 41, status: 'locked', players: [] } })
    api.updateMatchSquad.mockResolvedValueOnce({ squad: { id: 41, status: 'draft', players: [] } })

    const matchSquad = useMatchSquad()
    await matchSquad.loadMatch(1)
    await matchSquad.loadMatchSquads(1)
    await matchSquad.loadTeamSquad(1, 11)
    await matchSquad.saveSquad(1, 11, { notes: 'Draft', players: [] })
    await matchSquad.updateSquad(41, { notes: 'Edited', players: [] })
    await matchSquad.submitSquad(41)
    await matchSquad.approveSquad(41)
    await matchSquad.lockSquad(41)
    await nextTick()

    expect(matchSquad.match.value).toMatchObject({ id: 1, matchCode: 'M-1' })
    expect(matchSquad.squads.value).toHaveLength(1)
    expect(matchSquad.squad.value).toMatchObject({ id: 41, status: 'locked' })
  })
})
