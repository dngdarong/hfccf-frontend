import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  assignTournamentTeamToGroup,
  generateTournamentGroupPreview,
  removeTournamentTeamFromGroups,
  resolveTournamentGroupCards,
} from '@/modules/sport/tournament/composables/useTournamentGroupGeneration'

describe('useTournamentGroupGeneration', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('generates a balanced automatic preview with seeded teams', () => {
    const teams = [
      { id: 'team-1', name: 'Team 1', seeded: true, seedRank: 1 },
      { id: 'team-2', name: 'Team 2', seeded: true, seedRank: 2 },
      { id: 'team-3', name: 'Team 3' },
      { id: 'team-4', name: 'Team 4' },
      { id: 'team-5', name: 'Team 5' },
      { id: 'team-6', name: 'Team 6' },
    ]

    const preview = generateTournamentGroupPreview({
      teams,
      groupCount: 2,
      teamsPerGroup: 3,
      qualificationCount: 1,
      seededMode: true,
    })

    expect(preview.groups).toHaveLength(2)
    expect(preview.summary.capacity).toBe(6)
    expect(preview.summary.assignedCount).toBe(6)
    expect(preview.summary.unassignedCount).toBe(0)
    expect(new Set(preview.groups.flatMap((group) => group.teamIds)).size).toBe(6)
    expect(preview.groups[0].teamIds).toContain('team-1')
    expect(preview.groups[1].teamIds).toContain('team-2')
  })

  it('assigns and removes teams without duplication', () => {
    const groups = [
      { id: 'group-01', name: 'Group A', teamIds: ['team-1'], qualificationSlots: 1 },
      { id: 'group-02', name: 'Group B', teamIds: [], qualificationSlots: 1 },
    ]

    const assigned = assignTournamentTeamToGroup(groups, 'team-1', 'group-02', 3)
    expect(assigned[0].teamIds).not.toContain('team-1')
    expect(assigned[1].teamIds).toContain('team-1')

    const removed = removeTournamentTeamFromGroups(assigned, 'team-1')
    expect(removed[0].teamIds).not.toContain('team-1')
    expect(removed[1].teamIds).not.toContain('team-1')
  })

  it('resolves group cards with team data and capacities', () => {
    const cards = resolveTournamentGroupCards(
      [
        { id: 'group-01', name: 'Group A', teamIds: ['team-1', 'team-2'], qualificationSlots: 2 },
      ],
      [
        { id: 'team-1', name: 'Team 1' },
        { id: 'team-2', name: 'Team 2' },
      ],
      4,
    )

    expect(cards[0].assignedCount).toBe(2)
    expect(cards[0].capacity).toBe(4)
    expect(cards[0].remainingSlots).toBe(2)
    expect(cards[0].teams).toHaveLength(2)
  })
})
