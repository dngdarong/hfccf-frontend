import { ref } from 'vue'
import { getApiErrorMessage } from '@/services/api'
import { updateSportMatch } from '@/modules/sport/services/api/sportMatchesApi'

export function useMatchResultEntry() {
  const loading = ref(false)
  const error = ref('')

  async function saveResult(matchId, payload = {}, options = {}) {
    loading.value = true
    error.value = ''

    try {
      return await updateSportMatch(matchId, {
        status: payload.status,
        currentPeriod: payload.currentPeriod || payload.current_period,
        notes: payload.notes || payload.report,
      }, options)
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to save match result.')
      throw cause
    } finally {
      loading.value = false
    }
  }

  return {
    error,
    loading,
    saveResult,
  }
}