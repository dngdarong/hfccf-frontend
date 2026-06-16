<script setup>
import { computed, reactive, watch } from 'vue'
import Button from '@/components/buttons/Button.vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { useLanguage } from '@/composables/useLanguage'
import { MATCH_EVENT_PERIODS, MATCH_EVENT_TYPES, normalizeMatchEventType } from '@/modules/sport/constants/matchEvent'
import { useMatchSubstitutions } from '../composables/useMatchSubstitutions'

defineOptions({
  name: 'MatchEventForm',
})

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  match: {
    type: Object,
    default: () => null,
  },
  squads: {
    type: Array,
    default: () => [],
  },
  existingEvents: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])
const { t } = useLanguage()
const { validateSubstitution } = useMatchSubstitutions(computed(() => props.existingEvents))

function defaultTeamId() {
  return props.match?.homeTeamId || props.match?.home_team_id || ''
}

function createDraftEvent(value = {}) {
  return {
    id: value.id || '',
    eventType: normalizeMatchEventType(value.eventType || value.event_type || MATCH_EVENT_TYPES.GOAL),
    teamId: value.teamId || value.team_id || defaultTeamId(),
    squadId: value.squadId || value.squad_id || '',
    squadPlayerId: value.squadPlayerId || value.squad_player_id || '',
    assistPlayerId: value.assistPlayerId || value.assist_player_id || '',
    relatedSquadPlayerId: value.relatedSquadPlayerId || value.related_squad_player_id || '',
    minute: Number(value.minute || 0),
    stoppageMinute: Number(value.stoppageMinute || value.stoppage_minute || 0),
    period: String(value.period || MATCH_EVENT_PERIODS.FIRST_HALF),
    notes: String(value.notes || value.description || ''),
  }
}

const form = reactive(createDraftEvent(props.modelValue))

watch(
  () => props.modelValue,
  (value) => {
    Object.assign(form, createDraftEvent(value))
  },
  { deep: true },
)

const teamOptions = computed(() => [
  buildTeamOption(props.match?.homeTeamData || props.match?.homeTeam || props.match?.home_team || props.match?.homeTeamName, props.match?.homeTeamId || props.match?.home_team_id || '', t('sportMatchesManagement.resultsEntry.fixture.home')),
  buildTeamOption(props.match?.awayTeamData || props.match?.awayTeam || props.match?.away_team || props.match?.awayTeamName, props.match?.awayTeamId || props.match?.away_team_id || '', t('sportMatchesManagement.resultsEntry.fixture.away')),
].filter(Boolean))

const eventTypeOptions = computed(() => [
  MATCH_EVENT_TYPES.GOAL,
  MATCH_EVENT_TYPES.ASSIST,
  MATCH_EVENT_TYPES.YELLOW_CARD,
  MATCH_EVENT_TYPES.RED_CARD,
  MATCH_EVENT_TYPES.SUBSTITUTION_OUT,
  MATCH_EVENT_TYPES.SUBSTITUTION_IN,
  MATCH_EVENT_TYPES.INJURY,
  MATCH_EVENT_TYPES.PENALTY_GOAL,
  MATCH_EVENT_TYPES.PENALTY_MISS,
  MATCH_EVENT_TYPES.OWN_GOAL,
  MATCH_EVENT_TYPES.EXTRA_TIME_GOAL,
].map((value) => ({
  value,
  label: t(`sportMatchesManagement.resultsEntry.events.types.${value}`),
})))

const periodOptions = computed(() => [
  MATCH_EVENT_PERIODS.FIRST_HALF,
  MATCH_EVENT_PERIODS.HALFTIME,
  MATCH_EVENT_PERIODS.SECOND_HALF,
  MATCH_EVENT_PERIODS.EXTRA_TIME,
  MATCH_EVENT_PERIODS.PENALTY_SHOOTOUT,
  MATCH_EVENT_PERIODS.FINAL,
].map((value) => ({
  value,
  label: t(`sportMatchesManagement.resultsEntry.events.periods.${value}`),
})))

const selectedTeamSquad = computed(() => {
  const teamId = String(form.teamId || '')
  return props.squads.find((squad) => String(squad.teamId || squad.team_id || '') === teamId) || null
})

