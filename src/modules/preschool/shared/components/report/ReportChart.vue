<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  series: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: 'No chart data available.',
  },
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="mb-4">
      <h3 class="text-sm font-semibold text-slate-900">{{ title }}</h3>
      <p v-if="subtitle" class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <div v-if="!series.length" class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
      {{ emptyText }}
    </div>

    <div v-else class="space-y-3">
      <div v-for="item in series" :key="item.label" class="space-y-1">
        <div class="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>{{ item.label }}</span>
          <span>{{ item.value }}</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-slate-100">
          <div class="h-full rounded-full bg-slate-900" :style="{ width: `${Math.min(Number(item.value) || 0, 100)}%` }" />
        </div>
      </div>
    </div>
  </div>
</template>
