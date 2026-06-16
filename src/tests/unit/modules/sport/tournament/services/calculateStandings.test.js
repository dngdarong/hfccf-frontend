import { describe, expect, it } from 'vitest'
import { buildHeadToHeadTable, compareStandingRows } from '@/modules/sport/tournament/services/resolveTieBreakers'
import { calculateTournamentGroupStandings } from '@/modules/sport/tournament/services/calculateStandings'

describe('calculateStandings service', () => {
  it('calculates wins, draws, losses, goals, and ranking order', () => {
    const standings = calculateTournamentGroupStandings({
      group: {
        id: 'group-01',
        name: 'Group A',
        qualificationSlots: 2,
        teamIds: ['team-a', 'team-b', 'team-c'],
      },
      teams: [
        { id: 'team-a', name: 'Team A' },
        { id: 'team-b', name: 'Team B' },
        { id: 'team-c', name: 'Team C' },
      ],
      rules: {
        pointsWin: 3,
        pointsDraw: 1,
        pointsLoss: 0,
      },
      fixtures: [
        {
          groupId: 'group-01',
          status: 'completed',
          homeTeamId: 'team-a',
          awayTeamId: 'team-b',
          score: { home: 2, away: 0 },
        },
        {
          groupId: 'group-01',
          status: 'completed',
          homeTeamId: 'team-b',
          awayTeamId: 'team-c',
          score: { home: 1, away: 1 },
        },
        {
          groupId: 'group-01',
          status: 'completed',
          homeTeamId: 'team-c',
          awayTeamId: 'team-a',
          score: { home: 1, away: 0 },
        },
      ],
    })

    expect(standings.rows).toHaveLength(3)
    expect(standings.rows[0]).toMatchObject({
      teamId: 'team-c',
      played: 2,
      wins: 1,
      draws: 1,
      losses: 0,
      goalsFor: 2,
      goalsAgainst: 1,
      goalDifference: 1,
      points: 4,
      qualified: true,
    })
    expect(standings.rows[1]).toMatchObject({
      teamId: 'team-a',
      points: 3,
    })
    expect(standings.rows[2]).toMatchObject({
      teamId: 'team-b',
      points: 1,
    })
  })

  it('uses goal difference and goals scored tie-breakers', () => {
    const standings = calculateTournamentGroupStandings({
      group: {
        id: 'group-02',
        name: 'Group B',
        qualificationSlots: 2,
        teamIds: ['team-a', 'team-b', 'team-c'],
      },
      teams: [
        { id: 'team-a', name: 'Team A' },
        { id: 'team-b', name: 'Team B' },
        { id: 'team-c', name: 'Team C' },
      ],
      fixtures: [
        {
          groupId: 'group-02',
          status: 'completed',
          homeTeamId: 'team-a',
          awayTeamId: 'team-b',
          score: { home: 2, away: 0 },
        },
        {
          groupId: 'group-02',
          status: 'completed',
          homeTeamId: 'team-b',
          awayTeamId: 'team-c',
          score: { home: 3, away: 0 },
        },
        {
          groupId: 'group-02',
          status: 'completed',
          homeTeamId: 'team-c',
          awayTeamId: 'team-a',
          score: { home: 1, away: 0 },
        },
      ],
    })

    expect(standings.rows.map((row) => row.teamId)).toEqual(['team-b', 'team-a', 'team-c'])
    expect(standings.rows[1].goalDifference).toBe(1)
    expect(standings.rows[2].goalsFor).toBe(1)
  })

  it('ignores incomplete, cancelled, and postponed matches', () => {
    const standings = calculateTournamentGroupStandings({
      group: {
        id: 'group-03',
        name: 'Group C',
        qualificationSlots: 1,
        teamIds: ['team-a', 'team-b'],
      },
      teams: [
        { id: 'team-a', name: 'Team A' },
        { id: 'team-b', name: 'Team B' },
      ],
      fixtures: [
        {
          groupId: 'group-03',
          status: 'completed',
          homeTeamId: 'team-a',
          awayTeamId: 'team-b',
          score: { home: 1, away: 0 },
        },
        {
          groupId: 'group-03',
          status: 'postponed',
          homeTeamId: 'team-b',
          awayTeamId: 'team-a',
          score: { home: 4, away: 4 },
        },
        {
          groupId: 'group-03',
          status: 'cancelled',
          homeTeamId: 'team-a',
          awayTeamId: 'team-b',
          score: { home: 2, away: 2 },
        },
        {
          groupId: 'group-03',
          status: 'scheduled',
          homeTeamId: 'team-b',
          awayTeamId: 'team-a',
          score: { home: null, away: null },
        },
      ],
    })

    expect(standings.rows[0]).toMatchObject({
      teamId: 'team-a',
      played: 1,
      points: 3,
    })
    expect(standings.rows[1]).toMatchObject({
      teamId: 'team-b',
      played: 1,
      points: 0,
    })
    expect(standings.completedMatches).toBe(1)
    expect(standings.totalMatches).toBe(4)
  })

  it('uses head-to-head when tied on points, goal difference, and goals scored', () => {
    const tiedRows = [
      {
        teamId: 'team-a',
        teamName: 'Team A',
        points: 6,
        goalDifference: 3,
        goalsFor: 5,
      },
      {
        teamId: 'team-b',
        teamName: 'Team B',
        points: 6,
        goalDifference: 3,
        goalsFor: 5,
      },
    ]

    const headToHeadByTeamId = buildHeadToHeadTable({
      rows: tiedRows,
      fixtures: [
        {
          groupId: 'group-01',
          status: 'completed',
          homeTeamId: 'team-a',
          awayTeamId: 'team-b',
          score: { home: 2, away: 1 },
        },
      ],
    })

    expect(compareStandingRows(tiedRows[0], tiedRows[1], { headToHeadByTeamId })).toBeLessThan(0)
  })
})
