<script setup>
/**
 * TrainingSessionsTable
 * Presentation-focused table for Coach training schedule.
 */
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import ActionsButton from '@/components/buttons/ActionsButton.vue'

defineOptions({
  name: 'TrainingSessionsTable',
})

const props = defineProps({
  /** Array of training session records to display. */
  sessions: {
    type: Array,
    required: true,
  },
  /** Translation function. */
  t: {
    type: Function,
    required: true,
  },
  /** Text to show when there are no rows. */
  emptyText: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  showView: {
    type: Boolean,
    default: true,
  },
  showEdit: {
    type: Boolean,
    default: true,
  },
  showDelete: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['view', 'edit', 'delete'])

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function statusTone(status) {
  const value = normalize(status)
  if (value === 'scheduled') return 'pending'
  if (value === 'live') return 'info'
  if (value === 'completed') return 'success'
  if (value === 'postponed') return 'warning'
  if (value === 'cancelled') return 'danger'
  return 'info'
}

function intensityTone(intensity) {
  const value = normalize(intensity)
  if (value === 'high') return 'danger'
  if (value === 'medium') return 'warning'
  if (value === 'low') return 'success'
  return 'info'
}

function statusLabel(status) {
  const key = `coachTrainingSchedule.status.${normalize(status)}`
  const localized = props.t(key)
  return localized !== key ? localized : status
}

function intensityLabel(intensity) {
  const key = `coachTrainingSchedule.intensity.${normalize(intensity)}`
  const localized = props.t(key)
  return localized !== key ? localized : intensity
}
</script>

<template>
  <div class="training-sessions-table">
    <DataTable
      :value="sessions"
      :loading="loading"
      data-key="id"
      striped-rows
      removable-sort
      class="training-sessions-table__datatable"
    >
      <template #empty>
        <div class="px-4 py-7 text-center text-sm text-surface-500">
          {{ emptyText }}
        </div>
      </template>

      <Column field="title" :header="t('coachTrainingSchedule.table.title')" sortable>
        <template #body="{ data }">
          <div class="flex flex-col">
            <span class="font-bold text-surface-900">{{ data.title }}</span>
            <span class="text-xs text-surface-500">{{ data.focus }}</span>
          </div>
        </template>
      </Column>

      <Column field="team" :header="t('coachTrainingSchedule.table.team')" sortable>
        <template #body="{ data }">
          <div class="flex flex-col">
            <span>{{ data.team }}</span>
            <span class="text-xs text-surface-500">{{ data.division }}</span>
          </div>
        </template>
      </Column>

      <Column field="venue" :header="t('coachTrainingSchedule.table.venue')" sortable />

      <Column field="date" :header="t('coachTrainingSchedule.table.dateTime')" sortable>
        <template #body="{ data }">
          <div class="flex flex-col">
            <span class="font-medium">{{ data.date }}</span>
            <span class="text-xs text-surface-500">{{ data.startTime }} - {{ data.endTime }}</span>
          </div>
        </template>
      </Column>

      <Column field="intensity" :header="t('coachTrainingSchedule.table.intensity')" sortable>
        <template #body="{ data }">
          <StatusBadge
            :status="intensityTone(data.intensity)"
            :label="intensityLabel(data.intensity)"
            :translate-label="false"
            size="sm"
          />
        </template>
      </Column>

      <Column field="status" :header="t('coachTrainingSchedule.table.status')" sortable>
        <template #body="{ data }">
          <StatusBadge
            :status="statusTone(data.status)"
            :label="statusLabel(data.status)"
            :translate-label="false"
            size="sm"
          />
        </template>
      </Column>

      <Column
        v-if="showView || showEdit || showDelete"
        field="actions"
        :header="t('coachTrainingSchedule.table.actions')"
        header-class="text-right"
      >
        <template #body="{ data }">
          <div class="flex justify-end">
            <ActionsButton
              :item="data"
              :show-view="showView"
              :show-edit="showEdit && !readOnly"
              :show-delete="showDelete && !readOnly"
              @view="emit('view', $event)"
              @edit="emit('edit', $event)"
              @delete="emit('delete', $event)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.training-sessions-table :deep(.p-datatable-thead > tr > th) {
  background-color: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.training-sessions-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}
</style>
