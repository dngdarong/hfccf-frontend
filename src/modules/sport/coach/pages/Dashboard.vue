<script setup>
import { computed, onMounted, ref } from 'vue'
import RoleDashboardLayout from '@/shared/components/dashboards/RoleDashboardLayout.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchCoachDashboard } from '@/modules/sport/services/sportApi'

const { t } = useLanguage()
const dashboard = ref({ summary: {} })

const cards = computed(() => [
  { title: t('sportCoachDashboard.cards.teams.title'), value: dashboard.value.summary.teams ?? 0, label: t('sportCoachDashboard.cards.teams.label'), status: 'info' },
  { title: t('sportCoachDashboard.cards.matches.title'), value: dashboard.value.summary.matches ?? 0, label: t('sportCoachDashboard.cards.matches.label'), status: 'warning' },
  { title: t('sportCoachDashboard.cards.liveMatches.title'), value: dashboard.value.summary.liveMatches ?? 0, label: t('sportCoachDashboard.cards.liveMatches.label'), status: 'error' },
  { title: t('sportCoachDashboard.cards.upcoming.title'), value: dashboard.value.summary.upcomingMatches ?? 0, label: t('sportCoachDashboard.cards.upcoming.label'), status: 'success' },
])

onMounted(async () => {
  dashboard.value = await fetchCoachDashboard().catch(() => ({ summary: {} }))
})
</script>

<template>
  <RoleDashboardLayout
    :title="t('sportCoachDashboard.title')"
    :subtitle="t('sportCoachDashboard.subtitle')"
    :cards="cards"
    :spotlight-title="t('sportCoachDashboard.spotlight.title')"
    :spotlight-text="t('sportCoachDashboard.spotlight.text')"
    :actions="[
      t('sportCoachDashboard.actions.finalizePlans'),
      t('sportCoachDashboard.actions.submitNotes'),
      t('sportCoachDashboard.actions.confirmRecovery'),
    ]"
  />
</template>


