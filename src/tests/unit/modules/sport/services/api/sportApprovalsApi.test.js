import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  approvePendingMatch,
  approvePendingPlayer,
  createCoachTeamAssignment,
  deactivateCoachTeamAssignment,
  fetchPendingMatches,
  fetchPendingPlayers,
  listCoachTeamAssignments,
  rejectPendingMatch,
  rejectPendingPlayer,
  saveCoachTeamAssignment,
  updateCoachTeamAssignment,
} from '@/modules/sport/services/api/sportApprovalsApi'

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

describe('sport approvals api', () => {
  it('loads pending players and matches', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({ items: [{ id: 1, name: 'Player One' }], pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 } }),
    )
    await expect(fetchPendingPlayers()).resolves.toMatchObject({ items: [{ id: 1, name: 'Player One' }] })

    http.get.mockResolvedValueOnce(
      stubResponse({ items: [{ id: 2, home_team_id: 1, away_team_id: 2 }], pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 } }),
    )
    await expect(fetchPendingMatches()).resolves.toMatchObject({ items: [{ id: 2 }] })
  })

  it('approves and rejects player and match requests', async () => {
    http.post.mockResolvedValueOnce(stubResponse({ player: { id: 3, approval_status: 'approved' } }))
    await expect(approvePendingPlayer(3)).resolves.toMatchObject({ id: 3, approvalStatus: 'approved' })

    http.post.mockResolvedValueOnce(stubResponse({ player: { id: 4, approval_status: 'rejected' } }))
    await expect(rejectPendingPlayer(4, { rejection_reason: 'Duplicate' })).resolves.toMatchObject({ id: 4, approvalStatus: 'rejected' })

    http.post.mockResolvedValueOnce(stubResponse({ match: { id: 5, approval_status: 'approved' } }))
    await expect(approvePendingMatch(5)).resolves.toMatchObject({ id: 5, approvalStatus: 'approved' })

    http.post.mockResolvedValueOnce(stubResponse({ match: { id: 6, approval_status: 'rejected' } }))
    await expect(rejectPendingMatch(6, { rejection_reason: 'Busy' })).resolves.toMatchObject({ id: 6, approvalStatus: 'rejected' })
  })

  it('saves and deactivates coach assignments', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({ items: [{ id: 7, status: 'active' }], pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 } }),
    )
    await expect(listCoachTeamAssignments()).resolves.toMatchObject({ items: [{ id: 7, status: 'active' }] })

    http.post.mockResolvedValueOnce(stubResponse({ assignment: { id: 8 } }))
    await expect(createCoachTeamAssignment({ coach_user_id: 1, team_id: 2 })).resolves.toMatchObject({ assignment: { id: 8 } })

    http.patch.mockResolvedValueOnce(stubResponse({ assignment: { id: 9 } }))
    await expect(updateCoachTeamAssignment(9, { status: 'inactive' })).resolves.toMatchObject({ assignment: { id: 9 } })
    expect(http.patch).toHaveBeenLastCalledWith(
      '/sport/admin/coach-team-assignments/9',
      expect.any(FormData),
    )

    http.post.mockResolvedValueOnce(stubResponse({ assignment: { id: 11 } }))
    await expect(saveCoachTeamAssignment({ coach_user_id: 1, team_id: 2 })).resolves.toMatchObject({ assignment: { id: 11 } })

    http.patch.mockResolvedValueOnce(stubResponse({ assignment: { id: 12 } }))
    await expect(saveCoachTeamAssignment({ id: 12, status: 'active' })).resolves.toMatchObject({ assignment: { id: 12 } })

    http.delete.mockResolvedValueOnce(stubResponse(null))
    await expect(deactivateCoachTeamAssignment(10)).resolves.toBe(true)
  })
})
