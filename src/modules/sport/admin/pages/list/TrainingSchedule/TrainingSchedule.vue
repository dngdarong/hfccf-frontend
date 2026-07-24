<script setup>
/**
 * SportTrainingSchedulePage
 * Admin-facing training schedule page for the sport module.
 */
import { computed, ref, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import PlayerInfoToolbar from '@/modules/sport/admin/components/player-management/PlayerInfoToolbar.vue'
import Button from '@/components/buttons/Button.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import Dialog from 'primevue/dialog'
import Loading from '@/components/feedback/Loading.vue'
import { useLanguage } from '@/composables/useLanguage'
import TrainingSearchFilterBar from '@/modules/sport/coach/components/TrainingSearchFilterBar.vue'
import TrainingSessionsTable from '@/modules/sport/coach/components/TrainingSessionsTable.vue'
import TrainingSessionForm from '@/modules/sport/coach/components/TrainingSessionForm.vue'
import TrainingSessionDetail from '@/modules/sport/coach/components/TrainingSessionDetail.vue'
import { useTrainingSessions } from '@/modules/sport/composables/useTrainingSessions'
import { fetchSportCoaches } from '@/modules/sport/services/api/sportCoachesApi'
import { fetchSportTeams } from '@/modules/sport/services/api/sportTeamsApi'

defineOptions({
  name: 'SportTrainingSchedulePage',
})

const { t, language } = useLanguage()
const isKh = computed(() => language.value === 'KH')

// Page copy uses the existing sports training schedule locale bundle.
const title = computed(() => t('coachTrainingSchedule.title'))
const subtitle = computed(() => t('coachTrainingSchedule.subtitle'))
const {
  currentPage,
  error,
  clearError,
  create,
  intensityFilter,
  items: sessions,
  load,
  loading,
  loadDetail,
  pagination,
  remove,
  searchQuery,
  statusFilter,
  trainingTypeFilter,
  teamFilter,
  update,
  saving,
  validationErrors,
} = useTrainingSessions({
  messages: {
    load: t('coachTrainingSchedule.messages.loadFailed'),
  },
})

const showDeleteConfirm = ref(false)
const selectedSession = ref(null)
const formVisible = ref(false)
const formSession = ref(null)
const detailVisible = ref(false)
const detailSession = ref(null)
const formMode = ref('create')
const teams = ref([])
const coaches = ref([])
const optionsLoading = ref(false)
const optionsError = ref('')
const showSuccess = ref(false)
const successMessage = ref('')

const intensityOptions = computed(() => [...new Set(sessions.value.map((session) => session.intensity).filter(Boolean))].sort())
const statusOptions = computed(() => [...new Set(sessions.value.map((session) => session.status).filter(Boolean))].sort())
const trainingTypeOptions = ['technical', 'tactical', 'fitness', 'recovery', 'match_preparation']
const filterTeamOptions = computed(() => {
  const options = new Map()
  sessions.value.forEach((session) => {
    if (session.teamId && session.team) options.set(String(session.teamId), session.team)
  })
  return [...options].map(([value, label]) => ({ value, label }))
})

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
const formTitle = computed(() => formMode.value === 'edit'
  ? t('coachTrainingSchedule.dialogs.editTitle')
  : t('coachTrainingSchedule.dialogs.createTitle'))
const teamOptions = computed(() => teams.value
  .filter((team) => team.status !== 'inactive')
  .map((team) => ({ ...team, id: String(team.id) })))
const coachOptions = computed(() => coaches.value
  .filter((coach) => coach.status !== 'inactive')
  .map((coach) => ({ ...coach, id: String(coach.id) })))

async function loadOptions() {
  optionsLoading.value = true
  optionsError.value = ''
  try {
    const [teamResponse, coachResponse] = await Promise.all([
      fetchSportTeams({ page: 1, perPage: 100, status: 'active' }),
      fetchSportCoaches({ page: 1, perPage: 100, status: 'active' }),
    ])
    teams.value = teamResponse.items || []
    coaches.value = coachResponse.items || []
  } catch (cause) {
    optionsError.value = cause?.message || t('coachTrainingSchedule.messages.optionsFailed')
  } finally {
    optionsLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([load(), loadOptions()])
})

function openCreate() {
  clearError()
  formMode.value = 'create'
  formSession.value = null
  formVisible.value = true
}

function openEdit(session) {
  clearError()
  formMode.value = 'edit'
  formSession.value = session
  formVisible.value = true
}

async function openDetail(session) {
  const detail = await loadDetail(session.id)
  if (detail) {
    detailSession.value = detail
    detailVisible.value = true
  }
}

async function submitForm(payload) {
  const result = formMode.value === 'edit'
    ? await update(formSession.value.id, payload)
    : await create(payload)
  if (!result) return
  formVisible.value = false
  successMessage.value = formMode.value === 'edit'
    ? t('coachTrainingSchedule.feedback.updateSuccess')
    : t('coachTrainingSchedule.feedback.createSuccess')
  showSuccess.value = true
}

function onDeleteSession(session) {
  selectedSession.value = session
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (selectedSession.value) {
    const removed = await remove(selectedSession.value.id)
    if (removed) {
      successMessage.value = t('coachTrainingSchedule.feedback.deleteSuccess')
      showSuccess.value = true
    }
  }
  showDeleteConfirm.value = false
  selectedSession.value = null
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
        >
          <template #actions>
            <Button type="button" icon="pi pi-plus" :label="t('coachTrainingSchedule.actions.addButton')" @click="openCreate" />
          </template>
        </PlayerInfoToolbar>

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
            :team-options="filterTeamOptions"
            :t="t"
          />
        </div>

        <div class="training-schedule-page__table-wrapper mt-6">
          <TrainingSessionsTable
            v-if="!loading && !error"
            :sessions="sessions"
            :t="t"
            :show-view="true"
            :show-edit="true"
            :empty-text="t('coachTrainingSchedule.table.empty')"
            @view="openDetail"
            @edit="openEdit"
            @delete="onDeleteSession"
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

    <AlertQuestion
      :show="showDeleteConfirm"
      :title="t('coachTrainingSchedule.feedback.deleteTitle')"
      :message="t('coachTrainingSchedule.feedback.deleteMessage', { title: selectedSession?.title })"
      :confirm-text="t('common.delete')"
      :cancel-text="t('common.cancel')"
      type="danger"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />

    <Dialog v-model:visible="formVisible" modal :header="formTitle" :style="{ width: 'min(48rem, 95vw)' }">
      <Loading v-if="optionsLoading" :label="t('coachTrainingSchedule.messages.loadingOptions')" />
      <p v-else-if="optionsError" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{{ optionsError }}</p>
      <TrainingSessionForm
        v-else
        :session="formSession"
        :team-options="teamOptions"
        :coach-options="coachOptions"
        :loading="saving"
        :server-errors="validationErrors"
        :error-message="error"
        :t="t"
        @submit="submitForm"
        @cancel="formVisible = false"
      />
    </Dialog>

    <Dialog v-model:visible="detailVisible" modal :header="t('coachTrainingSchedule.dialogs.detailTitle')" :style="{ width: 'min(42rem, 95vw)' }">
      <TrainingSessionDetail :session="detailSession" :t="t" />
      <template #footer><Button text :label="t('common.close')" @click="detailVisible = false" /></template>
    </Dialog>

    <AlertSuccess
      :show="showSuccess"
      :title="t('common.success')"
      :message="successMessage || t('common.actionCompleted')"
      :button-text="t('common.close')"
      @close="showSuccess = false"
    />
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
