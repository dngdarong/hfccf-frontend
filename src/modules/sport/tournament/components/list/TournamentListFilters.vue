<script setup>
import { computed } from 'vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import SearchInputField from '@/components/forms/SearchInputField.vue'
import { useLanguage } from '@/composables/useLanguage'
import { getTournamentStateLabelKey } from '@/modules/sport/tournament/composables/useTournamentStateMachine'

defineOptions({
  name: 'TournamentListFilters',
})

const props = defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  seasonFilter: {
    type: String,
    default: '',
  },
  stateFilter: {
    type: String,
    default: '',
  },
  seasonOptions: {
    type: Array,
    default: () => [],
  },
  stateOptions: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:searchQuery',
  'update:seasonFilter',
  'update:stateFilter',
  'clear',
])

const { t } = useLanguage()

const seasonSelectOptions = computed(() => [
  { label: t('sportTournament.filters.allSeasons'), value: '' },
  ...props.seasonOptions.map((value) => ({ label: String(value), value: String(value) })),
])

const stateSelectOptions = computed(() => [
  { label: t('sportTournament.filters.allStates'), value: '' },
  ...props.stateOptions.map((value) => ({ label: t(getTournamentStateLabelKey(value)), value })),
])

const hasActiveFilters = computed(() =>
  Boolean(props.searchQuery || props.seasonFilter || props.stateFilter),
)

function clearFilters() {
  emit('update:searchQuery', '')
  emit('update:seasonFilter', '')
  emit('update:stateFilter', '')
  emit('clear')
}
</script>

<template>
  <div class="tournament-filters">
    <SearchInputField
      :model-value="searchQuery"
      :disabled="disabled"
      :placeholder="t('sportTournament.list.searchPlaceholder')"
      @update:model-value="emit('update:searchQuery', $event)"
    />

    <Select
      :model-value="seasonFilter"
      :options="seasonSelectOptions"
      option-label="label"
      option-value="value"
      append-to="self"
      class="w-full sm:w-[14rem]"
      :disabled="disabled"
      :placeholder="t('sportTournament.filters.season')"
      @update:model-value="emit('update:seasonFilter', $event)"
    />

    <Select
      :model-value="stateFilter"
      :options="stateSelectOptions"
      option-label="label"
      option-value="value"
      append-to="self"
      class="w-full sm:w-[16rem]"
      :disabled="disabled"
      :placeholder="t('sportTournament.filters.state')"
      @update:model-value="emit('update:stateFilter', $event)"
    />

    <Button
      type="button"
      severity="secondary"
      outlined
      icon="pi pi-filter-slash"
      class="tournament-filters__clear w-full sm:w-auto"
      :label="t('sportTournament.filters.clear')"
      :disabled="disabled || !hasActiveFilters"
      @click="clearFilters"
    />
  </div>
</template>

<style scoped>
.tournament-filters {
  display: grid;
  grid-template-columns: minmax(14rem, 1fr) minmax(10rem, 14rem) minmax(10rem, 16rem) auto;
  align-items: center;
  gap: 0.7rem;
}

.tournament-filters__clear {
  min-height: 2.8rem;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .tournament-filters {
    grid-template-columns: minmax(14rem, 1fr) minmax(10rem, 14rem);
  }
  .tournament-filters__clear { width: auto; }
}

@media (max-width: 640px) {
  .tournament-filters { grid-template-columns: 1fr; }
  .tournament-filters__clear { width: 100%; }
}
</style>

