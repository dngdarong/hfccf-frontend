<script setup>
/**
 * MatchResultFields
 * Owns the editable result controls only; parent containers own form state and validation.
 */
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'

defineOptions({
  name: 'MatchResultFields',
})

defineProps({
  homeTeam: {
    type: String,
    default: '',
  },
  awayTeam: {
    type: String,
    default: '',
  },
  homeScore: {
    type: [Number, String],
    default: 0,
  },
  awayScore: {
    type: [Number, String],
    default: 0,
  },
  resultStatus: {
    type: String,
    default: '',
  },
  report: {
    type: String,
    default: '',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  labels: {
    type: Object,
    required: true,
  },
  placeholders: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'update:homeScore',
  'update:awayScore',
  'update:resultStatus',
  'update:report',
])
</script>

<template>
  <div class="match-result-fields">
    <label class="match-result-fields__field">
      <span class="match-result-fields__label">{{ labels.homeTeam }}: {{ homeTeam }}</span>
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-lg font-bold text-slate-900">
        {{ homeScore }}
      </div>
    </label>

    <label class="match-result-fields__field">
      <span class="match-result-fields__label">{{ labels.awayTeam }}: {{ awayTeam }}</span>
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-lg font-bold text-slate-900">
        {{ awayScore }}
      </div>
    </label>

    <label class="match-result-fields__field">
      <span class="match-result-fields__label">{{ labels.resultStatus }}</span>
      <Select
        :model-value="resultStatus"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        :disabled="readonly"
        @update:model-value="emit('update:resultStatus', $event)"
      />
    </label>

    <label class="match-result-fields__field">
      <span class="match-result-fields__label">{{ labels.report }}</span>
      <InputText
        :model-value="report"
        type="text"
        :placeholder="placeholders.report"
        class="w-full"
        :disabled="readonly"
        @update:model-value="emit('update:report', $event)"
      />
    </label>
  </div>
</template>

<style scoped>
.match-result-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.match-result-fields__field {
  display: grid;
  gap: 0.45rem;
}

.match-result-fields__label {
  margin: 0;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 720px) {
  .match-result-fields {
    grid-template-columns: 1fr;
  }
}
</style>
