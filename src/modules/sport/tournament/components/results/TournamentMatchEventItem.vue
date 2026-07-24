<script setup>
import Button from '@/components/buttons/Button.vue'
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import TournamentMatchEventTypeBadge from './TournamentMatchEventTypeBadge.vue'
import { formatMatchEventMinute } from '@/modules/sport/tournament/services/sortMatchTimeline'

defineOptions({
  name: 'TournamentMatchEventItem',
})

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['remove'])
const { t } = useLanguage()

const minuteLabel = computed(() => formatMatchEventMinute(props.event))

const secondaryLine = computed(() => {
  if (props.event?.description) {
    return props.event.description
  }

  const detailParts = [props.event?.teamName || props.event?.teamId || '', props.event?.playerName || '']
    .map((value) => String(value || '').trim())
    .filter(Boolean)

  return detailParts.length ? detailParts.join(' · ') : '-'
})
</script>

<template>
  <article class="match-event-item">
    <div class="match-event-item__minute">{{ minuteLabel }}</div>

    <div class="match-event-item__body">
      <div class="match-event-item__head">
        <TournamentMatchEventTypeBadge :type="event.type" />
        <span class="match-event-item__side">
          {{
            event.side === 'away'
              ? t('sportTournament.results.eventForm.sides.away')
              : t('sportTournament.results.eventForm.sides.home')
          }}
        </span>
      </div>

      <strong class="match-event-item__name">
        {{ event.playerName || event.playerId || event.teamName || event.teamId || t('sportTournament.results.eventForm.noPlayer') }}
      </strong>

      <p class="match-event-item__meta">{{ secondaryLine }}</p>

      <div
        v-if="event.assistPlayerName || event.playerOutName || event.playerInName"
        class="match-event-item__details"
      >
        <span v-if="event.assistPlayerName">{{ event.assistPlayerName }}</span>
        <span v-if="event.playerOutName || event.playerInName">
          {{ event.playerOutName || t('sportTournament.results.eventForm.noPlayer') }} → {{ event.playerInName || t('sportTournament.results.eventForm.noPlayer') }}
        </span>
      </div>
    </div>

    <Button
      v-if="!disabled"
      type="button"
      class="rounded-xl"
      severity="secondary"
      :label="t('sportTournament.results.eventForm.remove')"
      @click="emit('remove', event.id)"
    />
  </article>
</template>

<style scoped>
.match-event-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(248, 250, 252, 0.95);
}

.match-event-item__minute {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.25rem;
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  background: rgba(0, 174, 239, 0.1);
  color: #0369a1;
  font-weight: 900;
}

.match-event-item__body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.match-event-item__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.match-event-item__side {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.match-event-item__name {
  color: #0f172a;
  font-size: 0.93rem;
  font-weight: 800;
  line-height: 1.45;
}

.match-event-item__meta {
  margin: 0;
  color: #475569;
  line-height: 1.55;
  word-break: break-word;
}

.match-event-item__details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.84rem;
}

@media (max-width: 768px) {
  .match-event-item {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }
}
</style>

