<script setup>
import { computed } from 'vue'
import AnalyticsDetailMetricCard from './components/AnalyticsDetailMetricCard.vue'
import AnalyticsDetailEmptyState from './components/AnalyticsDetailEmptyState.vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  metrics: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: '',
  },
})

const hasMetrics = computed(() => props.metrics.length > 0)
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
      <p class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <AnalyticsDetailEmptyState v-if="!hasMetrics" :title="emptyText" />

    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AnalyticsDetailMetricCard
        v-for="metric in metrics"
        :key="metric.label"
        :title="metric.label"
        :value="metric.value"
        :caption="metric.caption"
        :tone="metric.tone"
        :to="metric.to"
        :details-label="metric.detailsLabel"
      />
    </div>
  </section>
</template>
