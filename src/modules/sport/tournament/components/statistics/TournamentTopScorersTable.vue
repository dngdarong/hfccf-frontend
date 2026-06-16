<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentTopScorersTable',
})

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  rows: {
    type: Array,
    default: () => [],
  },
  mode: {
    type: String,
    default: 'goals',
  },
})

const { t } = useLanguage()

const visibleRows = computed(() => (Array.isArray(props.rows) ? props.rows : []).slice(0, 10))
</script>

<template>
  <section class="tournament-ranking-card">
    <div class="tournament-ranking-card__head">
      <div>
        <h3 class="tournament-ranking-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="tournament-ranking-card__subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <div class="tournament-ranking-card__table-wrap">
      <table class="tournament-ranking-card__table">
        <thead>
          <tr>
            <th>{{ t('sportTournament.statistics.tables.rank') }}</th>
            <th>{{ t('sportTournament.statistics.tables.player') }}</th>
            <th>{{ t('sportTournament.statistics.tables.team') }}</th>
            <th>{{ t('sportTournament.statistics.tables.goals') }}</th>
            <th>{{ t('sportTournament.statistics.tables.assists') }}</th>
            <th>{{ t('sportTournament.statistics.tables.appearances') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in visibleRows" :key="row.key || row.playerId || `${row.playerName}-${index}`">
            <td><strong class="tournament-ranking-card__rank">{{ index + 1 }}</strong></td>
            <td>
              <div class="tournament-ranking-card__name-block">
                <strong>{{ row.playerName || '-' }}</strong>
                <span>{{ row.teamName || '-' }}</span>
              </div>
            </td>
            <td>{{ row.teamName || '-' }}</td>
            <td :class="mode === 'goals' ? 'tournament-ranking-card__highlight' : ''">{{ row.goals ?? 0 }}</td>
            <td :class="mode === 'assists' ? 'tournament-ranking-card__highlight' : ''">{{ row.assists ?? 0 }}</td>
            <td>{{ row.appearances ?? 0 }}</td>
          </tr>
          <tr v-if="!visibleRows.length">
            <td :colspan="6" class="tournament-ranking-card__empty">
              {{ t('sportTournament.statistics.empty.title') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.tournament-ranking-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
}

.tournament-ranking-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.tournament-ranking-card__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

.tournament-ranking-card__table-wrap {
  overflow-x: auto;
}

.tournament-ranking-card__table {
  width: 100%;
  border-collapse: collapse;
}

.tournament-ranking-card__table th,
.tournament-ranking-card__table td {
  padding: 0.75rem 0.8rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}

.tournament-ranking-card__table th {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tournament-ranking-card__rank {
  display: inline-flex;
  width: 1.95rem;
  height: 1.95rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(0, 174, 239, 0.1);
  color: #0369a1;
}

.tournament-ranking-card__name-block {
  display: flex;
  flex-direction: column;
}

.tournament-ranking-card__name-block span {
  color: #64748b;
  font-size: 0.74rem;
}

.tournament-ranking-card__highlight {
  color: #0369a1;
  font-weight: 800;
}

.tournament-ranking-card__empty {
  color: #64748b;
  text-align: center;
}
</style>
