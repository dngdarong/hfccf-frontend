<script setup>
import ReportSummaryCard from '@/modules/preschool/shared/components/report/ReportSummaryCard.vue'

defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <ReportSummaryCard
      v-for="card in cards"
      :key="card.title"
      :title="card.title"
      :value="card.value"
      :caption="card.caption"
    />
  </div>
</template>
