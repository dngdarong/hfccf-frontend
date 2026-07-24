import { computed, ref } from 'vue'
import { getApiErrorMessage } from '@/services/api'
import { fetchTournamentStatistics } from '../api/tournamentApi'
import { calculateTournamentStats } from '../services/statistics/calculateTournamentStats'

function normalizeStatistics(source = {}) {
  const summary = source.summary || {}
  const playerStats = Array.isArray(source.playerStats)
    ? source.playerStats.map((row) => ({ ...row, playerName: row.playerName || row.player_name || '', goals: Number(row.goals || 0), assists: Number(row.assists || 0) }))
    : []
  const teamStats = Array.isArray(source.teamStats)
    ? source.teamStats.map((row) => ({
      ...row,
      teamName: row.teamName || row.team_name || '',
      goalsFor: Number(row.goalsFor ?? row.goals_for ?? 0),
      goalsAgainst: Number(row.goalsAgainst ?? row.goals_against ?? 0),
      fairPlayPoints: Number(row.fairPlayPoints ?? row.fair_play_points ?? 0),
    }))
    : []
  const sortBy = (field) => [...playerStats].sort((left, right) => Number(right[field] || 0) - Number(left[field] || 0))
  const teamSort = (field, direction = -1) => [...teamStats].sort((left, right) => direction * (Number(right[field] || 0) - Number(left[field] || 0)))

  return {
    ...source,
    summary,
    playerStats,
    teamStats,
    rankings: source.rankings || {
      topScorers: sortBy('goals'),
      topAssistProviders: sortBy('assists'),
      bestAttack: teamSort('goalsFor'),
      bestDefense: teamSort('goalsAgainst', 1),
      fairPlay: teamSort('fairPlayPoints', 1),
    },
  }
}

export function useTournamentStatistics(tournament) {
  const statistics = ref(null)
  const isLoading = ref(false)
  const error = ref('')

  async function loadStatistics(loadOptions = {}) {
    const id = String(tournament?.value?.id || tournament?.id || '').trim()
    if (!id) return null

    isLoading.value = true
    error.value = ''
    try {
      statistics.value = normalizeStatistics(await fetchTournamentStatistics(id, loadOptions))
      return statistics.value
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Failed to load tournament statistics.')
      throw cause
    } finally {
      isLoading.value = false
    }
  }

  const resolved = computed(() => statistics.value || {})

  return {
    statistics: resolved,
    isLoading,
    error,
    loadStatistics,
    summary: computed(() => resolved.value.summary || {}),
    playerStats: computed(() => resolved.value.playerStats || []),
    teamStats: computed(() => resolved.value.teamStats || []),
    disciplineStats: computed(() => resolved.value.disciplineStats || []),
    topScorers: computed(() => resolved.value.rankings?.topScorers || []),
    topAssistProviders: computed(() => resolved.value.rankings?.topAssistProviders || []),
    bestAttack: computed(() => resolved.value.rankings?.bestAttack || []),
    bestDefense: computed(() => resolved.value.rankings?.bestDefense || []),
    fairPlayRanking: computed(() => resolved.value.rankings?.fairPlay || []),
  }
}

export { calculateTournamentStats, normalizeStatistics }
