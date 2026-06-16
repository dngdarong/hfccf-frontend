<script setup>
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentFixtureStats',
})

defineProps({
  stats: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useLanguage()
</script>

<template>
  <section class="fixture-stats">
    <article class="fixture-stats__card">
      <span>{{ t('sportTournament.fixtures.stats.fixtures') }}</span>
      <strong>{{ stats.totalFixtures || 0 }}</strong>
    </article>
    <article class="fixture-stats__card">
      <span>{{ t('sportTournament.fixtures.stats.matchdays') }}</span>
      <strong>{{ stats.matchdays || 0 }}</strong>
    </article>
    <article class="fixture-stats__card">
      <span>{{ t('sportTournament.fixtures.stats.live') }}</span>
      <strong>{{ stats.liveMatches || 0 }}</strong>
    </article>
    <article class="fixture-stats__card">
      <span>{{ t('sportTournament.fixtures.stats.completed') }}</span>
      <strong>{{ stats.completedMatches || 0 }}</strong>
    </article>
  </section>
</template>

<style scoped>
.fixture-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.fixture-stats__card {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.95rem 1rem;
  border-radius: 1.15rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
}

.fixture-stats__card span {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.fixture-stats__card strong {
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 900;
}

@media (max-width: 768px) {
  .fixture-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
