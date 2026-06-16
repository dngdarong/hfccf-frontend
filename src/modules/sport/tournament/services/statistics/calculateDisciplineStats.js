import { compareFairPlayRows, comparePlayerDisciplineRows, rankStatistics } from './rankStatistics'

export function calculateDisciplineStats({
  playerStats = [],
  teamStats = [],
  limit = 10,
} = {}) {
  const teamRanking = rankStatistics(teamStats, compareFairPlayRows, limit)
  const playerRanking = rankStatistics(playerStats, comparePlayerDisciplineRows, limit)

  return {
    teamRanking,
    playerRanking,
    fairPlayLeader: teamRanking[0] || null,
  }
}

export {
  compareFairPlayRows,
  comparePlayerDisciplineRows,
  rankStatistics,
}
