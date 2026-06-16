import { computed, ref, watch } from 'vue'
import { getApiErrorMessage } from '@/services/api'
import { createTournamentGroupDrawDraft, normalizeTournamentGroupDraw } from '../mocks/tournaments.mock'
import { useTournamentGroupDraw } from './useTournamentGroupDraw'
import {
  drawTournamentGroups as apiDrawTournamentGroups,
  finalizeTournamentGroups as apiFinalizeTournamentGroups,
  getTournamentGroups as apiGetTournamentGroups,
} from '../api/groupApi'
import { buildTournamentGroupsDrawPayload, mergeTournamentGroupSnapshot } from '../api/groupMappers'

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

function isFallbackableError(error) {
  const status = Number(error?.status || error?.response?.status || 0)
  return Boolean(error?.isNetworkError || error?.code === 'NETWORK_ERROR' || status === 0 || status === 404 || status >= 500)
}

function normalizeLocalGroupDraw(tournament) {
  return normalizeTournamentGroupDraw(tournament?.groupDraw || createTournamentGroupDrawDraft(), tournament || {})
}

function buildMergedTournament(baseTournament, groupDraw) {
  const source = baseTournament ? deepClone(baseTournament) : null
  if (!source) return null

  return mergeTournamentGroupSnapshot(source, groupDraw || normalizeLocalGroupDraw(source))
}

