import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  createCoachMatchRequest,
  createCoachPlayerRequest,
  fetchCoachTeam,
  fetchCoachTeams,
} from '@/modules/sport/services/api/sportCoachTeamsApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('sport coach teams api', () => {
  it('loads assigned teams with the expected route', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        items: [{ id: 11, name: 'Assigned FC', team_code: 'TEAM-11' }],
        pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
      }),
    )

    const result = await fetchCoachTeams({ search: '  Assigned  ' })

    expect(http.get).toHaveBeenCalledWith('/sport/coach/teams', expect.objectContaining({
      params: expect.objectContaining({ search: 'Assigned' }),
    }))
    expect(result.items[0]).toMatchObject({ id: 11, name: 'Assigned FC', teamCode: 'TEAM-11' })
  })

  it('loads a single coach team and creates coach requests', async () => {
    http.get.mockResolvedValueOnce(stubResponse({ team: { id: 22, name: 'Team Two' }, players: [] }))
    await expect(fetchCoachTeam(22)).resolves.toMatchObject({ team: { id: 22, name: 'Team Two' } })
    expect(http.get).toHaveBeenCalledWith('/sport/coach/teams/22', { signal: undefined })

    http.post.mockResolvedValueOnce(stubResponse({ player: { id: 33, name: 'New Player' } }))
    await expect(
      createCoachPlayerRequest(22, { name: 'New Player' }),
    ).resolves.toMatchObject({ id: 33, name: 'New Player' })
    expect(http.post).toHaveBeenCalledWith(
      '/sport/coach/teams/22/players',
      expect.any(FormData),
    )

    http.post.mockResolvedValueOnce(stubResponse({ match: { id: 44, home_team_id: 22, away_team_id: 23 } }))
    await expect(
      createCoachMatchRequest({ team_id: 22, opponent_team_id: 23, match_type: 'training' }),
    ).resolves.toMatchObject({ id: 44 })
    expect(http.post).toHaveBeenCalledWith('/sport/coach/matches', expect.any(FormData))
  })
})
