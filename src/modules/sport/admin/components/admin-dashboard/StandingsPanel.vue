<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'StandingsPanel',
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
  standings: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: '',
  },
})

const { t, language } = useLanguage()

const isKh = computed(() => language.value === 'KH')
const resolvedTitle = computed(() => props.title || t('sportAdminDashboard.quickPanels.standings'))
const resolvedSubtitle = computed(() => props.subtitle || (isKh.value ? 'តារាងចំណាត់ថ្នាក់ពេលបច្ចុប្បន្ន' : 'Current standings snapshot'))
const resolvedEmptyText = computed(() => props.emptyText || (isKh.value ? 'មិនទាន់មានតារាងចំណាត់ថ្នាក់ទេ។' : 'No standings available yet.'))

function teamName(standing) {
  return String(standing?.team?.name || standing?.teamName || standing?.name || '-').trim() || '-'
}

function teamCode(standing) {
  return String(standing?.team?.teamCode || standing?.teamCode || '').trim()
}
</script>

<template>
  <section :class="isKh ? 'standings standings--kh' : 'standings'">
    <div class="standings__card">
      <div class="standings__head">
        <div>
          <h3 class="standings__title">{{ resolvedTitle }}</h3>
          <p class="standings__subtitle">{{ resolvedSubtitle }}</p>
        </div>
        <div class="standings__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 7h8M8 12h8M8 17h5" stroke-linecap="round" />
            <path d="M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>

      <div v-if="standings.length" class="standings__table-wrap">
        <table class="standings__table">
          <thead>
            <tr>
              <th class="standings__th standings__th--left">{{ isKh ? 'លំដាប់' : 'Rank' }}</th>
              <th class="standings__th standings__th--left">{{ isKh ? 'ក្រុម' : 'Team' }}</th>
              <th class="standings__th standings__th--center">P</th>
              <th class="standings__th standings__th--center">W</th>
              <th class="standings__th standings__th--center">D</th>
              <th class="standings__th standings__th--center">L</th>
              <th class="standings__th standings__th--center">GF</th>
              <th class="standings__th standings__th--center">GA</th>
              <th class="standings__th standings__th--center">GD</th>
              <th class="standings__th standings__th--right">Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="standing in standings" :key="standing.id || `${standing.teamId}-${standing.rankPosition}`" class="standings__row">
              <td class="standings__td standings__td--left standings__td--rank">
                <span class="standings__rank">{{ standing.rankPosition ?? '-' }}</span>
              </td>
              <td class="standings__td standings__td--left standings__td--team">
                <div class="standings__team">
                  <span class="standings__team-name">{{ teamName(standing) }}</span>
                  <span v-if="teamCode(standing)" class="standings__team-code">{{ teamCode(standing) }}</span>
                </div>
              </td>
              <td class="standings__td standings__td--center">{{ standing.played ?? 0 }}</td>
              <td class="standings__td standings__td--center">{{ standing.wins ?? 0 }}</td>
              <td class="standings__td standings__td--center">{{ standing.draws ?? 0 }}</td>
              <td class="standings__td standings__td--center">{{ standing.losses ?? 0 }}</td>
              <td class="standings__td standings__td--center">{{ standing.goalsFor ?? 0 }}</td>
              <td class="standings__td standings__td--center">{{ standing.goalsAgainst ?? 0 }}</td>
              <td class="standings__td standings__td--center">{{ standing.goalDifference ?? 0 }}</td>
              <td class="standings__td standings__td--right standings__td--points">{{ standing.points ?? 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="standings__empty">
        {{ resolvedEmptyText }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.standings__card {
  border: 1px solid #e8edf3;
  border-radius: 0.95rem;
  padding: 1.1rem;
  background: linear-gradient(160deg, #ffffff 0%, #f6fff6 100%);
  box-shadow: 0 12px 24px rgba(4, 52, 80, 0.05);
  border-left: 4px solid var(--hope-lime);
}

.standings__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.95rem;
}

.standings__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #122f43;
}

.standings__subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  color: #7b8794;
}

.standings__icon {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.58rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #4f7e12;
  background: color-mix(in srgb, var(--hope-lime) 16%, white);
  border: 1px solid color-mix(in srgb, var(--hope-lime) 32%, white);
  flex-shrink: 0;
}

.standings__icon svg {
  width: 1rem;
  height: 1rem;
}

.standings__table-wrap {
  overflow-x: auto;
}

.standings__table-wrap::-webkit-scrollbar {
  height: 5px;
}

.standings__table-wrap::-webkit-scrollbar-track {
  background: transparent;
}

.standings__table-wrap::-webkit-scrollbar-thumb {
  background: #b9d98a;
  border-radius: 9999px;
}

.standings__table-wrap::-webkit-scrollbar-thumb:hover {
  background: #8dc63f;
}

.standings__table {
  width: 100%;
  min-width: 720px;
  border-collapse: separate;
  border-spacing: 0;
}

.standings__th {
  padding: 0 0.55rem 0.8rem;
  border-bottom: 1px solid #d9e7d4;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7f8c98;
  white-space: nowrap;
}

.standings__th--left {
  text-align: left;
}

.standings__th--center {
  text-align: center;
}

.standings__th--right {
  text-align: right;
}

.standings__row:not(:last-child) .standings__td {
  border-bottom: 1px solid #eef5ea;
}

.standings__td {
  padding: 0.85rem 0.55rem;
  font-size: 0.83rem;
  color: #5f7286;
  white-space: nowrap;
}

.standings__td--left {
  text-align: left;
}

.standings__td--center {
  text-align: center;
}

.standings__td--right {
  text-align: right;
}

.standings__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.7rem;
  height: 1.7rem;
  padding: 0 0.35rem;
  border-radius: 0.55rem;
  background: color-mix(in srgb, var(--hope-lime) 18%, white);
  color: #4f7e12;
  font-size: 0.75rem;
  font-weight: 800;
}

.standings__team {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.standings__team-name {
  font-weight: 700;
  color: #162f43;
}

.standings__team-code {
  font-size: 0.7rem;
  color: #7b8794;
}

.standings__td--points {
  font-weight: 800;
  color: #4f7e12;
}

.standings__empty {
  padding: 1rem;
  border: 1px dashed #cbd5e1;
  border-radius: 0.85rem;
  text-align: center;
  font-size: 0.9rem;
  color: #64748b;
  background: rgba(248, 250, 252, 0.7);
}

.standings--kh .standings__title,
.standings--kh .standings__subtitle,
.standings--kh .standings__th,
.standings--kh .standings__td,
.standings--kh .standings__team-name,
.standings--kh .standings__team-code,
.standings--kh .standings__empty {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.standings--kh .standings__th {
  text-transform: none;
  letter-spacing: 0.01em;
}

@media (max-width: 560px) {
  .standings__card {
    padding: 1rem;
  }

  .standings__td,
  .standings__th {
    padding-left: 0.45rem;
    padding-right: 0.45rem;
  }
}
</style>
