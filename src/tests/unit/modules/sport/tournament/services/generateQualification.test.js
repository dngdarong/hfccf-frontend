import { describe, expect, it } from 'vitest'
import {
  createKnockoutSettingsSnapshot,
  selectTournamentQualifiers,
} from '@/modules/sport/tournament/services/generateQualification'

describe('generateQualification service', () => {
  it('selects top N qualifiers from each group and resolves a valid bracket size', () => {
    const result = selectTournamentQualifiers({
      tournament: {
        standings: [
          {
            groupId: 'group-a',
            groupName: 'Group A',
            qualificationSlots: 2,
            rows: [
              { teamId: 'a1', teamName: 'A1', position: 1, points: 9, goalDifference: 6, goalsFor: 8 },
              { teamId: 'a2', teamName: 'A2', position: 2, points: 6, goalDifference: 2, goalsFor: 5 },
              { teamId: 'a3', teamName: 'A3', position: 3, points: 3, goalDifference: -2, goalsFor: 3 },
            ],
          },
          {
            groupId: 'group-b',
            groupName: 'Group B',
            qualificationSlots: 2,
            rows: [
              { teamId: 'b1', teamName: 'B1', position: 1, points: 8, goalDifference: 5, goalsFor: 7 },
              { teamId: 'b2', teamName: 'B2', position: 2, points: 5, goalDifference: 1, goalsFor: 4 },
              { teamId: 'b3', teamName: 'B3', position: 3, points: 2, goalDifference: -4, goalsFor: 2 },
            ],
          },
          {
            groupId: 'group-c',
            groupName: 'Group C',
            qualificationSlots: 2,
            rows: [
              { teamId: 'c1', teamName: 'C1', position: 1, points: 7, goalDifference: 4, goalsFor: 6 },
              { teamId: 'c2', teamName: 'C2', position: 2, points: 4, goalDifference: 0, goalsFor: 3 },
              { teamId: 'c3', teamName: 'C3', position: 3, points: 1, goalDifference: -3, goalsFor: 1 },
            ],
          },
          {
            groupId: 'group-d',
            groupName: 'Group D',
            qualificationSlots: 2,
            rows: [
              { teamId: 'd1', teamName: 'D1', position: 1, points: 10, goalDifference: 8, goalsFor: 9 },
              { teamId: 'd2', teamName: 'D2', position: 2, points: 4, goalDifference: -1, goalsFor: 3 },
              { teamId: 'd3', teamName: 'D3', position: 3, points: 2, goalDifference: -2, goalsFor: 2 },
            ],
          },
        ],
      },
      settings: {
        qualificationSlots: 2,
      },
    })

    expect(result.qualifiers).toHaveLength(8)
    expect(result.bracketSize).toBe(8)
    expect(result.qualifiers[0]).toMatchObject({
      teamId: 'a1',
      role: 'winner',
      bracketSeed: 1,
    })
    expect(result.ready).toBe(true)
  })

  it('includes best third-place teams when configured', () => {
    const result = selectTournamentQualifiers({
      tournament: {
        standings: [
          {
            groupId: 'group-a',
            groupName: 'Group A',
            qualificationSlots: 1,
            rows: [
              { teamId: 'a1', teamName: 'A1', position: 1, points: 9, goalDifference: 6, goalsFor: 8 },
              { teamId: 'a2', teamName: 'A2', position: 2, points: 4, goalDifference: 1, goalsFor: 4 },
              { teamId: 'a3', teamName: 'A3', position: 3, points: 3, goalDifference: 0, goalsFor: 3 },
            ],
          },
          {
            groupId: 'group-b',
            groupName: 'Group B',
            qualificationSlots: 1,
            rows: [
              { teamId: 'b1', teamName: 'B1', position: 1, points: 8, goalDifference: 5, goalsFor: 7 },
              { teamId: 'b2', teamName: 'B2', position: 2, points: 5, goalDifference: 2, goalsFor: 5 },
              { teamId: 'b3', teamName: 'B3', position: 3, points: 4, goalDifference: 1, goalsFor: 4 },
            ],
          },
          {
            groupId: 'group-c',
            groupName: 'Group C',
            qualificationSlots: 1,
            rows: [
              { teamId: 'c1', teamName: 'C1', position: 1, points: 7, goalDifference: 4, goalsFor: 6 },
              { teamId: 'c2', teamName: 'C2', position: 2, points: 3, goalDifference: -1, goalsFor: 3 },
              { teamId: 'c3', teamName: 'C3', position: 3, points: 5, goalDifference: 2, goalsFor: 5 },
            ],
          },
        ],
      },
      settings: {
        qualificationSlots: 1,
        includeThirdPlaceTeams: true,
        bestThirdPlaceTeams: 1,
      },
    })

    expect(result.bracketSize).toBe(4)
    expect(result.qualifiers).toHaveLength(4)
    expect(result.qualifiers.some((row) => row.role === 'best_third_place')).toBe(true)
    expect(result.qualifiers.find((row) => row.role === 'best_third_place')?.teamId).toBe('c3')
  })

  it('normalizes knockout settings snapshots', () => {
    expect(createKnockoutSettingsSnapshot({
      qualificationSlots: 0,
      includeThirdPlaceTeams: 1,
      bestThirdPlaceTeams: 2,
      thirdPlaceMatchEnabled: 1,
      extraTimeEnabled: 0,
      penaltyEnabled: 1,
      seededMode: 0,
      autoGenerateBracket: 0,
    })).toEqual({
      qualificationSlots: 2,
      includeThirdPlaceTeams: true,
      bestThirdPlaceTeams: 2,
      thirdPlaceMatchEnabled: true,
      extraTimeEnabled: false,
      penaltyEnabled: true,
      seededMode: false,
      autoGenerateBracket: false,
    })
  })
})
