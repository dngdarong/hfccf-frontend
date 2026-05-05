<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  tournamentTitle: String,
  tournamentSubtitle: String,
  tournamentLocation: String,
  tournamentMatches: {
    type: [Number, String],
    default: null,
  },
  tournamentStatus: String,
  actionLabel: String,
  actionLink: String,
})

const { t } = useLanguage()
const isVisible = ref(true)

const defaultActionLink = '/module/sport-admin/matches'

const badge = computed(() => t('sportAdminDashboard.tournamentBanner.badge'))
const title = computed(() => props.tournamentTitle || t('sportAdminDashboard.tournamentBanner.title'))
const subtitle = computed(() => props.tournamentSubtitle || t('sportAdminDashboard.tournamentBanner.subtitle'))
const location = computed(() => props.tournamentLocation || '')
const matches = computed(() => props.tournamentMatches ?? '00')
const status = computed(() => props.tournamentStatus || t('sportAdminDashboard.quickPanels.liveLabel'))
const actionLabel = computed(() => props.actionLabel || t('sportAdminDashboard.tournamentBanner.action'))
const actionLink = computed(() => props.actionLink || defaultActionLink)
const closeLabel = computed(() => t('common.close'))
</script>

<template>
  <article
    v-if="isVisible"
    class="tournament-banner"
    aria-labelledby="dashboardTournamentTitle"
    aria-describedby="dashboardTournamentSubtitle"
  >
    <div class="tournament-banner__glow tournament-banner__glow--left" aria-hidden="true"></div>
    <div class="tournament-banner__glow tournament-banner__glow--right" aria-hidden="true"></div>

    <div class="tournament-banner__topline">
      <div class="tournament-banner__eyebrow">
        <span class="tournament-banner__eyebrow-dot" aria-hidden="true"></span>
        <span>{{ badge }}</span>
      </div>
      <button
        type="button"
        class="banner-close"
        :aria-label="closeLabel"
        @click="isVisible = false"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
          <path d="M5 5l10 10M15 5L5 15" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div class="tournament-banner__body">
      <div class="tournament-banner__content">
        <div class="tournament-banner__meta">
          <span class="tournament-banner__pill tournament-banner__pill--live">
            <span class="tournament-banner__pulse" aria-hidden="true"></span>
            {{ status }}
          </span>
          <span v-if="location" class="tournament-banner__pill tournament-banner__pill--ghost">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M10 17s5-4.35 5-8.2A5 5 0 105 8.8C5 12.65 10 17 10 17z" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="10" cy="8" r="1.8" />
            </svg>
            {{ location }}
          </span>
        </div>

        <div class="tournament-banner__copy">
          <h2 id="dashboardTournamentTitle" class="tournament-banner__title">{{ title }}</h2>
          <p id="dashboardTournamentSubtitle" class="tournament-banner__subtitle">{{ subtitle }}</p>
        </div>

        <div class="tournament-banner__actions">
          <RouterLink :to="actionLink" class="banner-button">
            <span>{{ actionLabel }}</span>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M4 10h10" stroke-linecap="round" />
              <path d="M10 5l5 5-5 5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
        </div>
      </div>

      <div class="tournament-banner__stats" aria-label="Tournament overview">
        <div class="tournament-banner__stat-card">
          <span class="tournament-banner__stat-label">{{ t('sportAddTeam.matches') }}</span>
          <strong class="tournament-banner__stat-value">{{ matches }}</strong>
        </div>
        <div class="tournament-banner__stat-card tournament-banner__stat-card--accent">
          <span class="tournament-banner__stat-label">{{ t('sportAddTeam.status') }}</span>
          <strong class="tournament-banner__stat-value">{{ status }}</strong>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.tournament-banner {
  position: relative;
  overflow: hidden;
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  color: white;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.24) 0%, transparent 28%),
    radial-gradient(circle at 85% 25%, rgba(253, 193, 22, 0.28) 0%, transparent 18%),
    linear-gradient(135deg, #0586bf 0%, #0f5fcd 46%, #0f3f9f 100%);
  box-shadow:
    0 24px 48px rgba(10, 53, 111, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.tournament-banner__glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(10px);
  pointer-events: none;
}

.tournament-banner__glow--left {
  top: -2rem;
  left: -1rem;
  width: 12rem;
  height: 12rem;
  background: rgba(255, 255, 255, 0.12);
}

.tournament-banner__glow--right {
  right: -3rem;
  bottom: -4rem;
  width: 14rem;
  height: 14rem;
  background: rgba(253, 193, 22, 0.18);
}

.tournament-banner__topline,
.tournament-banner__body {
  position: relative;
  z-index: 1;
}

.tournament-banner__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tournament-banner__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.tournament-banner__eyebrow-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 9999px;
  background: var(--hope-yellow);
  box-shadow: 0 0 0 0.25rem rgba(253, 193, 22, 0.22);
}

