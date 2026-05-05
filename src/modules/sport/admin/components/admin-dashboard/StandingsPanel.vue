<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import adminDashboardData from '@/mocks/sport/admin-dashboard-data.json'

const { t, language } = useLanguage()

const standings = adminDashboardData.standings
const isKh = computed(() => language.value === 'KH')
const subtitle = computed(() => (isKh.value ? 'តារាងចំណាត់ថ្នាក់បច្ចុប្បន្ន' : 'Current table snapshot'))
const columns = computed(() => [
  { key: 'pos', label: isKh.value ? 'ល.រ' : 'Pos', align: 'left' },
  { key: 'team', label: isKh.value ? 'ក្រុម' : 'Team', align: 'left' },
  { key: 'p', label: 'P', align: 'center' },
  { key: 'w', label: 'W', align: 'center' },
  { key: 'd', label: 'D', align: 'center' },
  { key: 'l', label: 'L', align: 'center' },
  { key: 'gf', label: 'GF', align: 'center' },
  { key: 'ga', label: 'GA', align: 'center' },
  { key: 'gd', label: 'GD', align: 'center' },
  { key: 'pts', label: isKh.value ? 'ពិន្ទុ' : 'Pts', align: 'right' },
])
</script>

<template>
  <section :class="isKh ? 'standings standings--kh' : 'standings'">
    <div class="standings__card">
      <div class="standings__head">
        <div>
          <h3 class="standings__title">{{ t('sportAdminDashboard.quickPanels.standings') }}</h3>
          <p class="standings__subtitle">{{ subtitle }}</p>
        </div>
        <div class="standings__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 7h8M8 12h8M8 17h5" stroke-linecap="round" />
            <path d="M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>

      <div class="standings__table-wrap">
        <table class="standings__table">
          <thead>
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                :class="[
                  'standings__th',
                  `standings__th--${column.align}`,
                ]"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in standings" :key="team.team" class="standings__row">
              <td class="standings__td standings__td--left standings__td--rank">
                <span class="standings__rank">{{ team.pos }}</span>
              </td>
              <td class="standings__td standings__td--left standings__td--team">{{ team.team }}</td>
              <td class="standings__td standings__td--center">{{ team.p }}</td>
              <td class="standings__td standings__td--center">{{ team.w }}</td>
              <td class="standings__td standings__td--center">{{ team.d }}</td>
              <td class="standings__td standings__td--center">{{ team.l }}</td>
              <td class="standings__td standings__td--center">{{ team.gf }}</td>
              <td class="standings__td standings__td--center">{{ team.ga }}</td>
              <td class="standings__td standings__td--center">{{ team.gd }}</td>
              <td class="standings__td standings__td--right standings__td--points">{{ team.pts }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.standings__card {
  border: 1px solid #e8edf3;
  border-radius: 0.95rem;
  padding: 1.25rem;
  background: linear-gradient(160deg, #ffffff 0%, #f6fff6 100%);
  box-shadow: 0 12px 24px rgba(4, 52, 80, 0.05);
  border-left: 4px solid var(--hope-lime);
}

.standings__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.15rem;
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

.standings__td--team {
  font-weight: 700;
  color: #162f43;
}

.standings__td--points {
  font-weight: 800;
  color: #4f7e12;
}

.standings--kh .standings__title,
.standings--kh .standings__subtitle,
.standings--kh .standings__th,
.standings--kh .standings__td {
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
