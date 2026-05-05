<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentList',
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
  tournaments: {
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
const totalTournaments = computed(() => props.tournaments.length)
const shouldScroll = computed(() => props.tournaments.length >= 4)
const sectionLabel = computed(() => (isKh.value ? 'បញ្ជីព្រឹត្តិការណ៍' : 'Tournament list'))
const resolvedTitle = computed(() => props.title || sectionLabel.value)
const resolvedSubtitle = computed(() =>
  props.subtitle || (
    isKh.value
      ? 'តាមដានការប្រកួត ទីតាំង និងចំនួនការប្រកួតសរុបក្នុងមួយព្រឹត្តិការណ៍បានភ្លាមៗ។'
      : 'Track active competitions, venues, and match volume at a glance.'
  ),
)
const resolvedEmptyText = computed(() =>
  props.emptyText || (isKh.value ? 'មិនមានព្រឹត្តិការណ៍សម្រាប់បង្ហាញទេ។' : 'No tournaments available.'),
)
const totalTournamentsLabel = computed(() =>
  isKh.value ? `${totalTournaments.value} ព្រឹត្តិការណ៍` : `${totalTournaments.value} tournaments`,
)

function normalizeStatus(status) {
  return String(status ?? '')
    .trim()
    .toLowerCase()
}

function statusClass(status) {
  const key = normalizeStatus(status)

  if (key === 'live' || key === 'active') return 'tournament-list__status--live'
  if (key === 'upcoming' || key === 'pending') return 'tournament-list__status--upcoming'
  if (key === 'completed' || key === 'closed') return 'tournament-list__status--completed'

  return 'tournament-list__status--default'
}

function statusLabel(status) {
  const key = normalizeStatus(status)

  if (key === 'live') {
    return isKh.value ? 'កំពុងប្រកួត' : 'Live'
  }

  if (key === 'active') {
    return t('common.status.active')
  }

  if (key === 'upcoming') {
    return isKh.value ? 'នាពេលខាងមុខ' : 'Upcoming'
  }

  if (key === 'pending') {
    return t('common.status.pending')
  }

  if (key === 'completed' || key === 'closed') {
    return isKh.value ? 'បានបញ្ចប់' : 'Completed'
  }

  const raw = String(status ?? '').trim()
  return raw || t('common.status.info')
}

function totalTeamsValue(tournament) {
  if (Array.isArray(tournament?.teams)) return tournament.teams.length

  const candidates = [
    tournament?.totalTeams,
    tournament?.teamCount,
    tournament?.teamsCount,
    tournament?.teams,
  ]

  const value = candidates.find((item) => item !== undefined && item !== null && item !== '')
  return value ?? '-'
}

function tournamentName(tournament) {
  const raw = String(tournament?.title || tournament?.name || '').trim()
  if (raw) return raw
  return isKh.value ? 'ព្រឹត្តិការណ៍មិនទាន់មានចំណងជើង' : 'Untitled tournament'
}
</script>

<template>
  <section :class="isKh ? 'tournament-list tournament-list--kh' : 'tournament-list'" :aria-label="sectionLabel">
    <div class="tournament-list__card">
      <div class="tournament-list__head">
        <div>
          <p class="tournament-list__eyebrow">{{ resolvedTitle }}</p>
          <h3 class="tournament-list__title">{{ totalTournamentsLabel }}</h3>
          <p class="tournament-list__subtitle">{{ resolvedSubtitle }}</p>
        </div>
        <div class="tournament-list__badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 6h8m-8 6h8m-8 6h5" stroke-linecap="round" />
            <path d="M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>

      <div
        v-if="tournaments.length"
        class="tournament-list__items"
        :class="{ 'tournament-list__items--scroll': shouldScroll }"
      >
        <article
          v-for="(tournament, index) in tournaments"
          :key="tournament.id || `${tournament.title}-${index}`"
          class="tournament-list__item"
        >
          <div class="tournament-list__item-main">
            <div class="tournament-list__number">{{ index + 1 }}</div>
            <div class="tournament-list__copy">
              <div class="tournament-list__row">
                <h4 class="tournament-list__item-title">
                  {{ tournamentName(tournament) }}
                </h4>
                <span
                  class="tournament-list__status"
                  :class="statusClass(tournament.status)"
                >
                  {{ statusLabel(tournament.status) }}
                </span>
              </div>
              <p v-if="tournament.subtitle || tournament.description" class="tournament-list__item-subtitle">
                {{ tournament.subtitle || tournament.description }}
              </p>
            </div>
          </div>

          <div class="tournament-list__meta">
            <div class="tournament-list__meta-item">
              <span class="tournament-list__meta-label">{{ t('sportAddTeam.venue') }}</span>
              <strong class="tournament-list__meta-value">
                {{ tournament.location || tournament.venue || '-' }}
              </strong>
            </div>
            <div class="tournament-list__meta-item">
              <span class="tournament-list__meta-label">{{ t('sportAddTeam.matches') }}</span>
              <strong class="tournament-list__meta-value">
                {{ tournament.matches ?? 0 }}
              </strong>
            </div>
            <div class="tournament-list__meta-item">
              <span class="tournament-list__meta-label">
                {{ t('sportAdminDashboard.cards.totalTeams.title') }}
              </span>
              <strong class="tournament-list__meta-value">
                {{ totalTeamsValue(tournament) }}
              </strong>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="tournament-list__empty">
        {{ resolvedEmptyText }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.tournament-list__card {
  border: 1px solid #d9e6f2;
  border-radius: 1rem;
  padding: 1.25rem;
  background:
    radial-gradient(circle at top right, rgba(0, 174, 239, 0.08) 0%, transparent 30%),
    linear-gradient(160deg, #ffffff 0%, #f7fbff 100%);
  box-shadow: 0 14px 32px rgba(4, 52, 80, 0.06);
}

.tournament-list__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.tournament-list__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hope-cyan);
}

.tournament-list__title {
  margin: 0.35rem 0 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #122f43;
}

.tournament-list__subtitle {
  margin: 0.5rem 0 0;
  max-width: 42rem;
  font-size: 0.92rem;
  line-height: 1.6;
  color: #5f7286;
}

.tournament-list__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.8rem;
  color: var(--hope-cyan);
  background: color-mix(in srgb, var(--hope-cyan) 14%, white);
  border: 1px solid color-mix(in srgb, var(--hope-cyan) 28%, white);
  flex-shrink: 0;
}

