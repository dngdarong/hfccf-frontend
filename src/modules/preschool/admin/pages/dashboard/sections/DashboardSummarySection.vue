<script setup>
import PreschoolDashboardSummary from '@/modules/preschool/admin/components/dashboard/PreschoolDashboardSummary.vue'

defineOptions({
  name: 'DashboardSummarySection',
})

defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <PreschoolDashboardSummary :cards="cards" />
</template>

