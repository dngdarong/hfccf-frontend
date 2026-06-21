<script setup>
defineProps({
  title: {
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
  loading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: 'Loading report...',
  },
  emptyText: {
    type: String,
    default: 'No data available.',
  },
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div v-if="title" class="mb-3">
      <h3 class="text-sm font-semibold text-slate-900">{{ title }}</h3>
    </div>

    <div v-if="loading" class="px-1 py-6 text-sm text-slate-500">{{ loadingText }}</div>
    <div v-else-if="!rows.length" class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
      {{ emptyText }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th v-for="column in columns" :key="column.key" class="px-4 py-3">{{ column.label }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr v-for="(row, index) in rows" :key="row.id || row.key || index">
            <td v-for="column in columns" :key="column.key" class="px-4 py-3 text-slate-600">
              <slot :name="column.key" :row="row" :value="row[column.key]">
                {{ row[column.key] ?? '-' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