const playerOptions = computed(() => {
  const players = Array.isArray(selectedTeamSquad.value?.players) ? selectedTeamSquad.value.players : []
  return players.map((player) => ({
    value: player.id,
    label: player.playerNameSnapshot || player.player?.name || player.playerName || player.name || '',
    player,
  }))
})

const assistPlayerOptions = computed(() => {
  const currentPlayerId = String(form.squadPlayerId || '')
  return playerOptions.value.filter((option) => String(option.value || '') !== currentPlayerId)
})

const relatedPlayerOptions = computed(() => {
  const currentPlayerId = String(form.squadPlayerId || '')
  return playerOptions.value.filter((option) => String(option.value || '') !== currentPlayerId)
})

const showAssistPlayer = computed(() => {
  const type = normalizeMatchEventType(form.eventType)
  return [MATCH_EVENT_TYPES.GOAL, MATCH_EVENT_TYPES.PENALTY_GOAL, MATCH_EVENT_TYPES.EXTRA_TIME_GOAL, MATCH_EVENT_TYPES.ASSIST].includes(type)
})

const isSubstitution = computed(() => {
  const type = normalizeMatchEventType(form.eventType)
  return type === MATCH_EVENT_TYPES.SUBSTITUTION_IN || type === MATCH_EVENT_TYPES.SUBSTITUTION_OUT
})

function buildTeamOption(team, id, fallbackLabel) {
  if (!id && !team) return null
  return {
    value: id,
    label: team?.name || team?.fullName || team?.teamName || team || fallbackLabel,
  }
}

function snapshotPlayer(playerOption) {
  const player = playerOption?.player || {}
  return {
    playerNameSnapshot: playerOption?.label || player.playerNameSnapshot || player.player?.name || '',
    jerseyNumberSnapshot: player?.jerseyNumberSnapshot ?? player?.jersey_number_snapshot ?? player?.player?.jerseyNumber ?? null,
    positionSnapshot: player?.positionSnapshot || player?.player?.position || '',
  }
}

function onTeamChange(teamId) {
  form.teamId = teamId
  form.squadId = selectedTeamSquad.value?.id || ''
  form.squadPlayerId = ''
  form.assistPlayerId = ''
  form.relatedSquadPlayerId = ''
}

function onPlayerChange(playerId) {
  form.squadPlayerId = playerId
  form.assistPlayerId = ''
  form.relatedSquadPlayerId = ''
}

function onSubmit() {
  const currentSquad = selectedTeamSquad.value
  const selectedPlayer = playerOptions.value.find((option) => String(option.value) === String(form.squadPlayerId || '')) || null
  const selectedAssistPlayer = playerOptions.value.find((option) => String(option.value) === String(form.assistPlayerId || '')) || null
  const selectedRelatedPlayer = playerOptions.value.find((option) => String(option.value) === String(form.relatedSquadPlayerId || '')) || null

  if (!form.teamId || !currentSquad || !form.squadPlayerId) {
    emit('submit', { error: t('sportMatchesManagement.resultsEntry.events.validation.playerRequired') })
    return
  }

  if (showAssistPlayer.value && form.assistPlayerId && String(form.assistPlayerId) === String(form.squadPlayerId)) {
    emit('submit', { error: t('sportMatchesManagement.resultsEntry.events.validation.assistDifferent') })
    return
  }

  if (isSubstitution.value) {
    const substitutionError = validateSubstitution({
      squadPlayerId: form.squadPlayerId,
      relatedSquadPlayerId: form.relatedSquadPlayerId,
    })

    if (substitutionError) {
      emit('submit', { error: substitutionError })
      return
    }
  }

  const snapshots = snapshotPlayer(selectedPlayer)
  const payload = {
    id: form.id || undefined,
    eventType: form.eventType,
    teamId: form.teamId,
    squadId: currentSquad.id || form.squadId,
    squadPlayerId: form.squadPlayerId,
    assistPlayerId: form.assistPlayerId || '',
    relatedSquadPlayerId: form.relatedSquadPlayerId || '',
    minute: Number(form.minute || 0),
    stoppageMinute: Number(form.stoppageMinute || 0),
    period: form.period,
    side: String(form.teamId) === String(props.match?.awayTeamId || props.match?.away_team_id) ? 'away' : 'home',
    notes: form.notes,
    ...snapshots,
  }

  if (selectedAssistPlayer) {
    payload.assistPlayerName = selectedAssistPlayer.label
  }

  if (selectedRelatedPlayer) {
    payload.relatedPlayerName = selectedRelatedPlayer.label
  }

  emit('submit', payload)
}
</script>

