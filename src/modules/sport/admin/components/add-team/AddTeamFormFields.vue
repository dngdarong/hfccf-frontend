<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

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
  coachOptions: {
    type: Array,
    default: () => [],
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  selectedPlayers: {
    type: Array,
    default: () => [],
  },
  playerCandidates: {
    type: Array,
    default: () => [],
  },
  playerSearch: {
    type: String,
    default: '',
  },
  playerLoading: {
    type: Boolean,
    default: false,
  },
  playerError: {
    type: String,
    default: '',
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
  'update:matches',
  'update:venue',
  'update:status',
  'update:wins',
  'update:draws',
  'update:losses',
  'update:selectedPlayers',
  'update:playerSearch',
])

const { t } = useI18n()

const labels = computed(() => ({
  teamName: t('sportAddTeam.teamName'),
  division: t('sportAddTeam.division'),
  coach: t('sportAddTeam.coach'),
  captain: t('sportAddTeam.captain'),
  matches: t('sportAddTeam.matches'),
  venue: t('sportAddTeam.venue'),
  status: t('sportAddTeam.status'),
  wins: t('sportAddTeam.wins'),
  draws: t('sportAddTeam.draws'),
  losses: t('sportAddTeam.losses'),
  pointsPreview: t('sportAddTeam.pointsPreview'),
  players: t('sportAddTeam.players'),
  selectedPlayers: t('sportAddTeam.selectedPlayers'),
  searchPlayers: t('sportAddTeam.searchPlayers'),
  playerCode: t('sportAddTeam.playerCode'),
  playerName: t('sportAddTeam.playerName'),
  position: t('sportAddTeam.position'),
  approvalStatus: t('sportAddTeam.approvalStatus'),
  rosterStatus: t('sportAddTeam.rosterStatus'),
  currentTeam: t('sportAddTeam.currentTeam'),
  noEligiblePlayers: t('sportAddTeam.noEligiblePlayers'),
  failedToLoadPlayers: t('sportAddTeam.failedToLoadPlayers'),
  selectedCount: t('sportAddTeam.selectedPlayersCount', { count: selectedPlayersCount.value }),
}))

const placeholders = computed(() => ({
  teamName: t('sportAddTeam.teamNamePlaceholder'),
  division: t('sportAddTeam.divisionPlaceholder'),
  coach: t('sportAddTeam.coachPlaceholder'),
  captain: t('sportAddTeam.captainPlaceholder'),
  matches: t('sportAddTeam.matchesPlaceholder'),
  venue: t('sportAddTeam.venuePlaceholder'),
  searchPlayers: t('sportAddTeam.searchPlayersPlaceholder'),
}))

const selectedPlayersCount = computed(() => (Array.isArray(props.selectedPlayers) ? props.selectedPlayers.length : 0))

const divisionSelectOptions = computed(() => toSelectOptions(props.divisionOptions))
const coachSelectOptions = computed(() => toSelectOptions(props.coachOptions))

const statusSelectOptions = computed(() => {
  if (!Array.isArray(props.statusOptions)) return []
  return props.statusOptions
    .filter(Boolean)
    .map((value) => ({
      label: props.statusLabel?.(value) || '',
      value: value || '',
    }))
})

const selectedPlayersProxy = computed({
  get: () => (Array.isArray(props.selectedPlayers) ? props.selectedPlayers : []),
  set: (value) => emit('update:selectedPlayers', Array.isArray(value) ? value : []),
})

const filteredCandidates = computed(() => {
  const candidates = Array.isArray(props.playerCandidates) ? props.playerCandidates : []
  const search = normalizeText(props.playerSearch).toLowerCase()

  if (!search) return candidates

  return candidates.filter((player) => {
    const haystack = [
      player.playerCode,
      player.name,
      player.firstName,
      player.lastName,
      player.position,
      player.primaryPosition,
      player.rosterStatus,
      player.approvalStatus,
      player.team,
      player.teamName,
    ]
      .map((value) => normalizeText(value).toLowerCase())
      .join(' ')

    return haystack.includes(search)
  })
})

function normalizeText(value) {
  return String(value || '').trim()
}

function toSelectOptions(values) {
  if (!Array.isArray(values)) return []

  return values
    .filter(Boolean)
    .map((value) => {
      if (value && typeof value === 'object') {
        return {
          label: value.label || value.name || value.value || '',
          value: value.value ?? value.id ?? value.name ?? '',
        }
      }

      return {
        label: value || '',
        value: value || '',
      }
    })
}

function updateNumber(field, event) {
  const rawValue = event?.target?.value ?? 0
  const parsedValue = Number.parseInt(rawValue, 10)
  emit(`update:${field}`, Number.isNaN(parsedValue) ? 0 : Math.max(parsedValue, 0))
}

