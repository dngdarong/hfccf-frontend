<script setup>
/**
 * FormMatche
 * Reusable placeholder form shell for creating a new match record.
 *
 * The page owns alerts and submission state; this component owns the form body
 * so the page stays easier to scan and future fields can be added in one place.
 */
import { computed, ref } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from '@/components/buttons/Button.vue'
import Form from '@/components/forms/Form.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'FormMatche',
})

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  submitText: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  competitionType: {
    type: String,
    default: '',
  },
  competitionTypeOptions: {
    type: Array,
    default: () => [],
  },
  tournament: {
    type: String,
    default: '',
  },
  tournamentOptions: {
    type: Array,
    default: () => [],
  },
  dateTime: {
    type: String,
    default: '',
  },
  venue: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: '',
  },
  homeTeam: {
    type: String,
    default: '',
  },
  awayTeam: {
    type: String,
    default: '',
  },
  teamOptions: {
    type: Array,
    default: () => [],
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  showDelete: {
    type: Boolean,
    default: false,
  },
  cancelText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'submit',
  'cancel',
  'update:competitionType',
  'update:tournament',
  'update:dateTime',
  'update:venue',
  'update:status',
  'update:homeTeam',
  'update:awayTeam',
])

const showTournamentField = computed(
  () => props.competitionType === 'tournament' || props.competitionType === 'friendly',
)
const isTournamentMode = computed(() => props.competitionType === 'tournament')
const isFriendlyMode = computed(() => props.competitionType === 'friendly')
const { t } = useLanguage()
const homeTeamSuggestions = ref([])
const awayTeamSuggestions = ref([])

function normalizeOption(option) {
  if (option && typeof option === 'object' && 'value' in option) return option
  const value = String(option ?? '').trim()
  return { value, label: value }
}

const competitionTypeSelectOptions = computed(() => [
  { value: '', label: t('sportMatchesManagement.competitionTypePlaceholder') },
  ...props.competitionTypeOptions.map((option) => normalizeOption(option)),
])

const tournamentSelectOptions = computed(() => [
  { value: '', label: t('sportMatchesManagement.tournamentSelectPlaceholder') },
  ...props.tournamentOptions.map((option) => normalizeOption(option)),
])

const statusSelectOptions = computed(() => [
  { value: '', label: t('sportMatchesManagement.statusPlaceholder') },
  ...props.statusOptions.map((option) => normalizeOption(option)),
])

const allTeamOptions = computed(() =>
  props.teamOptions
    .map((option) => String(option ?? '').trim())
    .filter(Boolean),
)

function searchHomeTeam(event) {
  const query = String(event?.query || '').trim().toLowerCase()
  const available = allTeamOptions.value.filter((option) => option !== props.awayTeam)

  homeTeamSuggestions.value = query
    ? available.filter((option) => option.toLowerCase().includes(query))
    : available
}

function searchAwayTeam(event) {
  const query = String(event?.query || '').trim().toLowerCase()
  const available = allTeamOptions.value.filter((option) => option !== props.homeTeam)

  awayTeamSuggestions.value = query
    ? available.filter((option) => option.toLowerCase().includes(query))
    : available
}

function onHomeTeamChange(value) {
  const nextValue = String(value ?? '').trim()
  emit('update:homeTeam', nextValue)
  if (nextValue && nextValue === props.awayTeam) emit('update:awayTeam', '')
}

function onAwayTeamChange(value) {
  const nextValue = String(value ?? '').trim()
  emit('update:awayTeam', nextValue)
  if (nextValue && nextValue === props.homeTeam) emit('update:homeTeam', '')
}

const selectPt = {
  root: {
    class:
      '!min-h-[2.9rem] !rounded-[0.9rem] !border !border-surface-300 !bg-white !shadow-none transition-all duration-200 hover:enabled:!border-surface-400 focus-within:!border-brand-400 focus-within:!shadow-focus',
  },
  label: {
    class:
      '!flex !min-h-[2.9rem] !items-center !bg-transparent !px-[0.9rem] !py-[0.8rem] !text-[0.9rem] !text-surface-900 max-sm:!min-h-11 max-sm:!text-[0.88rem]',
  },
  dropdown: { class: '!w-[2.8rem] !bg-transparent !text-surface-500' },
  overlay: {
    class:
      '!mt-[0.3rem] !rounded-[0.9rem] !border !border-surface-200 !bg-white !shadow-[0_12px_24px_-18px_rgba(15,23,42,0.16)]',
  },
  listContainer: { class: '!bg-white !p-[0.35rem]' },
  option: {
    class:
      '!rounded-[0.65rem] !bg-white !text-surface-900 hover:!bg-slate-50 data-[p-selected=true]:!bg-brand-50 data-[p-selected=true]:!text-brand-700',
  },
}

