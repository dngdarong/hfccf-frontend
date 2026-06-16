<script setup>
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Avatar from 'primevue/avatar'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import ActionsButton from '@/components/buttons/ActionsButton.vue'
import { useLanguage } from '@/composables/useLanguage'
import { statusType, teamInitials, teamLogoSrc } from '../utils/teamHelpers'

const { t } = useLanguage()

defineProps({
  teams: {
    type: Array,
    required: true,
  },
  emptyText: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['view', 'edit', 'delete'])

const tablePt = computed(() => ({
  root: {
    class: '!overflow-hidden !rounded-2xl !border !border-surface-200 !bg-white',
  },
  tableContainer: {
    class: '!bg-white',
  },
  table: {
    class: '!bg-white',
  },
  headerRow: {
    class: '!bg-slate-50',
  },
  headerCell: {
    class:
      '!border-b !border-surface-200 !bg-slate-50 !px-4 !py-3.5 !text-[0.75rem] !font-bold !tracking-[0.06em] !text-surface-600 uppercase md:!px-4',
  },
  bodyRow: {
    class: 'odd:!bg-white even:!bg-sky-50/30 hover:!bg-brand-50/60 transition-colors',
  },
  bodyCell: {
    class: '!border-b !border-slate-100 !bg-transparent !px-4 !py-3.5 !text-surface-700 md:!px-4',
  },
  emptyMessage: {
    class: '!bg-white',
  },
}))

function handleView(team) {
  emit('view', team)
}

function handleEdit(team) {
  emit('edit', team)
}

function handleDelete(team) {
  emit('delete', team)
}
</script>

<template>
  <DataTable
    :value="teams"
    data-key="id"
    striped-rows
    removable-sort
    class="teams-table"
    :pt="tablePt"
  >
    <template #empty>
      <div class="px-4 py-7 text-center text-sm text-surface-500">
        {{ emptyText }}
      </div>
    </template>

    <Column field="rowNumber" :header="t('common.table.number')">
      <template #body="{ data }">
        <span class="text-[12px] font-semibold text-surface-700 sm:text-sm">
          {{ data.rowNumber }}
        </span>
      </template>
    </Column>

    <Column field="name" :header="t('sportTeamsManagement.table.team')">
      <template #body="{ data }">
        <div class="flex items-center gap-3">
          <Avatar
            :image="teamLogoSrc(data) || undefined"
            :label="teamLogoSrc(data) ? undefined : teamInitials(data.name)"
            shape="circle"
            class="teams-table-avatar"
          />
          <div>
            <div class="text-[13px] font-semibold leading-5 text-surface-900 sm:text-sm">
              {{ data.name }}
            </div>
            <div class="text-[11px] text-surface-500 sm:text-xs">
              {{ t('sportTeamsManagement.table.captainPrefix', { captain: data.captain }) }}
            </div>
          </div>
        </div>
      </template>
    </Column>

    <Column field="division" :header="t('sportTeamsManagement.table.division')">
      <template #body="{ data }">
        <span class="teams-division-chip">{{ data.division }}</span>
      </template>
    </Column>

    <Column field="coach" :header="t('sportTeamsManagement.table.coach')" />

    <Column field="players" :header="t('sportTeamsManagement.table.players')">
      <template #body="{ data }">
        <span class="font-semibold text-slate-700">{{ data.players }}</span>
      </template>
    </Column>

    <Column field="matches" :header="t('sportTeamsManagement.table.matches')">
      <template #body="{ data }">
        <span class="font-semibold text-slate-700">{{ data.matches || 0 }}</span>
      </template>
    </Column>

    <Column field="record" :header="t('sportTeamsManagement.table.record')">
      <template #body="{ data }">
        <div class="flex flex-col gap-1">
          <span class="font-semibold text-slate-800">
            {{ data.wins }}-{{ data.draws }}-{{ data.losses }}
          </span>
          <span class="text-[11px] text-surface-500">
            {{ t('sportTeamsManagement.table.pointsPrefix', { points: data.points }) }}
          </span>
        </div>
      </template>
    </Column>

    <Column field="venue" :header="t('sportTeamsManagement.table.venue')" />

    <Column field="status" :header="t('common.table.status')">
      <template #body="{ data }">
        <StatusBadge :status="statusType(data.status)" :label="data.status" size="sm" />
      </template>
    </Column>

    <Column field="actions" :header="t('common.table.actions')" header-class="text-right">
      <template #body="{ data }">
        <ActionsButton
          :item="data"
          @view="handleView"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
.teams-table-avatar.p-avatar {
  width: 2.75rem;
  height: 2.75rem;
  box-shadow: 0 10px 18px -14px rgba(0, 174, 239, 0.55);
}

.teams-table-avatar.p-avatar:not(.p-avatar-image) {
  background: linear-gradient(135deg, var(--brand-primary-500) 0%, var(--brand-primary-700) 100%);
  color: #fff;
}

.teams-table-avatar :deep(img) {
  object-fit: cover;
}

.teams-division-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.32rem 0.7rem;
  background: #f0f9ff;
  color: #0369a1;
  font-size: 0.74rem;
  font-weight: 700;
}
</style>