function formatPlayerBadge(status) {
  const normalized = normalizeText(status).toLowerCase()

  if (normalized === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (normalized === 'suspended') return 'bg-amber-50 text-amber-700 border-amber-200'
  if (normalized === 'injured') return 'bg-orange-50 text-orange-700 border-orange-200'
  if (normalized === 'released' || normalized === 'archived') return 'bg-rose-50 text-rose-700 border-rose-200'
  return 'bg-slate-50 text-slate-700 border-slate-200'
}

function removeSelectedPlayer(playerId) {
  const nextSelection = (Array.isArray(props.selectedPlayers) ? props.selectedPlayers : []).filter(
    (player) => String(player.id) !== String(playerId),
  )

  emit('update:selectedPlayers', nextSelection)
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
      <Select
        :model-value="coach"
        :options="coachSelectOptions"
        option-label="label"
        option-value="value"
        :disabled="isLocked"
        :placeholder="placeholders.coach"
        append-to="self"
        class="w-full"
        :pt="selectPt"
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

    <div class="add-team-form-fields__field add-team-form-fields__field--full add-team-form-fields__players">
      <div class="add-team-form-fields__players-header">
        <div>
          <span class="add-team-form-fields__label">{{ labels.players }}</span>
          <p class="add-team-form-fields__hint">
            {{ labels.selectedCount }}
          </p>
        </div>
        <span class="add-team-form-fields__pill">{{ selectedPlayersCount }}</span>
      </div>

      <label class="add-team-form-fields__field">
        <span class="add-team-form-fields__label">{{ labels.searchPlayers }}</span>
        <InputText
          :model-value="playerSearch"
          :disabled="isLocked"
          :placeholder="placeholders.searchPlayers"
          class="w-full"
          @update:model-value="emit('update:playerSearch', $event)"
        />
      </label>

      <div v-if="playerError" class="add-team-form-fields__error">
        {{ playerError }}
      </div>

      <div
        v-if="selectedPlayersCount"
        class="add-team-form-fields__selected"
        :class="{ 'add-team-form-fields__selected--locked': isLocked }"
      >
        <button
          v-for="player in selectedPlayers"
          :key="player.id"
          type="button"
          class="add-team-form-fields__chip"
          :disabled="isLocked"
          @click="removeSelectedPlayer(player.id)"
        >
          <span class="add-team-form-fields__chip-name">{{ player.name || player.playerCode }}</span>
          <span class="add-team-form-fields__chip-x">×</span>
        </button>
      </div>

      <DataTable
        :value="filteredCandidates"
        v-model:selection="selectedPlayersProxy"
        data-key="id"
        striped-rows
        :loading="playerLoading"
        :selection-mode="isLocked ? null : 'multiple'"
        class="add-team-form-fields__table"
      >
        <Column v-if="!isLocked" selection-mode="multiple" header-style="width: 3rem" />
        <Column :header="labels.playerCode">
          <template #body="{ data }">
            <span class="add-team-form-fields__table-value">{{ data.playerCode || '-' }}</span>
          </template>
        </Column>
        <Column :header="labels.playerName">
          <template #body="{ data }">
            <span class="add-team-form-fields__table-value">{{ data.name || '-' }}</span>
          </template>
        </Column>
        <Column :header="labels.position">
          <template #body="{ data }">
            <span class="add-team-form-fields__table-value">{{ data.primaryPosition || data.position || '-' }}</span>
          </template>
        </Column>
        <Column :header="labels.approvalStatus">
          <template #body="{ data }">
            <span class="add-team-form-fields__badge" :class="formatPlayerBadge(data.approvalStatus)">
              {{ data.approvalStatus || '-' }}
            </span>
          </template>
        </Column>
        <Column :header="labels.rosterStatus">
          <template #body="{ data }">
            <span class="add-team-form-fields__badge" :class="formatPlayerBadge(data.rosterStatus)">
              {{ data.rosterStatus || '-' }}
            </span>
          </template>
        </Column>
        <Column :header="labels.currentTeam">
          <template #body="{ data }">
            <span class="add-team-form-fields__table-value">{{ data.teamName || data.team || '-' }}</span>
          </template>
        </Column>
      </DataTable>

      <p
        v-if="!playerLoading && !filteredCandidates.length"
        class="add-team-form-fields__empty"
      >
        {{ labels.noEligiblePlayers }}
      </p>
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

.add-team-form-fields__hint {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.82rem;
}

.add-team-form-fields__input {
  width: 100%;
  min-height: 3rem;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.add-team-form-fields__input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
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

.add-team-form-fields__players {
  padding: 1rem;
  border: 1px solid #dbe6f4;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.8) 0%, rgba(255, 255, 255, 1) 100%);
}

.add-team-form-fields__players-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.add-team-form-fields__pill {
  min-width: 2.5rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.9rem;
  font-weight: 800;
  text-align: center;
}

.add-team-form-fields__selected {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.add-team-form-fields__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.8rem;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.add-team-form-fields__chip:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.add-team-form-fields__chip-x {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 700;
}

.add-team-form-fields__table {
  border: 1px solid #dbe6f4;
  border-radius: 1rem;
  overflow: hidden;
}

.add-team-form-fields__table-value {
  color: #0f172a;
  font-size: 0.88rem;
}

.add-team-form-fields__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: capitalize;
}

.add-team-form-fields__empty {
  margin: 0;
  color: #64748b;
  font-size: 0.88rem;
}

.add-team-form-fields__error {
  padding: 0.75rem 0.9rem;
  border-radius: 0.9rem;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 0.88rem;
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

  .add-team-form-fields__players-header {
    flex-direction: column;
  }
}
</style>
