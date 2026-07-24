<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import { useLanguage } from '@/composables/useLanguage'
import FixtureSummaryCard from '@/modules/sport/admin/components/match-results/FixtureSummaryCard.vue'
import ResultEntryPanel from '@/modules/sport/admin/components/match-results/ResultEntryPanel.vue'
import { useMatchSquad } from '@/modules/sport/match-squads/composables/useMatchSquad'
import { useMatchEvents } from '@/modules/sport/match-events/composables/useMatchEvents'
import MatchEventForm from '@/modules/sport/match-events/components/MatchEventForm.vue'
import MatchTimeline from '@/modules/sport/match-events/components/MatchTimeline.vue'
import { useMatchResultEntry } from '@/modules/sport/admin/composables/useMatchResultEntry'
import {
  createResultValue,
  createDraftEvent,
  buildFixtureSummary,
  validateResult,
  buildResultSavePayload,
} from './utils/resultEntryHelpers'

defineOptions({
  name: 'SportAdminMatchesResultEntryPage',
})

const router = useRouter()
const route = useRoute()
const { t, language } = useLanguage()
const matchId = computed(() => String(route.params.id || '').trim())

const isKh = computed(() => language.value === 'KH')
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const draftEvent = ref(createDraftEvent())
const selectedMatch = computed(() => matchRecord.value)
const pendingDeleteEvent = ref(null)

const { loading: matchLoading, loadMatch, loadMatchSquads, squads, match: matchRecord } = useMatchSquad()
const {
  items: matchEvents,
  loading: eventsLoading,
  loadEvents,
  createEvent,
  updateEvent,
  removeEvent,
} = useMatchEvents()
const {
  loading: saveLoading,
  saveResult,
} = useMatchResultEntry()

const pageTitle = computed(() => t('sportMatchesManagement.resultsEntry.title'))
const pageSubtitle = computed(() => {
  if (!selectedMatch.value) return t('sportMatchesManagement.resultsEntry.subtitle')
  return t('sportMatchesManagement.resultsEntry.matchSubtitle', {
    homeTeam: selectedMatch.value.homeTeam,
    awayTeam: selectedMatch.value.awayTeam,
  })
})

const statusOptions = computed(() => [
  { value: 'completed', label: t('sportMatchesManagement.status.completed') },
  { value: 'live', label: t('sportMatchesManagement.status.live') },
  { value: 'postponed', label: t('sportMatchesManagement.status.postponed') },
  { value: 'cancelled', label: t('sportMatchesManagement.status.cancelled') },
])

const fixtureSummary = computed(() => buildFixtureSummary(selectedMatch.value))
const resultEntryValue = ref(createResultValue())

watch(
  selectedMatch,
  (match) => {
    if (!match) return

    resultEntryValue.value = createResultValue({
      homeTeam: match.homeTeam || '',
      awayTeam: match.awayTeam || '',
      homeScore: match.homeScore ?? 0,
      awayScore: match.awayScore ?? 0,
      status: match.status || 'completed',
      report: match.notes || '',
    })
    draftEvent.value = createDraftEvent()
    pendingDeleteEvent.value = null
  },
  { immediate: true },
)


function resetFeedback() {
  errorMessage.value = ''
  showError.value = false
  showSuccess.value = false
}

function goBackToMatches() {
  router.push({ name: 'dashboard-sport-admin-matches' })
}

