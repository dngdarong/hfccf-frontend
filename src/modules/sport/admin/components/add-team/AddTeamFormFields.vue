<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'

defineOptions({
  name: 'AddTeamFormFields',
})

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  division: {
    type: String,
    default: '',
  },
  coach: {
    type: String,
    default: '',
  },
  captain: {
    type: String,
    default: '',
  },
  players: {
    type: Number,
    default: 0,
  },
  matches: {
    type: Number,
    default: 0,
  },
  venue: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: '',
  },
  wins: {
    type: Number,
    default: 0,
  },
  draws: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 0,
  },
  divisionOptions: {
    type: Array,
    default: () => [],
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  statusLabel: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits([
  'update:name',
  'update:division',
  'update:coach',
  'update:captain',
  'update:players',
  'update:matches',
  'update:venue',
  'update:status',
  'update:wins',
  'update:draws',
  'update:losses',
])

const { t } = useI18n()

const labels = computed(() => ({
  teamName: t('sportAddTeam.teamName'),
  division: t('sportAddTeam.division'),
  coach: t('sportAddTeam.coach'),
  captain: t('sportAddTeam.captain'),
  players: t('sportAddTeam.players'),
  matches: t('sportAddTeam.matches'),
  venue: t('sportAddTeam.venue'),
  status: t('sportAddTeam.status'),
  wins: t('sportAddTeam.wins'),
  draws: t('sportAddTeam.draws'),
  losses: t('sportAddTeam.losses'),
  pointsPreview: t('sportAddTeam.pointsPreview'),
}))

const placeholders = computed(() => ({
  teamName: t('sportAddTeam.teamNamePlaceholder'),
  division: t('sportAddTeam.divisionPlaceholder'),
  coach: t('sportAddTeam.coachPlaceholder'),
  captain: t('sportAddTeam.captainPlaceholder'),
  players: t('sportAddTeam.playersPlaceholder'),
  matches: t('sportAddTeam.matchesPlaceholder'),
  venue: t('sportAddTeam.venuePlaceholder'),
}))

const divisionSelectOptions = computed(() =>
  props.divisionOptions.map((value) => ({
    label: value,
    value,
  })),
)

const statusSelectOptions = computed(() =>
  props.statusOptions.map((value) => ({
    label: props.statusLabel(value),
    value,
  })),
)

function updateNumber(field, event) {
  const rawValue = event?.target?.value ?? 0
  const parsedValue = Number.parseInt(rawValue, 10)
  emit(`update:${field}`, Number.isNaN(parsedValue) ? 0 : Math.max(parsedValue, 0))
}

const selectPt = {
  root: {
    class:
      '!min-h-[3rem] !rounded-xl !border !border-surface-300 !bg-white transition-all duration-200 hover:enabled:!border-surface-400 focus-within:!border-brand-400 focus-within:!shadow-focus',
  },
  label: {
    class: '!px-4 !py-3 !text-sm !text-surface-900',
  },
  dropdown: {
    class: '!w-12 !bg-transparent !text-surface-500',
  },
  overlay: {
    class:
      '!mt-1 !rounded-xl !border !border-surface-200 !bg-white !shadow-[0_12px_24px_-18px_rgba(15,23,42,0.16)]',
  },
  listContainer: {
    class: '!bg-white !p-1.5',
  },
  option: {
    class:
      '!rounded-lg !bg-white !text-surface-900 hover:!bg-slate-50 data-[p-selected=true]:!bg-brand-50 data-[p-selected=true]:!text-brand-700',
  },
}
</script>

<template>
  <div class="add-team-form-fields">
    <label class="add-team-form-fields__field">
      <span class="add-team-form-fields__label">{{ labels.teamName }}</span>
      <InputText
        :model-value="name"
        :disabled="isLocked"
        :placeholder="placeholders.teamName"
        class="w-full"
        @update:model-value="emit('update:name', $event)"
      />
    </label>

    <label class="add-team-form-fields__field">
      <span class="add-team-form-fields__label">{{ labels.division }}</span>
      <Select
        :model-value="division"
        :options="divisionSelectOptions"
        option-label="label"
        option-value="value"
        :disabled="isLocked"
        :placeholder="placeholders.division"
        append-to="self"
        class="w-full"
        :pt="selectPt"
        @update:model-value="emit('update:division', $event)"
      />
    </label>

    <label class="add-team-form-fields__field">
      <span class="add-team-form-fields__label">{{ labels.coach }}</span>
      <InputText
        :model-value="coach"
        :disabled="isLocked"
        :placeholder="placeholders.coach"
        class="w-full"
        @update:model-value="emit('update:coach', $event)"
      />
    </label>

    <label class="add-team-form-fields__field">
      <span class="add-team-form-fields__label">{{ labels.captain }}</span>
      <InputText
        :model-value="captain"
        :disabled="isLocked"
        :placeholder="placeholders.captain"
        class="w-full"
        @update:model-value="emit('update:captain', $event)"
      />
    </label>

    <label class="add-team-form-fields__field">
      <span class="add-team-form-fields__label">{{ labels.players }}</span>
      <input
        :value="players"
        :disabled="isLocked"
        :placeholder="placeholders.players"
        type="number"
        min="0"
        class="add-team-form-fields__input"
        @input="updateNumber('players', $event)"
      />
    </label>

    <label class="add-team-form-fields__field">
      <span class="add-team-form-fields__label">{{ labels.matches }}</span>
      <input
        :value="matches"
        :disabled="isLocked"
        :placeholder="placeholders.matches"
        type="number"
        min="0"
        class="add-team-form-fields__input"
        @input="updateNumber('matches', $event)"
      />
    </label>

    <label class="add-team-form-fields__field">
      <span class="add-team-form-fields__label">{{ labels.venue }}</span>
      <InputText
        :model-value="venue"
        :disabled="isLocked"
        :placeholder="placeholders.venue"
        class="w-full"
        @update:model-value="emit('update:venue', $event)"
      />
    </label>

    <label class="add-team-form-fields__field">
      <span class="add-team-form-fields__label">{{ labels.status }}</span>
      <Select
        :model-value="status"
        :options="statusSelectOptions"
        option-label="label"
        option-value="value"
        :disabled="isLocked"
        append-to="self"
        class="w-full"
        :pt="selectPt"
        @update:model-value="emit('update:status', $event)"
      />
    </label>

    <div class="add-team-form-fields__record-grid">
      <label class="add-team-form-fields__field">
        <span class="add-team-form-fields__label">{{ labels.wins }}</span>
        <input
          :value="wins"
          :disabled="isLocked"
          type="number"
          min="0"
          class="add-team-form-fields__input"
          @input="updateNumber('wins', $event)"
        />
      </label>

      <label class="add-team-form-fields__field">
        <span class="add-team-form-fields__label">{{ labels.draws }}</span>
        <input
          :value="draws"
          :disabled="isLocked"
          type="number"
          min="0"
          class="add-team-form-fields__input"
          @input="updateNumber('draws', $event)"
        />
      </label>

      <label class="add-team-form-fields__field">
        <span class="add-team-form-fields__label">{{ labels.losses }}</span>
        <input
          :value="losses"
          :disabled="isLocked"
          type="number"
          min="0"
          class="add-team-form-fields__input"
          @input="updateNumber('losses', $event)"
        />
      </label>
    </div>

    <div class="add-team-form-fields__field add-team-form-fields__field--full">
      <span class="add-team-form-fields__label">{{ labels.pointsPreview }}</span>
      <div class="add-team-form-fields__preview">
        <strong class="add-team-form-fields__preview-value">{{ points }}</strong>
        <span class="add-team-form-fields__preview-text">
          {{ t('sportAddTeam.pointsFormula') }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-team-form-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.add-team-form-fields__field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.add-team-form-fields__field--full {
  grid-column: 1 / -1;
}

.add-team-form-fields__label {
  color: #334155;
  font-size: 0.86rem;
  font-weight: 700;
}

.add-team-form-fields__input {
  width: 100%;
  min-height: 3rem;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db; /* border-surface-300 */
  border-radius: 0.75rem; /* rounded-xl */
  font-size: 0.875rem; /* text-sm */
  transition: all 0.2s;
}

.add-team-form-fields__input:focus {
  outline: none;
  border-color: #3b82f6; /* brand-400 */
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); /* shadow-focus */
}

.add-team-form-fields__input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.add-team-form-fields__record-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.add-team-form-fields__preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  border: 1px solid #dbe6f4;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.95) 0%, rgba(255, 255, 255, 1) 100%);
}

.add-team-form-fields__preview-value {
  color: #0f172a;
  font-size: 1.7rem;
  line-height: 1;
  font-weight: 800;
}

.add-team-form-fields__preview-text {
  color: #475569;
  font-size: 0.86rem;
  text-align: right;
}

@media (max-width: 768px) {
  .add-team-form-fields,
  .add-team-form-fields__record-grid {
    grid-template-columns: 1fr;
  }
}
</style>
