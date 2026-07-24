<script setup>
/**
 * TrainingSearchFilterBar
 * Search and filter bar for the Coach Training Schedule.
 */
import { computed } from 'vue'
import SearchInputField from '@/components/forms/SearchInputField.vue'
import FilterSelectGroup from '@/components/forms/FilterSelectGroup.vue'

defineOptions({
  name: 'TrainingSearchFilterBar',
})

const props = defineProps({
  searchQuery: { type: String, default: '' },
  intensity: { type: String, default: '' },
  status: { type: String, default: '' },
  trainingType: { type: String, default: '' },
  team: { type: String, default: '' },
  intensityOptions: { type: Array, default: () => [] },
  statusOptions: { type: Array, default: () => [] },
  trainingTypeOptions: { type: Array, default: () => [] },
  teamOptions: { type: Array, default: () => [] },
  t: { type: Function, required: true },
})

const emit = defineEmits([
  'update:searchQuery',
  'update:intensity',
  'update:status',
  'update:trainingType',
  'update:team',
])

const filterGroups = computed(() => [
  {
    id: 'team',
    value: props.team,
    placeholder: props.t('coachTrainingSchedule.filters.team'),
    options: props.teamOptions.map((opt) =>
      typeof opt === 'object' ? opt : { label: opt, value: opt },
    ),
  },
  {
    id: 'intensity',
    value: props.intensity,
    placeholder: props.t('coachTrainingSchedule.filters.intensity'),
    options: props.intensityOptions.map((opt) => ({
      label: props.t(`coachTrainingSchedule.intensity.${opt.toLowerCase()}`),
      value: opt,
    })),
  },
  {
    id: 'trainingType',
    value: props.trainingType,
    placeholder: props.t('coachTrainingSchedule.filters.trainingType'),
    options: props.trainingTypeOptions.map((opt) => ({
      label: props.t(`coachTrainingSchedule.trainingType.${opt === 'match_preparation' ? 'matchPreparation' : opt}`),
      value: opt,
    })),
  },
  {
    id: 'status',
    value: props.status,
    placeholder: props.t('coachTrainingSchedule.filters.status'),
    options: props.statusOptions.map((opt) => ({
      label: props.t(`coachTrainingSchedule.status.${opt.toLowerCase()}`),
      value: opt,
    })),
  },
])

function onFilterChange(id, value) {
  emit(`update:${id}`, value)
}
</script>

<template>
  <div class="training-filter-bar flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div class="w-full md:max-w-md">
      <SearchInputField
        :model-value="searchQuery"
        :placeholder="t('coachTrainingSchedule.filters.searchPlaceholder')"
        @update:model-value="emit('update:searchQuery', $event)"
      />
    </div>

    <FilterSelectGroup :filters="filterGroups" @change="onFilterChange" />
  </div>
</template>
