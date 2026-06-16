<script setup>
import { computed } from 'vue'
import Tag from 'primevue/tag'
import { useLanguage } from '@/composables/useLanguage'
import { MATCH_EVENT_TYPE_TONES, normalizeMatchEventType } from '@/modules/sport/constants/matchEvent'

defineOptions({
  name: 'MatchEventBadge',
})

const props = defineProps({
  type: {
    type: String,
    default: '',
  },
})

const { t } = useLanguage()

const normalizedType = computed(() => normalizeMatchEventType(props.type))
const severity = computed(() => MATCH_EVENT_TYPE_TONES[normalizedType.value] || 'info')
const label = computed(() => {
  const key = `sportMatchesManagement.resultsEntry.events.types.${normalizedType.value}`
  return t(key)
})
</script>

<template>
  <Tag :value="label" :severity="severity" class="!text-[0.65rem] !font-black uppercase tracking-wide" />
</template>