<script setup>
import { computed, onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import StatsCards from '@/components/data-display/StatsCards.vue'
import TournamentBanner from '@/modules/sport/admin/components/admin-dashboard/TournamentBanner.vue'
import TournamentList from '@/modules/sport/admin/components/admin-dashboard/TournamentList.vue'
import StandingsPanel from '@/modules/sport/admin/components/admin-dashboard/StandingsPanel.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchSportDashboard } from '@/modules/sport/services/sportApi'

const { t } = useLanguage()

const dashboard = ref({
  summary: {},
  teams: [],
  players: [],
  matches: [],
  events: [],
  tournaments: [],
  featuredTournament: null,
  standings: [],
})

const title = computed(() => t('sportAdminDashboard.title'))
const subtitle = computed(() => t('sportAdminDashboard.subtitle'))

const cards = computed(() => [
  {
    title: t('sportAdminDashboard.cards.totalTeams.title'),
    value: dashboard.value.summary.teams ?? 0,
    label: t('sportAdminDashboard.cards.totalTeams.label'),
    status: 'info',
  },
  {
    title: t('sportAdminDashboard.cards.totalPlayers.title'),
    value: dashboard.value.summary.players ?? 0,
    label: t('sportAdminDashboard.cards.totalPlayers.label'),
    status: 'warning',
  },
  {
    title: t('sportAdminDashboard.cards.upcomingMatches.title'),
    value: dashboard.value.summary.scheduledMatches ?? 0,
    label: t('sportAdminDashboard.cards.upcomingMatches.label'),
    status: 'success',
  },
  {
    title: t('sportAdminDashboard.cards.lowStockItems.title'),
    value: dashboard.value.summary.lowStockItems ?? 0,
    label: t('sportAdminDashboard.cards.lowStockItems.label'),
    status: 'error',
  },
  {
    title: t('sportAdminDashboard.cards.totalCoaches.title'),
    value: dashboard.value.summary.coaches ?? 0,
    label: t('sportAdminDashboard.cards.totalCoaches.label'),
    status: 'info',
  },
])

const featuredTournament = computed(() => dashboard.value.featuredTournament || dashboard.value.tournaments?.[0] || null)
const tournaments = computed(() => dashboard.value.tournaments || [])
const standings = computed(() => dashboard.value.standings || [])
const standingsTitle = computed(() => featuredTournament.value?.name || t('sportAdminDashboard.quickPanels.standings'))
const standingsSubtitle = computed(() => {
  if (!featuredTournament.value) {
    return ''
  }

  return [featuredTournament.value.season, featuredTournament.value.tournamentType].filter(Boolean).join(' • ')
})

const tournament = computed(() => ({
  title: featuredTournament.value?.name || t('sportAdminDashboard.tournamentBanner.title'),
  subtitle:
    featuredTournament.value?.description ||
    (featuredTournament.value?.season
      ? `${featuredTournament.value.season}${featuredTournament.value.tournamentType ? ` • ${featuredTournament.value.tournamentType}` : ''}`
      : t('sportAdminDashboard.tournamentBanner.subtitle')),
  location:
    featuredTournament.value?.season ||
    featuredTournament.value?.tournamentType ||
    t('sportAdminDashboard.tournamentBanner.location'),
  matches: featuredTournament.value?.matchesCount ?? featuredTournament.value?.matches ?? dashboard.value.summary.matches ?? 0,
  status: featuredTournament.value?.status || t('sportAdminDashboard.tournamentBanner.status'),
}))

async function loadDashboard() {
  const payload = await fetchSportDashboard().catch(() => ({
    summary: {},
    teams: [],
    players: [],
    matches: [],
    events: [],
    tournaments: [],
    featuredTournament: null,
    standings: [],
  }))

  dashboard.value = payload

}

onMounted(() => {
  void loadDashboard()
})
</script>

<template>
  <MainLayout>
    <section class="sport-dashboard">
      <div class="sport-dashboard__content">
        <HeaderSection :title="title" :subtitle="subtitle" />
        <div class="sport-dashboard__cards">
          <StatsCards :cards="cards" />
        </div>
        <TournamentBanner
          v-if="featuredTournament"
          :tournamentTitle="tournament.title"
          :tournamentSubtitle="tournament.subtitle"
          :tournamentLocation="tournament.location"
          :tournamentMatches="tournament.matches"
          :tournamentStatus="tournament.status"
          :actionLabel="t('sportAdminDashboard.tournamentBanner.action')"
        />
        <TournamentList :tournaments="tournaments" />
        <StandingsPanel
          :title="standingsTitle"
          :subtitle="standingsSubtitle"
          :standings="standings"
        />
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.sport-dashboard {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.sport-dashboard__content {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.sport-dashboard__cards {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.sport-dashboard__quick-panels {
  display: flex;
  flex-direction: column;
}
</style>
