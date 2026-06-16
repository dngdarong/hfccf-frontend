import { computed, ref } from 'vue'
import { getApiErrorMessage } from '@/services/api'
import { cloneTournamentRecord, createMockTournaments, createTournamentDraft } from '../mocks/tournaments.mock'
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

function createLocalId() {
  const suffix = Math.random().toString(36).slice(2, 8)
  return `tournament-local-${Date.now()}-${suffix}`
}

function isFallbackableError(error) {
  const status = Number(error?.status || error?.response?.status || 0)
  return Boolean(error?.isNetworkError || error?.code === 'NETWORK_ERROR' || status === 0 || status === 404 || status >= 500)
}

function seedRecords() {
  return createMockTournaments().map((record) => normalizeTournamentRecord(record))
}

const records = ref(seedRecords())
const mode = ref('mock')
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')

let hasAttemptedRemoteLoad = false

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
    return cloneTournamentRecord(merged)
  }

  records.value.unshift(normalized)
  return cloneTournamentRecord(normalized)
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

function resetTournamentCrudCatalog() {
  records.value = seedRecords()
  mode.value = 'mock'
  isLoading.value = false
  isSaving.value = false
  error.value = ''
  hasAttemptedRemoteLoad = false
}

async function loadTournaments(params = {}, options = {}) {
  isLoading.value = true
  error.value = ''

  try {
    const response = await apiListTournaments(params, options)
    mode.value = 'remote'
    hasAttemptedRemoteLoad = true
    setRemoteRecords(response.items || [])

    return {
      items: tournaments.value,
      pagination: response.pagination,
    }
  } catch (cause) {
    if (!isFallbackableError(cause)) {
      error.value = getApiErrorMessage(cause, 'Failed to load tournaments.')
      throw cause
    }

    mode.value = 'mock'
    if (!hasAttemptedRemoteLoad || !records.value.length) {
      records.value = seedRecords()
    }
    hasAttemptedRemoteLoad = true

    return {
      items: tournaments.value,
      pagination: {
        page: 1,
        perPage: records.value.length || 10,
        total: records.value.length,
        totalPages: 1,
      },
    }
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
      hasAttemptedRemoteLoad = true
      return upsertRecord(record, { replace: true })
    }

    return null
  } catch (cause) {
    if (!isFallbackableError(cause)) {
      error.value = getApiErrorMessage(cause, 'Failed to load tournament.')
      throw cause
    }

    mode.value = 'mock'
    hasAttemptedRemoteLoad = true

    const existing = getTournamentById(tournamentId)
    if (existing?.id) {
      return existing
    }

    const fallback = createMockTournaments().find((item) => String(item.id) === tournamentId)
    if (fallback?.id) {
      return upsertRecord(fallback, { replace: true })
    }

    return null
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
    hasAttemptedRemoteLoad = true
    return upsertRecord(record, { replace: true, fallback: payload })
  } catch (cause) {
    if (!isFallbackableError(cause)) {
      error.value = getApiErrorMessage(cause, 'Failed to create tournament.')
      throw cause
    }

    mode.value = 'mock'
    const localRecord = normalizeTournamentRecord({
      ...createTournamentDraft(),
      ...deepClone(payload),
      id: payload?.id || createLocalId(),
      state: payload?.state || payload?.status || 'draft',
      status: payload?.state || payload?.status || 'draft',
    })

    records.value.unshift(localRecord)
    return cloneTournamentRecord(localRecord)
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
    hasAttemptedRemoteLoad = true
    const current = getTournamentById(tournamentId)
    return upsertRecord(record, { replace: true, fallback: current || payload })
  } catch (cause) {
    if (!isFallbackableError(cause)) {
      error.value = getApiErrorMessage(cause, 'Failed to update tournament.')
      throw cause
    }

    mode.value = 'mock'
    const current = getTournamentById(tournamentId) || createTournamentDraft()
    const localRecord = normalizeTournamentRecord({
      ...deepClone(current),
      ...deepClone(payload),
      id: tournamentId,
      state: payload?.state || payload?.status || current.state,
      status: payload?.state || payload?.status || current.state,
    }, current)

    return upsertRecord(localRecord, { replace: true, fallback: current })
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
    hasAttemptedRemoteLoad = true
    if (deleted) {
      removeRecord(tournamentId)
    }
    return deleted
  } catch (cause) {
    if (!isFallbackableError(cause)) {
      error.value = getApiErrorMessage(cause, 'Failed to delete tournament.')
      throw cause
    }

    mode.value = 'mock'
    return removeRecord(tournamentId)
  } finally {
    isSaving.value = false
  }
}

async function archiveTournament(id) {
  try {
    const archived = await apiArchiveTournament(id)
    mode.value = 'remote'
    hasAttemptedRemoteLoad = true
    if (archived) {
      removeRecord(id)
    }
    return archived
  } catch (cause) {
    if (!isFallbackableError(cause)) {
      error.value = getApiErrorMessage(cause, 'Failed to archive tournament.')
      throw cause
    }

    return deleteTournament(id)
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
  return cloneTournamentRecord(updated)
}

function getTournamentById(id) {
  const index = findRecordIndex(id)
  return index >= 0 ? cloneTournamentRecord(records.value[index]) : null
}

const tournaments = computed(() => records.value.map((record) => cloneTournamentRecord(record)))

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
  }
}
