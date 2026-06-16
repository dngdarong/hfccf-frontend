<script setup>
// Keep report-period state labels centralized so report pages and audit views
// do not duplicate lifecycle badge colors or status wording.
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
    case 'active':
      return 'bg-emerald-50 text-emerald-700'
    case 'finalized':
      return 'bg-sky-50 text-sky-700'
    case 'locked':
      return 'bg-amber-50 text-amber-700'
    case 'archived':
      return 'bg-slate-100 text-slate-700'
    default:
      return 'bg-stone-100 text-stone-700'
  }
})

const label = computed(() => {
  const key = `preschoolLifecyclePage.reportPeriodStatuses.${String(props.status || '').toLowerCase()}`
  return t(key) || props.status || '-'
})
</script>

<template>
  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold" :class="toneClass">
    {{ label }}
  </span>
</template>

