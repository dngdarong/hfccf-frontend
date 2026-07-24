<script setup>
import { computed } from 'vue'
import AnalyticsDetailTable from './components/AnalyticsDetailTable.vue'
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
  columns: {
    type: Array,
    default: () => [],
  },
  rows: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: '',
  },
  rowTo: {
    type: Function,
    default: null,
  },
})

const hasRows = computed(() => props.rows.length > 0)
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
      <p class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <AnalyticsDetailEmptyState v-if="!hasRows" :title="emptyText" />
    <AnalyticsDetailTable
      v-else
      :title="title"
      :subtitle="subtitle"
      :columns="columns"
      :rows="rows"
      :empty-text="emptyText"
      :row-to="rowTo"
    />
  </section>
</template>
