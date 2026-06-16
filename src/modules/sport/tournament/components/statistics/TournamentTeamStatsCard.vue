<script setup>
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentTeamStatsCard',
})

defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  team: {
    type: Object,
    default: () => ({}),
  },
  mode: {
    type: String,
    default: 'attack',
  },
})

const { t } = useLanguage()
</script>

<template>
  <section class="team-stats-card">
    <div class="team-stats-card__head">
      <div>
        <h3 class="team-stats-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="team-stats-card__subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <div v-if="team && team.teamName" class="team-stats-card__body">
      <strong class="team-stats-card__team">{{ team.teamName }}</strong>
      <div class="team-stats-card__metrics">
        <div class="team-stats-card__metric">
          <span>{{ mode === 'attack' ? t('sportTournament.statistics.labels.goalsFor') : t('sportTournament.statistics.labels.goalsAgainst') }}</span>
          <strong>{{ mode === 'attack' ? team.goalsFor ?? 0 : team.goalsAgainst ?? 0 }}</strong>
        </div>
        <div class="team-stats-card__metric">
          <span>{{ t('sportTournament.statistics.labels.cleanSheets') }}</span>
          <strong>{{ team.cleanSheets ?? 0 }}</strong>
        </div>
        <div class="team-stats-card__metric">
          <span>{{ t('sportTournament.statistics.labels.fairPlayPoints') }}</span>
          <strong>{{ team.fairPlayPoints ?? 0 }}</strong>
        </div>
        <div class="team-stats-card__metric">
          <span>{{ t('sportTournament.statistics.labels.points') }}</span>
          <strong>{{ team.points ?? 0 }}</strong>
        </div>
      </div>
    </div>

    <div v-else class="team-stats-card__empty">
      {{ t('sportTournament.statistics.empty.title') }}
    </div>
  </section>
</template>

<style scoped>
.team-stats-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
}

.team-stats-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.team-stats-card__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

.team-stats-card__team {
  color: #0f172a;
  font-size: 1.02rem;
  font-weight: 800;
}

.team-stats-card__metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.9rem;
}

.team-stats-card__metric {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  padding: 0.85rem 0.9rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.team-stats-card__metric span {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.team-stats-card__metric strong {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 900;
}

.team-stats-card__empty {
  color: #64748b;
}

@media (max-width: 640px) {
  .team-stats-card__metrics {
    grid-template-columns: 1fr;
  }
}
</style>
