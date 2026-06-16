<script setup>
import { computed } from 'vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { getTournamentStateLabelKey, getTournamentStateTone } from '../../composables/useTournamentStateMachine'

defineOptions({
  name: 'TournamentStatusBadge',
})

const props = defineProps({
  state: {
    type: String,
    default: 'draft',
  },
  label: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',
  },
})

const { t, te } = useLanguage()

const resolvedLabel = computed(() => {
  const rawLabel = String(props.label || '').trim()

  if (rawLabel) return rawLabel

  const key = getTournamentStateLabelKey(props.state)
  return te(key) ? t(key) : String(props.state || 'draft')
})

const resolvedTone = computed(() => getTournamentStateTone(props.state))
</script>

<template>
  <StatusBadge
    :status="resolvedTone"
    :label="resolvedLabel"
    :translate-label="false"
    :size="size"
  />
</template>

