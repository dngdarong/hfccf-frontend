import { ref } from 'vue'
import {
  approvePendingMatch,
  approvePendingPlayer,
  deactivateCoachTeamAssignment,
  fetchPendingMatches,
  fetchPendingPlayers,
  listCoachTeamAssignments,
  rejectPendingMatch,
  rejectPendingPlayer,
  saveCoachTeamAssignment,
} from '@/modules/sport/services/api/sportApprovalsApi'

export function useSportApprovals() {
  const loading = ref(false)
  const error = ref('')

  async function loadPendingPlayers(options = {}) {
    loading.value = true
    error.value = ''

    try {
      return await fetchPendingPlayers(options)
    } catch (exception) {
      error.value = exception?.message || 'Unable to load pending players.'
      return { items: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 } }
    } finally {
      loading.value = false
    }
  }

  async function loadPendingMatches(options = {}) {
    loading.value = true
    error.value = ''

    try {
      return await fetchPendingMatches(options)
    } catch (exception) {
      error.value = exception?.message || 'Unable to load pending matches.'
      return { items: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 } }
    } finally {
      loading.value = false
    }
  }

  return {
    approvePendingMatch,
    approvePendingPlayer,
    deactivateCoachTeamAssignment,
    error,
    loadPendingMatches,
    loadPendingPlayers,
    listCoachTeamAssignments,
    loading,
    rejectPendingMatch,
    rejectPendingPlayer,
    saveCoachTeamAssignment,
  }
}
