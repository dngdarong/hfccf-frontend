<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import TournamentStatusBadge from '../shared/TournamentStatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'

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
const { t } = useLanguage()

const resolvedEmptyText = computed(() =>
  props.emptyText || t('sportTournament.list.empty'),
)

function formatDateRange(tournament) {
  const start = String(tournament?.registrationOpenAt || '').trim()
  const end = String(tournament?.registrationCloseAt || '').trim()

  if (!start && !end) return '-'

  return `${start || '—'} → ${end || '—'}`
}

function teamCount(tournament) {
  const registered = Number(tournament?.statistics?.registeredTeams || 0)
  const total = Number(tournament?.statistics?.totalTeams || tournament?.teams?.length || 0)

  if (!total) return String(registered || 0)

  return `${registered}/${total}`
}
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
      bodyCell: { class: '!border-b !border-slate-100 !bg-white !px-4 !py-3.5 !text-surface-700' },
      emptyMessage: { class: '!bg-white' },
    }"
  >
    <template #empty>
      <div class="p-6 text-center text-sm text-surface-500">
        {{ resolvedEmptyText }}
      </div>
    </template>

    <Column :header="t('sportTournament.list.table.name')" field="name" sortable>
      <template #body="{ data }">
        <div class="min-w-0">
          <p class="m-0 truncate text-sm font-extrabold text-surface-900">
            {{ data.name }}
          </p>
          <p class="m-0 mt-1 line-clamp-2 text-xs leading-5 text-surface-500">
            {{ data.description || '-' }}
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

    <Column :header="t('sportTournament.list.table.schedule')" field="registrationOpenAt" sortable>
      <template #body="{ data }">
        <div class="text-sm">
          <p class="m-0 font-semibold text-surface-900">{{ formatDateRange(data) }}</p>
          <p class="m-0 mt-1 text-xs text-surface-500">{{ data.location || '-' }}</p>
        </div>
      </template>
    </Column>

    <Column :header="t('sportTournament.list.table.teams')" field="registeredTeams" sortable>
      <template #body="{ data }">
        <div class="text-sm">
          <p class="m-0 font-semibold text-surface-900">{{ teamCount(data) }}</p>
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
            text
            rounded
            :label="t('common.view')"
            @click="emit('view', data)"
          />
          <Button
            type="button"
            severity="info"
            text
            rounded
            :label="t('common.edit')"
            @click="emit('edit', data)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

