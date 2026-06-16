import { ref } from 'vue'
import { createCoachPlayerRequest, fetchCoachTeam } from '@/modules/sport/services/api/sportCoachTeamsApi'

export function useCoachPlayerRequests() {
  const loading = ref(false)
  const error = ref('')

  async function createRequest(teamId, payload = {}, options = {}) {
    loading.value = true
    error.value = ''

    try {
      return await createCoachPlayerRequest(teamId, payload, options)
    } catch (exception) {
      error.value = exception?.message || 'Unable to create player request.'
      throw exception
    } finally {
      loading.value = false
    }
  }

  async function loadTeamPlayers(teamId, options = {}) {
    loading.value = true
    error.value = ''

    try {
      return await fetchCoachTeam(teamId, options)
    } catch (exception) {
      error.value = exception?.message || 'Unable to load team players.'
      return { team: null, players: [] }
    } finally {
      loading.value = false
    }
  }

  return {
    createRequest,
    error,
    loadTeamPlayers,
    loading,
  }
}
