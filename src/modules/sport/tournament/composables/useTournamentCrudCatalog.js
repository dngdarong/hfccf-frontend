import { computed, ref } from 'vue'
import { getApiErrorMessage } from '@/services/api'
import { canTransitionTournament, normalizeTournamentState } from './useTournamentStateMachine'
import {
  archiveTournament as apiArchiveTournament,
  createTournament as apiCreateTournament,
  deleteTournament as apiDeleteTournament,
  getTournament as apiGetTournament,
  listTournaments as apiListTournaments,
  updateTournament as apiUpdateTournament,
} from '../api/tournamentApi'
import { normalizeTournamentRecord } from '../api/tournamentMappers'

function deepClone(value) {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch {
      return JSON.parse(JSON.stringify(value))
    }
  }

  return JSON.parse(JSON.stringify(value))
}

const records = ref([])
const mode = ref('remote')
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')

function findRecordIndex(id) {
  const targetId = String(id ?? '').trim()
  if (!targetId) return -1

  return records.value.findIndex((item) => String(item.id || '').trim() === targetId)
}

function upsertRecord(record, { replace = false, fallback = null } = {}) {
  const normalized = normalizeTournamentRecord(record, fallback)
  const index = findRecordIndex(normalized.id)

  if (index >= 0) {
    const merged = replace
      ? normalized
      : normalizeTournamentRecord({ ...records.value[index], ...normalized }, records.value[index])

    records.value.splice(index, 1, merged)
    return deepClone(merged)
  }

  records.value.unshift(normalized)
  return deepClone(normalized)
}

function removeRecord(id) {
  const index = findRecordIndex(id)
  if (index < 0) return false

  records.value.splice(index, 1)
  return true
}

function setRemoteRecords(items = []) {
  records.value = items.map((item) => normalizeTournamentRecord(item))
}

function setTournamentRecord(record) {
  return record?.id ? upsertRecord(record, { replace: true }) : null
}

function resetTournamentCrudCatalog() {
  records.value = []
  mode.value = 'remote'
  isLoading.value = false
  isSaving.value = false
  error.value = ''
}

async function loadTournaments(params = {}, options = {}) {
  isLoading.value = true
  error.value = ''

  try {
    const response = await apiListTournaments(params, options)
    mode.value = 'remote'
    setRemoteRecords(response.items || [])

    return {
      items: tournaments.value,
      pagination: response.pagination,
    }
  } catch (cause) {
    error.value = getApiErrorMessage(cause, 'Failed to load tournaments.')
    throw cause
  } finally {
    isLoading.value = false
  }
}

async function loadTournament(id, options = {}) {
  const tournamentId = String(id ?? '').trim()
  if (!tournamentId) return null

  isLoading.value = true
  error.value = ''

  try {
    const record = await apiGetTournament(tournamentId, options)
    if (record?.id) {
      mode.value = 'remote'
      return upsertRecord(record, { replace: true })
    }

    return null
  } catch (cause) {
    error.value = getApiErrorMessage(cause, 'Failed to load tournament.')
    throw cause
  } finally {
    isLoading.value = false
  }
}

async function createTournament(payload = {}) {
  isSaving.value = true
  error.value = ''

  try {
    const record = await apiCreateTournament(payload)
    mode.value = 'remote'
    return upsertRecord(record, { replace: true, fallback: payload })
  } catch (cause) {
    error.value = getApiErrorMessage(cause, 'Failed to create tournament.')
    throw cause
  } finally {
    isSaving.value = false
  }
}

async function updateTournament(id, payload = {}) {
  const tournamentId = String(id ?? '').trim()
  if (!tournamentId) throw new Error('Tournament id is required.')

  isSaving.value = true
  error.value = ''

  try {
    const record = await apiUpdateTournament(tournamentId, payload)
    mode.value = 'remote'
    const current = getTournamentById(tournamentId)
    return upsertRecord(record, { replace: true, fallback: current || payload })
  } catch (cause) {
    error.value = getApiErrorMessage(cause, 'Failed to update tournament.')
    throw cause
  } finally {
    isSaving.value = false
  }
}

async function deleteTournament(id) {
  const tournamentId = String(id ?? '').trim()
  if (!tournamentId) return false

  isSaving.value = true
  error.value = ''

  try {
    const deleted = await apiDeleteTournament(tournamentId)
    mode.value = 'remote'
    if (deleted) {
      removeRecord(tournamentId)
    }
    return deleted
  } catch (cause) {
    error.value = getApiErrorMessage(cause, 'Failed to delete tournament.')
    throw cause
  } finally {
    isSaving.value = false
  }
}

async function archiveTournament(id) {
  try {
    const archived = await apiArchiveTournament(id)
    mode.value = 'remote'
    if (archived) {
      removeRecord(id)
    }
    return archived
  } catch (cause) {
    error.value = getApiErrorMessage(cause, 'Failed to archive tournament.')
    throw cause
  }
}

function transitionTournament(id, nextState) {
  const tournamentId = String(id ?? '').trim()
  const index = findRecordIndex(tournamentId)

  if (index < 0) return null

  const current = records.value[index]
  if (!canTransitionTournament(current.state, nextState)) {
    return null
  }

  const state = normalizeTournamentState(nextState)
  const updated = normalizeTournamentRecord({
    ...deepClone(current),
    state,
    status: state,
    registrationStatus: state === 'registration_open' ? 'open' : state === 'registration_closed' ? 'closed' : current.registrationStatus,
  }, current)

  records.value.splice(index, 1, updated)
  return deepClone(updated)
}

function getTournamentById(id) {
  const index = findRecordIndex(id)
  return index >= 0 ? deepClone(records.value[index]) : null
}

const tournaments = computed(() => records.value.map((record) => deepClone(record)))

export function useTournamentCrudCatalog() {
  return {
    tournaments,
    getTournamentById,
    loadTournaments,
    loadTournament,
    createTournament,
    updateTournament,
    deleteTournament,
    archiveTournament,
    transitionTournament,
    isLoading,
    isSaving,
    error,
    mode,
    resetTournamentCrudCatalog,
    setTournamentRecord,
  }
}
