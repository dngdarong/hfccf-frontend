<script setup>
import { useLanguage } from '@/composables/useLanguage'
import adminDashboardData from '@/mocks/sport/admin-dashboard-data.json'

const { t } = useLanguage()

const liveMatches = adminDashboardData.liveMatches
</script>

<template>
  <section class="live-matches">
    <div class="live-matches__card">
      <div class="live-matches__head">
        <h3 class="live-matches__title">{{ t('sportAdminDashboard.quickPanels.liveMatches') }}</h3>
        <div class="live-matches__indicator" aria-hidden="true">
          <span class="live-matches__dot"></span>
        </div>
      </div>

      <div class="live-matches__list">
        <div v-for="(match, index) in liveMatches" :key="match.teams" class="live-matches__item">
          <div class="live-matches__info">
            <span class="live-matches__number">{{ index + 1 }}</span>
            <div>
              <p class="live-matches__teams">{{ match.teams }}</p>
              <p class="live-matches__meta">{{ match.meta }}</p>
            </div>
          </div>
          <span class="live-matches__badge">
            {{ t('sportAdminDashboard.quickPanels.liveLabel') }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.live-matches__card {
  border: 1px solid #e3ecf4;
  border-radius: 0.95rem;
  padding: 1.25rem;
  background: linear-gradient(160deg, #ffffff 0%, #f7fbff 100%);
  box-shadow: 0 12px 24px rgba(4, 52, 80, 0.05);
  border-left: 4px solid var(--hope-red);
}

.live-matches__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.live-matches__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #122f43;
}

.live-matches__indicator {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.58rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--hope-red) 15%, white);
  border: 1px solid color-mix(in srgb, var(--hope-red) 30%, white);
}

.live-matches__dot {
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--hope-red);
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.live-matches__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* Custom scrollbar */
.live-matches__list::-webkit-scrollbar {
  width: 4px;
}

.live-matches__list::-webkit-scrollbar-track {
  background: transparent;
}

.live-matches__list::-webkit-scrollbar-thumb {
  background: #fecaca; /* Red tint for live scrollbar */
  border-radius: 10px;
}

.live-matches__list::-webkit-scrollbar-thumb:hover {
  background: #f87171;
}

.live-matches__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem;
  background: white;
  border: 1px solid #edf2f7;
  border-radius: 0.75rem;
}

.live-matches__info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.live-matches__number {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--hope-red);
  background: color-mix(in srgb, var(--hope-red) 10%, white);
  width: 1.4rem;
  height: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.live-matches__teams {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--hope-dark);
}

.live-matches__meta {
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  color: #64748b;
}

.live-matches__badge {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  background-color: var(--hope-red);
  color: white;
}

</style>



