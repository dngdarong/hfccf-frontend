import { ref } from 'vue'
import { fetchSportMatch } from '@/modules/sport/services/api/sportMatchesApi'
import {
  approveMatchSquad,
  fetchMatchSquads,
  fetchMatchTeamSquad,
  lockMatchSquad,
  saveMatchTeamSquad,
  submitMatchSquad,
  updateMatchSquad,
} from '@/modules/sport/services/api/matchSquadApi'
import { getApiErrorMessage } from '@/services/api'

export function useMatchSquad() {
  const match = ref(null)
  const squads = ref([])
  const squad = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function loadMatch(matchId, options = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await fetchSportMatch(matchId, options)
      match.value = response
      return response
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to load match.')
      match.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  async function loadMatchSquads(matchId, options = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await fetchMatchSquads(matchId, options)
      squads.value = response.items || []
      return response
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to load match squads.')
      squads.value = []
      return { items: [], match: null, raw: null }
    } finally {
      loading.value = false
    }
  }

  async function loadTeamSquad(matchId, teamId, options = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await fetchMatchTeamSquad(matchId, teamId, options)
      squad.value = response.squad
      return response
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to load match squad.')
      squad.value = null
      return { squad: null, match: null, team: null, players: [], raw: null }
    } finally {
      loading.value = false
    }
  }

  async function saveSquad(matchId, teamId, payload = {}, options = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await saveMatchTeamSquad(matchId, teamId, payload, options)
      squad.value = response.squad
      return response
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to save match squad.')
      throw cause
    } finally {
      loading.value = false
    }
  }

  async function updateSquad(squadId, payload = {}, options = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await updateMatchSquad(squadId, payload, options)
      squad.value = response.squad
      return response
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to update match squad.')
      throw cause
    } finally {
      loading.value = false
    }
  }

  async function submitSquad(squadId) {
    loading.value = true
    error.value = ''

    try {
      const response = await submitMatchSquad(squadId)
      squad.value = response.squad
      return response
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to submit match squad.')
      throw cause
    } finally {
      loading.value = false
    }
  }

  async function approveSquad(squadId) {
    loading.value = true
    error.value = ''

    try {
      const response = await approveMatchSquad(squadId)
      squad.value = response.squad
      return response
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to approve match squad.')
      throw cause
    } finally {
      loading.value = false
    }
  }

  async function lockSquad(squadId) {
    loading.value = true
    error.value = ''

    try {
      const response = await lockMatchSquad(squadId)
      squad.value = response.squad
      return response
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to lock match squad.')
      throw cause
    } finally {
      loading.value = false
    }
  }

  return {
    approveSquad,
    error,
    loadMatch,
    loadMatchSquads,
    loadTeamSquad,
    lockSquad,
    loading,
    match,
    saveSquad,
    squad,
    squads,
    submitSquad,
    updateSquad,
  }
}
