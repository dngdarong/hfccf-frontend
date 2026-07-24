import { computed, ref } from 'vue'
import { getApiErrorMessage } from '@/services/api'
import { fetchSportTeams } from '@/modules/sport/services/api/sportTeamsApi'
import { addTournamentTeam, removeTournamentTeam } from '../api/tournamentApi'

export function useTournamentTeams(tournament, options = {}) {
  const availableTeams = ref([])
  const attachedTeams = ref(Array.isArray(tournament?.value?.teams) ? tournament.value.teams : [])
  const isLoading = ref(false)
  const isAttaching = ref(false)
  const removingTeamId = ref('')
  const error = ref('')
  const validationErrors = ref({})

  const selectableTeams = computed(() => {
    const attachedIds = new Set(attachedTeams.value.map((team) => String(team.teamId || team.id)))
    return availableTeams.value.filter((team) => !attachedIds.has(String(team.id)))
  })

  async function loadTeams() {
    isLoading.value = true
    error.value = ''
    try {
      const result = await fetchSportTeams({ page: 1, perPage: 100, status: 'active' })
      availableTeams.value = result.items || []
      if (Array.isArray(tournament?.value?.teams)) attachedTeams.value = tournament.value.teams
      return availableTeams.value
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Failed to load Sport teams.')
      throw cause
    } finally {
      isLoading.value = false
    }
  }

  async function attachTeam(teamId) {
    if (isAttaching.value || !teamId) return null
    isAttaching.value = true
    error.value = ''
    validationErrors.value = {}
    try {
      const result = await addTournamentTeam(tournament.value.id, { teamId })
      if (Array.isArray(result.tournament?.teams)) attachedTeams.value = result.tournament.teams
      if (typeof options.reload === 'function') await options.reload()
      return result
    } catch (cause) {
      validationErrors.value = cause?.validationErrors || cause?.response?.data?.data?.errors || {}
      error.value = getApiErrorMessage(cause, 'Failed to attach team.')
      throw cause
    } finally {
      isAttaching.value = false
    }
  }

  async function removeTeam(teamId) {
    if (removingTeamId.value || !teamId) return null
    removingTeamId.value = String(teamId)
    error.value = ''
    validationErrors.value = {}
    try {
      const result = await removeTournamentTeam(tournament.value.id, teamId)
      if (Array.isArray(result.tournament?.teams)) attachedTeams.value = result.tournament.teams
      if (typeof options.reload === 'function') await options.reload()
      return result
    } catch (cause) {
      validationErrors.value = cause?.validationErrors || cause?.response?.data?.data?.errors || {}
      error.value = getApiErrorMessage(cause, 'Failed to remove team.')
      throw cause
    } finally {
      removingTeamId.value = ''
    }
  }

  return { availableTeams, attachedTeams, selectableTeams, isLoading, isAttaching, removingTeamId, error, validationErrors, loadTeams, attachTeam, removeTeam }
}
