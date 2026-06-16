import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  drawTournamentGroups,
  finalizeTournamentGroups,
  getTournamentGroups,
} from '@/modules/sport/tournament/api/groupApi'

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

describe('group api', () => {
  it('loads backend groups and normalizes the draw snapshot', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        tournamentId: 9,
        groups: [
          {
            id: 101,
            tournamentId: 9,
            name: 'Group A',
            code: 'A',
            position: 1,
            qualificationSlots: 2,
            status: 'finalized',
            finalizedAt: '2026-04-12T10:00:00.000Z',
            teams: [
              {
                id: 201,
                teamId: 301,
                seed: 1,
                position: 1,
                status: 'assigned',
                team: {
                  id: 301,
                  teamCode: 'BP',
                  name: 'Blue Phoenix',
                  shortName: 'Blue',
                  logo: '/media/logo.png',
                  status: 'active',
                },
              },
            ],
          },
        ],
        groupStandings: [{ group: { id: 101 }, standings: [] }],
        standings: [{ id: 1 }],
      }),
    )

    const result = await getTournamentGroups(9)

    expect(http.get).toHaveBeenCalledWith('/sport/tournaments/9/groups', { signal: undefined })
    expect(result.tournamentId).toBe('9')
    expect(result.groupDraw.groups[0]).toMatchObject({
      id: '101',
      name: 'Group A',
      code: 'A',
      qualificationSlots: 2,
      locked: true,
      teamIds: ['301'],
    })
    expect(result.groupDraw.settings).toMatchObject({
      groupCount: 1,
      qualificationCount: 2,
    })
  })

  it('sends the expected draw payload and returns a normalized response', async () => {
    http.post.mockResolvedValueOnce(
      stubResponse({
        tournamentId: 9,
        groups: [
          {
            id: 101,
            name: 'Group A',
            code: 'A',
            qualificationSlots: 2,
            status: 'draft',
            teams: [],
          },
        ],
      }),
    )

    const result = await drawTournamentGroups(9, {
      settings: {
        groupCount: 2,
        teamsPerGroup: 4,
        qualificationCount: 2,
      },
      groups: [
        {
          id: 'group-01',
          code: 'A',
          teamIds: ['team-1', 'team-2'],
        },
      ],
    })

    expect(http.post).toHaveBeenCalledWith(
      '/sport/tournaments/9/groups/draw',
      expect.objectContaining({
        group_count: 2,
        qualification_slots: 2,
        reset: true,
        assignments: {
          'team-1': 'A',
          'team-2': 'A',
        },
      }),
      { signal: undefined },
    )
    expect(result.groupDraw.groups[0]).toMatchObject({
      id: '101',
      code: 'A',
    })
  })

  it('finalizes groups with the expected endpoint', async () => {
    http.post.mockResolvedValueOnce(
      stubResponse({
        tournamentId: 9,
        groups: [
          {
            id: 101,
            name: 'Group A',
            code: 'A',
            status: 'finalized',
            teams: [],
          },
        ],
      }),
    )

    const result = await finalizeTournamentGroups(9)

    expect(http.post).toHaveBeenCalledWith('/sport/tournaments/9/groups/finalize', {}, { signal: undefined })
    expect(result.groupDraw.locked).toBe(true)
  })
})

