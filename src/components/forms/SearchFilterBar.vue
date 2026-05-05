<script setup>
import { computed } from 'vue'
import SearchInputField from './SearchInputField.vue'
import FilterSelectGroup from './FilterSelectGroup.vue'

const props = defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  roleFilter: {
    type: String,
    default: '',
  },
  divisionFilter: {
    type: String,
    default: '',
  },
  teamFilter: {
    type: String,
    default: '',
  },
  statusFilter: {
    type: String,
    default: '',
  },
  roleOptions: {
    type: Array,
    default: () => ['Admin', 'Coach', 'Player'],
  },
  divisionOptions: {
    type: Array,
    default: () => [],
  },
  teamOptions: {
    type: Array,
    default: () => [],
  },
  statusOptions: {
    type: Array,
    default: () => ['Active', 'Pending', 'Inactive', 'Suspended'],
  },
  /**
   * Optional override for status label localization.
   * Passed through to `FilterSelectGroup`.
   */
  statusKeyPrefix: {
    type: String,
    default: 'common.status',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  searchPlaceholder: {
    type: String,
    default: '',
  },
  showRoleFilter: {
    type: Boolean,
    default: true,
  },
  showDivisionFilter: {
    type: Boolean,
    default: false,
  },
  showTeamFilter: {
    type: Boolean,
    default: false,
  },
  showStatusFilter: {
    type: Boolean,
    default: true,
  },
  showClearButton: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits([
  'update:searchQuery',
  'update:roleFilter',
  'update:divisionFilter',
  'update:teamFilter',
  'update:statusFilter',
  'clear',
])

const hasFilterControls = computed(
  () =>
    props.showRoleFilter ||
    props.showDivisionFilter ||
    props.showTeamFilter ||
    props.showStatusFilter ||
    props.showClearButton,
)

function clearFilters() {
  emit('update:searchQuery', '')
  emit('update:roleFilter', '')
  emit('update:divisionFilter', '')
  emit('update:teamFilter', '')
  emit('update:statusFilter', '')
  emit('clear')
}
</script>

<template>
  <div
    class="w-full rounded-2xl border border-surface-200/90 bg-white p-4 shadow-sm shadow-slate-200/60 md:p-5"
  >
    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div class="min-w-0 flex-1">
        <SearchInputField
          :model-value="props.searchQuery"
          :disabled="props.disabled"
          :placeholder="props.searchPlaceholder"
          input-class="search-filter-bar__search-input"
          @update:model-value="emit('update:searchQuery', $event)"
        />
      </div>

      <div v-if="hasFilterControls" class="flex w-full xl:w-auto xl:justify-end">
        <FilterSelectGroup
          :role-filter="props.roleFilter"
          :division-filter="props.divisionFilter"
          :team-filter="props.teamFilter"
          :status-filter="props.statusFilter"
          :role-options="props.roleOptions"
          :division-options="props.divisionOptions"
          :team-options="props.teamOptions"
          :status-options="props.statusOptions"
          :status-key-prefix="props.statusKeyPrefix"
          :disabled="props.disabled"
          :show-role-filter="props.showRoleFilter"
          :show-division-filter="props.showDivisionFilter"
          :show-team-filter="props.showTeamFilter"
          :show-status-filter="props.showStatusFilter"
          :show-clear-button="props.showClearButton"
          @update:role-filter="emit('update:roleFilter', $event)"
          @update:division-filter="emit('update:divisionFilter', $event)"
          @update:team-filter="emit('update:teamFilter', $event)"
          @update:status-filter="emit('update:statusFilter', $event)"
          @clear="clearFilters"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.search-filter-bar__search-input) {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}
</style>
