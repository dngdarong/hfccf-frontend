import { computed, ref, watch } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import {
  createKnockoutBracket,
  createKnockoutMatchDraft,
  findKnockoutMatchById,
  flattenKnockoutMatches,
  rebuildKnockoutProgression,
  summarizeKnockoutBracket,
  updateKnockoutMatchResult,
} from './useTournamentBracket'
import { createKnockoutSettingsSnapshot, useTournamentQualification } from './useTournamentQualification'
import { normalizeTournamentState } from './useTournamentStateMachine'
import { generateTournamentKnockout, updateTournamentResult } from '../api/tournamentApi'

function clone(value) {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch {
      return JSON.parse(JSON.stringify(value))
    }
  }

  return JSON.parse(JSON.stringify(value))
}

function normalizeText(value) {
  return String(value || '').trim()
}

export function useTournamentKnockout(tournament, actions = {}) {
  const { t } = useLanguage()
  const settings = ref(createKnockoutSettingsSnapshot(tournament?.value?.knockoutSettings || tournament?.value?.knockout?.settings || {}))
  const previewBracket = ref(null)
  const previewVisible = ref(false)
  const selectedMatchId = ref('')
  const resultDraft = ref(createKnockoutMatchDraft())
  const isGenerating = ref(false)
  const isSaving = ref(false)

  const qualification = useTournamentQualification(tournament, settings)

  const currentTournament = computed(() => tournament?.value || {})
  const tournamentState = computed(() => normalizeTournamentState(currentTournament.value.state))
  const bracket = computed(() => previewVisible.value && previewBracket.value ? previewBracket.value : currentTournament.value?.knockout?.bracket || null)
  const bracketSummary = computed(() => summarizeKnockoutBracket(bracket.value || {}))
  const qualifiers = computed(() => qualification.qualifiers.value)
  const validation = computed(() => {
    const issues = [...qualification.validation.value.issues]

    if (['completed', 'archived'].includes(tournamentState.value)) {
      issues.push({ code: 'tournamentLocked' })
    }

    if (!['active', 'knockout_stage'].includes(tournamentState.value) && !bracket.value) {
      issues.push({ code: 'stateNotReady' })
    }

    return {
      ready: issues.length === 0,
      issues,
    }
  })

  const statusOptions = computed(() => [
    { label: t('sportTournament.matchStatuses.scheduled'), value: 'scheduled' },
    { label: t('sportTournament.matchStatuses.live'), value: 'live' },
    { label: t('sportTournament.matchStatuses.completed'), value: 'completed' },
    { label: t('sportTournament.matchStatuses.postponed'), value: 'postponed' },
    { label: t('sportTournament.matchStatuses.cancelled'), value: 'cancelled' },
  ])
  const selectedMatch = computed(() => findKnockoutMatchById(bracket.value || {}, selectedMatchId.value) || flattenKnockoutMatches(bracket.value || {})[0] || null)
  const champion = computed(() => bracket.value?.champion || currentTournament.value?.knockout?.champion || null)
  const canEdit = computed(() => ['active', 'knockout_stage'].includes(tournamentState.value))
  const canGenerateBracket = computed(() => canEdit.value && qualification.validation.value.ready && qualification.bracketSize.value > 0)

  watch(
    () => bracket.value,
    (nextBracket) => {
      const matches = flattenKnockoutMatches(nextBracket || {})
      if (!matches.length) {
        selectedMatchId.value = ''
        return
      }

      const currentMatch = matches.find((match) => match.id === selectedMatchId.value)
      if (!currentMatch) {
        const firstScheduled = matches.find((match) => match.status !== 'completed') || matches[0]
        selectedMatchId.value = firstScheduled?.id || ''
      }
    },
    { immediate: true, deep: true },
  )

  watch(
    selectedMatch,
    (nextMatch) => {
      resultDraft.value = createKnockoutMatchDraft(nextMatch || {})
    },
    { immediate: true, deep: true },
  )

  watch(
    () => currentTournament.value?.knockoutSettings,
    (nextSettings) => {
      settings.value = createKnockoutSettingsSnapshot(nextSettings || {})
      if (!previewVisible.value) {
        previewBracket.value = null
      }
    },
    { immediate: true, deep: true },
  )

  function updateSettings(patch = {}) {
    settings.value = createKnockoutSettingsSnapshot({
      ...settings.value,
      ...patch,
    })
  }

  function selectMatch(matchId) {
    const normalizedId = normalizeText(matchId)
    if (!normalizedId) return

    selectedMatchId.value = normalizedId
  }

  function updateDraft(patch = {}) {
    resultDraft.value = {
      ...resultDraft.value,
      ...patch,
      status: patch.status ? patch.status : resultDraft.value.status,
      homeScore: Object.prototype.hasOwnProperty.call(patch, 'homeScore') ? patch.homeScore : resultDraft.value.homeScore,
      awayScore: Object.prototype.hasOwnProperty.call(patch, 'awayScore') ? patch.awayScore : resultDraft.value.awayScore,
      extraTimeHomeScore: Object.prototype.hasOwnProperty.call(patch, 'extraTimeHomeScore') ? patch.extraTimeHomeScore : resultDraft.value.extraTimeHomeScore,
      extraTimeAwayScore: Object.prototype.hasOwnProperty.call(patch, 'extraTimeAwayScore') ? patch.extraTimeAwayScore : resultDraft.value.extraTimeAwayScore,
      penaltyHomeScore: Object.prototype.hasOwnProperty.call(patch, 'penaltyHomeScore') ? patch.penaltyHomeScore : resultDraft.value.penaltyHomeScore,
      penaltyAwayScore: Object.prototype.hasOwnProperty.call(patch, 'penaltyAwayScore') ? patch.penaltyAwayScore : resultDraft.value.penaltyAwayScore,
      notes: Object.prototype.hasOwnProperty.call(patch, 'notes') ? patch.notes : resultDraft.value.notes,
      venue: Object.prototype.hasOwnProperty.call(patch, 'venue') ? patch.venue : resultDraft.value.venue,
      dateTime: Object.prototype.hasOwnProperty.call(patch, 'dateTime') ? patch.dateTime : resultDraft.value.dateTime,
    }
  }

  function generatePreview() {
    if (!canGenerateBracket.value) {
      return null
    }

    const result = createKnockoutBracket({
      tournamentId: currentTournament.value.id,
      qualifiers: qualifiers.value,
      settings: settings.value,
    })

    if (!result.valid || !result.bracket) {
      previewBracket.value = null
      previewVisible.value = false
      return result
    }

    previewBracket.value = result.bracket
    previewVisible.value = true
    selectedMatchId.value = flattenKnockoutMatches(result.bracket)[0]?.id || ''

    return result
  }

  async function applyPreview() {
    if (isGenerating.value) return null
    if (!previewVisible.value || !previewBracket.value || typeof actions.reloadTournament !== 'function' || !currentTournament.value?.id) {
      return null
    }
    isGenerating.value = true
    try {
      await generateTournamentKnockout(currentTournament.value.id, { replace: true })
      await actions.reloadTournament()
    } finally {
      isGenerating.value = false
    }
    const nextBracket = rebuildKnockoutProgression(clone(previewBracket.value), settings.value)

    previewVisible.value = false
    previewBracket.value = null
    selectedMatchId.value = flattenKnockoutMatches(nextBracket)[0]?.id || ''

    return { id: currentTournament.value.id }
  }

  async function saveMatchResult(patch = {}) {
    if (isSaving.value) return null
    if (!selectedMatch.value || !currentTournament.value?.id || typeof actions.reloadTournament !== 'function') {
      return null
    }

    const nextPatch = {
      ...resultDraft.value,
      ...patch,
    }
    const outcome = updateKnockoutMatchResult(bracket.value || {}, selectedMatch.value.id, nextPatch, settings.value)
    if (outcome.issue || !outcome.bracket) {
      return outcome
    }

    isSaving.value = true
    try {
      await updateTournamentResult(currentTournament.value.id, selectedMatch.value.id, {
        homeScore: nextPatch.homeScore,
        awayScore: nextPatch.awayScore,
        extraTimeHomeScore: nextPatch.extraTimeHomeScore,
        extraTimeAwayScore: nextPatch.extraTimeAwayScore,
        penaltyHomeScore: nextPatch.penaltyHomeScore,
        penaltyAwayScore: nextPatch.penaltyAwayScore,
        winnerTeamId: nextPatch.winnerTeamId,
        status: nextPatch.status,
        notes: nextPatch.notes,
      })
      await actions.reloadTournament()
      return { id: currentTournament.value.id }
    } finally {
      isSaving.value = false
    }
  }

  function resetKnockout() {
    if (!currentTournament.value?.knockout?.bracket) {
      previewVisible.value = false
      previewBracket.value = null
      return false
    }

    previewVisible.value = false
    previewBracket.value = null
    settings.value = createKnockoutSettingsSnapshot(currentTournament.value.knockoutSettings || currentTournament.value.knockout.settings || {})
    selectedMatchId.value = flattenKnockoutMatches(currentTournament.value.knockout.bracket)[0]?.id || ''
    return true
  }

  return {
    settings,
    qualification,
    validation,
    qualifiers,
    bracket,
    bracketSummary,
    champion,
    selectedMatchId,
    selectedMatch,
    statusOptions,
    previewBracket,
    previewVisible,
    canEdit,
    canGenerateBracket,
    updateSettings,
    generatePreview,
    applyPreview,
    saveMatchResult,
    selectMatch,
    updateDraft,
    resultDraft,
    resetKnockout,
    createKnockoutMatchDraft,
    isGenerating,
    isSaving,
  }
}
