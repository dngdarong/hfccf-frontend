import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useTeamRoster } from '@/modules/sport/coach/composables/useTeamRoster'
import * as teamRosterApi from '@/modules/sport/services/api/teamRosterApi'

vi.mock('@/modules/sport/services/api/teamRosterApi', () => ({
  fetchTeamRoster: vi.fn(),
  addTeamRosterPlayer: vi.fn(),
  updateRosterMembership: vi.fn(),
  removeRosterMembership: vi.fn(),
  fetchPlayerHistory: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useTeamRoster', () => {
  it('loads roster data and tracks loading state', async () => {
    teamRosterApi.fetchTeamRoster.mockResolvedValueOnce({
      team: { id: 'team-1', name: 'Assigned FC' },
      players: [{ id: 'player-1', name: 'Player One', rosterStatus: 'active' }],
      memberships: [{ id: 'membership-1', status: 'active' }],
    })

    const { team, players, memberships, loading, loadRoster } = useTeamRoster()
    const pending = loadRoster('team-1')

    expect(loading.value).toBe(true)
    await pending
    await nextTick()

    expect(loading.value).toBe(false)
    expect(team.value).toMatchObject({ id: 'team-1', name: 'Assigned FC' })
    expect(players.value).toHaveLength(1)
    expect(memberships.value).toHaveLength(1)
  })

  it('surfaces roster errors and delegates mutations', async () => {
    teamRosterApi.fetchTeamRoster.mockRejectedValueOnce(new Error('Roster offline'))
    teamRosterApi.addTeamRosterPlayer.mockResolvedValueOnce({ team: null, players: [], memberships: [] })
    teamRosterApi.updateRosterMembership.mockResolvedValueOnce({ team: null, players: [], memberships: [] })
    teamRosterApi.removeRosterMembership.mockResolvedValueOnce(true)
    teamRosterApi.fetchPlayerHistory.mockResolvedValueOnce({ player: null, memberships: [] })

    const roster = useTeamRoster()
    await roster.loadRoster('team-1')
    expect(roster.error.value).toBe('Roster offline')

    await expect(roster.addPlayer('team-1', { player_id: 'player-1' })).resolves.toMatchObject({ players: [] })
    await expect(roster.updateMembership('membership-1', { status: 'inactive' })).resolves.toMatchObject({ memberships: [] })
    await expect(roster.removeMembership('membership-2')).resolves.toBe(true)
    await expect(roster.loadHistory('player-1')).resolves.toMatchObject({ player: null, memberships: [] })
  })
})
