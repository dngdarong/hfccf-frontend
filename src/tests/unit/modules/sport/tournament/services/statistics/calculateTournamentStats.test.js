import { describe, expect, it } from 'vitest'
import { calculateTournamentStats } from '@/modules/sport/tournament/services/statistics/calculateTournamentStats'

describe('calculateTournamentStats', () => {
  it('summarizes tournament totals and ranking tie-breaks', () => {
    const stats = calculateTournamentStats({
      tournament: {
        teams: [
          { id: 'team-a', name: 'Team A' },
          { id: 'team-b', name: 'Team B' },
          { id: 'team-c', name: 'Team C' },
          { id: 'team-d', name: 'Team D' },
        ],
        fixtures: [
          {
            id: 'match-1',
            homeTeamId: 'team-a',
            homeTeamName: 'Team A',
            awayTeamId: 'team-b',
            awayTeamName: 'Team B',
            status: 'completed',
            score: { home: 3, away: 1 },
            events: [
              { id: 'event-1', minute: 11, type: 'goal', teamId: 'team-a', playerId: 'player-1', playerName: 'Scorer A' },
              { id: 'event-2', minute: 12, type: 'goal', teamId: 'team-a', playerId: 'player-1', playerName: 'Scorer A' },
              { id: 'event-3', minute: 21, type: 'goal', teamId: 'team-a', playerId: 'player-6', playerName: 'Scorer D', assistPlayerId: 'player-2', assistPlayerName: 'Assist A' },
              { id: 'event-4', minute: 35, type: 'goal', teamId: 'team-b', playerId: 'player-3', playerName: 'Scorer B' },
              { id: 'event-5', minute: 77, type: 'yellow_card', teamId: 'team-b', playerId: 'player-4', playerName: 'Booked B' },
            ],
          },
          {
            id: 'match-2',
            homeTeamId: 'team-c',
            homeTeamName: 'Team C',
            awayTeamId: 'team-d',
            awayTeamName: 'Team D',
            status: 'completed',
            score: { home: 2, away: 0 },
            events: [
              { id: 'event-5', minute: 10, type: 'goal', teamId: 'team-c', playerId: 'player-5', playerName: 'Scorer C' },
              { id: 'event-6', minute: 60, type: 'goal', teamId: 'team-c', playerId: 'player-5', playerName: 'Scorer C' },
              { id: 'event-7', minute: 61, type: 'yellow_card', teamId: 'team-c', playerId: 'player-8', playerName: 'Booked C' },
            ],
          },
          {
            id: 'match-3',
            homeTeamId: 'team-a',
            homeTeamName: 'Team A',
            awayTeamId: 'team-c',
            awayTeamName: 'Team C',
            status: 'scheduled',
            score: { home: null, away: null },
            events: [],
          },
        ],
      },
    })

    expect(stats.summary.totalMatches).toBe(3)
    expect(stats.summary.completedMatches).toBe(2)
    expect(stats.summary.scheduledMatches).toBe(1)
    expect(stats.summary.totalGoals).toBe(6)
    expect(stats.summary.goalsPerMatch).toBe(3)
    expect(stats.summary.totalYellowCards).toBe(2)
    expect(stats.summary.totalRedCards).toBe(0)
    expect(stats.summary.topScorer.playerName).toBe('Scorer A')
    expect(stats.summary.topScorer.goals).toBe(2)
    expect(stats.summary.topScorer.assists).toBe(0)
    expect(stats.summary.topAssistProvider.playerName).toBe('Assist A')
    expect(stats.summary.topAssistProvider.assists).toBe(1)
    expect(stats.summary.bestAttack.teamName).toBe('Team A')
    expect(stats.summary.bestDefense.teamName).toBe('Team C')
    expect(stats.summary.fairPlayLeader.teamName).toBe('Team A')
  })

  it('recalculates statistics after an event update', () => {
    const baseTournament = {
      teams: [
        { id: 'team-a', name: 'Team A' },
        { id: 'team-b', name: 'Team B' },
      ],
      fixtures: [
        {
          id: 'match-1',
          homeTeamId: 'team-a',
          homeTeamName: 'Team A',
          awayTeamId: 'team-b',
          awayTeamName: 'Team B',
          status: 'completed',
          score: { home: 0, away: 0 },
          events: [],
        },
      ],
    }

    const initial = calculateTournamentStats({ tournament: baseTournament })
    const updated = calculateTournamentStats({
      tournament: {
        ...baseTournament,
        fixtures: [
          {
            ...baseTournament.fixtures[0],
            events: [
              { id: 'event-1', minute: 45, type: 'goal', teamId: 'team-a', playerId: 'player-1', playerName: 'Scorer A' },
            ],
          },
        ],
      },
    })

    expect(initial.summary.totalGoals).toBe(0)
    expect(updated.summary.totalGoals).toBe(1)
    expect(updated.summary.topScorer.playerName).toBe('Scorer A')
  })
})
