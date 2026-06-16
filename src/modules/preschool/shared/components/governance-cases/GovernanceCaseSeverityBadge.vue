<script setup>
defineOptions({
  name: 'GovernanceCaseSeverityBadge',
})

const props = defineProps({
  severity: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
})

const SEVERITY_STYLES = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-800',
  high: 'border-orange-200 bg-orange-50 text-orange-700',
  critical: 'border-rose-200 bg-rose-50 text-rose-700',
}

const normalizedSeverity = (props.severity || '').toLowerCase()
const severityClass = SEVERITY_STYLES[normalizedSeverity] || SEVERITY_STYLES.medium
</script>

<template>
  <span class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize" :class="severityClass">
    {{ label || severity || '-' }}
  </span>
</template>
