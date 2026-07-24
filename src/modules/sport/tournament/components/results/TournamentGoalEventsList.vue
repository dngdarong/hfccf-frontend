<script setup>
import Button from '@/components/buttons/Button.vue'
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import TournamentMatchEventTypeBadge from './TournamentMatchEventTypeBadge.vue'
import { formatMatchEventMinute, sortMatchTimeline } from '@/modules/sport/tournament/services/sortMatchTimeline'

defineOptions({
  name: 'TournamentGoalEventsList',
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

const emit = defineEmits(['add-event', 'remove-event'])
const { t } = useLanguage()

const sortedEvents = computed(() => sortMatchTimeline(props.events))
</script>

<template>
  <section class="events-list">
    <div class="events-list__head">
      <div>
        <h3>{{ t('sportTournament.results.events.title') }}</h3>
        <p>{{ t('sportTournament.results.events.subtitle') }}</p>
      </div>

      <Button
        type="button"
        class="rounded-xl"
        outlined
        :disabled="disabled"
        :label="t('sportTournament.results.actions.addEvent')"
        @click="emit('add-event')"
      />
    </div>

    <div v-if="sortedEvents.length" class="events-list__grid">
      <article v-for="event in sortedEvents" :key="event.id" class="events-list__item">
        <div class="events-list__minute">{{ formatMatchEventMinute(event) }}</div>

        <div class="events-list__body">
          <div class="events-list__head-row">
            <TournamentMatchEventTypeBadge :type="event.type" />
            <span class="events-list__side">{{ event.side === 'away' ? t('sportTournament.results.eventForm.sides.away') : t('sportTournament.results.eventForm.sides.home') }}</span>
          </div>
          <strong>{{ event.playerName || event.teamName || event.teamId || t('sportTournament.results.eventForm.noPlayer') }}</strong>
          <p>{{ event.description || '-' }}</p>
        </div>

        <Button
          type="button"
          class="rounded-xl"
          severity="secondary"
          :disabled="disabled"
          :label="t('sportTournament.results.actions.removeEvent')"
          @click="emit('remove-event', event.id)"
        />
      </article>
    </div>

    <div v-else class="events-list__empty">
      {{ t('sportTournament.results.events.empty') }}
    </div>
  </section>
</template>

<style scoped>
.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
}

.events-list__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.events-list__head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.events-list__head p {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

.events-list__grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.events-list__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 0.95rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(248, 250, 252, 0.94);
}

.events-list__minute {
  display: inline-flex;
  min-width: 3rem;
  justify-content: center;
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  background: rgba(0, 174, 239, 0.1);
  color: #0369a1;
  font-weight: 900;
}

.events-list__body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.events-list__head-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.events-list__side {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.events-list__body strong {
  color: #0f172a;
  font-size: 0.9rem;
}

.events-list__body p {
  margin: 0;
  color: #64748b;
}

.events-list__empty {
  padding: 0.95rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  color: #64748b;
}

@media (max-width: 768px) {
  .events-list__item {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }
}
</style>

