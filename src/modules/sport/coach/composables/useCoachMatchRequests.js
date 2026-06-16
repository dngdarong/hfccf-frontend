import { ref } from 'vue'
import { createCoachMatchRequest } from '@/modules/sport/services/api/sportCoachTeamsApi'

export function useCoachMatchRequests() {
  const loading = ref(false)
  const error = ref('')

  async function createRequest(payload = {}, options = {}) {
    loading.value = true
    error.value = ''

    try {
      return await createCoachMatchRequest(payload, options)
    } catch (exception) {
      error.value = exception?.message || 'Unable to create match request.'
      throw exception
    } finally {
      loading.value = false
    }
  }

  return {
    createRequest,
    error,
    loading,
  }
}
