<script setup>
/**
 * TrainingScheduleCoachPage
 * Dedicated page for sport coaches to manage their training sessions.
 */
import { computed, ref, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import PlayerInfoToolbar from '@/modules/sport/admin/components/player-management/PlayerInfoToolbar.vue'
import Button from '@/components/buttons/Button.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import { useLanguage } from '@/composables/useLanguage'
import TrainingSearchFilterBar from '../components/TrainingSearchFilterBar.vue'
import TrainingSessionsTable from '../components/TrainingSessionsTable.vue'
import trainingSessionsData from '@/mocks/sport/training-sessions.json'

defineOptions({
  name: 'TrainingScheduleCoachPage',
})

const { t, language } = useLanguage()
const isKh = computed(() => language.value === 'KH')

// Page Metadata
const title = computed(() => t('coachTrainingSchedule.title'))
const subtitle = computed(() => t('coachTrainingSchedule.subtitle'))
const addButtonLabel = computed(() => t('coachTrainingSchedule.actions.addButton'))

// Filter & Pagination State
const searchQuery = ref('')
const intensityFilter = ref('')
const statusFilter = ref('')
const teamFilter = ref('')
const currentPage = ref(1)
const pageSize = 8

// Data State
const sessions = ref([...trainingSessionsData])

// Feedback State
const showAddSuccess = ref(false)
const showDeleteConfirm = ref(false)
const selectedSession = ref(null)

// Computed Options for Filters
const intensityOptions = computed(() => {
  const options = sessions.value.map((s) => s.intensity).filter(Boolean)
  return [...new Set(options)].sort()
})

const statusOptions = computed(() => {
  const options = sessions.value.map((s) => s.status).filter(Boolean)
  return [...new Set(options)].sort()
})

const teamOptions = computed(() => {
  const options = sessions.value.map((s) => s.team).filter(Boolean)
  return [...new Set(options)].sort()
})

// Filtering Logic
function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

const filteredSessions = computed(() => {
  const query = normalize(searchQuery.value)

  return sessions.value.filter((session) => {
    let matches = true

    if (query) {
      const haystack = normalize(`${session.title} ${session.team} ${session.venue} ${session.focus}`)
      matches = haystack.includes(query)
    }

    if (matches && intensityFilter.value) {
      matches = normalize(session.intensity) === normalize(intensityFilter.value)
    }

    if (matches && statusFilter.value) {
      matches = normalize(session.status) === normalize(statusFilter.value)
    }

    if (matches && teamFilter.value) {
      matches = normalize(session.team) === normalize(teamFilter.value)
    }

    return matches
  })
})

// Pagination Logic
const totalPages = computed(() => Math.max(Math.ceil(filteredSessions.value.length / pageSize), 1))
const paginatedSessions = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredSessions.value.slice(start, start + pageSize)
})

watch(
  () => filteredSessions.value.length,
  () => {
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  },
)

// Toolbar Metadata
const toolbarEyebrow = computed(() => t('coachTrainingSchedule.toolbarEyebrow'))
const toolbarTitle = computed(() =>
  t('coachTrainingSchedule.toolbarSummary', { count: filteredSessions.value.length }),
)
const toolbarText = computed(() =>
  t('coachTrainingSchedule.visibleRange', {
    shown: filteredSessions.value.length,
    total: sessions.value.length,
  }),
)
const spotlightValue = computed(() =>
  String(sessions.value.filter((s) => normalize(s.status) === 'live').length),
)

// Actions
function onAddSession() {
  // Placeholder for add functionality
  showAddSuccess.value = true
}

function onViewSession(session) {
  selectedSession.value = session
}

function onEditSession(session) {
  selectedSession.value = session
}

function onDeleteSession(session) {
  selectedSession.value = session
  showDeleteConfirm.value = true
}

function confirmDelete() {
  if (selectedSession.value) {
    sessions.value = sessions.value.filter((s) => s.id !== selectedSession.value.id)
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
            <Button
              type="button"
              :label="addButtonLabel"
              icon="pi pi-plus"
              class="training-schedule-page__add-btn"
              @click="onAddSession"
            />
          </template>
        </PlayerInfoToolbar>

        <div class="training-schedule-page__filters mt-6">
          <TrainingSearchFilterBar
            v-model:searchQuery="searchQuery"
            v-model:intensity="intensityFilter"
            v-model:status="statusFilter"
            v-model:team="teamFilter"
            :intensity-options="intensityOptions"
            :status-options="statusOptions"
            :team-options="teamOptions"
            :t="t"
          />
        </div>

        <div class="training-schedule-page__table-wrapper mt-6">
          <TrainingSessionsTable
            :sessions="paginatedSessions"
            :t="t"
            :empty-text="t('coachTrainingSchedule.table.empty')"
            @view="onViewSession"
            @edit="onEditSession"
            @delete="onDeleteSession"
          />

          <div v-if="totalPages > 1" class="mt-6 flex justify-end">
            <Pagination v-model="currentPage" :total-pages="totalPages" />
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback Dialogs -->
    <AlertSuccess
      :show="showAddSuccess"
      :title="t('coachTrainingSchedule.feedback.addTitle')"
      :message="t('coachTrainingSchedule.feedback.addMessage')"
      :button-text="t('common.close')"
      @close="showAddSuccess = false"
    />

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

.training-schedule-page__add-btn {
  background-color: #00aeef;
  border-color: #00aeef;
  font-weight: 700;
  border-radius: 0.5rem;
}

.training-schedule-page__add-btn:hover {
  background-color: #0089bc !important;
  border-color: #0089bc !important;
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
