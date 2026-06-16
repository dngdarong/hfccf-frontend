<script setup>
import StatsCards from '@/components/data-display/StatsCards.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentGroupStats',
})

defineProps({
  summary: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useLanguage()

function createStatCard(titleKey, value, labelKey, status) {
  return {
    title: t(titleKey),
    titleKey,
    value,
    label: t(labelKey),
    labelKey,
    status,
  }
}
</script>

<template>
  <section class="group-stats">
    <StatsCards
      :cards="[
        createStatCard('sportTournament.groups.stats.groups', summary.groupCount || 0, 'sportTournament.groups.stats.groupsLabel', 'info'),
        createStatCard('sportTournament.groups.stats.capacity', summary.capacity || 0, 'sportTournament.groups.stats.capacityLabel', 'warning'),
        createStatCard('sportTournament.groups.stats.assigned', summary.assignedCount || 0, 'sportTournament.groups.stats.assignedLabel', 'success'),
        createStatCard('sportTournament.groups.stats.unassigned', summary.unassignedCount || 0, 'sportTournament.groups.stats.unassignedLabel', 'error'),
        createStatCard('sportTournament.groups.stats.seeds', summary.seededCount || 0, 'sportTournament.groups.stats.seedsLabel', 'info'),
        createStatCard('sportTournament.groups.stats.fillRate', `${summary.fillRate || 0}%`, 'sportTournament.groups.stats.fillRateLabel', 'success'),
      ]"
    />
  </section>
</template>

<style scoped>
.group-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
