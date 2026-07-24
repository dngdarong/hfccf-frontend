<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import DashboardOverview from './DashboardOverview.vue'

defineOptions({
  name: 'RoleDashboardLayout',
})

const props = defineProps({
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
  spotlightTitle: {
    type: String,
    default: '',
  },
  spotlightText: {
    type: String,
    default: '',
  },
  actions: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <MainLayout>
    <section class="dashboard-page">
      <HeaderSection :title="props.title" :subtitle="props.subtitle" />
      <DashboardOverview
        :cards="props.cards"
        :spotlight-title="props.spotlightTitle"
        :spotlight-text="props.spotlightText"
        :actions="props.actions"
      />
      <slot />
    </section>
  </MainLayout>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>

