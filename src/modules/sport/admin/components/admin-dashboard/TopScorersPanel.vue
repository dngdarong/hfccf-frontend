<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import adminDashboardData from '@/mocks/sport/admin-dashboard-data.json'

const { t, language } = useLanguage()

const topScorers = adminDashboardData.topScorers
const isKh = computed(() => language.value === 'KH')
const goalsLabel = computed(() => (isKh.value ? 'គ្រាប់បាល់' : 'goals'))
const leaderLabel = computed(() => (isKh.value ? 'អ្នកនាំមុខ' : 'Leading scorers'))
</script>

<template>
  <section :class="isKh ? 'top-scorers top-scorers--kh' : 'top-scorers'">
    <div class="top-scorers__card">
      <div class="top-scorers__head">
        <div>
          <h3 class="top-scorers__title">{{ t('sportAdminDashboard.quickPanels.topScorers') }}</h3>
          <p class="top-scorers__subtitle">{{ leaderLabel }}</p>
        </div>
        <div class="top-scorers__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 21h8" stroke-linecap="round" />
            <path d="M12 17v4" stroke-linecap="round" />
            <path d="M7 4h10v3a5 5 0 01-10 0V4z" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M17 6h2a2 2 0 010 4h-2M7 6H5a2 2 0 000 4h2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>

      <div class="top-scorers__list">
        <article
          v-for="(scorer, index) in topScorers"
          :key="scorer.player"
          class="top-scorers__item"
        >
          <div class="top-scorers__profile">
            <span class="top-scorers__rank">{{ index + 1 }}</span>
            <div class="top-scorers__copy">
              <p class="top-scorers__player">{{ scorer.player }}</p>
              <p class="top-scorers__team">{{ scorer.team }}</p>
            </div>
          </div>

          <div class="top-scorers__stat">
            <strong class="top-scorers__goals">{{ scorer.goals }}</strong>
            <span class="top-scorers__label">{{ goalsLabel }}</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.top-scorers__card {
  border: 1px solid #e8edf3;
  border-radius: 0.95rem;
  padding: 1.25rem;
  background: linear-gradient(160deg, #ffffff 0%, #fffaf1 100%);
  box-shadow: 0 12px 24px rgba(4, 52, 80, 0.05);
  border-left: 4px solid var(--hope-yellow);
}

.top-scorers__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.15rem;
}

.top-scorers__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #122f43;
}

.top-scorers__subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  color: #7b8794;
}

.top-scorers__icon {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.58rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #af7a00;
  background: color-mix(in srgb, var(--hope-yellow) 16%, white);
  border: 1px solid color-mix(in srgb, var(--hope-yellow) 32%, white);
  flex-shrink: 0;
}

.top-scorers__icon svg {
  width: 1rem;
  height: 1rem;
}

.top-scorers__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 0.4rem;
}

.top-scorers__list::-webkit-scrollbar {
  width: 4px;
}

.top-scorers__list::-webkit-scrollbar-track {
  background: transparent;
}

.top-scorers__list::-webkit-scrollbar-thumb {
  background: #f8d777;
  border-radius: 9999px;
}

.top-scorers__list::-webkit-scrollbar-thumb:hover {
  background: #e5b94b;
}

.top-scorers__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem;
  border: 1px solid #f1ead7;
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.94);
}

.top-scorers__profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.top-scorers__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 0.55rem;
  background: color-mix(in srgb, var(--hope-yellow) 18%, white);
  color: #8a5a00;
  font-size: 0.72rem;
  font-weight: 800;
  flex-shrink: 0;
}

.top-scorers__copy {
  min-width: 0;
}

.top-scorers__player {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 800;
  color: #162f43;
}

.top-scorers__team {
  margin: 0.2rem 0 0;
  font-size: 0.76rem;
  color: #6b7a8c;
}

.top-scorers__stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0.35rem 0.65rem;
  border-radius: 0.7rem;
  background: #fff7df;
  border: 1px solid #f3df9e;
  flex-shrink: 0;
}

.top-scorers__goals {
  font-size: 1.05rem;
  line-height: 1;
  font-weight: 800;
  color: #8a5a00;
}

.top-scorers__label {
  margin-top: 0.2rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #9b7d27;
}

.top-scorers--kh .top-scorers__title,
.top-scorers--kh .top-scorers__subtitle,
.top-scorers--kh .top-scorers__player,
.top-scorers--kh .top-scorers__team,
.top-scorers--kh .top-scorers__label {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.top-scorers--kh .top-scorers__label {
  letter-spacing: 0.01em;
  text-transform: none;
}

@media (max-width: 560px) {
  .top-scorers__card {
    padding: 1rem;
  }

  .top-scorers__item {
    padding: 0.8rem;
  }

  .top-scorers__player {
    font-size: 0.86rem;
  }
}
</style>
