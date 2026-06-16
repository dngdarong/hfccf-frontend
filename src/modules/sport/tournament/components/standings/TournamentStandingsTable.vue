<script setup>
import TournamentQualificationBadge from './TournamentQualificationBadge.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentStandingsTable',
})

defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
})

const { t } = useLanguage()
</script>

<template>
  <div class="standings-table-wrap">
    <table class="standings-table">
      <thead>
        <tr>
          <th>{{ t('sportTournament.standings.table.position') }}</th>
          <th>{{ t('sportTournament.standings.table.team') }}</th>
          <th>{{ t('sportTournament.standings.table.played') }}</th>
          <th>{{ t('sportTournament.standings.table.record') }}</th>
          <th>{{ t('sportTournament.standings.table.gfga') }}</th>
          <th>{{ t('sportTournament.standings.table.gd') }}</th>
          <th>{{ t('sportTournament.standings.table.points') }}</th>
          <th>{{ t('sportTournament.standings.table.qualification') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.teamId">
          <td>
            <strong class="standings-table__position">{{ row.position }}</strong>
          </td>
          <td>
            <div class="standings-table__team">
              <strong>{{ row.teamName }}</strong>
            </div>
          </td>
          <td>{{ row.played }}</td>
          <td>{{ row.wins }} / {{ row.draws }} / {{ row.losses }}</td>
          <td>{{ row.goalsFor }} / {{ row.goalsAgainst }}</td>
          <td :style="{ color: row.goalDifference > 0 ? '#16a34a' : row.goalDifference < 0 ? '#dc2626' : '#0f172a' }">
            {{ row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference }}
          </td>
          <td><strong>{{ row.points }}</strong></td>
          <td>
            <TournamentQualificationBadge :qualified="row.qualified" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.standings-table-wrap {
  overflow-x: auto;
}

.standings-table {
  width: 100%;
  border-collapse: collapse;
}

.standings-table th,
.standings-table td {
  padding: 0.8rem 0.85rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}

.standings-table th {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.standings-table__position {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(0, 174, 239, 0.1);
  color: #0369a1;
}

.standings-table__team {
  display: flex;
  flex-direction: column;
}
</style>
