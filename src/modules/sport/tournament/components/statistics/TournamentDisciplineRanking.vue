<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentDisciplineRanking',
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
})

const { t } = useLanguage()
const visibleRows = computed(() => (Array.isArray(props.rows) ? props.rows : []).slice(0, 10))
</script>

<template>
  <section class="discipline-card">
    <div class="discipline-card__head">
      <div>
        <h3 class="discipline-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="discipline-card__subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <div class="discipline-card__table-wrap">
      <table class="discipline-card__table">
        <thead>
          <tr>
            <th>{{ t('sportTournament.statistics.tables.rank') }}</th>
            <th>{{ t('sportTournament.statistics.tables.team') }}</th>
            <th>{{ t('sportTournament.statistics.tables.cards') }}</th>
            <th>{{ t('sportTournament.statistics.tables.fairPlay') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in visibleRows" :key="row.teamId || `${row.teamName}-${index}`">
            <td><strong class="discipline-card__rank">{{ index + 1 }}</strong></td>
            <td>
              <div class="discipline-card__team">
                <strong>{{ row.teamName || '-' }}</strong>
                <span>{{ row.yellowCards ?? 0 }} {{ t('sportTournament.statistics.labels.yellowCards') }} · {{ row.redCards ?? 0 }} {{ t('sportTournament.statistics.labels.redCards') }}</span>
              </div>
            </td>
            <td>{{ row.cards ?? 0 }}</td>
            <td class="discipline-card__fair-play">{{ row.fairPlayPoints ?? 0 }}</td>
          </tr>
          <tr v-if="!visibleRows.length">
            <td :colspan="4" class="discipline-card__empty">
              {{ t('sportTournament.statistics.empty.title') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.discipline-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
}

.discipline-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.discipline-card__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

.discipline-card__table-wrap {
  overflow-x: auto;
}

.discipline-card__table {
  width: 100%;
  border-collapse: collapse;
}

.discipline-card__table th,
.discipline-card__table td {
  padding: 0.75rem 0.8rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}

.discipline-card__table th {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.discipline-card__rank {
  display: inline-flex;
  width: 1.95rem;
  height: 1.95rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(237, 28, 36, 0.1);
  color: #b91c1c;
}

.discipline-card__team {
  display: flex;
  flex-direction: column;
}

.discipline-card__team span {
  color: #64748b;
  font-size: 0.74rem;
}

.discipline-card__fair-play {
  font-weight: 800;
}

.discipline-card__empty {
  color: #64748b;
  text-align: center;
}
</style>
