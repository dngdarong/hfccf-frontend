<script setup>
import { computed } from 'vue'
import Button from '@/components/buttons/Button.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import TournamentStatusBadge from '../shared/TournamentStatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { formatTournamentDateRange, getTournamentTeamCount } from './tournamentListUtils'

defineOptions({
  name: 'TournamentTable',
})

const props = defineProps({
  tournaments: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['view', 'edit'])
const { t, language } = useLanguage()

const resolvedEmptyText = computed(() =>
  props.emptyText || t('sportTournament.list.empty'),
)

</script>

<template>
  <DataTable
    :value="tournaments"
    :loading="loading"
    data-key="id"
    striped-rows
    removable-sort
    class="tournament-table ui-data-table"
    :pt="{
      root: { class: '!overflow-hidden !rounded-[1.1rem] !border !border-surface-200 !bg-white' },
      headerRow: { class: '!bg-slate-50' },
      headerCell: { class: '!border-b !border-surface-200 !bg-slate-50 !px-4 !py-3 !text-[0.75rem] !font-bold !tracking-[0.06em] !text-surface-600 uppercase' },
      bodyCell: { class: '!border-b !border-slate-100 !bg-white !px-4 !py-3 !text-surface-700' },
      emptyMessage: { class: '!bg-white' },
    }"
  >
    <template #empty>
      <div class="p-6 text-center text-sm text-surface-500">
        {{ resolvedEmptyText }}
      </div>
    </template>

    <Column field="rowNumber" :header="t('sportTournament.list.table.number')">
      <template #body="{ data }">
        <span class="text-sm font-semibold text-surface-700">{{ data.rowNumber }}</span>
      </template>
    </Column>

    <Column :header="t('sportTournament.list.table.name')" field="name" sortable>
      <template #body="{ data }">
        <div class="min-w-0">
          <p class="m-0 line-clamp-2 text-sm font-extrabold leading-5 text-surface-900" :title="data.name">
            {{ data.name }}
          </p>
          <p class="m-0 mt-1 truncate text-xs leading-5 text-surface-500" :title="data.organizer || data.description">
            {{ data.organizer || data.description || '-' }}
          </p>
        </div>
      </template>
    </Column>

    <Column :header="t('sportTournament.list.table.state')" field="state" sortable>
      <template #body="{ data }">
        <TournamentStatusBadge :state="data.state" />
      </template>
    </Column>

    <Column :header="t('sportTournament.list.table.season')" field="season" sortable>
      <template #body="{ data }">
        <div class="text-sm">
          <p class="m-0 font-semibold text-surface-900">{{ data.season || '-' }}</p>
          <p class="m-0 mt-1 text-xs text-surface-500">{{ data.sportType || '-' }}</p>
        </div>
      </template>
    </Column>

    <Column :header="t('sportTournament.list.table.schedule')" field="startAt" sortable>
      <template #body="{ data }">
        <div class="text-sm">
          <p class="m-0 font-semibold text-surface-900">{{ formatTournamentDateRange(data, language) }}</p>
          <p class="m-0 mt-1 text-xs text-surface-500">{{ data.location || '-' }}</p>
        </div>
      </template>
    </Column>

    <Column :header="t('sportTournament.list.table.teams')" field="registeredTeams" sortable>
      <template #body="{ data }">
        <div class="text-sm">
          <p class="m-0 font-semibold text-surface-900">{{ getTournamentTeamCount(data) }}</p>
          <p class="m-0 mt-1 text-xs text-surface-500">
            {{ t('sportTournament.list.table.teamsSubtitle') }}
          </p>
        </div>
      </template>
    </Column>

    <Column :header="t('sportTournament.list.table.actions')" :exportable="false">
      <template #body="{ data }">
        <div class="flex flex-wrap gap-2">
          <Button
            type="button"
            severity="secondary"
            outlined
            size="small"
            class="tournament-table__action"
            :label="t('common.view')"
            @click="emit('view', data)"
          />
          <Button
            type="button"
            severity="info"
            outlined
            size="small"
            class="tournament-table__action"
            :label="t('common.edit')"
            @click="emit('edit', data)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
.tournament-table :deep(.p-datatable-tbody > tr) {
  transition: background-color 160ms ease;
}

.tournament-table :deep(.p-datatable-tbody > tr:hover > td) {
  background: #f8fafc;
}

.tournament-table__action { min-height: 2.25rem; }

@media (min-width: 768px) {
  .tournament-table :deep(.p-datatable-table) { table-layout: fixed; }
  .tournament-table :deep(.p-datatable-thead > tr > th:nth-child(1)) { width: 7%; }
  .tournament-table :deep(.p-datatable-thead > tr > th:nth-child(2)) { width: 29%; }
  .tournament-table :deep(.p-datatable-thead > tr > th:nth-child(3)) { width: 12%; }
  .tournament-table :deep(.p-datatable-thead > tr > th:nth-child(4)) { width: 10%; }
  .tournament-table :deep(.p-datatable-thead > tr > th:nth-child(5)) { width: 21%; }
  .tournament-table :deep(.p-datatable-thead > tr > th:nth-child(6)) { width: 9%; }
  .tournament-table :deep(.p-datatable-thead > tr > th:nth-child(7)) { width: 12%; }
}
</style>