.tournament-list__badge svg {
  width: 1.1rem;
  height: 1.1rem;
}

.tournament-list__items {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.tournament-list__items--scroll {
  max-height: 31rem;
  overflow-y: auto;
  padding-right: 0.35rem;
}

.tournament-list__items--scroll::-webkit-scrollbar {
  width: 5px;
}

.tournament-list__items--scroll::-webkit-scrollbar-track {
  background: transparent;
}

.tournament-list__items--scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}

.tournament-list__items--scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.tournament-list__item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e8f0f7;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.86);
}

.tournament-list__item-main {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  min-width: 0;
  flex: 1;
}

.tournament-list__number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 0.65rem;
  background: color-mix(in srgb, var(--hope-cyan) 12%, white);
  color: var(--hope-cyan);
  font-size: 0.78rem;
  font-weight: 800;
  flex-shrink: 0;
}

.tournament-list__copy {
  min-width: 0;
}

.tournament-list__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.tournament-list__item-title {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 800;
  color: #122f43;
}

.tournament-list__status {
  display: inline-flex;
  align-items: center;
  min-height: 1.7rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tournament-list__status--live {
  background: color-mix(in srgb, var(--hope-red) 12%, white);
  color: var(--hope-red);
}

.tournament-list__status--upcoming {
  background: color-mix(in srgb, var(--hope-yellow) 22%, white);
  color: #8a5a00;
}

.tournament-list__status--completed {
  background: color-mix(in srgb, var(--hope-lime) 16%, white);
  color: #3f6f13;
}

.tournament-list__status--default {
  background: #edf2f7;
  color: #516375;
}

.tournament-list__item-subtitle {
  margin: 0.45rem 0 0;
  font-size: 0.83rem;
  line-height: 1.55;
  color: #64748b;
}

.tournament-list__meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(90px, auto));
  gap: 0.75rem;
  flex-shrink: 0;
}

.tournament-list__meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.tournament-list__meta-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a9bae;
}

.tournament-list__meta-value {
  font-size: 0.88rem;
  font-weight: 700;
  color: #22384d;
}

.tournament-list__empty {
  padding: 1rem;
  border: 1px dashed #cbd5e1;
  border-radius: 0.85rem;
  text-align: center;
  font-size: 0.9rem;
  color: #64748b;
  background: rgba(248, 250, 252, 0.7);
}

.tournament-list--kh .tournament-list__eyebrow,
.tournament-list--kh .tournament-list__meta-label {
  letter-spacing: 0.01em;
  text-transform: none;
}

.tournament-list--kh .tournament-list__eyebrow,
.tournament-list--kh .tournament-list__title,
.tournament-list--kh .tournament-list__subtitle,
.tournament-list--kh .tournament-list__item-title,
.tournament-list--kh .tournament-list__item-subtitle,
.tournament-list--kh .tournament-list__meta-label,
.tournament-list--kh .tournament-list__meta-value,
.tournament-list--kh .tournament-list__empty,
.tournament-list--kh .tournament-list__status {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

@media (max-width: 768px) {
  .tournament-list__item {
    flex-direction: column;
  }

  .tournament-list__meta {
    width: 100%;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .tournament-list__card {
    padding: 1rem;
  }

  .tournament-list__head {
    margin-bottom: 1rem;
  }

  .tournament-list__title {
    font-size: 1.18rem;
  }

  .tournament-list__subtitle {
    font-size: 0.86rem;
  }

  .tournament-list__meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .tournament-list__meta {
    grid-template-columns: 1fr;
  }
}
</style>
