<script setup>
// Keep schedule state visible through a tiny badge so pages can reuse the
// same status tone everywhere without repeating badge markup.
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'active',
  },
  label: {
    type: String,
    default: '',
  },
})

const badgeClassMap = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  inactive: 'bg-amber-100 text-amber-700 border-amber-200',
  archived: 'bg-slate-100 text-slate-600 border-slate-200',
}

const resolvedClass = computed(() => badgeClassMap[props.status] || badgeClassMap.active)
</script>

<template>
  <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold" :class="resolvedClass">
    {{ label || status }}
  </span>
</template>
