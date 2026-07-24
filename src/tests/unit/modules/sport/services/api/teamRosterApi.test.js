import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  addTeamRosterPlayer,
  fetchAdminRosterCandidates,
  fetchPlayerHistory,
  fetchRosterCandidates,
  fetchTeamRoster,
  removeRosterMembership,
  updateRosterMembership,
} from '@/modules/sport/services/api/teamRosterApi'
import { fetchTeamRoster as barrelFetchTeamRoster } from '@/modules/sport/services/sportApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('team roster api', () => {
  it('loads roster data and keeps the sport api barrel wired', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        team: { id: 1, name: 'Assigned FC', team_code: 'TEAM-1' },
        players: [{ id: 2, name: 'Player One', roster_status: 'active' }],
        memberships: [{ id: 3, status: 'active', team_id: 1, player_id: 2 }],
      }),
    )

    const result = await fetchTeamRoster(1)

    expect(barrelFetchTeamRoster).toBe(fetchTeamRoster)
    expect(http.get).toHaveBeenCalledWith('/sport/teams/1/roster', { signal: undefined })
    expect(result.team).toMatchObject({ id: 1, name: 'Assigned FC', teamCode: 'TEAM-1' })
    expect(result.players[0]).toMatchObject({ id: 2, name: 'Player One', rosterStatus: 'active' })
    expect(result.memberships[0]).toMatchObject({ id: 3, status: 'active' })
  })

  it('submits roster membership changes and history requests', async () => {
    http.post.mockResolvedValueOnce(
      stubResponse({
        team: { id: 1, name: 'Assigned FC' },
        players: [],
        memberships: [],
      }),
    )

    await expect(addTeamRosterPlayer(1, { player_id: 2 })).resolves.toMatchObject({ team: { id: 1 } })
    expect(http.post).toHaveBeenCalledWith('/sport/teams/1/roster', expect.any(FormData))

    http.patch.mockResolvedValueOnce(
      stubResponse({
        team: { id: 1, name: 'Assigned FC' },
        players: [],
        memberships: [],
      }),
    )

    await expect(updateRosterMembership(3, { status: 'inactive' })).resolves.toMatchObject({ memberships: [] })
    expect(http.patch).toHaveBeenCalledWith('/sport/roster/3', expect.any(FormData))

    http.delete.mockResolvedValueOnce(stubResponse(null))
    await expect(removeRosterMembership(4)).resolves.toBe(true)
    expect(http.delete).toHaveBeenCalledWith('/sport/roster/4')

    http.get.mockResolvedValueOnce(
      stubResponse({
        player: { id: 5, name: 'Player Two', roster_status: 'inactive' },
        memberships: [{ id: 6, status: 'inactive', team_id: 1, player_id: 5 }],
      }),
    )

    await expect(fetchPlayerHistory(5)).resolves.toMatchObject({
      player: { id: 5, name: 'Player Two', rosterStatus: 'inactive' },
      memberships: [{ id: 6, status: 'inactive' }],
    })
    expect(http.get).toHaveBeenCalledWith('/sport/players/5/history', { signal: undefined })
  })

  it('loads coach roster candidates from the coach-safe lookup', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        team: { id: 1, name: 'Assigned FC' },
        items: [{ id: 8, name: 'Player Eight', approval_status: 'approved' }],
        pagination: { page: 1, per_page: 10, total: 1, total_pages: 1 },
      }),
    )

    const result = await fetchRosterCandidates(1)

    expect(http.get).toHaveBeenCalledWith('/sport/coach/teams/1/roster-candidates', expect.objectContaining({
      params: {},
    }))
    expect(result.items[0]).toMatchObject({ id: 8, name: 'Player Eight', approvalStatus: 'approved' })
  })

  it('loads admin roster candidates from the admin-safe lookup', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        team: null,
        items: [{ id: 9, name: 'Player Nine', approval_status: 'approved' }],
        pagination: { page: 1, per_page: 10, total: 1, total_pages: 1 },
      }),
    )

    const result = await fetchAdminRosterCandidates()

    expect(http.get).toHaveBeenCalledWith('/sport/admin/teams/roster-candidates', expect.objectContaining({
      params: {},
    }))
    expect(result.items[0]).toMatchObject({ id: 9, name: 'Player Nine', approvalStatus: 'approved' })
  })
})
