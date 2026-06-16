<script setup>
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentKnockoutResultForm',
})

const props = defineProps({
  match: {
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
  settings: {
    type: Object,
    default: () => ({}),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'reset'])
const { t } = useLanguage()

const draft = computed(() => ({
  status: 'scheduled',
  homeScore: null,
  awayScore: null,
  extraTimeHomeScore: null,
  extraTimeAwayScore: null,
  penaltyHomeScore: null,
  penaltyAwayScore: null,
  notes: '',
  venue: '',
  dateTime: '',
  ...props.modelValue,
}))

function updateField(field, value) {
  emit('update:modelValue', {
    ...draft.value,
    [field]: value,
  })
}

function fieldDisabled(name) {
  if (props.disabled) return true

  if ((name === 'extraTimeHomeScore' || name === 'extraTimeAwayScore') && !props.settings.extraTimeEnabled) return true
  if ((name === 'penaltyHomeScore' || name === 'penaltyAwayScore') && !props.settings.penaltyEnabled) return true

  return false
}
</script>

<template>
  <section class="knockout-result-form">
    <div class="knockout-result-form__head">
      <div>
        <h3 class="knockout-result-form__title">{{ t('sportTournament.knockout.resultForm.title') }}</h3>
        <p class="knockout-result-form__subtitle">{{ t('sportTournament.knockout.resultForm.subtitle') }}</p>
      </div>
    </div>

    <div v-if="match?.id" class="knockout-result-form__match">
      <strong>{{ match.homeTeamName || t('sportTournament.knockout.match.placeholder') }}</strong>
      <span>{{ t('sportTournament.knockout.resultForm.vs') }}</span>
      <strong>{{ match.awayTeamName || t('sportTournament.knockout.match.placeholder') }}</strong>
    </div>

    <div v-else class="knockout-result-form__empty">
      <p>{{ t('sportTournament.knockout.resultForm.empty') }}</p>
    </div>

    <div class="knockout-result-form__grid">
      <label class="knockout-result-form__field">
        <span>{{ t('sportTournament.knockout.resultForm.status') }}</span>
        <Select
          :model-value="draft.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          append-to="self"
          :disabled="disabled"
          @update:modelValue="updateField('status', $event)"
        />
      </label>

      <label class="knockout-result-form__field">
        <span>{{ t('sportTournament.knockout.resultForm.homeScore') }}</span>
        <InputNumber :model-value="draft.homeScore" :min="0" :disabled="disabled" @update:modelValue="updateField('homeScore', $event)" />
      </label>

      <label class="knockout-result-form__field">
        <span>{{ t('sportTournament.knockout.resultForm.awayScore') }}</span>
        <InputNumber :model-value="draft.awayScore" :min="0" :disabled="disabled" @update:modelValue="updateField('awayScore', $event)" />
      </label>

      <label class="knockout-result-form__field" :class="{ 'knockout-result-form__field--disabled': fieldDisabled('extraTimeHomeScore') }">
        <span>{{ t('sportTournament.knockout.resultForm.extraTimeHomeScore') }}</span>
        <InputNumber
          :model-value="draft.extraTimeHomeScore"
          :min="0"
          :disabled="fieldDisabled('extraTimeHomeScore')"
          @update:modelValue="updateField('extraTimeHomeScore', $event)"
        />
      </label>

      <label class="knockout-result-form__field" :class="{ 'knockout-result-form__field--disabled': fieldDisabled('extraTimeAwayScore') }">
        <span>{{ t('sportTournament.knockout.resultForm.extraTimeAwayScore') }}</span>
        <InputNumber
          :model-value="draft.extraTimeAwayScore"
          :min="0"
          :disabled="fieldDisabled('extraTimeAwayScore')"
          @update:modelValue="updateField('extraTimeAwayScore', $event)"
        />
      </label>

      <label class="knockout-result-form__field" :class="{ 'knockout-result-form__field--disabled': fieldDisabled('penaltyHomeScore') }">
        <span>{{ t('sportTournament.knockout.resultForm.penaltyHomeScore') }}</span>
        <InputNumber
          :model-value="draft.penaltyHomeScore"
          :min="0"
          :disabled="fieldDisabled('penaltyHomeScore')"
          @update:modelValue="updateField('penaltyHomeScore', $event)"
        />
      </label>

      <label class="knockout-result-form__field" :class="{ 'knockout-result-form__field--disabled': fieldDisabled('penaltyAwayScore') }">
        <span>{{ t('sportTournament.knockout.resultForm.penaltyAwayScore') }}</span>
        <InputNumber
          :model-value="draft.penaltyAwayScore"
          :min="0"
          :disabled="fieldDisabled('penaltyAwayScore')"
          @update:modelValue="updateField('penaltyAwayScore', $event)"
        />
      </label>

      <label class="knockout-result-form__field knockout-result-form__field--full">
        <span>{{ t('sportTournament.knockout.resultForm.notes') }}</span>
        <Textarea :model-value="draft.notes" rows="3" auto-resize :disabled="disabled" @update:modelValue="updateField('notes', $event)" />
      </label>
    </div>

    <div class="knockout-result-form__actions">
      <Button type="button" class="rounded-xl" outlined :label="t('common.reset')" :disabled="disabled || !match?.id" @click="emit('reset')" />
      <Button type="button" class="rounded-xl" severity="info" :label="t('sportTournament.knockout.resultForm.save')" :disabled="disabled || !match?.id" @click="emit('save')" />
    </div>
  </section>
</template>

<style scoped>
.knockout-result-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1.35rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(253, 193, 22, 0.08), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 55px -40px rgba(15, 23, 42, 0.45);
}

.knockout-result-form__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.02rem;
  font-weight: 800;
}

.knockout-result-form__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.knockout-result-form__match {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  background: rgba(248, 250, 252, 0.95);
  color: #0f172a;
}

.knockout-result-form__empty {
  padding: 1rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.95);
  color: #64748b;
}

.knockout-result-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.knockout-result-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.9rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
  min-width: 0;
}

.knockout-result-form__field--full {
  grid-column: 1 / -1;
}

.knockout-result-form__field--disabled {
  opacity: 0.7;
}

.knockout-result-form__field span {
  color: #0f172a;
  font-size: 0.84rem;
  font-weight: 700;
}

.knockout-result-form__field :deep(.p-dropdown),
.knockout-result-form__field :deep(.p-select),
.knockout-result-form__field :deep(.p-inputnumber),
.knockout-result-form__field :deep(.p-inputtext),
.knockout-result-form__field :deep(.p-textarea) {
  width: 100%;
}

.knockout-result-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.knockout-result-form__field--full :deep(textarea) {
  min-height: 7rem;
  resize: vertical;
}

@media (max-width: 768px) {
  .knockout-result-form {
    padding: 1rem;
  }

  .knockout-result-form__grid {
    grid-template-columns: 1fr;
  }
}
</style>