<template>
  <form class="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" @submit.prevent="onSubmit">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-lg font-black text-slate-900">{{ t('sportMatchesManagement.resultsEntry.events.formTitle') }}</h3>
        <p class="text-sm text-slate-500">{{ t('sportMatchesManagement.resultsEntry.events.formSubtitle') }}</p>
      </div>
      <Button type="button" variant="ghost" size="sm" rounded="full" :disabled="readonly" @click="$emit('cancel')">
        {{ t('common.cancel') }}
      </Button>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div class="grid gap-2">
        <label class="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{{ t('sportMatchesManagement.resultsEntry.events.team') }}</label>
        <Select
          :model-value="form.teamId"
          :options="teamOptions"
          option-label="label"
          option-value="value"
          :disabled="readonly"
          :placeholder="t('sportMatchesManagement.resultsEntry.events.teamPlaceholder')"
          @update:model-value="onTeamChange"
        />
      </div>

      <div class="grid gap-2">
        <label class="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{{ t('sportMatchesManagement.resultsEntry.events.eventType') }}</label>
        <Select
          v-model="form.eventType"
          :options="eventTypeOptions"
          option-label="label"
          option-value="value"
          :disabled="readonly"
          :placeholder="t('sportMatchesManagement.resultsEntry.events.typePlaceholder')"
        />
      </div>

      <div class="grid gap-2">
        <label class="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{{ t('sportMatchesManagement.resultsEntry.events.period') }}</label>
        <Select
          v-model="form.period"
          :options="periodOptions"
          option-label="label"
          option-value="value"
          :disabled="readonly"
        />
      </div>

      <div class="grid gap-2">
        <label class="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{{ t('sportMatchesManagement.resultsEntry.events.player') }}</label>
        <Select
          :model-value="form.squadPlayerId"
          :options="playerOptions"
          option-label="label"
          option-value="value"
          :disabled="readonly || !playerOptions.length"
          :placeholder="t('sportMatchesManagement.resultsEntry.events.playerPlaceholder')"
          @update:model-value="onPlayerChange"
        />
      </div>

      <div v-if="showAssistPlayer" class="grid gap-2">
        <label class="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{{ t('sportMatchesManagement.resultsEntry.events.assistPlayer') }}</label>
        <Select
          v-model="form.assistPlayerId"
          :options="assistPlayerOptions"
          option-label="label"
          option-value="value"
          :disabled="readonly || !assistPlayerOptions.length"
          :placeholder="t('sportMatchesManagement.resultsEntry.events.assistPlayerPlaceholder')"
        />
      </div>

      <div v-if="isSubstitution" class="grid gap-2">
        <label class="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{{ t('sportMatchesManagement.resultsEntry.events.relatedPlayer') }}</label>
        <Select
          v-model="form.relatedSquadPlayerId"
          :options="relatedPlayerOptions"
          option-label="label"
          option-value="value"
          :disabled="readonly || !relatedPlayerOptions.length"
          :placeholder="t('sportMatchesManagement.resultsEntry.events.relatedPlayerPlaceholder')"
        />
      </div>

      <div class="grid gap-2">
        <label class="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{{ t('sportMatchesManagement.resultsEntry.events.minute') }}</label>
        <InputText v-model="form.minute" :disabled="readonly" type="number" min="0" max="120" />
      </div>

      <div class="grid gap-2">
        <label class="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{{ t('sportMatchesManagement.resultsEntry.events.stoppageMinute') }}</label>
        <InputText v-model="form.stoppageMinute" :disabled="readonly" type="number" min="0" max="20" />
      </div>

      <div class="grid gap-2 md:col-span-2 xl:col-span-3">
        <label class="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{{ t('sportMatchesManagement.resultsEntry.events.notes') }}</label>
        <Textarea v-model="form.notes" :disabled="readonly" rows="3" auto-resize />
      </div>
    </div>

    <div class="flex items-center justify-end gap-2">
      <Button type="submit" variant="solid" size="md" :loading="loading" :disabled="readonly || loading">
        {{ form.id ? t('sportMatchesManagement.resultsEntry.events.updateEvent') : t('sportMatchesManagement.resultsEntry.events.addEvent') }}
      </Button>
    </div>
  </form>
</template>