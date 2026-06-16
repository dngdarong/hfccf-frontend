<script setup>
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentMatchEventForm',
})

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  eventTypes: {
    type: Array,
    default: () => [],
  },
  sideOptions: {
    type: Array,
    default: () => [],
  },
  teamOptions: {
    type: Array,
    default: () => [],
  },
  validation: {
    type: Object,
    default: () => ({
      valid: true,
      issues: [],
    }),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'add', 'reset'])
const { t } = useLanguage()

const draft = computed({
  get: () => ({
    type: 'goal',
    side: 'home',
    minute: 1,
    stoppageMinute: 0,
    teamId: '',
    playerName: '',
    assistPlayerName: '',
    playerOutName: '',
    playerInName: '',
    description: '',
    ...props.modelValue,
  }),
  set: (value) => emit('update:modelValue', value),
})

const issueMessages = computed(() =>
  (Array.isArray(props.validation?.issues) ? props.validation.issues : []).map((issue) => {
    const key = `sportTournament.results.eventValidation.${String(issue?.code || '').trim()}`
    return t(key)
  }),
)

const showAssistField = computed(() => ['goal', 'penalty_goal'].includes(String(draft.value.type || '').trim()))
const showPlayerField = computed(() => ['goal', 'penalty_goal', 'own_goal', 'yellow_card', 'red_card'].includes(String(draft.value.type || '').trim()))
const showSubstitutionFields = computed(() => String(draft.value.type || '').trim() === 'substitution')

function updatePatch(patch = {}) {
  emit('update:modelValue', {
    ...draft.value,
    ...patch,
  })
}
</script>

<template>
  <section class="match-event-form">
    <div class="match-event-form__head">
      <div>
        <h3>{{ t('sportTournament.results.eventForm.title') }}</h3>
        <p>{{ t('sportTournament.results.eventForm.subtitle') }}</p>
      </div>
    </div>

    <div class="match-event-form__grid">
      <div class="match-event-form__field">
        <span>{{ t('sportTournament.results.eventForm.type') }}</span>
        <Select
          :model-value="draft.type"
          :options="eventTypes"
          option-label="label"
          option-value="value"
          append-to="self"
          :disabled="disabled"
          @update:modelValue="updatePatch({ type: $event })"
        />
      </div>

      <div class="match-event-form__field">
        <span>{{ t('sportTournament.results.eventForm.side') }}</span>
        <Select
          :model-value="draft.side"
          :options="sideOptions"
          option-label="label"
          option-value="value"
          append-to="self"
          :disabled="disabled"
          @update:modelValue="updatePatch({ side: $event })"
        />
      </div>

      <div class="match-event-form__field">
        <span>{{ t('sportTournament.results.eventForm.team') }}</span>
        <Select
          :model-value="draft.teamId"
          :options="teamOptions"
          option-label="label"
          option-value="value"
          append-to="self"
          :disabled="disabled"
          @update:modelValue="updatePatch({ teamId: $event })"
        />
      </div>

      <div class="match-event-form__field">
        <span>{{ t('sportTournament.results.eventForm.minute') }}</span>
        <InputNumber
          :model-value="draft.minute"
          :min="0"
          :max="120"
          :disabled="disabled"
          @update:modelValue="updatePatch({ minute: $event })"
        />
      </div>

      <div class="match-event-form__field">
        <span>{{ t('sportTournament.results.eventForm.stoppageMinute') }}</span>
        <InputNumber
          :model-value="draft.stoppageMinute"
          :min="0"
          :disabled="disabled"
          @update:modelValue="updatePatch({ stoppageMinute: $event })"
        />
      </div>

      <div v-if="showPlayerField" class="match-event-form__field">
        <span>{{ t('sportTournament.results.eventForm.playerName') }}</span>
        <InputText
          :model-value="draft.playerName"
          :disabled="disabled"
          @update:modelValue="updatePatch({ playerName: $event })"
        />
      </div>

      <div v-if="showAssistField" class="match-event-form__field">
        <span>{{ t('sportTournament.results.eventForm.assistPlayerName') }}</span>
        <InputText
          :model-value="draft.assistPlayerName"
          :disabled="disabled"
          @update:modelValue="updatePatch({ assistPlayerName: $event })"
        />
      </div>

      <div v-if="showSubstitutionFields" class="match-event-form__field">
        <span>{{ t('sportTournament.results.eventForm.playerOutName') }}</span>
        <InputText
          :model-value="draft.playerOutName"
          :disabled="disabled"
          @update:modelValue="updatePatch({ playerOutName: $event })"
        />
      </div>

      <div v-if="showSubstitutionFields" class="match-event-form__field">
        <span>{{ t('sportTournament.results.eventForm.playerInName') }}</span>
        <InputText
          :model-value="draft.playerInName"
          :disabled="disabled"
          @update:modelValue="updatePatch({ playerInName: $event })"
        />
      </div>

      <div class="match-event-form__field match-event-form__field--full">
        <span>{{ t('sportTournament.results.eventForm.description') }}</span>
        <Textarea
          :model-value="draft.description"
          rows="3"
          auto-resize
          :disabled="disabled"
          @update:modelValue="updatePatch({ description: $event })"
        />
      </div>
    </div>

    <div v-if="issueMessages.length" class="match-event-form__issues">
      <strong>{{ t('sportTournament.results.eventForm.validationTitle') }}</strong>
      <ul>
        <li v-for="(message, index) in issueMessages" :key="`${message}-${index}`">{{ message }}</li>
      </ul>
    </div>

    <div class="match-event-form__actions">
      <Button
        type="button"
        class="rounded-xl"
        severity="success"
        :disabled="disabled || !validation.valid"
        :label="t('sportTournament.results.eventForm.add')"
        @click="emit('add')"
      />
      <Button
        type="button"
        class="rounded-xl"
        outlined
        :disabled="disabled"
        :label="t('sportTournament.results.eventForm.reset')"
        @click="emit('reset')"
      />
    </div>
  </section>
</template>

<style scoped>
.match-event-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
}

.match-event-form__head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.match-event-form__head p {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

.match-event-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.match-event-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.match-event-form__field span {
  color: #475569;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.match-event-form__field :deep(.p-select),
.match-event-form__field :deep(.p-inputnumber),
.match-event-form__field :deep(.p-inputtext),
.match-event-form__field :deep(.p-textarea) {
  width: 100%;
}

.match-event-form__field--full {
  grid-column: 1 / -1;
}

.match-event-form__issues {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(237, 28, 36, 0.25);
  background: rgba(237, 28, 36, 0.06);
}

.match-event-form__issues strong {
  color: #b91c1c;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.match-event-form__issues ul {
  margin: 0;
  padding-left: 1.15rem;
  color: #991b1b;
}

.match-event-form__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .match-event-form__grid {
    grid-template-columns: 1fr;
  }
}
</style>
