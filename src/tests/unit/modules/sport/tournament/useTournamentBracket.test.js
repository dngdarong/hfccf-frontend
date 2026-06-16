import { describe, expect, it } from 'vitest'
import { createKnockoutBracket, updateKnockoutMatchResult } from '@/modules/sport/tournament/composables/useTournamentBracket'
import { selectTournamentQualifiers } from '@/modules/sport/tournament/composables/useTournamentQualification'
import { createMockTournaments } from '@/modules/sport/tournament/mocks/tournaments.mock'

function createSeededQualifiers() {
  return [
    { teamId: 'a1', teamName: 'Alpha 1', groupId: 'group-a', groupName: 'Group A', points: 9, goalDifference: 8, goalsFor: 10, position: 1, role: 'winner', seedPriority: 0 },
    { teamId: 'b1', teamName: 'Bravo 1', groupId: 'group-b', groupName: 'Group B', points: 8, goalDifference: 7, goalsFor: 9, position: 1, role: 'winner', seedPriority: 0 },
    { teamId: 'c1', teamName: 'Charlie 1', groupId: 'group-c', groupName: 'Group C', points: 7, goalDifference: 6, goalsFor: 8, position: 1, role: 'winner', seedPriority: 0 },
    { teamId: 'd1', teamName: 'Delta 1', groupId: 'group-d', groupName: 'Group D', points: 6, goalDifference: 5, goalsFor: 7, position: 1, role: 'winner', seedPriority: 0 },
    { teamId: 'a2', teamName: 'Alpha 2', groupId: 'group-a', groupName: 'Group A', points: 6, goalDifference: 3, goalsFor: 6, position: 2, role: 'runner_up', seedPriority: 1 },
    { teamId: 'b2', teamName: 'Bravo 2', groupId: 'group-b', groupName: 'Group B', points: 5, goalDifference: 2, goalsFor: 5, position: 2, role: 'runner_up', seedPriority: 1 },
    { teamId: 'c2', teamName: 'Charlie 2', groupId: 'group-c', groupName: 'Group C', points: 4, goalDifference: 1, goalsFor: 4, position: 2, role: 'runner_up', seedPriority: 1 },
    { teamId: 'd2', teamName: 'Delta 2', groupId: 'group-d', groupName: 'Group D', points: 3, goalDifference: 0, goalsFor: 3, position: 2, role: 'runner_up', seedPriority: 1 },
  ]
}

describe('useTournamentBracket', () => {
  it('generates a valid bracket and avoids same-group pairings where possible', () => {
    const bracketResult = createKnockoutBracket({
      tournamentId: 'tournament-x',
      qualifiers: createSeededQualifiers(),
      settings: {
        extraTimeEnabled: false,
        penaltyEnabled: false,
        thirdPlaceMatchEnabled: false,
      },
    })

    expect(bracketResult.valid).toBe(true)
    expect(bracketResult.bracket.rounds[0].key).toBe('quarterfinal')
    expect(bracketResult.bracket.rounds[0].matches).toHaveLength(4)
    expect(bracketResult.bracket.rounds[0].matches.every((match) => match.homeTeamId !== match.awayTeamId)).toBe(true)
  })

  it('rejects invalid qualifier counts', () => {
    const tournament = createMockTournaments().find((item) => item.id === 'tournament-003')
    const qualifiers = selectTournamentQualifiers({
      tournament,
      settings: {
        qualificationSlots: 2,
      },
    }).qualifiers

    const bracketResult = createKnockoutBracket({
      tournamentId: 'tournament-invalid',
      qualifiers,
      settings: {},
    })

    expect(bracketResult.valid).toBe(false)
    expect(bracketResult.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'invalidBracketSize' }),
    ]))
  })

  it('progresses winners through the knockout bracket and determines the champion', () => {
    const bracketResult = createKnockoutBracket({
      tournamentId: 'tournament-finals',
      qualifiers: createSeededQualifiers().slice(0, 4),
      settings: {
        extraTimeEnabled: false,
        penaltyEnabled: false,
      },
    })

    let bracket = bracketResult.bracket
    const semifinalRound = bracket.rounds.find((round) => round.key === 'semifinal')

    bracket = updateKnockoutMatchResult(bracket, semifinalRound.matches[0].id, {
      status: 'completed',
      homeScore: 2,
      awayScore: 1,
    }, bracket.settings).bracket

    bracket = updateKnockoutMatchResult(bracket, semifinalRound.matches[1].id, {
      status: 'completed',
      homeScore: 3,
      awayScore: 0,
    }, bracket.settings).bracket

    const finalRound = bracket.rounds.find((round) => round.key === 'final')
    expect(finalRound.matches[0].homeTeamId).toBeTruthy()
    expect(finalRound.matches[0].awayTeamId).toBeTruthy()

    bracket = updateKnockoutMatchResult(bracket, finalRound.matches[0].id, {
      status: 'completed',
      homeScore: 1,
      awayScore: 0,
    }, bracket.settings).bracket

    expect(bracket.champion.teamId).toBe(finalRound.matches[0].homeTeamId)
    expect(bracket.status).toBe('completed')
  })

  it('prevents tied matches from being completed without a penalty winner', () => {
    const bracketResult = createKnockoutBracket({
      tournamentId: 'tournament-penalty',
      qualifiers: createSeededQualifiers().slice(0, 4),
      settings: {
        extraTimeEnabled: false,
        penaltyEnabled: false,
      },
    })

    const matchId = bracketResult.bracket.rounds[0].matches[0].id
    const result = updateKnockoutMatchResult(bracketResult.bracket, matchId, {
      status: 'completed',
      homeScore: 1,
      awayScore: 1,
    }, bracketResult.bracket.settings)

    expect(result.issue).toEqual(expect.objectContaining({ code: 'drawWithoutPenaltyWinner' }))
  })

  it('accepts penalty shootout winners when penalties are enabled', () => {
    const bracketResult = createKnockoutBracket({
      tournamentId: 'tournament-penalty-win',
      qualifiers: createSeededQualifiers().slice(0, 4),
      settings: {
        extraTimeEnabled: false,
        penaltyEnabled: true,
      },
    })

    const matchId = bracketResult.bracket.rounds[0].matches[0].id
    const result = updateKnockoutMatchResult(bracketResult.bracket, matchId, {
      status: 'completed',
      homeScore: 1,
      awayScore: 1,
      penaltyHomeScore: 5,
      penaltyAwayScore: 4,
    }, bracketResult.bracket.settings)

    expect(result.issue).toBeNull()
    expect(result.bracket.rounds[0].matches[0].winnerMethod).toBe('penalties')
    expect(result.bracket.rounds[0].matches[0].winnerTeamId).toBeTruthy()
  })
})
