<script setup>
/**
 * ResultEntryPanel
 * Reusable stateful container for match result entry workflows.
 *
 * Contract:
 * - Receives `modelValue` as initial/current result data.
 * - Owns a local copy so child components never mutate props.
 * - Emits `update:modelValue`, granular `field-update`, and `save`.
 */
import { computed, reactive, watch } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import GoalEventsEditor from '@/modules/sport/admin/components/match-results/GoalEventsEditor.vue'
import MatchResultActions from '@/modules/sport/admin/components/match-results/MatchResultActions.vue'
import MatchResultFields from '@/modules/sport/admin/components/match-results/MatchResultFields.vue'

defineOptions({
  name: 'ResultEntryPanel',
})

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'field-update', 'save', 'cancel'])
const { t } = useLanguage()

const form = reactive(createResultValue(props.modelValue))

const fieldLabels = computed(() => ({
  homeTeam: t('sportMatchesManagement.homeTeamLabel'),
  awayTeam: t('sportMatchesManagement.awayTeamLabel'),
  homeScore: t('sportMatchesManagement.resultsEntry.homeScore'),
  awayScore: t('sportMatchesManagement.resultsEntry.awayScore'),
  resultStatus: t('sportMatchesManagement.resultsEntry.resultStatus'),
  report: t('sportMatchesManagement.resultsEntry.report'),
}))
const fieldPlaceholders = computed(() => ({
  report: t('sportMatchesManagement.resultsEntry.reportPlaceholder'),
}))
const goalEventLabels = computed(() => ({
  title: t('sportMatchesManagement.resultsEntry.goalEvents.title'),
  description: t('sportMatchesManagement.resultsEntry.goalEvents.description'),
  add: t('sportMatchesManagement.resultsEntry.goalEvents.add'),
  empty: t('sportMatchesManagement.resultsEntry.goalEvents.empty'),
  playerName: t('sportMatchesManagement.resultsEntry.goalEvents.playerName'),
  minute: t('sportMatchesManagement.resultsEntry.goalEvents.minute'),
  goalTypes: t('common.type'),
  remove: t('sportMatchesManagement.resultsEntry.goalEvents.remove'),
}))
const goalEventPlaceholders = computed(() => ({
  playerName: t('sportMatchesManagement.resultsEntry.goalEvents.playerNamePlaceholder'),
  minute: t('sportMatchesManagement.resultsEntry.goalEvents.minutePlaceholder'),
}))

watch(
  () => props.modelValue,
  (value) => {
    Object.assign(form, createResultValue(value))
  },
  { deep: true },
)

function createResultValue(value = {}) {
  return {
    homeTeam: String(value.homeTeam || ''),
    awayTeam: String(value.awayTeam || ''),
    homeScore: Number(value.homeScore || 0),
    awayScore: Number(value.awayScore || 0),
    status: String(value.status || 'completed'),
    report: String(value.report || ''),
    homeEvents: Array.isArray(value.homeEvents)
      ? value.homeEvents.map((event) => normalizeGoalEvent(event))
      : [],
    awayEvents: Array.isArray(value.awayEvents)
      ? value.awayEvents.map((event) => normalizeGoalEvent(event))
      : [],
  }
}

function normalizeGoalEvent(event = {}) {
  return {
    id: event.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    playerName: String(event.playerName || ''),
    minute: String(event.minute || ''),
    goalTypes: Array.isArray(event.goalTypes) ? event.goalTypes : [],
  }
}

function snapshot() {
  return createResultValue(form)
}

function commitPatch(patch) {
  Object.assign(form, patch)
  const nextValue = snapshot()
  emit('update:modelValue', nextValue)

  Object.entries(patch).forEach(([field, value]) => {
    emit('field-update', { field, value, result: nextValue })
  })
}

function commit(field, value) {
  commitPatch({ [field]: value })
}

function addGoalEvent(team) {
  const field = team === 'home' ? 'homeEvents' : 'awayEvents'
  const scoreField = team === 'home' ? 'homeScore' : 'awayScore'
  const event = normalizeGoalEvent()
  const updatedEvents = [...form[field], event]

  // Adding/removing goal rows is score-affecting, so commit the events and score together.
  commitPatch({ [field]: updatedEvents, [scoreField]: updatedEvents.length })
}

function updateGoalEvent(team, updatedEvent) {
  const field = team === 'home' ? 'homeEvents' : 'awayEvents'
  const updatedEvents = form[field].map((event) =>
    event.id === updatedEvent.id ? normalizeGoalEvent(updatedEvent) : event,
  )
  commit(field, updatedEvents)
  // Note: changing player/minute doesn't change score; only adding/removing does.
}

function removeGoalEvent(team, id) {
  const field = team === 'home' ? 'homeEvents' : 'awayEvents'
  const scoreField = team === 'home' ? 'homeScore' : 'awayScore'
  const updatedEvents = form[field].filter((event) => event.id !== id)
  commitPatch({ [field]: updatedEvents, [scoreField]: updatedEvents.length })
}

function onSubmit() {
  emit('save', snapshot())
}
</script>

<template>
  <form class="result-entry-panel" @submit.prevent="onSubmit">
    <MatchResultFields
      :home-team="form.homeTeam"
      :away-team="form.awayTeam"
      :home-score="form.homeScore"
      :away-score="form.awayScore"
      :result-status="form.status"
      :report="form.report"
      :readonly="readonly"
      :status-options="statusOptions"
      :labels="fieldLabels"
      :placeholders="fieldPlaceholders"
      @update:home-score="commit('homeScore', Number($event || 0))"
      @update:away-score="commit('awayScore', Number($event || 0))"
      @update:result-status="commit('status', $event)"
      @update:report="commit('report', $event)"
    />

    <div class="grid gap-4 lg:grid-cols-2">
      <GoalEventsEditor
        :events="form.homeEvents"
        :labels="{ ...goalEventLabels, title: `${goalEventLabels.title} (${form.homeTeam})` }"
        :placeholders="goalEventPlaceholders"
        :readonly="readonly"
        @add="addGoalEvent('home')"
        @update="updateGoalEvent('home', $event)"
        @remove="removeGoalEvent('home', $event)"
      />

      <GoalEventsEditor
        :events="form.awayEvents"
        :labels="{ ...goalEventLabels, title: `${goalEventLabels.title} (${form.awayTeam})` }"
        :placeholders="goalEventPlaceholders"
        :readonly="readonly"
        @add="addGoalEvent('away')"
        @update="updateGoalEvent('away', $event)"
        @remove="removeGoalEvent('away', $event)"
      />
    </div>

    <MatchResultActions
      :loading="loading"
      :cancel-text="t('common.cancel')"
      :submit-text="t('sportMatchesManagement.resultsEntry.saveButton')"
      @cancel="$emit('cancel')"
    />
  </form>
</template>

<style scoped>
.result-entry-panel {
  display: grid;
  gap: 1rem;
}

.result-entry-panel__score-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #ffffff;
  color: #1d1d1b;
}

.result-entry-panel__score-preview span {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.result-entry-panel__score-preview strong {
  color: #00aeef;
  font-size: 1.2rem;
  font-weight: 900;
}

@media (max-width: 720px) {
  .result-entry-panel__score-preview {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
