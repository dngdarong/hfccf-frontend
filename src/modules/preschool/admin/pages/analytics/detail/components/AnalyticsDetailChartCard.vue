<script setup>
import AnalyticsChartCard from '../../components/AnalyticsChartCard.vue'

defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  chartType: {
    type: String,
    default: 'line',
  },
  series: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: '',
  },
  itemTo: {
    type: Function,
    default: null,
  },
  viewLabel: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <AnalyticsChartCard
    :title="title"
    :subtitle="subtitle"
    :chart-type="chartType"
    :series="series"
    :empty-text="emptyText"
    :item-to="itemTo"
    :view-label="viewLabel"
  />
</template>
