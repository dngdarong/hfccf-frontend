<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import TournamentMatchEventItem from './TournamentMatchEventItem.vue'
import { sortMatchTimeline } from '@/modules/sport/tournament/services/sortMatchTimeline'

defineOptions({
  name: 'TournamentMatchEventTimeline',
})

const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['remove'])
const { t } = useLanguage()

const sortedEvents = computed(() => sortMatchTimeline(props.events))
</script>

<template>
  <section class="match-event-timeline">
    <div class="match-event-timeline__head">
      <div>
        <h3>{{ t('sportTournament.results.timeline.title') }}</h3>
        <p>{{ t('sportTournament.results.timeline.subtitle') }}</p>
      </div>
    </div>

    <div v-if="sortedEvents.length" class="match-event-timeline__items">
      <TournamentMatchEventItem
        v-for="event in sortedEvents"
        :key="event.id"
        :event="event"
        :disabled="disabled"
        @remove="emit('remove', $event)"
      />
    </div>

    <div v-else class="match-event-timeline__empty">
      {{ t('sportTournament.results.timeline.empty') }}
    </div>
  </section>
</template>

<style scoped>
.match-event-timeline {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
}

.match-event-timeline__head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.match-event-timeline__head p {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

.match-event-timeline__items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.match-event-timeline__empty {
  padding: 0.95rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  color: #64748b;
}
</style>
