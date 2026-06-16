import { computed, ref } from 'vue'
import {
  addTeamRosterPlayer,
  fetchPlayerHistory,
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
  const loading = ref(false)
  const error = ref('')

  const activePlayers = computed(() =>
    players.value.filter(
      (player) => String(player.rosterStatus || player.status || '').toLowerCase() === PLAYER_ROSTER_STATUS.ACTIVE,
    ),
  )

  async function loadRoster(teamId, options = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await fetchTeamRoster(teamId, options)
      team.value = response.team
      players.value = response.players || []
      memberships.value = response.memberships || []
      return response
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to load team roster.')
      team.value = null
      players.value = []
      memberships.value = []
      return { team: null, players: [], memberships: [], raw: null }
    } finally {
      loading.value = false
    }
  }

  async function addPlayer(teamId, payload = {}, options = {}) {
    loading.value = true
    error.value = ''

    try {
      return await addTeamRosterPlayer(teamId, payload, options)
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to add player to roster.')
      throw cause
    } finally {
      loading.value = false
    }
  }

  async function updateMembership(membershipId, payload = {}, options = {}) {
    loading.value = true
    error.value = ''

    try {
      return await updateRosterMembership(membershipId, payload, options)
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to update roster membership.')
      throw cause
    } finally {
      loading.value = false
    }
  }

  async function removeMembership(membershipId) {
    loading.value = true
    error.value = ''

    try {
      return await removeRosterMembership(membershipId)
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to remove roster membership.')
      throw cause
    } finally {
      loading.value = false
    }
  }

  async function loadHistory(playerId, options = {}) {
    loading.value = true
    error.value = ''

    try {
      return await fetchPlayerHistory(playerId, options)
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to load player history.')
      return { player: null, memberships: [], raw: null }
    } finally {
      loading.value = false
    }
  }

  return {
    activePlayers,
    addPlayer,
    error,
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