function onSubmit(event) {
  // Delegate submit handling back to the page so alerts/loading stay centralized there.
  emit('submit', event)
}
</script>

<template>
  <Form
    class="form-matche"
    :title="title"
    :description="description"
    :submit-text="submitText"
    :loading="loading"
    :show-cancel="false"
    @submit="onSubmit"
  >
    <div class="form-matche__callout">
      <label class="form-matche__field">
        <span class="form-matche__label">{{ t('sportMatchesManagement.competitionTypeLabel') }}</span>
        <Select
          :model-value="competitionType"
          :options="competitionTypeSelectOptions"
          option-label="label"
          option-value="value"
          append-to="self"
          class="w-full"
          :pt="selectPt"
          @update:model-value="emit('update:competitionType', $event)"
        />
      </label>

      <label v-if="showTournamentField" class="form-matche__field">
        <span class="form-matche__label">{{ t('sportMatchesManagement.tournamentNameLabel') }}</span>
        <Select
          v-if="isTournamentMode"
          :model-value="tournament"
          :options="tournamentSelectOptions"
          option-label="label"
          option-value="value"
          append-to="self"
          class="w-full"
          :pt="selectPt"
          @update:model-value="emit('update:tournament', $event)"
        />
        <InputText
          v-else-if="isFriendlyMode"
          :model-value="tournament"
          type="text"
          :placeholder="t('sportMatchesManagement.tournamentNamePlaceholder')"
          class="w-full"
          @update:model-value="emit('update:tournament', $event)"
        />
      </label>

      <div class="form-matche__grid">
        <label class="form-matche__field">
          <span class="form-matche__label">{{ t('sportMatchesManagement.homeTeamLabel') }}</span>
          <AutoComplete
            :model-value="homeTeam"
            :placeholder="t('sportMatchesManagement.homeTeamPlaceholder')"
            dropdown
            :suggestions="homeTeamSuggestions"
            class="w-full"
            @complete="searchHomeTeam"
            @update:model-value="onHomeTeamChange"
          />
        </label>

        <label class="form-matche__field">
          <span class="form-matche__label">{{ t('sportMatchesManagement.awayTeamLabel') }}</span>
          <AutoComplete
            :model-value="awayTeam"
            :placeholder="t('sportMatchesManagement.awayTeamPlaceholder')"
            dropdown
            :suggestions="awayTeamSuggestions"
            class="w-full"
            @complete="searchAwayTeam"
            @update:model-value="onAwayTeamChange"
          />
        </label>
      </div>

      <label class="form-matche__field">
        <span class="form-matche__label">{{ t('sportMatchesManagement.dateTimeLabel') }}</span>
        <InputText
          :model-value="dateTime"
          type="datetime-local"
          :placeholder="t('sportMatchesManagement.dateTimePlaceholder')"
          class="w-full"
          @update:model-value="emit('update:dateTime', $event)"
        />
      </label>

      <div class="form-matche__grid">
        <label class="form-matche__field">
          <span class="form-matche__label">{{ t('sportMatchesManagement.venueLabel') }}</span>
          <InputText
            :model-value="venue"
            type="text"
            :placeholder="t('sportMatchesManagement.venuePlaceholder')"
            class="w-full"
            @update:model-value="emit('update:venue', $event)"
          />
        </label>

        <label class="form-matche__field">
          <span class="form-matche__label">{{ t('sportMatchesManagement.statusLabel') }}</span>
          <Select
            :model-value="status"
            :options="statusSelectOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('sportMatchesManagement.statusPlaceholder')"
            append-to="self"
            class="w-full"
            :pt="selectPt"
            @update:model-value="emit('update:status', $event)"
          />
        </label>
      </div>
    </div>

    <template #actions>
      <!-- The shared Form wrapper only renders its footer when an actions slot exists. -->
      <div class="form-matche__actions">
        <Button
          v-if="showDelete"
          type="button"
          variant="outline"
          size="md"
          rounded="xl"
          :disabled="loading"
          @click="emit('cancel')"
        >
          {{ cancelText }}
        </Button>

        <Button type="submit" variant="primary" size="md" rounded="xl" :loading="loading">
          {{ submitText }}
        </Button>
      </div>
    </template>
  </Form>
</template>

<style scoped>
.form-matche {
  display: block;
}

.form-matche__callout {
  display: grid;
  gap: 1rem;
}

.form-matche__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-matche__field {
  display: grid;
  gap: 0.45rem;
}

.form-matche__label {
  color: #475569;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.form-matche__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
  width: 100%;
}

@media (max-width: 640px) {
  .form-matche__grid {
    grid-template-columns: 1fr;
  }

  .form-matche__actions {
    justify-content: stretch;
  }
}
</style>
