<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentMatchStats',
})

const props = defineProps({
  fixture: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useLanguage()

const totalGoals = computed(() => {
  const eventScore = props.fixture?.eventScore?.hasScoringEvents ? props.fixture.eventScore.score : null
  const score = eventScore || props.fixture?.score || {}

  return (Number(score.home ?? 0) || 0) + (Number(score.away ?? 0) || 0)
})
</script>

<template>
  <section class="match-stats">
    <article class="match-stats__card">
      <span>{{ t('sportTournament.results.matchStats.goals') }}</span>
      <strong>{{ totalGoals }}</strong>
    </article>
    <article class="match-stats__card">
      <span>{{ t('sportTournament.results.matchStats.events') }}</span>
      <strong>{{ fixture.events?.length || 0 }}</strong>
    </article>
    <article class="match-stats__card">
      <span>{{ t('sportTournament.results.matchStats.status') }}</span>
      <strong>{{ fixture.status || 'scheduled' }}</strong>
    </article>
  </section>
</template>

<style scoped>
.match-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.match-stats__card {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.95rem 1rem;
  border-radius: 1.15rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
}

.match-stats__card span {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.match-stats__card strong {
  color: #0f172a;
  font-size: 1.1rem;
  font-weight: 900;
}

@media (max-width: 768px) {
  .match-stats {
    grid-template-columns: 1fr;
  }
}
</style>
