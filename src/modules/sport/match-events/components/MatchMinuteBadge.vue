<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { formatMatchEventMinute } from '@/modules/sport/match-events/composables/useMatchTimeline'

defineOptions({
  name: 'MatchMinuteBadge',
})

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
})

const { t } = useLanguage()

const minuteLabel = computed(() => formatMatchEventMinute(props.event))
const periodLabel = computed(() => {
  const period = String(props.event.period || 'first_half').toLowerCase()
  const key = `sportMatchesManagement.resultsEntry.events.periods.${period}`
  return t(key)
})
</script>

<template>
  <div class="inline-flex flex-col items-center gap-0.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-center text-slate-700">
    <span class="font-mono text-sm font-black text-slate-900">{{ minuteLabel }}</span>
    <span class="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500">{{ periodLabel }}</span>
  </div>
</template>