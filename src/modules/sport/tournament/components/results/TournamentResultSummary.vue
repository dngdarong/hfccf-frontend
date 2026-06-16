<script setup>
import { computed } from 'vue'
import TournamentFixtureStatusBadge from '@/modules/sport/tournament/components/fixtures/TournamentFixtureStatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentResultSummary',
})

const props = defineProps({
  fixture: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useLanguage()

const displayScore = computed(() => {
  if (props.fixture?.eventScore?.hasScoringEvents) {
    return props.fixture.eventScore.score
  }

  return props.fixture?.score || { home: null, away: null }
})

const scoreSourceLabel = computed(() =>
  props.fixture?.eventScore?.hasScoringEvents
    ? t('sportTournament.results.scoreSummary.eventDerived')
    : t('sportTournament.results.scoreSummary.manual'),
)
</script>

<template>
  <section class="result-summary">
    <div class="result-summary__head">
      <div>
        <h3>{{ fixture.homeTeamName }} vs {{ fixture.awayTeamName }}</h3>
        <p>{{ fixture.groupName }} · {{ t('sportTournament.results.labels.matchday') }} {{ fixture.matchday || 1 }}</p>
      </div>
      <TournamentFixtureStatusBadge :status="fixture.status" />
    </div>

    <div class="result-summary__score">
      <strong>{{ displayScore.home ?? '-' }}</strong>
      <span>:</span>
      <strong>{{ displayScore.away ?? '-' }}</strong>
    </div>

    <div class="result-summary__source">
      {{ scoreSourceLabel }}
    </div>

    <div class="result-summary__meta">
      <div>
        <span>{{ t('sportTournament.results.labels.dateTime') }}</span>
        <strong>{{ fixture.dateTime ? new Date(fixture.dateTime).toLocaleString() : '-' }}</strong>
      </div>
      <div>
        <span>{{ t('sportTournament.results.labels.venue') }}</span>
        <strong>{{ fixture.venue || '-' }}</strong>
      </div>
    </div>
  </section>
</template>

<style scoped>
.result-summary {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
}

.result-summary__head,
.result-summary__meta {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.result-summary__head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.02rem;
  font-weight: 800;
}

.result-summary__head p {
  margin: 0.3rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

.result-summary__score {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.7rem 0.85rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(248, 250, 252, 0.94);
}

.result-summary__score strong {
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 900;
}

.result-summary__source {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.result-summary__meta > div {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.result-summary__meta span {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.result-summary__meta strong {
  color: #0f172a;
  font-size: 0.88rem;
  line-height: 1.5;
}
</style>
