import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useCoachRequests } from '@/modules/sport/coach/composables/useCoachRequests'
import * as coachTeamsApi from '@/modules/sport/services/api/sportCoachTeamsApi'

vi.mock('@/modules/sport/services/api/sportCoachTeamsApi', () => ({
  fetchCoachRequests: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useCoachRequests', () => {
  it('loads coach-owned request history', async () => {
    coachTeamsApi.fetchCoachRequests.mockResolvedValueOnce({
      playerRequests: [{ id: 'player-request-1', name: 'Request Player', approvalStatus: 'pending' }],
      matchRequests: [{ id: 'match-request-1', homeTeam: 'A', awayTeam: 'B', approvalStatus: 'pending' }],
      summary: { playerRequests: 1, matchRequests: 1, total: 2 },
    })

    const { loadRequests, playerRequests, matchRequests, summary, loading } = useCoachRequests()
    const pending = loadRequests()

    expect(loading.value).toBe(true)
    await pending
    await nextTick()

    expect(playerRequests.value).toHaveLength(1)
    expect(matchRequests.value).toHaveLength(1)
    expect(summary.value.total).toBe(2)
  })

  it('surfaces lookup errors', async () => {
    coachTeamsApi.fetchCoachRequests.mockRejectedValueOnce(new Error('Requests unavailable'))

    const { error, loadRequests, playerRequests, matchRequests } = useCoachRequests()
    await loadRequests()

    expect(error.value).toBe('Requests unavailable')
    expect(playerRequests.value).toEqual([])
    expect(matchRequests.value).toEqual([])
  })
})
