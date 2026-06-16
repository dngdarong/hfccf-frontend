import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSportApprovals } from '@/modules/sport/admin/composables/useSportApprovals'
import * as approvalsApi from '@/modules/sport/services/api/sportApprovalsApi'

vi.mock('@/modules/sport/services/api/sportApprovalsApi', () => ({
  fetchPendingPlayers: vi.fn(),
  fetchPendingMatches: vi.fn(),
  approvePendingPlayer: vi.fn(),
  rejectPendingPlayer: vi.fn(),
  approvePendingMatch: vi.fn(),
  rejectPendingMatch: vi.fn(),
  listCoachTeamAssignments: vi.fn(),
  saveCoachTeamAssignment: vi.fn(),
  deactivateCoachTeamAssignment: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useSportApprovals', () => {
  it('loads pending players and matches', async () => {
    approvalsApi.fetchPendingPlayers.mockResolvedValueOnce({ items: [{ id: '1' }] })
    approvalsApi.fetchPendingMatches.mockResolvedValueOnce({ items: [{ id: '2' }] })

    const approvals = useSportApprovals()
    await expect(approvals.loadPendingPlayers()).resolves.toMatchObject({ items: [{ id: '1' }] })
    await expect(approvals.loadPendingMatches()).resolves.toMatchObject({ items: [{ id: '2' }] })
  })

  it('re-exports approval helpers', () => {
    const approvals = useSportApprovals()
    expect(approvals.approvePendingPlayer).toBe(approvalsApi.approvePendingPlayer)
    expect(approvals.rejectPendingMatch).toBe(approvalsApi.rejectPendingMatch)
  })
})
