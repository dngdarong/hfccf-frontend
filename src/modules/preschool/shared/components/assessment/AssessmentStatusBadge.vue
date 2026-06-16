<script setup>
// Keep status labels centralized so the module never falls back to hardcoded
// English tags when draft/finalized/archived states change later.
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  status: {
    type: String,
    default: '',
  },
})

const { t } = useLanguage()

const toneClass = computed(() => {
  switch (String(props.status || '').toLowerCase()) {
    case 'finalized':
      return 'bg-emerald-50 text-emerald-700'
    case 'archived':
      return 'bg-slate-100 text-slate-700'
    default:
      return 'bg-amber-50 text-amber-700'
  }
})

const label = computed(() => {
  const key = `preschoolAssessmentStatus.${String(props.status || '').toLowerCase()}`
  return t(key) || props.status || '-'
})
</script>

<template>
  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold" :class="toneClass">
    {{ label }}
  </span>
</template>
