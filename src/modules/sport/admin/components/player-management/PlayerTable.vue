<script setup>
/**
 * PlayerTable Component
 * Handles the display of player data in a DataTable with pagination.
 */
import { defineProps, defineEmits } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Avatar from 'primevue/avatar'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import ActionsButton from '@/components/buttons/ActionsButton.vue'

const props = defineProps({
  /** Array of player records for the current page */
  players: {
    type: Array,
    required: true,
  },
  /** Translation function */
  t: {
    type: Function,
    required: true,
  },
  /** Text to show when no data is available */
  emptyText: {
    type: String,
    required: true,
  },
  /** Current active page number */
  currentPage: {
    type: Number,
    required: true,
  },
  /** Total number of pages */
  totalPages: {
    type: Number,
    required: true,
  },
  /**
   * Status label namespace for i18n.
   * Players are not users, so player screens should not use `common.status.*` by default.
   */
  statusKeyPrefix: {
    type: String,
    default: 'sportPlayerInformation.status',
  },
})

const emit = defineEmits([
  'update:currentPage',
  // Player actions are handled by the parent page (this table stays presentation-focused).
  'view',
  'edit',
  'delete',
])

/**
 * Normalizes a string for comparison.
 */
function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

/**
 * Returns the status badge tone based on player status.
 */
function statusType(status) {
  const value = normalize(status)
  if (value === 'active') return 'success'
  if (value === 'pending') return 'pending'
  if (value === 'inactive') return 'warning'
  if (value === 'suspended') return 'danger'
  return 'info'
}

function statusText(status) {
  // Keep the label fully domain-owned (player status != user status).
  const key = `${props.statusKeyPrefix}.${normalize(status).replace(/[\s-]+/g, '_')}`
  const localized = props.t(key)
  return localized !== key ? localized : status
}

/**
 * Generates initials from a player name for the avatar.
 */
function initials(name) {
  return (
    String(name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?'
  )
}

/**
 * Handles page change from pagination component.
 */
function onPageChange(newPage) {
  emit('update:currentPage', newPage)
}
</script>

<template>
  <div class="player-table">
    <DataTable
      :value="players"
      data-key="id"
      striped-rows
      removable-sort
      class="player-table__datatable"
    >
      <template #empty>
        <div class="px-4 py-7 text-center text-sm text-surface-500">
          {{ emptyText }}
        </div>
      </template>

      <!-- Row Number Column -->
      <Column field="rowNumber" :header="t('common.table.number')">
        <template #body="{ data }">
          <span class="text-[12px] font-semibold text-surface-700 sm:text-sm">
            {{ data.rowNumber }}
          </span>
        </template>
      </Column>

      <!-- Player Identity Column (Avatar + Name + Position) -->
      <Column field="name" :header="t('sportPlayerInformation.table.player')">
        <template #body="{ data }">
          <div class="flex items-center gap-3">
            <Avatar
              :label="initials(data.name)"
              shape="circle"
              class="player-table__avatar"
            />
            <div>
              <div class="text-[13px] font-semibold leading-5 text-surface-900 sm:text-sm">
                {{ data.name }}
              </div>
              <div class="text-[11px] text-surface-500 sm:text-xs">
                {{ data.position }}
              </div>
            </div>
          </div>
        </template>
      </Column>

      <!-- Basic Info Columns -->
      <Column field="team" :header="t('sportPlayerInformation.table.team')" />
      <Column field="division" :header="t('sportPlayerInformation.table.division')" />

      <!-- Show match appearances instead of position in the table (position still appears under the name). -->
      <Column field="matchesPlayed" :header="t('sportPlayerInformation.table.matches')">
        <template #body="{ data }">
          <span class="font-semibold text-slate-700">
            {{ data.matchesPlayed }}
          </span>
        </template>
      </Column>

      <Column field="jerseyNumber" :header="t('sportPlayerInformation.table.jersey')" />
      <Column field="age" :header="t('sportPlayerInformation.table.age')" />

      <!-- Goals Column -->
      <Column field="goalsScored" :header="t('sportPlayerInformation.table.goals')">
        <template #body="{ data }">
          <span class="font-semibold text-slate-700">
            {{ data.goalsScored }}
          </span>
        </template>
      </Column>

      <!-- Status Column -->
      <Column field="status" :header="t('common.table.status')">
        <template #body="{ data }">
          <!-- Label is already localized in `statusText` (player statuses are domain-owned). -->
          <StatusBadge
            :status="statusType(data.status)"
            :label="statusText(data.status)"
            :translate-label="false"
            size="sm"
          />
        </template>
      </Column>

      <Column
        field="actions"
        :header="t('common.table.actions')"
        header-class="text-right"
      >
        <template #body="{ data }">
          <div class="flex justify-end">
            <ActionsButton
              :item="data"
              @view="emit('view', $event)"
              @edit="emit('edit', $event)"
              @delete="emit('delete', $event)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-end mt-4">
      <Pagination :modelValue="currentPage" @update:modelValue="onPageChange" :total-pages="totalPages" />
    </div>
  </div>
</template>

<style scoped>
.player-table__avatar.p-avatar {
  width: 2.75rem;
  height: 2.75rem;
  box-shadow: 0 10px 18px -14px rgba(0, 174, 239, 0.55);
}

.player-table__avatar.p-avatar:not(.p-avatar-image) {
  background: linear-gradient(135deg, var(--brand-primary-500) 0%, var(--brand-primary-700) 100%);
  color: #fff;
}
</style>
