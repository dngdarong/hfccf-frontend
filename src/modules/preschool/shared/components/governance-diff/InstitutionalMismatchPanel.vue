<script setup>
import ChangeSeverityBadge from './ChangeSeverityBadge.vue'

defineProps({
  mismatches: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Institutional mismatches',
  },
  subtitle: {
    type: String,
    default: 'Mismatch signals derived from immutable records and audit context.',
  },
  emptyLabel: {
    type: String,
    default: 'No institutional mismatches detected.',
  },
  sourceLabel: {
    type: String,
    default: 'Source',
  },
  statusLabel: {
    type: String,
    default: 'Status',
  },
  detectedLabel: {
    type: String,
    default: 'Detected',
  },
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="space-y-1">
      <h3 class="text-sm font-semibold text-slate-900">{{ title }}</h3>
      <p class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <div v-if="!mismatches.length" class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
      {{ emptyLabel }}
    </div>

    <div v-else class="mt-4 space-y-3">
      <article v-for="item in mismatches" :key="item.key" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <ChangeSeverityBadge :severity="item.severity" :label="item.severityLabel || item.severity" />
              <span class="text-xs uppercase tracking-wide text-slate-500">{{ sourceLabel }}: {{ item.source || 'institutional' }}</span>
            </div>
            <p class="text-sm font-medium text-slate-900">{{ item.message }}</p>
            <p class="text-xs text-slate-500">{{ item.reviewAction }}</p>
          </div>
          <div class="text-right text-xs text-slate-500">
            <p>{{ statusLabel }}: {{ item.reviewStatus || 'open' }}</p>
            <p>{{ detectedLabel }}: {{ item.detectedAt || '-' }}</p>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
