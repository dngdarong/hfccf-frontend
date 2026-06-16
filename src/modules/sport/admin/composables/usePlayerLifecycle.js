import { ref } from 'vue'
import {
  archivePlayer,
  fetchPlayerHistory,
  releasePlayer,
  updatePlayerInjury,
  updatePlayerLifecycleStatus,
  updatePlayerSuspension,
} from '@/modules/sport/services/api/playerLifecycleApi'
import { fetchSportPlayers } from '@/modules/sport/services/api/sportPlayersApi'
import { getApiErrorMessage } from '@/services/api'

export function usePlayerLifecycle() {
  const items = ref([])
  const history = ref({ player: null, memberships: [] })
  const loading = ref(false)
  const error = ref('')

  async function runMutation(action, fallbackMessage) {
    loading.value = true
    error.value = ''

    try {
      return await action()
    } catch (cause) {
      error.value = getApiErrorMessage(cause, fallbackMessage)
      throw cause
    } finally {
      loading.value = false
    }
  }

  async function loadPlayers(options = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await fetchSportPlayers(options)
      items.value = response.items || []
      return response
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to load players.')
      items.value = []
      return { items: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 } }
    } finally {
      loading.value = false
    }
  }

  async function loadHistory(playerId, options = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await fetchPlayerHistory(playerId, options)
      history.value = response
      return response
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to load player history.')
      history.value = { player: null, memberships: [] }
      return history.value
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(playerId, payload = {}, options = {}) {
    return runMutation(
      () => updatePlayerLifecycleStatus(playerId, payload, options),
      'Unable to update player lifecycle status.',
    )
  }

  async function markInjury(playerId, payload = {}, options = {}) {
    return runMutation(() => updatePlayerInjury(playerId, payload, options), 'Unable to update player injury status.')
  }

  async function markSuspension(playerId, payload = {}, options = {}) {
    return runMutation(
      () => updatePlayerSuspension(playerId, payload, options),
      'Unable to update player suspension status.',
    )
  }

  async function release(playerId, payload = {}, options = {}) {
    return runMutation(() => releasePlayer(playerId, payload, options), 'Unable to release player.')
  }

  async function archive(playerId, payload = {}, options = {}) {
    return runMutation(() => archivePlayer(playerId, payload, options), 'Unable to archive player.')
  }

  return {
    archive,
    error,
    history,
    items,
    loadHistory,
    loadPlayers,
    loading,
    markInjury,
    markSuspension,
    release,
    updateStatus,
  }
}
