<script setup>
/**
 * TrainingScheduleCoachPage
 * Dedicated page for sport coaches to manage their training sessions.
 */
import { computed, onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import PlayerInfoToolbar from '@/modules/sport/admin/components/player-management/PlayerInfoToolbar.vue'
import Button from '@/components/buttons/Button.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import Dialog from 'primevue/dialog'
import Loading from '@/components/feedback/Loading.vue'
import { useLanguage } from '@/composables/useLanguage'
import TrainingSearchFilterBar from '../components/TrainingSearchFilterBar.vue'
import TrainingSessionsTable from '../components/TrainingSessionsTable.vue'
import TrainingSessionDetail from '../components/TrainingSessionDetail.vue'
import { useTrainingSessions } from '@/modules/sport/composables/useTrainingSessions'

defineOptions({
  name: 'TrainingScheduleCoachPage',
})

const { t, language } = useLanguage()
const isKh = computed(() => language.value === 'KH')

// Page Metadata
const title = computed(() => t('coachTrainingSchedule.title'))
const subtitle = computed(() => t('coachTrainingSchedule.subtitle'))
const {
  currentPage,
  error,
  intensityFilter,
  items: sessions,
  load,
  loadDetail,
  loading,
  pagination,
  readOnly,
  searchQuery,
  statusFilter,
  trainingTypeFilter,
  teamFilter,
} = useTrainingSessions({
  readOnly: true,
  messages: {
    load: t('coachTrainingSchedule.messages.loadFailed'),
  },
})

const intensityOptions = computed(() => [...new Set(sessions.value.map((session) => session.intensity).filter(Boolean))].sort())
const statusOptions = computed(() => [...new Set(sessions.value.map((session) => session.status).filter(Boolean))].sort())
const trainingTypeOptions = ['technical', 'tactical', 'fitness', 'recovery', 'match_preparation']
const teamOptions = computed(() => {
  const options = new Map()
  sessions.value.forEach((session) => {
    if (session.teamId && session.team) options.set(String(session.teamId), session.team)
  })
  return [...options].map(([value, label]) => ({ value, label }))
})

// Toolbar Metadata
const toolbarEyebrow = computed(() => t('coachTrainingSchedule.toolbarEyebrow'))
const toolbarTitle = computed(() =>
  t('coachTrainingSchedule.toolbarSummary', { count: pagination.value.total }),
)
const toolbarText = computed(() =>
  t('coachTrainingSchedule.visibleRange', {
    shown: sessions.value.length,
    total: pagination.value.total,
  }),
)
const spotlightValue = computed(() => String(sessions.value.filter((session) => session.status === 'live').length))

const totalPages = computed(() => pagination.value.totalPages)
const detailVisible = ref(false)
const detailSession = ref(null)

onMounted(() => load())

async function openDetail(session) {
  const detail = await loadDetail(session.id)
  if (detail) {
    detailSession.value = detail
    detailVisible.value = true
  }
}

</script>

<template>
  <MainLayout>
    <div :class="['training-schedule-page', { 'training-schedule-page--kh': isKh }]">
      <HeaderSection :title="title" :subtitle="subtitle" />

      <div class="training-schedule-page__content mt-6">
        <PlayerInfoToolbar
          :eyebrow="toolbarEyebrow"
          :title="toolbarTitle"
          :text="toolbarText"
          :spotlight-label="t('coachTrainingSchedule.spotlightLabel')"
          :spotlight-value="spotlightValue"
        />

        <div class="training-schedule-page__filters mt-6">
          <TrainingSearchFilterBar
            v-model:searchQuery="searchQuery"
            v-model:intensity="intensityFilter"
            v-model:status="statusFilter"
            v-model:trainingType="trainingTypeFilter"
            v-model:team="teamFilter"
            :intensity-options="intensityOptions"
            :status-options="statusOptions"
            :training-type-options="trainingTypeOptions"
            :team-options="teamOptions"
            :t="t"
          />
        </div>

        <div class="training-schedule-page__table-wrapper mt-6">
          <TrainingSessionsTable
            v-if="!loading && !error"
            :sessions="sessions"
            :t="t"
            :read-only="readOnly"
            :empty-text="t('coachTrainingSchedule.table.empty')"
            @view="openDetail"
          />

          <Loading v-if="loading" class="mt-6" :label="t('common.states.loading')" />
          <div v-else-if="error" class="mt-6 flex items-center justify-between gap-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <span>{{ error }}</span>
            <button type="button" class="font-bold underline" @click="load()">
              {{ t('common.states.retry') }}
            </button>
          </div>
          <div v-if="!loading && !error && totalPages > 1" class="mt-6 flex justify-end">
            <Pagination v-model="currentPage" :total-pages="totalPages" />
          </div>
        </div>
      </div>
    </div>
    <Dialog v-model:visible="detailVisible" modal :header="t('coachTrainingSchedule.dialogs.detailTitle')" :style="{ width: 'min(42rem, 95vw)' }">
      <TrainingSessionDetail :session="detailSession" :t="t" />
      <template #footer><Button text :label="t('common.close')" @click="detailVisible = false" /></template>
    </Dialog>
  </MainLayout>
</template>

<style scoped>
.training-schedule-page {
  display: flex;
  flex-direction: column;
}

.training-schedule-page__content {
  padding: 2rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.training-schedule-page--kh {
  font-family: 'Noto Sans Khmer', sans-serif;
}

@media (max-width: 768px) {
  .training-schedule-page__content {
    padding: 1rem;
  }
}
</style>
