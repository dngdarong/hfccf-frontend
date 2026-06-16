import { computed, ref } from 'vue'
import { fetchCoachTeam, fetchCoachTeams } from '@/modules/sport/services/api/sportCoachTeamsApi'

export function useCoachTeams() {
  const items = ref([])
  const selectedTeam = ref(null)
  const loading = ref(false)
  const error = ref('')

  const hasTeams = computed(() => items.value.length > 0)

  async function loadTeams(options = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await fetchCoachTeams(options)
      items.value = response.items || []

      if (!selectedTeam.value && items.value.length) {
        selectedTeam.value = items.value[0]
      }

      return response
    } catch (exception) {
      error.value = exception?.message || 'Unable to load coach teams.'
      items.value = []
      return { items: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 } }
    } finally {
      loading.value = false
    }
  }

  async function loadTeam(teamId, options = {}) {
    const response = await fetchCoachTeam(teamId, options)
    selectedTeam.value = response?.team || null
    return response
  }

  return {
    error,
    hasTeams,
    items,
    loadTeam,
    loadTeams,
    loading,
    selectedTeam,
  }
}
