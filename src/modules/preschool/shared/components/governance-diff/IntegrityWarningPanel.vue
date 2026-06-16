<script setup>
import ChangeSeverityBadge from './ChangeSeverityBadge.vue'

defineProps({
  warnings: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Integrity warnings',
  },
  subtitle: {
    type: String,
    default: 'Operational warnings that may require institutional review.',
  },
  emptyLabel: {
    type: String,
    default: 'No integrity warnings detected.',
  },
  severityLabel: {
    type: String,
    default: 'Severity',
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

    <div v-if="!warnings.length" class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
      {{ emptyLabel }}
    </div>

    <ul v-else class="mt-4 space-y-3">
      <li v-for="warning in warnings" :key="warning.key" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <ChangeSeverityBadge :severity="warning.severity" :label="warning.severityLabel || warning.severity" />
              <span class="text-xs uppercase tracking-wide text-slate-500">{{ sourceLabel }}: {{ warning.source || 'integrity' }}</span>
            </div>
            <p class="text-sm font-medium text-slate-900">{{ warning.message }}</p>
            <p class="text-xs text-slate-500">{{ warning.reviewAction }}</p>
          </div>
          <div class="text-right text-xs text-slate-500">
            <p>{{ statusLabel }}: {{ warning.reviewStatus || 'open' }}</p>
            <p>{{ detectedLabel }}: {{ warning.detectedAt || '-' }}</p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
