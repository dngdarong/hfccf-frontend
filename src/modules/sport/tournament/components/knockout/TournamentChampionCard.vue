<script setup>
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentChampionCard',
})

defineProps({
  champion: {
    type: Object,
    default: () => null,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const { t } = useLanguage()

function scoreLabel(champion) {
  if (!champion?.score) return '-'

  const home = Number.isFinite(Number(champion.score.home)) ? Number(champion.score.home) : '-'
  const away = Number.isFinite(Number(champion.score.away)) ? Number(champion.score.away) : '-'

  return `${home} - ${away}`
}
</script>

<template>
  <section class="champion-card" :class="{ 'champion-card--confirmed': Boolean(champion?.teamId) }">
    <div class="champion-card__head">
      <div>
        <h3 class="champion-card__title">{{ title || t('sportTournament.knockout.champion.title') }}</h3>
        <p class="champion-card__subtitle">{{ subtitle || t('sportTournament.knockout.champion.subtitle') }}</p>
      </div>
    </div>

    <div v-if="champion?.teamId" class="champion-card__body">
      <div class="champion-card__icon">
        <i class="pi pi-trophy" />
      </div>

      <div class="champion-card__copy">
        <h4>{{ champion.teamName }}</h4>
        <p>{{ t('sportTournament.knockout.champion.confirmed') }}</p>
        <strong class="champion-card__score">{{ scoreLabel(champion) }}</strong>
      </div>
    </div>

    <div v-else class="champion-card__empty">
      <p>{{ t('sportTournament.knockout.champion.empty') }}</p>
    </div>
  </section>
</template>

<style scoped>
.champion-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1.35rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(220, 252, 231, 0.18), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 55px -40px rgba(15, 23, 42, 0.45);
}

.champion-card--confirmed {
  border-color: rgba(141, 198, 63, 0.28);
}

.champion-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.02rem;
  font-weight: 800;
}

.champion-card__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.champion-card__body {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(141, 198, 63, 0.25);
  background: rgba(240, 253, 244, 0.95);
}

.champion-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: rgba(141, 198, 63, 0.18);
  color: #166534;
  font-size: 1.15rem;
}

.champion-card__copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.champion-card__copy h4 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.champion-card__copy p {
  margin: 0;
  color: #166534;
  font-size: 0.85rem;
  font-weight: 700;
}

.champion-card__score {
  color: #0f172a;
  font-size: 0.88rem;
  font-weight: 900;
}

.champion-card__empty {
  padding: 1rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.95);
  color: #64748b;
}
</style>
