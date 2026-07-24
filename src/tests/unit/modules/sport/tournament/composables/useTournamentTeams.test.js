import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTournamentTeams } from '@/modules/sport/tournament/composables/useTournamentTeams'

const apiMocks = vi.hoisted(() => ({
  fetchSportTeams: vi.fn(),
  addTournamentTeam: vi.fn(),
  removeTournamentTeam: vi.fn(),
}))
vi.mock('@/modules/sport/services/api/sportTeamsApi', () => ({ fetchSportTeams: apiMocks.fetchSportTeams }))
vi.mock('@/modules/sport/tournament/api/tournamentApi', () => ({
  addTournamentTeam: apiMocks.addTournamentTeam,
  removeTournamentTeam: apiMocks.removeTournamentTeam,
}))

beforeEach(() => vi.clearAllMocks())

describe('useTournamentTeams', () => {
  it('loads Sport teams and excludes attached selections', async () => {
    apiMocks.fetchSportTeams.mockResolvedValueOnce({ items: [{ id: 1, name: 'Attached' }, { id: 2, name: 'Available' }] })
    const state = useTournamentTeams(ref({ id: '9', teams: [{ teamId: '1', name: 'Attached' }] }))
    await state.loadTeams()
    expect(state.selectableTeams.value).toEqual([{ id: 2, name: 'Available' }])
  })

  it('attaches and removes through canonical endpoints and reloads', async () => {
    apiMocks.addTournamentTeam.mockResolvedValueOnce({ tournament: { id: '9' } })
    apiMocks.removeTournamentTeam.mockResolvedValueOnce({ tournament: { id: '9' } })
    const reload = vi.fn()
    const state = useTournamentTeams(ref({ id: '9', teams: [] }), { reload })
    await state.attachTeam(2)
    await state.removeTeam(2)
    expect(apiMocks.addTournamentTeam).toHaveBeenCalledWith('9', { teamId: 2 })
    expect(apiMocks.removeTournamentTeam).toHaveBeenCalledWith('9', 2)
    expect(reload).toHaveBeenCalledTimes(2)
  })

  it('prevents duplicate attachment requests and preserves errors', async () => {
    let resolveRequest
    apiMocks.addTournamentTeam.mockReturnValueOnce(new Promise((resolve) => { resolveRequest = resolve }))
    const state = useTournamentTeams(ref({ id: '9', teams: [] }))
    const first = state.attachTeam(2)
    expect(await state.attachTeam(2)).toBeNull()
    expect(state.isAttaching.value).toBe(true)
    resolveRequest({ tournament: { id: '9' } })
    await first
    expect(state.isAttaching.value).toBe(false)
  })
})
