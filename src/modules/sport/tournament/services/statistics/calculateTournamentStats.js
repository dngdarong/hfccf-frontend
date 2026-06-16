import { normalizeEventType } from '../normalizeMatchEvents'
import { normalizeStatisticsInput, resolveStatisticsFixtureScore } from './normalizeStatisticsInput'
import { calculatePlayerStats } from './calculatePlayerStats'
import { calculateTeamStats } from './calculateTeamStats'
import { calculateDisciplineStats } from './calculateDisciplineStats'
import {
  compareAssistProviders,
  compareBestAttackRows,
  compareBestDefenseRows,
  compareTopScorers,
  rankStatistics,
} from './rankStatistics'

function isCountableStatus(status = '') {
  const normalized = String(status || '').trim().toLowerCase()
  return normalized !== 'cancelled' && normalized !== 'postponed'
}

function countEventTypes(fixtures = []) {
  return (Array.isArray(fixtures) ? fixtures : []).reduce(
    (carry, fixture) => {
      if (!isCountableStatus(fixture.status)) {
        return carry
      }

      ;(Array.isArray(fixture.events) ? fixture.events : []).forEach((event) => {
        const type = normalizeEventType(event.type)

        if (type === 'yellow_card') {
          carry.totalYellowCards += 1
        }

        if (type === 'red_card') {
          carry.totalRedCards += 1
        }
      })

      return carry
    },
    {
      totalYellowCards: 0,
      totalRedCards: 0,
    },
  )
}

function resolveGoalsFromFixture(fixture = {}) {
  const score = fixture?.eventScore?.hasScoringEvents
    ? fixture.eventScore.score
    : resolveStatisticsFixtureScore(fixture)

  return {
    home: Number(score?.home ?? 0) || 0,
    away: Number(score?.away ?? 0) || 0,
  }
}

export function calculateTournamentStats({
  tournament = {},
  limit = 10,
} = {}) {
  const normalized = normalizeStatisticsInput(tournament)
  const playerStats = calculatePlayerStats({ tournament: normalized, fixtures: normalized.fixtures })
  const teamStats = calculateTeamStats({
    tournament: normalized,
    fixtures: normalized.fixtures,
    teams: normalized.teams,
  })
  const disciplineStats = calculateDisciplineStats({
    playerStats,
    teamStats,
    limit,
  })

  const totalMatches = normalized.fixtures.length
  const completedMatches = normalized.fixtures.filter((fixture) => String(fixture.status || '').trim().toLowerCase() === 'completed').length
  const scheduledMatches = normalized.fixtures.filter((fixture) => String(fixture.status || '').trim().toLowerCase() === 'scheduled').length
  const countableFixtures = normalized.fixtures.filter((fixture) => isCountableStatus(fixture.status))

  const totalGoals = countableFixtures.reduce((sum, fixture) => {
    const score = resolveGoalsFromFixture(fixture)
    return sum + score.home + score.away
  }, 0)

  const goalBase = completedMatches || countableFixtures.length || 0
  const goalsPerMatch = goalBase > 0 ? Number((totalGoals / goalBase).toFixed(2)) : 0
  const { totalYellowCards, totalRedCards } = countEventTypes(countableFixtures)

  const topScorers = rankStatistics(playerStats, compareTopScorers, limit)
  const topAssistProviders = rankStatistics(playerStats, compareAssistProviders, limit)
  const bestAttack = rankStatistics(teamStats, compareBestAttackRows, limit)
  const bestDefense = rankStatistics(teamStats, compareBestDefenseRows, limit)

  return {
    summary: {
      totalMatches,
      completedMatches,
      scheduledMatches,
      totalGoals,
      goalsPerMatch,
      totalYellowCards,
      totalRedCards,
      topScorer: topScorers[0] || null,
      topAssistProvider: topAssistProviders[0] || null,
      bestAttack: bestAttack[0] || null,
      bestDefense: bestDefense[0] || null,
      fairPlayLeader: disciplineStats.fairPlayLeader || null,
    },
    playerStats,
    teamStats,
    disciplineStats,
    rankings: {
      topScorers,
      topAssistProviders,
      bestAttack,
      bestDefense,
      fairPlay: disciplineStats.teamRanking,
    },
  }
}

export {
  countEventTypes,
  isCountableStatus,
  resolveGoalsFromFixture,
}