function onEditEvent(event) {
  draftEvent.value = createDraftEvent(event)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function requestDeleteEvent(event) {
  pendingDeleteEvent.value = event
}

function cancelDeleteEvent() {
  pendingDeleteEvent.value = null
}

function resetDraftEvent() {
  draftEvent.value = createDraftEvent()
}

async function confirmDeleteEvent() {
  if (!pendingDeleteEvent.value) return

  try {
    await removeEvent(pendingDeleteEvent.value.id)
    showSuccess.value = true
  } catch {
    errorMessage.value = t('sportMatchesManagement.resultsEntry.events.deleteFailed')
    showError.value = true
  } finally {
    cancelDeleteEvent()
  }
}

async function onSubmitEvent(payload) {
  if (payload?.error) {
    errorMessage.value = payload.error
    showError.value = true
    return
  }

  resetFeedback()

  try {
    const target = payload.id ? updateEvent : createEvent
    await target(payload.id || matchId.value, payload)
    draftEvent.value = createDraftEvent()
    showSuccess.value = true
  } catch {
    errorMessage.value = t('sportMatchesManagement.resultsEntry.events.saveFailed')
    showError.value = true
  }
}

async function onSaveResult(result) {
  resetFeedback()

  const validationError = validateResult(result, selectedMatch.value, t)
  if (validationError) {
    errorMessage.value = validationError
    showError.value = true
    return
  }

  try {
    const payload = buildResultSavePayload(result)
    await saveResult(matchId.value, payload)
    showSuccess.value = true
  } catch {
    errorMessage.value = t('sportMatchesManagement.resultsEntry.saveFailed')
    showError.value = true
  }
}

async function loadMatchData() {
  resetFeedback()
  draftEvent.value = createDraftEvent()
  pendingDeleteEvent.value = null

  await Promise.all([
    loadMatch(matchId.value),
    loadMatchSquads(matchId.value),
    loadEvents(matchId.value),
  ])
}

watch(
  matchId,
  () => {
    void loadMatchData()
  },
  { immediate: true },
)
</script>

<template>
  <MainLayout>
    <section :class="isKh ? 'matches-result-entry matches-result-entry--kh' : 'matches-result-entry'">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <div class="matches-result-entry__shell">
        <FixtureSummaryCard
          :home-team="fixtureSummary.homeTeam"
          :away-team="fixtureSummary.awayTeam"
          :home-score="resultEntryValue.homeScore"
          :away-score="resultEntryValue.awayScore"
          :match-date="fixtureSummary.matchDate"
          :match-time="fixtureSummary.matchTime"
          :venue="fixtureSummary.venue"
          :competition="fixtureSummary.competition"
        />

        <ResultEntryPanel
          v-model="resultEntryValue"
          :loading="saveLoading"
          :readonly="saveLoading || matchLoading"
          :show-goal-editors="false"
          :status-options="statusOptions"
          @save="onSaveResult"
          @cancel="goBackToMatches"
        />
      </div>

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <MatchEventForm
          v-model="draftEvent"
          :match="selectedMatch"
          :squads="squads"
          :existing-events="matchEvents"
          :loading="eventsLoading"
          :readonly="eventsLoading"
          @submit="onSubmitEvent"
          @cancel="resetDraftEvent"
        />

        <MatchTimeline
          :events="matchEvents"
          :home-team="selectedMatch?.homeTeam || ''"
          :away-team="selectedMatch?.awayTeam || ''"
          :loading="eventsLoading"
          :readonly="false"
          @edit="onEditEvent"
          @delete="requestDeleteEvent"
        />
      </div>

      <AlertError
        :show="showError"
        :title="t('sportMatchesManagement.resultsEntry.errorTitle')"
        :message="errorMessage || t('common.errorTryAgain')"
        :button-text="t('common.close')"
        @close="showError = false"
      />

      <AlertSuccess
        :show="showSuccess"
        :title="t('sportMatchesManagement.resultsEntry.successTitle')"
        :message="t('sportMatchesManagement.resultsEntry.successMessage')"
        :button-text="t('common.close')"
        @close="showSuccess = false"
      />

      <AlertQuestion
        :show="Boolean(pendingDeleteEvent)"
        :title="t('sportMatchesManagement.resultsEntry.events.deleteTitle')"
        :message="t('sportMatchesManagement.resultsEntry.events.deleteMessage')"
        :confirm-text="t('common.delete')"
        :cancel-text="t('common.cancel')"
        type="danger"
        @confirm="confirmDeleteEvent"
        @cancel="cancelDeleteEvent"
      />
    </section>
  </MainLayout>
</template>

<style scoped>
.matches-result-entry {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.matches-result-entry__shell {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.matches-result-entry--kh,
.matches-result-entry--kh :deep(input),
.matches-result-entry--kh :deep(.p-select-label) {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}
</style>
