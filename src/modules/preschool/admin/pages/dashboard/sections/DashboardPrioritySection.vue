<script setup>
import PreschoolDashboardActionList from '@/modules/preschool/admin/components/dashboard/PreschoolDashboardActionList.vue'

defineOptions({
  name: 'DashboardPrioritySection',
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
  cardTitle: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="preschool-dashboard-page__section preschool-dashboard-page__section--priority">
    <div class="preschool-dashboard-page__section-header">
      <div>
        <h2 class="preschool-dashboard-page__section-title">{{ title }}</h2>
        <p class="preschool-dashboard-page__section-subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <PreschoolDashboardActionList
      :title="cardTitle"
      :items="items"
      :empty-text="emptyText"
    />
  </section>
</template>

