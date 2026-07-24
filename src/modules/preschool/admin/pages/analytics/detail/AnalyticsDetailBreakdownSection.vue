<script setup>
import AnalyticsBreakdownList from '../components/AnalyticsBreakdownList.vue'
import AnalyticsDetailEmptyState from './components/AnalyticsDetailEmptyState.vue'

defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: '',
  },
  viewLabel: {
    type: String,
    default: '',
  },
  itemTo: {
    type: Function,
    default: null,
  },
})
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
      <p class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <AnalyticsDetailEmptyState v-if="!items.length" :title="emptyText" />
    <AnalyticsBreakdownList
      v-else
      :title="title"
      :subtitle="subtitle"
      :items="items"
      :empty-text="emptyText"
      :view-label="viewLabel"
      :item-to="itemTo"
    />
  </section>
</template>
