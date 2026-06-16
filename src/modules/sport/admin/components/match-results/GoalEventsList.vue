<script setup>
/**
 * GoalEventsList
 * A structured table view for all goal and card events in the match.
 * Combines home and away events for a unified timeline view.
 */
import { computed, ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from '@/components/buttons/Button.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import Loading from '@/components/feedback/Loading.vue'
import { useLanguage } from '@/composables/useLanguage'
import { compareMatchEvents } from '@/modules/sport/services/sportApi'

defineOptions({
  name: 'GoalEventsList',
})

const props = defineProps({
  homeEvents: {
    type: Array,
    default: () => [],
  },
  awayEvents: {
    type: Array,
    default: () => [],
  },
  homeTeam: {
    type: String,
    required: true,
  },
  awayTeam: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'delete'])
const { t } = useLanguage()

const eventToDelete = ref(null)
const showDeleteConfirm = ref(false)

const combinedEvents = computed(() => {
  const home = props.homeEvents.map((e) => ({ ...e, team: props.homeTeam, teamType: 'home' }))
  const away = props.awayEvents.map((e) => ({ ...e, team: props.awayTeam, teamType: 'away' }))

  // Keep the incident timeline readable by ordering all team events by match minute.
  return [...home, ...away].sort(compareMatchEvents)
})

function getTagSeverity(type) {
  const value = String(type || '').toLowerCase()
  if (value === 'red_card') return 'danger'
  if (value === 'yellow_card') return 'warn'
  if (value === 'goal' || value === 'penalty_goal') return 'success'
  if (value === 'own_goal') return 'warning'
  if (value === 'substitution') return 'info'
  return 'info'
}

function confirmDelete(event) {
  eventToDelete.value = event
  showDeleteConfirm.value = true
}

function onDelete() {
  if (eventToDelete.value) {
    emit('delete', eventToDelete.value)
  }
  cancelDelete()
}

function cancelDelete() {
  showDeleteConfirm.value = false
  eventToDelete.value = null
}
</script>

<template>
  <section class="goal-events-list">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-black text-slate-800">
        {{ t('sportMatchesManagement.resultsEntry.goalEvents.listTitle') }}
      </h3>
    </div>

    <DataTable
      :value="combinedEvents"
      :loading="loading"
      class="p-datatable-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      responsive-layout="scroll"
      :pt="{
        headerRow: { class: 'bg-slate-50' },
        headerCell: { class: 'px-4 py-3 text-[0.7rem] font-bold uppercase tracking-wider text-slate-500' },
        bodyRow: { class: 'hover:bg-slate-50 transition-colors' },
        bodyCell: { class: 'px-4 py-3 text-sm text-slate-700 border-b border-slate-100' },
      }"
    >
      <Column header="#">
        <template #body="{ index }">
          <span class="text-slate-400 font-mono text-xs">{{ index + 1 }}</span>
        </template>
      </Column>

      <Column field="minute" :header="t('sportMatchesManagement.resultsEntry.goalEvents.minute')">
        <template #body="{ data }">
          <span class="font-mono font-bold text-brand-500">{{ data.minute }}'</span>
        </template>
      </Column>

      <Column field="playerName" :header="t('sportMatchesManagement.resultsEntry.goalEvents.playerName')">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <i class="pi pi-user text-xs text-slate-400"></i>
            <span class="font-bold">{{ data.playerName }}</span>
          </div>
        </template>
      </Column>

      <Column field="team" :header="t('sportMatchesManagement.resultsEntry.fixture.details')">
        <template #body="{ data }">
          <span
            class="inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-widest"
            :class="data.teamType === 'home' ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'"
          >
            {{ data.team }}
          </span>
        </template>
      </Column>

      <Column :header="t('common.type')">
        <template #body="{ data }">
          <Tag
            :value="data.eventType"
            :severity="getTagSeverity(data.eventType)"
            class="!text-[0.6rem] !font-black uppercase"
          />
        </template>
      </Column>

      <Column :header="t('common.table.actions')" align-frozen="right" frozen>
        <template #body="{ data }">
          <div class="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              rounded="full"
              icon="pi pi-pencil"
              :disabled="readonly"
              @click="emit('edit', data)"
            />
            <Button
              type="button"
              variant="ghost"
              size="xs"
              rounded="full"
              icon="pi pi-trash"
              class="!text-hope-red hover:!bg-rose-50"
              :disabled="readonly"
              @click="confirmDelete(data)"
            />
          </div>
        </template>
      </Column>

      <template #loading>
        <div class="flex justify-center p-8">
          <Loading />
        </div>
      </template>

      <template #empty>
        <div class="px-4 py-8 text-center text-slate-400">
          {{ t('sportMatchesManagement.resultsEntry.goalEvents.empty') }}
        </div>
      </template>
    </DataTable>

    <AlertQuestion
      :show="showDeleteConfirm"
      :title="t('sportMatchesManagement.resultsEntry.goalEvents.deleteTitle')"
      :message="t('sportMatchesManagement.resultsEntry.goalEvents.deleteMessage')"
      :confirm-text="t('common.delete')"
      :cancel-text="t('common.cancel')"
      type="danger"
      @confirm="onDelete"
      @cancel="cancelDelete"
    />
  </section>
</template>

<style scoped>
:deep(.p-tag) {
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}
</style>
