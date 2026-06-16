<script setup>
import ChangeSeverityBadge from './ChangeSeverityBadge.vue'

defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    default: 'Governance difference table',
  },
  subtitle: {
    type: String,
    default: 'Side-by-side institutional changes across the selected contexts.',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyLabel: {
    type: String,
    default: 'No governance differences detected.',
  },
})

function renderValue(value) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="space-y-1">
      <h3 class="text-sm font-semibold text-slate-900">{{ title }}</h3>
      <p class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <div v-if="loading" class="mt-4 px-1 py-6 text-sm text-slate-500">
      Loading diff rows...
    </div>

    <div v-else-if="!rows.length" class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
      {{ emptyLabel }}
    </div>

    <div v-else class="mt-4 overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-4 py-3">{{ columns.section || 'Section' }}</th>
            <th class="px-4 py-3">{{ columns.entity || 'Entity' }}</th>
            <th class="px-4 py-3">{{ columns.field || 'Field' }}</th>
            <th class="px-4 py-3">{{ columns.previousValue || 'Previous Value' }}</th>
            <th class="px-4 py-3">{{ columns.currentValue || 'Current Value' }}</th>
            <th class="px-4 py-3">{{ columns.differenceType || 'Difference Type' }}</th>
            <th class="px-4 py-3">{{ columns.severity || 'Severity' }}</th>
            <th class="px-4 py-3">{{ columns.governanceImpact || 'Governance Impact' }}</th>
            <th class="px-4 py-3">{{ columns.reviewStatus || 'Review Status' }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr v-for="row in rows" :key="`${row.section}-${row.entity}-${row.field}`">
            <td class="px-4 py-3 font-medium text-slate-900">{{ row.section }}</td>
            <td class="px-4 py-3 text-slate-600">{{ row.entity }}</td>
            <td class="px-4 py-3 text-slate-600">{{ row.field }}</td>
            <td class="px-4 py-3 text-slate-600">{{ renderValue(row.previousValue) }}</td>
            <td class="px-4 py-3 text-slate-600">{{ renderValue(row.currentValue) }}</td>
            <td class="px-4 py-3 text-slate-600">{{ row.differenceType }}</td>
            <td class="px-4 py-3"><ChangeSeverityBadge :severity="row.severity" :label="row.severityLabel || row.severity" /></td>
            <td class="px-4 py-3 text-slate-600">{{ row.governanceImpact }}</td>
            <td class="px-4 py-3 text-slate-600">{{ row.reviewStatus }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