.tournament-banner__body {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(220px, 0.95fr);
  gap: 1rem;
  align-items: stretch;
}

.tournament-banner__content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

.tournament-banner__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tournament-banner__pill {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 2.2rem;
  padding: 0.55rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 700;
}

.tournament-banner__pill--live {
  background: rgba(237, 28, 36, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.tournament-banner__pill--ghost {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.tournament-banner__pill--ghost svg {
  width: 0.95rem;
  height: 0.95rem;
}

.tournament-banner__pulse {
  width: 0.52rem;
  height: 0.52rem;
  border-radius: 9999px;
  background: #ffd4d6;
  box-shadow: 0 0 0 0 rgba(255, 212, 214, 0.45);
  animation: banner-pulse 1.9s infinite;
}

.tournament-banner__copy {
  max-width: 42rem;
}

.tournament-banner__title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.02;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.tournament-banner__subtitle {
  margin: 0.9rem 0 0;
  max-width: 34rem;
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.88);
}

.tournament-banner__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.banner-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  min-height: 3rem;
  padding: 0.85rem 1.15rem;
  border-radius: 1rem;
  background: white;
  color: #0f4f7c;
  font-weight: 700;
  text-decoration: none;
  border: none;
  box-shadow: 0 14px 28px rgba(9, 32, 77, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.banner-button:hover {
  background: #f8fbff;
  transform: translateY(-1px);
  box-shadow: 0 18px 30px rgba(9, 32, 77, 0.22);
}

.banner-button svg {
  width: 1rem;
  height: 1rem;
}

.tournament-banner__stats {
  display: grid;
  gap: 0.85rem;
}

.tournament-banner__stat-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 8rem;
  padding: 1rem 1.1rem;
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(7, 28, 75, 0.24);
  backdrop-filter: blur(8px);
}

.tournament-banner__stat-card--accent {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.08) 100%);
}

.tournament-banner__stat-label {
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}

.tournament-banner__stat-value {
  margin-top: 0.45rem;
  font-size: clamp(1.6rem, 3vw, 2.45rem);
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.banner-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.banner-close:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.45);
  transform: scale(1.04);
}

.banner-close:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}

.banner-close svg {
  width: 0.95rem;
  height: 0.95rem;
}

@keyframes banner-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 212, 214, 0.45);
  }
  70% {
    box-shadow: 0 0 0 0.45rem rgba(255, 212, 214, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 212, 214, 0);
  }
}

@media (max-width: 960px) {
  .tournament-banner__body {
    grid-template-columns: 1fr;
  }

  .tournament-banner__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .tournament-banner {
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .tournament-banner__eyebrow {
    font-size: 0.68rem;
    letter-spacing: 0.08em;
  }

  .tournament-banner__title {
    font-size: 1.85rem;
  }

  .tournament-banner__subtitle {
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .tournament-banner__stats {
    grid-template-columns: 1fr;
  }

  .banner-button {
    width: 100%;
  }
}
</style>
