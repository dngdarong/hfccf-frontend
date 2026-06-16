import { computed, ref } from 'vue'
import { fetchMatchTeamEligibility } from '@/modules/sport/services/api/matchEligibilityApi'
import { getApiErrorMessage } from '@/services/api'

export function useMatchEligibility() {
  const match = ref(null)
  const team = ref(null)
  const players = ref([])
  const loading = ref(false)
  const error = ref('')

  const eligiblePlayers = computed(() => players.value.filter((player) => player.isEligible))
  const unavailablePlayers = computed(() => players.value.filter((player) => !player.isEligible))

  async function loadEligibility(matchId, teamId, options = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await fetchMatchTeamEligibility(matchId, teamId, options)
      match.value = response.match
      team.value = response.team
      players.value = response.items || []
      return response
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to load match eligibility.')
      match.value = null
      team.value = null
      players.value = []
      return { match: null, team: null, items: [], raw: null }
    } finally {
      loading.value = false
    }
  }

  return {
    eligiblePlayers,
    error,
    loadEligibility,
    loading,
    match,
    players,
    team,
    unavailablePlayers,
  }
}

