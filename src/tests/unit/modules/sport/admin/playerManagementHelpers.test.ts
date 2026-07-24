import { describe, expect, it } from 'vitest'
import {
  filterPlayers,
  getPaginatedPlayers,
  calculatePlayerMetrics,
} from '@/modules/sport/admin/pages/list/ManagesPlayerInfor/utils/playerManagementHelpers'

describe('playerManagementHelpers', () => {
  it('searches across player code, team, division, and name fields', () => {
    const players = [
      {
        id: 'p1',
        name: 'Sok Dara',
        playerCode: 'PLY-001',
        team: 'Lions FC',
        division: 'Senior',
        status: 'active',
      },
      {
        id: 'p2',
        name: 'Lina Chan',
        playerCode: 'PLY-002',
        team: 'Phoenix FC',
        division: 'Junior',
        status: 'pending',
      },
    ]

    expect(filterPlayers(players, 'ply-002', '', '', '')).toHaveLength(1)
    expect(filterPlayers(players, 'phoenix', '', '', '')).toHaveLength(1)
    expect(filterPlayers(players, 'junior', '', '', '')).toHaveLength(1)
    expect(filterPlayers(players, 'sok', '', '', '')).toHaveLength(1)
  })

  it('paginates and calculates summary metrics from the loaded records', () => {
    const players = [
      { id: 'p1', name: 'A', status: 'active', primaryPosition: 'Forward' },
      { id: 'p2', name: 'B', status: 'pending', primaryPosition: 'Defender' },
      { id: 'p3', name: 'C', status: 'suspended', primaryPosition: 'Midfielder' },
    ]

    expect(getPaginatedPlayers(players, 1, 2)).toEqual([
      { id: 'p1', name: 'A', status: 'active', primaryPosition: 'Forward', position: 'Forward', rowNumber: 1 },
      { id: 'p2', name: 'B', status: 'pending', primaryPosition: 'Defender', position: 'Defender', rowNumber: 2 },
    ])

    expect(calculatePlayerMetrics(players)).toMatchObject({
      totalPlayers: 3,
      activePlayers: 1,
      pendingPlayers: 1,
      attentionPlayers: 1,
      activeRate: '33%',
    })
  })
})
