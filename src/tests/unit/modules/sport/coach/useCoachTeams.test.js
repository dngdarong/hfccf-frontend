import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useCoachTeams } from '@/modules/sport/coach/composables/useCoachTeams'
import * as coachTeamsApi from '@/modules/sport/services/api/sportCoachTeamsApi'

vi.mock('@/modules/sport/services/api/sportCoachTeamsApi', () => ({
  fetchCoachTeams: vi.fn(),
  fetchCoachTeam: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useCoachTeams', () => {
  it('loads coach teams and selects the first team', async () => {
    coachTeamsApi.fetchCoachTeams.mockResolvedValueOnce({
      items: [{ id: 'team-1', name: 'Team One' }],
      pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
    })

    const { items, selectedTeam, loadTeams, hasTeams } = useCoachTeams()
    await loadTeams()
    await nextTick()

    expect(items.value).toHaveLength(1)
    expect(selectedTeam.value).toMatchObject({ id: 'team-1' })
    expect(hasTeams.value).toBe(true)
  })

  it('captures load errors safely', async () => {
    coachTeamsApi.fetchCoachTeams.mockRejectedValueOnce(new Error('Network down'))

    const { error, loadTeams, items } = useCoachTeams()
    await loadTeams()

    expect(error.value).toBe('Network down')
    expect(items.value).toEqual([])
  })
})
