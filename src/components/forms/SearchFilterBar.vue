<script setup>
/**
 * SearchFilterBar
 * --------------------------------------------------------------------------
 * Shared search + filter toolbar.
 *
 * Features:
 * - Search input
 * - Role / division / team / status filter group
 * - Clear all filters action
 * - Configurable filter visibility
 * - Disabled state support
 * --------------------------------------------------------------------------
 */

import { computed } from 'vue'
import SearchInputField from './SearchInputField.vue'
import FilterSelectGroup from './FilterSelectGroup.vue'

defineOptions({
  name: 'SearchFilterBar',
})

const props = defineProps({
  /**
   * Search keyword.
   */
  searchQuery: {
    type: String,
    default: '',
  },

  /**
   * Selected filter values.
   */
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

  /**
   * Filter option arrays.
   */
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
   * Status translation namespace.
   */
  statusKeyPrefix: {
    type: String,
    default: 'common.status',
  },

  /**
   * Disable search and filters.
   */
  disabled: {
    type: Boolean,
    default: false,
  },

  /**
   * Search input placeholder.
   */
  searchPlaceholder: {
    type: String,
    default: '',
  },

  /**
   * Toggle filter visibility.
   */
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

/**
 * Determine whether filter controls should be rendered.
 */
const hasFilterControls = computed(() =>
  props.showRoleFilter ||
  props.showDivisionFilter ||
  props.showTeamFilter ||
  props.showStatusFilter ||
  props.showClearButton,
)

/**
 * Clear search and all filters.
 */
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
      <!-- Search input -->
      <div class="min-w-0 flex-1">
        <SearchInputField
          :model-value="searchQuery"
          :disabled="disabled"
          :placeholder="searchPlaceholder"
          input-class="search-filter-bar__search-input"
          @update:model-value="emit('update:searchQuery', $event)"
        />
      </div>

      <!-- Filter controls -->
      <div
        v-if="hasFilterControls"
        class="flex w-full xl:w-auto xl:justify-end"
      >
        <FilterSelectGroup
          :role-filter="roleFilter"
          :division-filter="divisionFilter"
          :team-filter="teamFilter"
          :status-filter="statusFilter"
          :role-options="roleOptions"
          :division-options="divisionOptions"
          :team-options="teamOptions"
          :status-options="statusOptions"
          :status-key-prefix="statusKeyPrefix"
          :disabled="disabled"
          :show-role-filter="showRoleFilter"
          :show-division-filter="showDivisionFilter"
          :show-team-filter="showTeamFilter"
          :show-status-filter="showStatusFilter"
          :show-clear-button="showClearButton"
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
/**
 * Search input background override.
 */
:deep(.search-filter-bar__search-input) {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}
</style>
