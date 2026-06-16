<script setup>
defineProps({
  level: { type: String, default: null }, // 'low' | 'medium' | 'high' | 'critical'
  size: { type: String, default: 'md' },  // 'sm' | 'md'
})

const cfg = {
  low:      { label: 'Low Risk',      cls: 'bg-green-50 text-green-700 ring-green-200' },
  medium:   { label: 'Medium Risk',   cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  high:     { label: 'High Risk',     cls: 'bg-orange-50 text-orange-700 ring-orange-200' },
  critical: { label: 'Critical Risk', cls: 'bg-red-50 text-red-700 ring-red-200' },
}
</script>

<template>
  <span
    v-if="level && cfg[level]"
    :class="[
      'inline-flex items-center rounded-full font-semibold ring-1 ring-inset',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
      cfg[level].cls,
    ]"
  >
    {{ cfg[level].label }}
  </span>
  <span v-else class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-500">
    —
  </span>
</template>
