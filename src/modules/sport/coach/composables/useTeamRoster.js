import { computed, ref } from 'vue'
import {
  addTeamRosterPlayer,
  fetchPlayerHistory,
  fetchRosterCandidates,
  fetchTeamRoster,
  removeRosterMembership,
  updateRosterMembership,
} from '@/modules/sport/services/api/teamRosterApi'
import { getApiErrorMessage } from '@/services/api'
import { PLAYER_ROSTER_STATUS } from '@/modules/sport/constants/playerStatus'

export function useTeamRoster() {
  const team = ref(null)
  const players = ref([])
  const memberships = ref([])
  const candidates = ref([])
  const loading = ref(false)
  const rosterError = ref('')
  const candidateError = ref('')
  const actionError = ref('')
  const error = computed(() => candidateError.value || rosterError.value || actionError.value)

  const activePlayers = computed(() =>
    players.value.filter(
      (player) => String(player.rosterStatus || player.status || '').toLowerCase() === PLAYER_ROSTER_STATUS.ACTIVE,
    ),
  )

  async function loadRoster(teamId, options = {}) {
    loading.value = true
    rosterError.value = ''

    try {
      const response = await fetchTeamRoster(teamId, options)
      team.value = response.team
      players.value = response.players || []
      memberships.value = response.memberships || []
      return response
    } catch (cause) {
      rosterError.value = getApiErrorMessage(cause, 'Unable to load team roster.')
      team.value = null
      players.value = []
      memberships.value = []
      return { team: null, players: [], memberships: [], raw: null }
    } finally {
      loading.value = false
    }
  }

  async function loadCandidates(teamId, options = {}) {
    loading.value = true
    candidateError.value = ''

    try {
      const response = await fetchRosterCandidates(teamId, options)
      candidates.value = response.items || []
      return response
    } catch (cause) {
      candidateError.value = getApiErrorMessage(cause, 'Unable to load roster candidates.')
      candidates.value = []
      return { team: null, items: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 }, raw: null }
    } finally {
      loading.value = false
    }
  }

  async function addPlayer(teamId, payload = {}, options = {}) {
    loading.value = true
    actionError.value = ''

    try {
      return await addTeamRosterPlayer(teamId, payload, options)
    } catch (cause) {
      actionError.value = getApiErrorMessage(cause, 'Unable to add player to roster.')
      throw cause
    } finally {
      loading.value = false
    }
  }

  async function updateMembership(membershipId, payload = {}, options = {}) {
    loading.value = true
    actionError.value = ''

    try {
      return await updateRosterMembership(membershipId, payload, options)
    } catch (cause) {
      actionError.value = getApiErrorMessage(cause, 'Unable to update roster membership.')
      throw cause
    } finally {
      loading.value = false
    }
  }

  async function removeMembership(membershipId) {
    loading.value = true
    actionError.value = ''

    try {
      return await removeRosterMembership(membershipId)
    } catch (cause) {
      actionError.value = getApiErrorMessage(cause, 'Unable to remove roster membership.')
      throw cause
    } finally {
      loading.value = false
    }
  }

  async function loadHistory(playerId, options = {}) {
    loading.value = true
    actionError.value = ''

    try {
      return await fetchPlayerHistory(playerId, options)
    } catch (cause) {
      actionError.value = getApiErrorMessage(cause, 'Unable to load player history.')
      return { player: null, memberships: [], raw: null }
    } finally {
      loading.value = false
    }
  }

  return {
    activePlayers,
    addPlayer,
    candidates,
    error,
    actionError,
    loadCandidates,
    loadHistory,
    loadRoster,
    loading,
    memberships,
    players,
    removeMembership,
    team,
    updateMembership,
  }
}
