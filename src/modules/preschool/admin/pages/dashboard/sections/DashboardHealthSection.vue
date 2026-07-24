<script setup>
import DashboardExecutiveHealthBar from '@/modules/preschool/admin/pages/dashboard/components/DashboardExecutiveHealthBar.vue'

defineOptions({
  name: 'DashboardHealthSection',
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
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section class="preschool-dashboard-page__section preschool-dashboard-page__section--health">
    <div class="preschool-dashboard-page__section-header">
      <div>
        <h2 class="preschool-dashboard-page__section-title">{{ title }}</h2>
        <p class="preschool-dashboard-page__section-subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <DashboardExecutiveHealthBar :items="items" />
  </section>
</template>

