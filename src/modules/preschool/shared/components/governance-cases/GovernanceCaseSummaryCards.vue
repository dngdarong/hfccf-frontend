<script setup>
defineOptions({
  name: 'GovernanceCaseSummaryCards',
})

defineProps({
  summary: {
    type: Object,
    default: () => ({}),
  },
  titleMap: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
    <div
      v-for="card in [
        { key: 'openCases', tone: 'text-slate-900', border: 'border-slate-200' },
        { key: 'underReviewCases', tone: 'text-blue-700', border: 'border-blue-200' },
        { key: 'escalatedCases', tone: 'text-rose-700', border: 'border-rose-200' },
        { key: 'criticalCases', tone: 'text-orange-700', border: 'border-orange-200' },
        { key: 'overdueCases', tone: 'text-amber-700', border: 'border-amber-200' },
        { key: 'resolvedCases', tone: 'text-emerald-700', border: 'border-emerald-200' },
      ]"
      :key="card.key"
      class="rounded-2xl border bg-white p-4 shadow-sm"
      :class="card.border"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ titleMap[card.key] || card.key }}</p>
      <p class="mt-2 text-3xl font-semibold" :class="card.tone">{{ summary[card.key] ?? 0 }}</p>
    </div>
  </div>
</template>
