import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  archivePlayer,
  fetchPlayerHistory,
  releasePlayer,
  updatePlayerInjury,
  updatePlayerLifecycleStatus,
  updatePlayerSuspension,
} from '@/modules/sport/services/api/playerLifecycleApi'
import { updatePlayerLifecycleStatus as barrelUpdatePlayerLifecycleStatus } from '@/modules/sport/services/sportApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('player lifecycle api', () => {
  it('updates player lifecycle through the sport api barrel', async () => {
    http.patch.mockResolvedValueOnce(
      stubResponse({
        player: { id: 10, name: 'Player Ten', roster_status: 'injured' },
        memberships: [],
      }),
    )

    const result = await updatePlayerLifecycleStatus(10, { roster_status: 'injured' })

    expect(barrelUpdatePlayerLifecycleStatus).toBe(updatePlayerLifecycleStatus)
    expect(http.patch).toHaveBeenCalledWith('/sport/players/10/status', expect.any(FormData))
    expect(result.player).toMatchObject({ id: 10, rosterStatus: 'injured' })
  })

  it('handles injury, suspension, release, archive, and history requests', async () => {
    http.patch.mockResolvedValueOnce(stubResponse({ player: { id: 11, roster_status: 'injured' }, memberships: [] }))
    await expect(updatePlayerInjury(11, { notes: 'Knock' })).resolves.toMatchObject({ player: { id: 11 } })

    http.patch.mockResolvedValueOnce(stubResponse({ player: { id: 12, roster_status: 'suspended' }, memberships: [] }))
    await expect(updatePlayerSuspension(12, { notes: 'Card' })).resolves.toMatchObject({ player: { id: 12 } })

    http.patch.mockResolvedValueOnce(stubResponse({ player: { id: 13, roster_status: 'released' }, memberships: [] }))
    await expect(releasePlayer(13, { notes: 'Released' })).resolves.toMatchObject({ player: { id: 13 } })

    http.patch.mockResolvedValueOnce(stubResponse({ player: { id: 14, roster_status: 'archived' }, memberships: [] }))
    await expect(archivePlayer(14, { notes: 'Archived' })).resolves.toMatchObject({ player: { id: 14 } })

    http.get.mockResolvedValueOnce(
      stubResponse({
        player: { id: 15, name: 'Player Fifteen', roster_status: 'active' },
        memberships: [{ id: 16, status: 'active', team_id: 1, player_id: 15 }],
      }),
    )

    await expect(fetchPlayerHistory(15)).resolves.toMatchObject({
      player: { id: 15, rosterStatus: 'active' },
      memberships: [{ id: 16, status: 'active' }],
    })
  })
})
