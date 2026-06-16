<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import TournamentStatsOverview from './TournamentStatsOverview.vue'
import TournamentTopScorersTable from './TournamentTopScorersTable.vue'
import TournamentTeamStatsCard from './TournamentTeamStatsCard.vue'
import TournamentDisciplineRanking from './TournamentDisciplineRanking.vue'

defineOptions({
  name: 'TournamentStatisticsPanel',
})

const props = defineProps({
  statistics: {
    type: Object,
    default: () => ({}),
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const { t } = useLanguage()

const summary = computed(() => props.statistics?.summary || {})
const rankings = computed(() => props.statistics?.rankings || {})

const topScorers = computed(() => rankings.value.topScorers || [])
const topAssistProviders = computed(() => rankings.value.topAssistProviders || [])
const bestAttack = computed(() => rankings.value.bestAttack || [])
const bestDefense = computed(() => rankings.value.bestDefense || [])
const fairPlayRanking = computed(() => rankings.value.fairPlay || [])
</script>

<template>
  <section class="tournament-statistics-panel">
    <div class="tournament-statistics-panel__head">
      <div>
        <p class="tournament-statistics-panel__eyebrow">{{ t('sportTournament.statistics.title') }}</p>
        <h3 class="tournament-statistics-panel__title">{{ t('sportTournament.statistics.panel.title') }}</h3>
        <p class="tournament-statistics-panel__subtitle">{{ t('sportTournament.statistics.panel.subtitle') }}</p>
      </div>
    </div>

    <TournamentStatsOverview :summary="summary" />

    <div v-if="!compact" class="tournament-statistics-panel__grid">
      <TournamentTopScorersTable
        :title="t('sportTournament.statistics.topScorers')"
        :subtitle="t('sportTournament.statistics.panel.topScorersSubtitle')"
        :rows="topScorers"
        mode="goals"
      />

      <TournamentTopScorersTable
        :title="t('sportTournament.statistics.topAssistProviders')"
        :subtitle="t('sportTournament.statistics.panel.topAssistsSubtitle')"
        :rows="topAssistProviders"
        mode="assists"
      />

      <TournamentTeamStatsCard
        :title="t('sportTournament.statistics.bestAttack')"
        :subtitle="t('sportTournament.statistics.panel.bestAttackSubtitle')"
        :team="bestAttack[0] || {}"
        mode="attack"
      />

      <TournamentTeamStatsCard
        :title="t('sportTournament.statistics.bestDefense')"
        :subtitle="t('sportTournament.statistics.panel.bestDefenseSubtitle')"
        :team="bestDefense[0] || {}"
        mode="defense"
      />

      <TournamentDisciplineRanking
        :title="t('sportTournament.statistics.discipline')"
        :subtitle="t('sportTournament.statistics.panel.disciplineSubtitle')"
        :rows="fairPlayRanking"
      />
    </div>
  </section>
</template>

<style scoped>
.tournament-statistics-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.15rem;
  border-radius: 1.4rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(0, 174, 239, 0.08), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 22px 45px -38px rgba(15, 23, 42, 0.42);
}

.tournament-statistics-panel__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tournament-statistics-panel__title {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 1.08rem;
  font-weight: 800;
}

.tournament-statistics-panel__subtitle {
  margin: 0.35rem 0 0;
  color: #475569;
  line-height: 1.6;
}

.tournament-statistics-panel__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.tournament-statistics-panel__grid > :deep(.team-stats-card),
.tournament-statistics-panel__grid > :deep(.discipline-card) {
  height: 100%;
}

@media (max-width: 1024px) {
  .tournament-statistics-panel__grid {
    grid-template-columns: 1fr;
  }
}
</style>
