import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { usePlayerLifecycle } from '@/modules/sport/admin/composables/usePlayerLifecycle'
import * as playerLifecycleApi from '@/modules/sport/services/api/playerLifecycleApi'
import * as sportPlayersApi from '@/modules/sport/services/api/sportPlayersApi'

vi.mock('@/modules/sport/services/api/playerLifecycleApi', () => ({
  updatePlayerLifecycleStatus: vi.fn(),
  updatePlayerInjury: vi.fn(),
  updatePlayerSuspension: vi.fn(),
  releasePlayer: vi.fn(),
  archivePlayer: vi.fn(),
  fetchPlayerHistory: vi.fn(),
}))

vi.mock('@/modules/sport/services/api/sportPlayersApi', () => ({
  fetchSportPlayers: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('usePlayerLifecycle', () => {
  it('loads player list and history', async () => {
    sportPlayersApi.fetchSportPlayers.mockResolvedValueOnce({
      items: [{ id: 'player-1', name: 'Player One', rosterStatus: 'active' }],
      pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
    })
    playerLifecycleApi.fetchPlayerHistory.mockResolvedValueOnce({
      player: { id: 'player-1', name: 'Player One' },
      memberships: [{ id: 'membership-1', status: 'active' }],
    })

    const lifecycle = usePlayerLifecycle()
    await lifecycle.loadPlayers()
    await nextTick()
    expect(lifecycle.items.value).toHaveLength(1)

    await expect(lifecycle.loadHistory('player-1')).resolves.toMatchObject({
      player: { id: 'player-1', name: 'Player One' },
      memberships: [{ id: 'membership-1', status: 'active' }],
    })
  })

  it('delegates lifecycle mutation helpers', async () => {
    const lifecycle = usePlayerLifecycle()

    playerLifecycleApi.updatePlayerLifecycleStatus.mockResolvedValueOnce({})
    playerLifecycleApi.updatePlayerInjury.mockResolvedValueOnce({})
    playerLifecycleApi.updatePlayerSuspension.mockResolvedValueOnce({})
    playerLifecycleApi.releasePlayer.mockResolvedValueOnce({})
    playerLifecycleApi.archivePlayer.mockResolvedValueOnce({})

    await lifecycle.updateStatus('player-1', { roster_status: 'active' })
    await lifecycle.markInjury('player-1', { notes: 'Knock' })
    await lifecycle.markSuspension('player-1', { notes: 'Card' })
    await lifecycle.release('player-1', { notes: 'Released' })
    await lifecycle.archive('player-1', { notes: 'Archived' })

    expect(playerLifecycleApi.updatePlayerLifecycleStatus).toHaveBeenCalledWith('player-1', { roster_status: 'active' }, {})
    expect(playerLifecycleApi.updatePlayerInjury).toHaveBeenCalledWith('player-1', { notes: 'Knock' }, {})
    expect(playerLifecycleApi.updatePlayerSuspension).toHaveBeenCalledWith('player-1', { notes: 'Card' }, {})
    expect(playerLifecycleApi.releasePlayer).toHaveBeenCalledWith('player-1', { notes: 'Released' }, {})
    expect(playerLifecycleApi.archivePlayer).toHaveBeenCalledWith('player-1', { notes: 'Archived' }, {})
  })
})
