import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useMatchEligibility } from '@/modules/sport/match-squads/composables/useMatchEligibility'
import * as api from '@/modules/sport/services/api/matchEligibilityApi'

vi.mock('@/modules/sport/services/api/matchEligibilityApi', () => ({
  fetchMatchTeamEligibility: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useMatchEligibility', () => {
  it('loads match eligibility and splits eligible and blocked players', async () => {
    api.fetchMatchTeamEligibility.mockResolvedValueOnce({
      match: { id: 1, matchCode: 'M-1' },
      team: { id: 11, name: 'Assigned FC' },
      items: [
        { player: { id: 21, name: 'Player One' }, team: { id: 11, name: 'Assigned FC' }, eligibilityStatus: 'eligible', isEligible: true },
        { player: { id: 22, name: 'Player Two' }, team: { id: 11, name: 'Assigned FC' }, eligibilityStatus: 'injured', isEligible: false },
      ],
    })

    const { loadEligibility, loading, players, eligiblePlayers, unavailablePlayers } = useMatchEligibility()
    const pending = loadEligibility(1, 11)

    expect(loading.value).toBe(true)
    await pending
    await nextTick()

    expect(loading.value).toBe(false)
    expect(players.value).toHaveLength(2)
    expect(eligiblePlayers.value).toHaveLength(1)
    expect(unavailablePlayers.value).toHaveLength(1)
  })

  it('surfaces api errors', async () => {
    api.fetchMatchTeamEligibility.mockRejectedValueOnce(new Error('Offline'))

    const roster = useMatchEligibility()
    await roster.loadEligibility(1, 11)

    expect(roster.error.value).toBe('Offline')
    expect(roster.players.value).toHaveLength(0)
  })
})
