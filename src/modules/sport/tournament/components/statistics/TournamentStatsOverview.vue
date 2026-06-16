<script setup>
import { computed } from 'vue'
import StatsCards from '@/components/data-display/StatsCards.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentStatsOverview',
})

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useLanguage()

const cards = computed(() => {
  const summary = props.summary || {}
  const topScorer = summary.topScorer || {}
  const topAssistProvider = summary.topAssistProvider || {}
  const fairPlayLeader = summary.fairPlayLeader || {}

  return [
    {
      title: t('sportTournament.statistics.labels.totalMatches'),
      value: summary.totalMatches ?? 0,
      label: t('sportTournament.statistics.labels.completedMatches'),
      status: 'info',
    },
    {
      title: t('sportTournament.statistics.labels.totalGoals'),
      value: summary.totalGoals ?? 0,
      label: t('sportTournament.statistics.labels.goalsPerMatch'),
      status: 'success',
    },
    {
      title: t('sportTournament.statistics.labels.topScorer'),
      value: topScorer.goals ?? 0,
      label: `${topScorer.playerName || '-'} · ${topScorer.assists ?? 0} ${t('sportTournament.statistics.labels.assists')}`,
      status: 'warning',
    },
    {
      title: t('sportTournament.statistics.labels.topAssistProvider'),
      value: topAssistProvider.assists ?? 0,
      label: `${topAssistProvider.playerName || '-'} · ${topAssistProvider.goals ?? 0} ${t('sportTournament.statistics.labels.goals')}`,
      status: 'info',
    },
    {
      title: t('sportTournament.statistics.labels.totalYellowCards'),
      value: summary.totalYellowCards ?? 0,
      label: t('sportTournament.statistics.labels.yellowCards'),
      status: 'warning',
    },
    {
      title: t('sportTournament.statistics.labels.totalRedCards'),
      value: summary.totalRedCards ?? 0,
      label: t('sportTournament.statistics.labels.redCards'),
      status: 'error',
    },
    {
      title: t('sportTournament.statistics.labels.fairPlayLeader'),
      value: fairPlayLeader.fairPlayPoints ?? 0,
      label: `${fairPlayLeader.teamName || '-'} · ${fairPlayLeader.fairPlayPoints ?? 0} ${t('sportTournament.statistics.labels.fairPlayPoints')}`,
      status: 'success',
    },
    {
      title: t('sportTournament.statistics.labels.goalsPerMatch'),
      value: summary.goalsPerMatch ?? 0,
      label: t('sportTournament.statistics.labels.scheduledMatches'),
      status: 'info',
    },
  ]
})
</script>

<template>
  <StatsCards :cards="cards" />
</template>
