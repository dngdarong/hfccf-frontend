import { computed } from 'vue'
import { calculateTournamentStats } from '../services/statistics/calculateTournamentStats'

export function useTournamentStatistics(tournament, options = {}) {
  const statistics = computed(() =>
    calculateTournamentStats({
      tournament: tournament?.value || tournament || {},
      limit: Number(options.limit ?? 10) || 10,
    }),
  )

  return {
    statistics,
    summary: computed(() => statistics.value.summary),
    playerStats: computed(() => statistics.value.playerStats),
    teamStats: computed(() => statistics.value.teamStats),
    disciplineStats: computed(() => statistics.value.disciplineStats),
    topScorers: computed(() => statistics.value.rankings.topScorers),
    topAssistProviders: computed(() => statistics.value.rankings.topAssistProviders),
    bestAttack: computed(() => statistics.value.rankings.bestAttack),
    bestDefense: computed(() => statistics.value.rankings.bestDefense),
    fairPlayRanking: computed(() => statistics.value.rankings.fairPlay),
  }
}

export {
  calculateTournamentStats,
}
