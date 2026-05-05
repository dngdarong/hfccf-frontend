<script setup>
import { useLanguage } from '@/composables/useLanguage'
import adminDashboardData from '@/mocks/sport/admin-dashboard-data.json'

const { t } = useLanguage()

const todayMatches = adminDashboardData.todayMatches
</script>

<template>
  <section class="today-matches">
    <div class="today-matches__card">
      <div class="today-matches__head">
        <h3 class="today-matches__title">{{ t('sportAdminDashboard.quickPanels.todayMatches') }}</h3>
        <div class="today-matches__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>

      <div class="today-matches__list">
        <div v-for="(match, index) in todayMatches" :key="match.teams" class="today-matches__item">
          <div class="today-matches__info">
            <span class="today-matches__number">{{ index + 1 }}</span>
            <p class="today-matches__teams">{{ match.teams }}</p>
          </div>
          <div class="today-matches__time-wrap">
            <span class="today-matches__time">{{ match.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.today-matches__card {
  border: 1px solid #e3ecf4;
  border-radius: 0.95rem;
  padding: 1.25rem;
  background: linear-gradient(160deg, #ffffff 0%, #f7fbff 100%);
  box-shadow: 0 12px 24px rgba(4, 52, 80, 0.05);
  border-left: 4px solid #a855f7; /* Purple accent */
}

.today-matches__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.today-matches__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #122f43;
}

.today-matches__icon {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.58rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #a855f7;
  background: color-mix(in srgb, #a855f7 15%, white);
  border: 1px solid color-mix(in srgb, #a855f7 30%, white);
}

.today-matches__icon svg {
  width: 1rem;
  height: 1rem;
}

.today-matches__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* Custom scrollbar */
.today-matches__list::-webkit-scrollbar {
  width: 4px;
}

.today-matches__list::-webkit-scrollbar-track {
  background: transparent;
}

.today-matches__list::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.today-matches__list::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.today-matches__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem;
  background: white;
  border: 1px solid #edf2f7;
  border-radius: 0.75rem;
}

.today-matches__info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.today-matches__number {
  font-size: 0.7rem;
  font-weight: 800;
  color: #a855f7;
  background: color-mix(in srgb, #a855f7 10%, white);
  width: 1.4rem;
  height: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.today-matches__teams {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--hope-dark);
}

.today-matches__time-wrap {
  background: #f8fafc;
  padding: 0.25rem 0.6rem;
  border-radius: 0.5rem;
  border: 1px solid #f1f5f9;
}

.today-matches__time {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
}

</style>



