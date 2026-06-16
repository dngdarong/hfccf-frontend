<script setup>
import TournamentMatchEventTimeline from './TournamentMatchEventTimeline.vue'

defineOptions({
  name: 'TournamentResultTimeline',
})

defineProps({
  events: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <TournamentMatchEventTimeline :events="events" :disabled="true" />
</template>
