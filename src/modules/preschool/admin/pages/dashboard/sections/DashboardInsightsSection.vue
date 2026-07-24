<script setup>
import DashboardInsightCard from '@/modules/preschool/admin/pages/dashboard/components/DashboardInsightCard.vue'

defineOptions({
  name: 'DashboardInsightsSection',
})

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  cards: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section class="preschool-dashboard-page__section">
    <div class="preschool-dashboard-page__section-header">
      <div>
        <h2 class="preschool-dashboard-page__section-title">{{ title }}</h2>
        <p class="preschool-dashboard-page__section-subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <div class="preschool-dashboard-page__insight-grid">
      <DashboardInsightCard
        v-for="card in cards"
        :key="card.title"
        :card="card"
      />
    </div>
  </section>
</template>

