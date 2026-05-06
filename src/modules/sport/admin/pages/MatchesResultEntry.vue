<script setup>
/**
 * SportAdminMatchesResultEntryPage
 * Keeps route lookup, validation, alerts, and simulated persistence in one place.
 * Presentational sections live in smaller components under `components/match-results`.
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import { useLanguage } from '@/composables/useLanguage'
import FixtureSummaryCard from '@/modules/sport/admin/components/match-results/FixtureSummaryCard.vue'
import ResultEntryPanel from '@/modules/sport/admin/components/match-results/ResultEntryPanel.vue'
import GoalEventsList from '@/modules/sport/admin/components/match-results/GoalEventsList.vue'
import matchesManagementData from '@/mocks/sport/matches-management-data.json'

defineOptions({
  name: 'SportAdminMatchesResultEntryPage',
})

const router = useRouter()
const route = useRoute()
const { t, language } = useLanguage()

const isKh = computed(() => language.value === 'KH')
const matchId = computed(() => String(route.params.id || '').trim())
const isSubmitting = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const resultEntryValue = ref(createResultValue())

const selectedMatch = computed(() => {
  const matches = Array.isArray(matchesManagementData) ? matchesManagementData : []
  return matches.find((match) => String(match?.id || '').trim() === matchId.value) || null
})

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

const fixtureSummary = computed(() => {
  const match = selectedMatch.value || {}
  const [matchDate = '-', matchTime = '-'] = String(match.schedule || '')
    .trim()
    .split(/\s+/)

  // The card is reusable and expects display-ready strings, so the page handles mock data shaping.
  return {
    homeTeam: String(match.homeTeam || '-'),
    awayTeam: String(match.awayTeam || '-'),
    matchDate,
    matchTime,
    venue: String(match.venue || '-'),
    competition: String(match.competition || '-'),
  }
})

function createResultValue(value = {}) {
  return {
    homeTeam: String(value.homeTeam || ''),
    awayTeam: String(value.awayTeam || ''),
    homeScore: Number(value.homeScore || 0),
    awayScore: Number(value.awayScore || 0),
    status: String(value.status || 'completed'),
    report: String(value.report || ''),
    homeEvents: Array.isArray(value.homeEvents) ? value.homeEvents : [],
    awayEvents: Array.isArray(value.awayEvents) ? value.awayEvents : [],
  }
}

function toScoreNumber(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : 0
}

function parseDisplayScore(score) {
  const [home = '0', away = '0'] = String(score || '')
    .split('-')
    .map((value) => value.trim())

  return {
    home: toScoreNumber(home),
    away: toScoreNumber(away),
  }
}

function resolveScore(match = {}) {
  if ('homeScore' in match || 'awayScore' in match) {
    return {
      home: toScoreNumber(match.homeScore),
      away: toScoreNumber(match.awayScore),
    }
  }

  if ('home_score' in match || 'away_score' in match) {
    return {
      home: toScoreNumber(match.home_score),
      away: toScoreNumber(match.away_score),
    }
  }

  // Backward-compatible while older frontend mock rows still expose display score text.
  return parseDisplayScore(match.score)
}

watch(
  selectedMatch,
  (match) => {
    if (!match) return
    const score = resolveScore(match)
    resultEntryValue.value = createResultValue({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeScore: score.home,
      awayScore: score.away,
      status: match.status || 'completed',
      report: '',
      homeEvents: [],
      awayEvents: [],
    })
  },
  { immediate: true },
)

function resetFeedback() {
  errorMessage.value = ''
  showError.value = false
}

function validateResult(result) {
  if (!selectedMatch.value) return t('sportMatchesManagement.resultsEntry.validation.matchRequired')
  if (Number(result.homeScore) < 0 || Number(result.awayScore) < 0) {
    return t('sportMatchesManagement.resultsEntry.validation.scoreInvalid')
  }
  if (!result.status) return t('sportMatchesManagement.resultsEntry.validation.statusRequired')
  return ''
}

async function onSaveResult(result) {
  resetFeedback()
  const validationError = validateResult(result)
  if (validationError) {
    errorMessage.value = validationError
    showError.value = true
    return
  }

  isSubmitting.value = true
  try {
    // UI-only save: backend result persistence will replace this simulated delay.
    await new Promise((resolve) => setTimeout(resolve, 600))
    resultEntryValue.value = createResultValue(result)
    showSuccess.value = true
  } catch {
    errorMessage.value = t('sportMatchesManagement.resultsEntry.saveFailed')
    showError.value = true
  } finally {
    isSubmitting.value = false
  }
}

function goBackToMatches() {
  router.push({ name: 'dashboard-sport-admin-matches' })
}

function onDeleteEvent(event) {
  const team = event.teamType
  const field = team === 'home' ? 'homeEvents' : 'awayEvents'
  const nextEvents = resultEntryValue.value[field].filter((e) => e.id !== event.id)
  resultEntryValue.value = {
    ...resultEntryValue.value,
    [field]: nextEvents,
    [team === 'home' ? 'homeScore' : 'awayScore']: nextEvents.length,
  }
}

function onEditEvent() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
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
          :loading="isSubmitting"
          :readonly="isSubmitting"
          :status-options="statusOptions"
          @save="onSaveResult"
          @cancel="goBackToMatches"
        />
      </div>

      <div v-if="resultEntryValue.homeEvents.length || resultEntryValue.awayEvents.length" class="mt-6">
        <GoalEventsList
          :home-events="resultEntryValue.homeEvents"
          :away-events="resultEntryValue.awayEvents"
          :home-team="resultEntryValue.homeTeam"
          :away-team="resultEntryValue.awayTeam"
          :loading="isSubmitting"
          :readonly="isSubmitting"
          @edit="onEditEvent"
          @delete="onDeleteEvent"
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
