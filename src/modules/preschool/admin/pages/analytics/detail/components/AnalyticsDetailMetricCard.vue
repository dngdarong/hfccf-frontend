<script setup>
import AnalyticsMetricCard from '../../components/AnalyticsMetricCard.vue'

defineProps({
  title: {
    type: String,
    default: '',
  },
  value: {
    type: [String, Number],
    default: '',
  },
  caption: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: 'slate',
  },
  to: {
    type: [Object, String],
    default: null,
  },
  detailsLabel: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <AnalyticsMetricCard
    :title="title"
    :value="value"
    :caption="caption"
    :tone="tone"
    :to="to"
    :details-label="detailsLabel"
  />
</template>
