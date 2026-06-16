import { computed, ref } from 'vue'
import { getApiErrorMessage } from '@/services/api'
import { compareMatchEvents } from '@/modules/sport/services/sportApi'
import {
  createMatchEvent,
  deleteMatchEvent,
  getMatchEvents,
  updateMatchEvent,
} from '@/modules/sport/services/api/matchEventApi'

export function useMatchEvents() {
  const match = ref(null)
  const items = ref([])
  const loading = ref(false)
  const error = ref('')

  const orderedItems = computed(() => [...items.value].sort(compareMatchEvents))
  const hasEvents = computed(() => orderedItems.value.length > 0)

  async function loadEvents(matchId, options = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await getMatchEvents(matchId, options)
      match.value = response.match || null
      items.value = response.items || []
      return response
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to load match events.')
      match.value = null
      items.value = []
      return {
        items: [],
        pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 },
        match: null,
        raw: null,
      }
    } finally {
      loading.value = false
    }
  }

  async function createEvent(matchId, payload = {}, options = {}) {
    loading.value = true
    error.value = ''

    try {
      const event = await createMatchEvent(matchId, payload, options)
      const nextItems = [...items.value, event].sort(compareMatchEvents)
      items.value = nextItems
      return event
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to create match event.')
      throw cause
    } finally {
      loading.value = false
    }
  }

  async function updateEvent(eventId, payload = {}, options = {}) {
    loading.value = true
    error.value = ''

    try {
      const event = await updateMatchEvent(eventId, payload, options)
      items.value = items.value.map((current) => (String(current.id) === String(event.id) ? event : current)).sort(compareMatchEvents)
      return event
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to update match event.')
      throw cause
    } finally {
      loading.value = false
    }
  }

  async function removeEvent(eventId) {
    loading.value = true
    error.value = ''

    try {
      const result = await deleteMatchEvent(eventId)
      items.value = items.value.filter((event) => String(event.id) !== String(eventId))
      return result
    } catch (cause) {
      error.value = getApiErrorMessage(cause, 'Unable to delete match event.')
      throw cause
    } finally {
      loading.value = false
    }
  }

  return {
    match,
    items,
    orderedItems,
    hasEvents,
    loading,
    error,
    loadEvents,
    createEvent,
    updateEvent,
    removeEvent,
  }
}