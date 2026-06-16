import { describe, expect, it } from 'vitest'
import { calculatePlayerStats } from '@/modules/sport/tournament/services/statistics/calculatePlayerStats'

describe('calculatePlayerStats', () => {
  it('calculates goals, assists, penalties, cards, own goals, and appearances from match events', () => {
    const stats = calculatePlayerStats({
      fixtures: [
        {
          id: 'match-1',
          homeTeamId: 'team-a',
          homeTeamName: 'Team A',
          awayTeamId: 'team-b',
          awayTeamName: 'Team B',
          events: [
            {
              id: 'event-1',
              matchId: 'match-1',
              minute: 12,
              type: 'goal',
              teamId: 'team-a',
              playerId: 'player-1',
              playerName: 'Forward A',
              assistPlayerId: 'player-2',
              assistPlayerName: 'Playmaker A',
            },
            {
              id: 'event-2',
              matchId: 'match-1',
              minute: 21,
              type: 'penalty_goal',
              teamId: 'team-a',
              playerId: 'player-1',
              playerName: 'Forward A',
            },
            {
              id: 'event-3',
              matchId: 'match-1',
              minute: 33,
              type: 'own_goal',
              teamId: 'team-b',
              playerId: 'player-3',
              playerName: 'Defender B',
            },
            {
              id: 'event-4',
              matchId: 'match-1',
              minute: 48,
              type: 'yellow_card',
              teamId: 'team-b',
              playerId: 'player-4',
              playerName: 'Midfielder B',
            },
            {
              id: 'event-5',
              matchId: 'match-1',
              minute: 54,
              type: 'red_card',
              teamId: 'team-b',
              playerId: 'player-4',
              playerName: 'Midfielder B',
            },
            {
              id: 'event-6',
              matchId: 'match-1',
              minute: 60,
              type: 'penalty_miss',
              teamId: 'team-b',
              playerId: 'player-4',
              playerName: 'Midfielder B',
            },
            {
              id: 'event-7',
              matchId: 'match-1',
              minute: 74,
              type: 'substitution',
              teamId: 'team-a',
              playerOutId: 'player-5',
              playerOutName: 'Winger A',
              playerInId: 'player-6',
              playerInName: 'Winger B',
            },
          ],
        },
      ],
    })

    const scorer = stats.find((row) => row.playerId === 'player-1')
    const assister = stats.find((row) => row.playerId === 'player-2')
    const defender = stats.find((row) => row.playerId === 'player-3')
    const bookedPlayer = stats.find((row) => row.playerId === 'player-4')
    const subbedOut = stats.find((row) => row.playerId === 'player-5')
    const subbedIn = stats.find((row) => row.playerId === 'player-6')

    expect(scorer.goals).toBe(2)
    expect(scorer.penaltyGoals).toBe(1)
    expect(scorer.appearances).toBe(1)
    expect(assister.assists).toBe(1)
    expect(assister.appearances).toBe(1)
    expect(defender.ownGoals).toBe(1)
    expect(bookedPlayer.yellowCards).toBe(1)
    expect(bookedPlayer.redCards).toBe(1)
    expect(bookedPlayer.penaltyMisses).toBe(1)
    expect(bookedPlayer.disciplinePoints).toBe(4)
    expect(subbedOut.appearances).toBe(1)
    expect(subbedIn.appearances).toBe(1)
  })
})
