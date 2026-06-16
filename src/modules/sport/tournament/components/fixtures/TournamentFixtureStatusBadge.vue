<script setup>
import Tag from 'primevue/tag'
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentFixtureStatusBadge',
})

const props = defineProps({
  status: {
    type: String,
    default: 'scheduled',
  },
})

const { t, te } = useLanguage()

const statusKey = computed(() => `sportTournament.matchStatuses.${String(props.status || 'scheduled')}`)

const badgeTone = computed(() => {
  const status = String(props.status || 'scheduled')
  if (status === 'completed' || status === 'live') return 'success'
  if (status === 'postponed') return 'warning'
  if (status === 'cancelled') return 'danger'
  return 'secondary'
})

const statusLabel = computed(() => (te(statusKey.value) ? t(statusKey.value) : String(props.status || 'scheduled')))
</script>

<template>
  <Tag :severity="badgeTone" :value="statusLabel" />
</template>
