<script setup>
/**
 * MatchesTable
 * Presentation-focused table for Sport Admin match management.
 *
 * Important:
 * - This component does not do routing or API calls.
 * - It emits actions to the parent page so future backend integration is centralized.
 */
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import ActionsButton from '@/components/buttons/ActionsButton.vue'

defineOptions({
  name: 'MatchesTable',
})

const props = defineProps({
  /** Array of match records to display (already filtered/paginated by the page). */
  matches: {
    type: Array,
    required: true,
  },
  /** Translation function (keep i18n ownership in the page). */
  t: {
    type: Function,
    required: true,
  },
  /** Text to show when there are no rows. */
  emptyText: {
    type: String,
    required: true,
  },
})

const emit = defineEmits([
  // We use domain naming here (results != view) and map from ActionsButton events internally.
  'results',
  'edit',
  'delete',
])

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function statusTone(status) {
  // Keep the mapping small and predictable; backend can expand later.
  const value = normalize(status)
  if (value === 'scheduled') return 'pending'
  if (value === 'live') return 'info'
  if (value === 'completed') return 'success'
  if (value === 'postponed') return 'warning'
  if (value === 'cancelled' || value === 'canceled') return 'danger'
  return 'info'
}

function statusLabel(status) {
  // Avoid noisy i18n warnings: fall back to raw value if key doesn't exist.
  const key = `sportMatchesManagement.status.${normalize(status).replace(/[\s-]+/g, '_')}`
  const localized = props.t(key)
  return localized !== key ? localized : status
}

const actionLabels = computed(() => ({
  // ActionsButton emits `view/edit/delete`, but match management wants `Results/Edit/Delete`.
  results: props.t('sportMatchesManagement.actions.results'),
  edit: props.t('sportMatchesManagement.actions.edit'),
  delete: props.t('sportMatchesManagement.actions.delete'),
}))

function onResults(match) {
  emit('results', match)
}
</script>

<template>
  <div class="matches-table">
    <DataTable
      :value="matches"
      data-key="id"
      striped-rows
      removable-sort
      class="matches-table__datatable"
    >
      <template #empty>
        <div class="px-4 py-7 text-center text-sm text-surface-500">
          {{ emptyText }}
        </div>
      </template>

      <Column field="id" :header="t('sportMatchesManagement.table.id')">
        <template #body="{ data }">
          <span class="text-[12px] font-semibold text-surface-700 sm:text-sm">
            {{ data.id }}
          </span>
        </template>
      </Column>

      <Column field="homeTeam" :header="t('sportMatchesManagement.table.homeTeam')" />

      <Column field="score" :header="t('sportMatchesManagement.table.score')" header-class="text-center">
        <template #body="{ data }">
          <div class="flex justify-center">
            <span class="rounded-lg bg-slate-50 px-3 py-1 text-sm font-extrabold text-slate-800">
              {{ data.score }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="awayTeam" :header="t('sportMatchesManagement.table.awayTeam')" />
      <Column field="schedule" :header="t('sportMatchesManagement.table.schedule')" />
      <Column field="venue" :header="t('sportMatchesManagement.table.venue')" />

      <Column field="status" :header="t('sportMatchesManagement.table.status')">
        <template #body="{ data }">
          <!-- Label is already localized by this table (`sportMatchesManagement.status.*`). -->
          <StatusBadge
            :status="statusTone(data.status)"
            :label="statusLabel(data.status)"
            :translate-label="false"
            size="sm"
          />
        </template>
      </Column>

      <Column
        field="actions"
        :header="t('sportMatchesManagement.table.actions')"
        header-class="text-right"
      >
        <template #body="{ data }">
          <div class="flex justify-end">
            <ActionsButton
              :item="data"
              :view-label="actionLabels.results"
              :edit-label="actionLabels.edit"
              :delete-label="actionLabels.delete"
              @view="onResults"
              @edit="emit('edit', $event)"
              @delete="emit('delete', $event)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
