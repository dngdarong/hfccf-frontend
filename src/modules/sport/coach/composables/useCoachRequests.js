import { ref } from 'vue'
import { fetchCoachRequests } from '@/modules/sport/services/api/sportCoachTeamsApi'
import { getApiErrorMessage } from '@/services/api'

export function useCoachRequests() {
  const playerRequests = ref([])
  const matchRequests = ref([])
  const summary = ref({ playerRequests: 0, matchRequests: 0, total: 0 })
  const loading = ref(false)
  const error = ref('')

  async function loadRequests(options = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await fetchCoachRequests(options)
      playerRequests.value = response.playerRequests || []
      matchRequests.value = response.matchRequests || []
      summary.value = response.summary || { playerRequests: 0, matchRequests: 0, total: 0 }
      return response
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to load your requests.')
      playerRequests.value = []
      matchRequests.value = []
      summary.value = { playerRequests: 0, matchRequests: 0, total: 0 }
      return { playerRequests: [], matchRequests: [], summary: summary.value, raw: null }
    } finally {
      loading.value = false
    }
  }

  return {
    error,
    loadRequests,
    loading,
    matchRequests,
    playerRequests,
    summary,
  }
}