export function useTournamentGroups(tournament, actions = {}) {
  const baseTournament = computed(() => tournament?.value || tournament || null)
  const syncedTournament = ref(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref('')
  const hasLoadedGroups = ref(false)

  const activeTournament = computed(() => syncedTournament.value || baseTournament.value || null)

  const drawEngine = useTournamentGroupDraw(activeTournament, {
    // The groups page persists through the backend API below; the local
    // callbacks only keep the existing mock fallback behavior intact.
    updateTournament: (id, nextState) => {
      if (!activeTournament.value?.id || String(activeTournament.value.id) !== String(id)) {
        return null
      }

      const nextTournament = deepClone(activeTournament.value)
      nextTournament.state = nextState
      nextTournament.status = nextState
      syncedTournament.value = nextTournament
      return deepClone(nextTournament)
    },
    transitionTournament: (id, nextState) => {
      if (!activeTournament.value?.id || String(activeTournament.value.id) !== String(id)) {
        return null
      }

      const nextTournament = deepClone(activeTournament.value)
      nextTournament.state = nextState
      nextTournament.status = nextState
      syncedTournament.value = nextTournament
      return deepClone(nextTournament)
    },
  })

  watch(
    baseTournament,
    (nextTournament) => {
      if (!nextTournament?.id) {
        syncedTournament.value = null
        return
      }

      // Keep the latest tournament payload but preserve the last known group
      // draft snapshot so backend group state does not get lost when the CRUD
      // layer rehydrates the tournament record.
      const currentGroupDraw = syncedTournament.value?.groupDraw || nextTournament.groupDraw || createTournamentGroupDrawDraft()
      syncedTournament.value = buildMergedTournament(nextTournament, currentGroupDraw)
    },
    { immediate: true, deep: true },
  )

  function setSyncedTournament(nextTournament, groupDraw = null) {
    if (!nextTournament?.id) {
      syncedTournament.value = null
      return null
    }

    syncedTournament.value = buildMergedTournament(nextTournament, groupDraw)
    return deepClone(syncedTournament.value)
  }

  function getFallbackGroupDraw() {
    return normalizeLocalGroupDraw(baseTournament.value || activeTournament.value || {})
  }

  async function loadGroups(options = {}) {
    const tournamentId = String(baseTournament.value?.id || '').trim()
    if (!tournamentId) return null

    isLoading.value = true
    error.value = ''

    try {
      const response = await apiGetTournamentGroups(tournamentId, {
        signal: options.signal,
        fallbackTournament: baseTournament.value || activeTournament.value || null,
      })

      hasLoadedGroups.value = true
      return setSyncedTournament(baseTournament.value || activeTournament.value, response.groupDraw)
    } catch (cause) {
      if (!isFallbackableError(cause)) {
        error.value = getApiErrorMessage(cause, 'Failed to load tournament groups.')
        throw cause
      }

      hasLoadedGroups.value = true
      return setSyncedTournament(baseTournament.value || activeTournament.value, getFallbackGroupDraw())
    } finally {
      isLoading.value = false
    }
  }

  async function persistGroups({ finalize = false } = {}) {
    const tournamentId = String(baseTournament.value?.id || '').trim()
    if (!tournamentId) return null

    isSaving.value = true
    error.value = ''

    try {
      const drawPayload = buildTournamentGroupsDrawPayload({
        settings: drawEngine.settings,
        groups: drawEngine.groups.value,
        reset: true,
      })

      const drawResponse = await apiDrawTournamentGroups(tournamentId, drawPayload, {
        fallbackTournament: baseTournament.value || activeTournament.value || null,
      })

      const tournamentRecord = typeof actions.loadTournament === 'function'
        ? await actions.loadTournament(tournamentId).catch((loadError) => {
          if (!isFallbackableError(loadError)) {
            throw loadError
          }

          return baseTournament.value || activeTournament.value || null
        })
        : baseTournament.value || activeTournament.value || null

      const synced = setSyncedTournament(tournamentRecord, {
        ...drawResponse.groupDraw,
        mode: drawEngine.mode.value,
        lastGeneratedAt: drawEngine.lastGeneratedAt.value || drawResponse.groupDraw?.lastGeneratedAt || new Date().toISOString(),
      })

      if (!finalize) {
        return synced
      }

      const finalizeResponse = await apiFinalizeTournamentGroups(tournamentId, {
        fallbackTournament: tournamentRecord || baseTournament.value || activeTournament.value || null,
      })

      const refreshedTournament = typeof actions.loadTournament === 'function'
        ? await actions.loadTournament(tournamentId).catch((loadError) => {
          if (!isFallbackableError(loadError)) {
            throw loadError
          }

          return tournamentRecord || baseTournament.value || activeTournament.value || null
        })
        : tournamentRecord || baseTournament.value || activeTournament.value || null

      return setSyncedTournament(refreshedTournament || tournamentRecord || baseTournament.value || activeTournament.value || null, {
        ...finalizeResponse.groupDraw,
        mode: drawEngine.mode.value,
        locked: true,
        lastGeneratedAt: drawEngine.lastGeneratedAt.value || finalizeResponse.groupDraw?.lastGeneratedAt || new Date().toISOString(),
      })
    } catch (cause) {
      if (!isFallbackableError(cause)) {
        error.value = getApiErrorMessage(cause, 'Failed to save tournament groups.')
        throw cause
      }

      const fallbackTournament = baseTournament.value || activeTournament.value || null
      const fallbackGroupDraw = {
        ...normalizeLocalGroupDraw(fallbackTournament || {}),
        mode: drawEngine.mode.value,
        locked: Boolean(finalize),
        lastGeneratedAt: drawEngine.lastGeneratedAt.value || new Date().toISOString(),
        groups: deepClone(drawEngine.groups.value),
      }

      if (finalize && typeof actions.transitionTournament === 'function' && tournamentId) {
        actions.transitionTournament(tournamentId, 'group_draw_completed')
      }

      hasLoadedGroups.value = true
      return setSyncedTournament(fallbackTournament, fallbackGroupDraw)
    } finally {
      isSaving.value = false
    }
  }

  async function applyPreview() {
    const applied = drawEngine.applyPreview()
    if (!applied) return null

    return persistGroups()
  }

  async function saveDraft() {
    return persistGroups()
  }

  async function finalizeGroups() {
    return persistGroups({ finalize: true })
  }

  function resetDraft() {
    drawEngine.resetDraft()
    const fallbackTournament = baseTournament.value || activeTournament.value || null
    syncedTournament.value = fallbackTournament ? buildMergedTournament(fallbackTournament, fallbackTournament.groupDraw) : null
  }

  return {
    tournament: computed(() => syncedTournament.value || baseTournament.value || null),
    settings: drawEngine.settings,
    mode: drawEngine.mode,
    groups: drawEngine.groups,
    previewVisible: drawEngine.previewVisible,
    previewGroups: drawEngine.previewGroups,
    previewSummary: drawEngine.previewSummary,
    previewWarnings: drawEngine.previewWarnings,
    lastGeneratedAt: drawEngine.lastGeneratedAt,
    initialSnapshot: drawEngine.initialSnapshot,
    teams: drawEngine.teams,
    state: drawEngine.state,
    groupOptions: drawEngine.groupOptions,
    resolvedGroups: drawEngine.resolvedGroups,
    resolvedPreviewGroups: drawEngine.resolvedPreviewGroups,
    seedTeams: drawEngine.seedTeams,
    unassignedTeams: drawEngine.unassignedTeams,
    summary: drawEngine.summary,
    issues: drawEngine.issues,
    canEdit: drawEngine.canEdit,
    canFinalize: drawEngine.canFinalize,
    updateSettings: drawEngine.updateSettings,
    rebuildGroups: drawEngine.rebuildGroups,
    previewAutomaticDraw: drawEngine.previewAutomaticDraw,
    applyPreview,
    assignTeamToGroup: drawEngine.assignTeamToGroup,
    removeTeamFromGroup: drawEngine.removeTeamFromGroup,
    resetDraft,
    saveDraft,
    finalizeGroups,
    loadGroups,
    isLoading,
    isSaving,
    error,
    hasLoadedGroups,
  }
}
