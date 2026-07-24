<script setup>
import Button from '@/components/buttons/Button.vue'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentResultEntryForm',
})

const props = defineProps({
  fixture: {
    type: Object,
    default: () => ({}),
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'reset'])
const { t } = useLanguage()

const draft = computed({
  get: () => {
    const base = {
      status: 'scheduled',
      score: { home: null, away: null },
      venue: '',
      dateTime: '',
      notes: '',
      ...props.modelValue,
    }

    return {
      ...base,
      score: {
        home: props.modelValue?.score?.home ?? null,
        away: props.modelValue?.score?.away ?? null,
      },
    }
  },
  set: (value) => emit('update:modelValue', value),
})

function updatePatch(patch = {}) {
  emit('update:modelValue', {
    ...draft.value,
    ...patch,
    score: patch.score
      ? {
          home: patch.score.home ?? null,
          away: patch.score.away ?? null,
        }
      : draft.value.score,
  })
}
</script>

<template>
  <section class="result-form">
    <div class="result-form__head">
      <div>
        <h3>{{ t('sportTournament.results.entry.title') }}</h3>
        <p>{{ t('sportTournament.results.entry.subtitle') }}</p>
      </div>
    </div>

    <div class="result-form__grid">
      <div class="result-form__field">
        <span>{{ t('sportTournament.results.labels.status') }}</span>
        <Select
          :model-value="draft.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          append-to="self"
          @update:modelValue="updatePatch({ status: $event })"
        />
      </div>

      <div class="result-form__field">
        <span>{{ t('sportTournament.results.labels.homeScore') }}</span>
        <InputNumber
          :model-value="draft.score.home"
          :min="0"
          @update:modelValue="updatePatch({ score: { ...draft.score, home: $event } })"
        />
      </div>

      <div class="result-form__field">
        <span>{{ t('sportTournament.results.labels.awayScore') }}</span>
        <InputNumber
          :model-value="draft.score.away"
          :min="0"
          @update:modelValue="updatePatch({ score: { ...draft.score, away: $event } })"
        />
      </div>

      <div class="result-form__field">
        <span>{{ t('sportTournament.results.labels.venue') }}</span>
        <InputText :model-value="draft.venue" @update:modelValue="updatePatch({ venue: $event })" />
      </div>

      <div class="result-form__field">
        <span>{{ t('sportTournament.results.labels.dateTime') }}</span>
        <InputText :model-value="draft.dateTime" @update:modelValue="updatePatch({ dateTime: $event })" />
      </div>

      <div class="result-form__field result-form__field--full">
        <span>{{ t('sportTournament.results.labels.notes') }}</span>
        <Textarea :model-value="draft.notes" rows="4" auto-resize @update:modelValue="updatePatch({ notes: $event })" />
      </div>
    </div>

    <div class="result-form__actions">
      <Button
        type="button"
        class="rounded-xl"
        severity="success"
        :disabled="disabled"
        :label="t('sportTournament.results.actions.saveResult')"
        @click="emit('save')"
      />
      <Button
        type="button"
        class="rounded-xl"
        outlined
        :disabled="disabled"
        :label="t('sportTournament.results.actions.reset')"
        @click="emit('reset')"
      />
    </div>
  </section>
</template>

<style scoped>
.result-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
}

.result-form__head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.result-form__head p {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

.result-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.result-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.result-form__field span {
  color: #475569;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.result-form__field :deep(.p-select) {
  width: 100%;
}

.result-form__field--full {
  grid-column: 1 / -1;
}

.result-form__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .result-form__grid {
    grid-template-columns: 1fr;
  }
}
</style>

