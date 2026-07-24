<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import RoleDashboardLayout from '@/shared/components/dashboards/RoleDashboardLayout.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchCoachDashboard } from '@/modules/sport/services/sportApi'
import { fetchSportTrainingSessions } from '@/modules/sport/services/api/sportTrainingSessionsApi'
import CoachNextTrainingCard from '../components/CoachNextTrainingCard.vue'
import CoachTeamOverview from '../components/CoachTeamOverview.vue'
import CoachDashboardActions from '../components/CoachDashboardActions.vue'

const { t } = useLanguage()
const router = useRouter()
const dashboard = ref({ summary: {} })
const teams = ref([])
const matches = ref([])
const nextTraining = ref(null)
const loading = ref(true)
const dashboardError = ref('')
const trainingError = ref('')

const cards = computed(() => [
  { title: t('sportCoachDashboard.cards.teams.title'), value: dashboard.value.summary.teams ?? 0, label: t('sportCoachDashboard.cards.teams.label'), status: 'info' },
  { title: t('sportCoachDashboard.cards.matches.title'), value: dashboard.value.summary.matches ?? 0, label: t('sportCoachDashboard.cards.matches.label'), status: 'warning' },
  { title: t('sportCoachDashboard.cards.liveMatches.title'), value: dashboard.value.summary.liveMatches ?? 0, label: t('sportCoachDashboard.cards.liveMatches.label'), status: 'error' },
])

async function loadDashboard() {
  loading.value = true
  dashboardError.value = ''
  trainingError.value = ''

  const [dashboardResult, trainingResult] = await Promise.allSettled([
    fetchCoachDashboard(),
    fetchSportTrainingSessions({ page: 1, perPage: 100, sortBy: 'starts_at', sortDirection: 'asc' }),
  ])

  if (dashboardResult.status === 'fulfilled') {
    dashboard.value = dashboardResult.value || { summary: {} }
    teams.value = dashboard.value.teams || []
    matches.value = dashboard.value.matches || []
  } else {
    dashboardError.value = t('sportCoachDashboard.states.loadError')
    teams.value = []
    matches.value = []
  }

  if (trainingResult.status === 'fulfilled') {
    const now = Date.now()
    nextTraining.value = (trainingResult.value.items || []).find((session) => {
      const startsAt = Date.parse(session.startsAt)
      return !Number.isNaN(startsAt) && startsAt >= now
    }) || null
  } else {
    trainingError.value = t('sportCoachDashboard.states.loadError')
  }

  loading.value = false
}

function navigate(name) {
  router.push({ name })
}

onMounted(loadDashboard)
</script>

<template>
  <RoleDashboardLayout
    :title="t('sportCoachDashboard.title')"
    :subtitle="t('sportCoachDashboard.subtitle')"
    :cards="cards"
  >
    <div class="mt-4 grid gap-4 xl:grid-cols-2">
      <CoachNextTrainingCard
        :session="nextTraining"
        :loading="loading"
        :error="trainingError"
        :t="t"
        @open-schedule="navigate('dashboard-sport-coach-training')"
        @retry="loadDashboard"
      />
      <CoachTeamOverview
        :teams="teams"
        :matches="matches"
        :loading="loading"
        :error="dashboardError"
        :t="t"
        @open-teams="navigate('dashboard-sport-coach-teams')"
        @retry="loadDashboard"
      />
    </div>
    <div class="mt-4">
      <CoachDashboardActions
        :t="t"
        @attendance="navigate('dashboard-sport-coach-attendance')"
        @schedule="navigate('dashboard-sport-coach-training')"
        @teams="navigate('dashboard-sport-coach-teams')"
      />
    </div>
  </RoleDashboardLayout>
</template>
