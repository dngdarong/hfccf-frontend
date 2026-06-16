<script setup>
import Tag from 'primevue/tag'
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { normalizeEventType } from '@/modules/sport/tournament/services/normalizeMatchEvents'

defineOptions({
  name: 'TournamentMatchEventTypeBadge',
})

const props = defineProps({
  type: {
    type: String,
    default: '',
  },
})

const { t, te } = useLanguage()

const normalizedType = computed(() => normalizeEventType(props.type))

const label = computed(() => {
  const key = `sportTournament.results.eventTypes.${normalizedType.value}`
  return te(key) ? t(key) : normalizedType.value
})

const severity = computed(() => {
  switch (normalizedType.value) {
    case 'goal':
    case 'penalty_goal':
      return 'success'
    case 'own_goal':
    case 'red_card':
      return 'danger'
    case 'yellow_card':
      return 'warn'
    case 'assist':
    case 'substitution':
      return 'info'
    default:
      return 'secondary'
  }
})
</script>

<template>
  <Tag
    :value="label"
    :severity="severity"
    class="match-event-type-badge"
  />
</template>

<style scoped>
.match-event-type-badge {
  border-radius: 999px;
  font-weight: 800;
  letter-spacing: 0.02em;
}
</style>
