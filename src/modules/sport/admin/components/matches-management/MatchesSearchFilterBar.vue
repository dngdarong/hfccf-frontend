<script setup>
/**
 * MatchesSearchFilterBar
 * Dedicated search + filter bar for the Sport Admin "Manage Matches" page.
 *
 * Note: This component is UI-only; it emits selected filter values to the page,
 * which will later apply filtering against the API-backed match list.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from '@/components/buttons/Button.vue'

defineOptions({
  name: 'MatchesSearchFilterBar',
})

const props = defineProps({
  searchQuery: { type: String, default: '' },
  competition: { type: String, default: '' },
  tournament: { type: String, default: '' },
  matchDateInput: { type: String, default: '' },

  // Options are provided by the page so future backend values can drive them.
  competitionOptions: { type: Array, default: () => [] },
  tournamentOptions: { type: Array, default: () => [] },

  disabled: { type: Boolean, default: false },
  /**
   * When true, shows a "Clear" button that resets all filter values.
   * This matches the global `SearchFilterBar` behavior for consistent UX.
   */
  showClearButton: { type: Boolean, default: true },
})

const emit = defineEmits([
  'update:searchQuery',
  'update:competition',
  'update:tournament',
  'update:matchDateInput',
  'clear',
])

// `te` (translation exists) is intentionally not used here; all keys referenced are required.
const { t } = useI18n()

// Placeholders are the visible UX copy (we intentionally keep labels out of the UI,
// consistent with the project's shared `SearchFilterBar` pattern).
const placeholders = computed(() => ({
  search: t('sportMatchesManagement.filters.searchPlaceholder'),
  competition: t('sportMatchesManagement.filters.competitionPlaceholder'),
  tournament: t('sportMatchesManagement.filters.tournamentPlaceholder'),
  matchDate: t('sportMatchesManagement.filters.matchDatePlaceholder'),
}))

function normalizeOption(option) {
  // Support both simple string arrays and `{ value, label }` items.
  if (option && typeof option === 'object' && 'value' in option) return option
  const value = String(option ?? '').trim()
  return { value, label: value }
}

const competitionSelectOptions = computed(() =>
  props.competitionOptions.map((option) => normalizeOption(option)),
)

const tournamentSelectOptions = computed(() =>
  props.tournamentOptions.map((option) => normalizeOption(option)),
)

// Keep select styling consistent with the other Sport Admin filter bars.
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

const hasActiveFilters = computed(() =>
  Boolean(props.searchQuery || props.competition || props.tournament || props.matchDateInput),
)

function clearFilters() {
  // Reset all v-model values so the parent page state is the single source of truth.
  emit('update:searchQuery', '')
  emit('update:competition', '')
  emit('update:tournament', '')
  emit('update:matchDateInput', '')
  emit('clear')
}

// Avoid duplicate IDs across pages and keep label association accessible.
const searchInputId = 'matchSearchInput'

// Search input styling is defined locally because the matches page uses a slightly
// different layout than the shared `SearchFilterBar` (filters are denser on the right).
const searchInputPt = {
  root: {
    class: [
      '!w-full',
      '!min-h-[2.9rem]',
      '!rounded-[0.9rem]',
      '!border',
      '!border-surface-300',
      '!bg-white',
      '!py-[0.85rem]',
      '!pr-4',
      '!pl-11',
      '!text-surface-900',
      '!shadow-[0_1px_2px_rgba(15,23,42,0.05)]',
      'transition-all',
      'duration-200',
      'hover:enabled:!border-surface-400',
      'focus:!border-brand-500',
      'focus:!shadow-focus',
    ],
  },
}
</script>

<template>
  <div
    class="w-full rounded-2xl border border-surface-200/90 bg-white p-4 shadow-sm shadow-slate-200/60 md:p-5"
  >
    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div class="min-w-0 flex-1">
        <label class="block w-full" :for="searchInputId">
          <!-- Screen-reader label: the placeholder is the visible copy. -->
          <span class="sr-only">{{ placeholders.search }}</span>
          <IconField icon-position="left" class="w-full">
            <InputIcon class="pi pi-search" />
            <InputText
              :id="searchInputId"
              :model-value="searchQuery"
              type="search"
              :disabled="disabled"
              :placeholder="placeholders.search"
              class="matches-search-filter-bar__search-input w-full"
              :pt="searchInputPt"
              autocomplete="off"
              spellcheck="false"
              @update:model-value="emit('update:searchQuery', $event)"
            />
          </IconField>
        </label>
      </div>

      <div class="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <Select
          input-id="matchCompetitionFilter"
          :model-value="competition"
          :options="competitionSelectOptions"
          option-label="label"
          option-value="value"
          :disabled="disabled"
          :placeholder="placeholders.competition"
          append-to="self"
          class="ui-filter-select w-full sm:w-44"
          :pt="selectPt"
          @update:model-value="emit('update:competition', $event)"
        />

        <Select
          input-id="matchTournamentFilter"
          :model-value="tournament"
          :options="tournamentSelectOptions"
          option-label="label"
          option-value="value"
          :disabled="disabled"
          :placeholder="placeholders.tournament"
          append-to="self"
          class="ui-filter-select w-full sm:w-44"
          :pt="selectPt"
          @update:model-value="emit('update:tournament', $event)"
        />

        <!-- Native date input stays mobile-friendly and dependency-free. -->
        <InputText
          :model-value="matchDateInput"
          type="date"
          :disabled="disabled"
          :placeholder="placeholders.matchDate"
          class="w-full sm:w-44"
          @update:model-value="emit('update:matchDateInput', $event)"
        />

        <Button
          v-if="showClearButton"
          type="button"
          variant="outline"
          size="md"
          :disabled="disabled || !hasActiveFilters"
          @click="clearFilters"
        >
          {{ t('common.clear') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

:deep(.p-iconfield .p-inputicon) {
  /* Keep the search icon readable but subtle. */
  color: var(--brand-surface-500);
}

:deep(.matches-search-filter-bar__search-input) {
  /*
   * UI polish for the matches page only.
   * This keeps the input feeling consistent with the select controls.
   */
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}
</style>
