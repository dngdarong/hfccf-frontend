<script setup>
import { computed } from 'vue'

const props = defineProps({
  severity: {
    type: String,
    default: 'LOW',
  },
  label: {
    type: String,
    default: '',
  },
})

const tone = computed(() => {
  const severity = String(props.severity || 'LOW').toUpperCase()

  if (severity === 'CRITICAL') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }

  if (severity === 'HIGH') {
    return 'border-orange-200 bg-orange-50 text-orange-700'
  }

  if (severity === 'MEDIUM' || severity === 'MODERATE') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
})
</script>

<template>
  <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide" :class="tone">
    {{ label || severity || 'LOW' }}
  </span>
</template>
