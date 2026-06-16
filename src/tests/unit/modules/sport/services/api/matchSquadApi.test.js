import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  approveMatchSquad,
  fetchMatchSquads,
  fetchMatchTeamSquad,
  lockMatchSquad,
  saveMatchTeamSquad,
  submitMatchSquad,
  updateMatchSquad,
} from '@/modules/sport/services/api/matchSquadApi'
import { fetchMatchTeamEligibility } from '@/modules/sport/services/api/matchEligibilityApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('match squad api', () => {
  it('loads eligibility and squads from the expected endpoints', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        match: { id: 1, match_code: 'M-1', home_team_id: 11, away_team_id: 12 },
        team: { id: 11, name: 'Assigned FC', team_code: 'TEAM-11' },
        players: [
          {
            player: { id: 21, name: 'Player One', approval_status: 'approved', roster_status: 'active' },
            team: { id: 11, name: 'Assigned FC' },
            eligibility_status: 'eligible',
            is_eligible: true,
            reason: '',
          },
        ],
      }),
    )

    await expect(fetchMatchTeamEligibility(1, 11)).resolves.toMatchObject({
      match: { id: 1, matchCode: 'M-1' },
      team: { id: 11, name: 'Assigned FC' },
      items: [{ isEligible: true, eligibilityStatus: 'eligible' }],
    })
    expect(http.get).toHaveBeenCalledWith('/sport/matches/1/teams/11/eligibility', { signal: undefined })

    http.get.mockResolvedValueOnce(
      stubResponse({
        squads: [{ id: 31, status: 'draft', team: { id: 11, name: 'Assigned FC' }, players: [] }],
      }),
    )

    await expect(fetchMatchSquads(1)).resolves.toMatchObject({
      items: [{ id: 31, status: 'draft' }],
    })
    expect(http.get).toHaveBeenCalledWith('/sport/matches/1/squads', { signal: undefined })
  })

  it('loads, saves, updates, submits, approves and locks squads with JSON payloads', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        squad: {
          id: 41,
          match_id: 1,
          team_id: 11,
          status: 'draft',
          players: [
            {
              id: 51,
              player_id: 21,
              role: 'starter',
              eligibility_status: 'eligible',
              is_eligible: true,
              player: { id: 21, name: 'Player One', approval_status: 'approved', roster_status: 'active' },
            },
          ],
        },
        players: [
          {
            player: { id: 21, name: 'Player One', approval_status: 'approved', roster_status: 'active' },
            team: { id: 11, name: 'Assigned FC' },
            eligibility_status: 'eligible',
            is_eligible: true,
            reason: '',
          },
        ],
      }),
    )

    await expect(fetchMatchTeamSquad(1, 11)).resolves.toMatchObject({
      squad: { id: 41, status: 'draft' },
      players: [{ isEligible: true, eligibilityStatus: 'eligible' }],
    })
    expect(http.get).toHaveBeenCalledWith('/sport/matches/1/teams/11/squad', { signal: undefined })

    http.post.mockResolvedValueOnce(
      stubResponse({
        squad: { id: 41, status: 'draft', team: { id: 11, name: 'Assigned FC' }, players: [] },
      }),
    )
    await expect(saveMatchTeamSquad(1, 11, { notes: 'Draft', players: [{ player_id: 21, role: 'starter' }] })).resolves.toMatchObject({
      squad: { id: 41, status: 'draft' },
    })
    expect(http.post).toHaveBeenCalledWith(
      '/sport/matches/1/teams/11/squad',
      { notes: 'Draft', players: [{ player_id: 21, role: 'starter' }] },
    )

    http.patch.mockResolvedValueOnce(
      stubResponse({
        squad: { id: 41, status: 'submitted', team: { id: 11, name: 'Assigned FC' }, players: [] },
      }),
    )
    await expect(updateMatchSquad(41, { notes: 'Updated', players: [] })).resolves.toMatchObject({
      squad: { id: 41, status: 'submitted' },
    })
    expect(http.patch).toHaveBeenCalledWith(
      '/sport/match-squads/41',
      { notes: 'Updated', players: [] },
    )

    http.post.mockResolvedValueOnce(stubResponse({ squad: { id: 41, status: 'submitted' } }))
    await expect(submitMatchSquad(41)).resolves.toMatchObject({ squad: { id: 41, status: 'submitted' } })
    expect(http.post).toHaveBeenCalledWith('/sport/match-squads/41/submit')

    http.post.mockResolvedValueOnce(stubResponse({ squad: { id: 41, status: 'approved' } }))
    await expect(approveMatchSquad(41)).resolves.toMatchObject({ squad: { id: 41, status: 'approved' } })
    expect(http.post).toHaveBeenCalledWith('/sport/match-squads/41/approve')

    http.post.mockResolvedValueOnce(stubResponse({ squad: { id: 41, status: 'locked' } }))
    await expect(lockMatchSquad(41)).resolves.toMatchObject({ squad: { id: 41, status: 'locked' } })
    expect(http.post).toHaveBeenCalledWith('/sport/match-squads/41/lock')
  })
})
