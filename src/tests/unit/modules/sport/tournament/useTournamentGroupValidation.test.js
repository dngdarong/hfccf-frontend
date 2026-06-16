import { describe, expect, it } from 'vitest'
import {
  canFinalizeTournamentGroupDraw,
  calculateGroupQualificationSlots,
  isTournamentGroupDrawEditable,
  normalizeTournamentGroupSettings,
  validateTournamentGroupDrawDraft,
} from '@/modules/sport/tournament/composables/useTournamentGroupValidation'

describe('useTournamentGroupValidation', () => {
  it('validates duplicate and capacity issues', () => {
    const issues = validateTournamentGroupDrawDraft({
      settings: { groupCount: 2, teamsPerGroup: 2, qualificationCount: 1 },
      teams: [
        { id: 'team-1' },
        { id: 'team-2' },
        { id: 'team-3' },
      ],
      groups: [
        { id: 'group-01', teamIds: ['team-1', 'team-2', 'team-3'] },
        { id: 'group-02', teamIds: ['team-1'] },
      ],
    })

    expect(issues.some((issue) => issue.type === 'duplicateTeams')).toBe(true)
    expect(issues.some((issue) => issue.type === 'groupOverflow')).toBe(true)
    expect(canFinalizeTournamentGroupDraw({
      state: 'registration_closed',
      settings: { groupCount: 2, teamsPerGroup: 2, qualificationCount: 1 },
      teams: [{ id: 'team-1' }, { id: 'team-2' }, { id: 'team-3' }],
      groups: [
        { id: 'group-01', teamIds: ['team-1', 'team-2', 'team-3'] },
        { id: 'group-02', teamIds: ['team-1'] },
      ],
    })).toBe(false)
  })

  it('normalizes settings and qualification slots', () => {
    expect(normalizeTournamentGroupSettings({ groupCount: 0, teamsPerGroup: 0, qualificationCount: 9 })).toEqual({
      groupCount: 1,
      teamsPerGroup: 1,
      qualificationCount: 1,
      seededMode: true,
      autoFixtureGeneration: true,
    })

    expect(calculateGroupQualificationSlots(
      { teamIds: ['team-1', 'team-2'] },
      { qualificationCount: 3 },
    )).toBe(2)
  })

  it('blocks editing outside the registration closed state', () => {
    expect(isTournamentGroupDrawEditable('active')).toBe(false)
    expect(isTournamentGroupDrawEditable('registration_closed')).toBe(true)
  })
})
