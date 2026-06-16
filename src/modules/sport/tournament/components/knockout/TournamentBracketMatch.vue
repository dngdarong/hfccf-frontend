<script setup>
import Button from 'primevue/button'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentBracketMatch',
})

const props = defineProps({
  match: {
    type: Object,
    default: () => ({}),
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])
const { t, te } = useLanguage()

const statusKeyMap = {
  scheduled: 'scheduled',
  live: 'live',
  completed: 'completed',
  postponed: 'postponed',
  cancelled: 'cancelled',
}

function normalizedStatus() {
  const status = String(props.match?.status || 'scheduled').trim().toLowerCase()
  return statusKeyMap[status] || 'scheduled'
}

function statusLabel(status) {
  const key = `sportTournament.matchStatuses.${String(status || 'scheduled').trim().toLowerCase()}`
  return te(key) ? t(key) : String(status || '')
}

function scoreValue(value) {
  return Number.isFinite(Number(value)) ? Number(value) : '-'
}

function winnerClass(teamId) {
  return props.match?.winnerTeamId && String(props.match.winnerTeamId) === String(teamId)
    ? 'tournament-bracket-match__team--winner'
    : ''
}

function isLocked() {
  return normalizedStatus() === 'completed' || normalizedStatus() === 'cancelled'
}

function hasPenaltyDecider() {
  return Number.isFinite(Number(props.match?.penaltyHomeScore)) || Number.isFinite(Number(props.match?.penaltyAwayScore))
}

function hasExtraTime() {
  return Number.isFinite(Number(props.match?.extraTimeHomeScore)) || Number.isFinite(Number(props.match?.extraTimeAwayScore))
}
</script>

<template>
  <article
    class="tournament-bracket-match"
    :class="{
      'tournament-bracket-match--selected': selected,
      'tournament-bracket-match--completed': normalizedStatus() === 'completed',
      'tournament-bracket-match--live': normalizedStatus() === 'live',
      'tournament-bracket-match--locked': isLocked(),
    }"
  >
    <div class="tournament-bracket-match__head">
      <div>
        <p class="tournament-bracket-match__eyebrow">{{ t('sportTournament.knockout.labels.match') }} {{ match.matchNumber || '-' }}</p>
        <h5 class="tournament-bracket-match__title">
          {{ match.homeTeamName || t('sportTournament.knockout.match.placeholder') }}
          <span class="tournament-bracket-match__title-divider">vs</span>
          {{ match.awayTeamName || t('sportTournament.knockout.match.placeholder') }}
        </h5>
      </div>

      <span class="tournament-bracket-match__status">{{ statusLabel(match.status) }}</span>
    </div>

    <div class="tournament-bracket-match__scoreboard">
      <div class="tournament-bracket-match__team" :class="winnerClass(match.homeTeamId)">
        <div class="tournament-bracket-match__team-name">
          <span class="tournament-bracket-match__team-label">{{ t('sportTournament.knockout.labels.home') }}</span>
          <span>{{ match.homeTeamName || t('sportTournament.knockout.match.placeholder') }}</span>
        </div>
        <strong class="tournament-bracket-match__team-score">{{ scoreValue(match.homeScore) }}</strong>
      </div>
      <div class="tournament-bracket-match__team" :class="winnerClass(match.awayTeamId)">
        <div class="tournament-bracket-match__team-name">
          <span class="tournament-bracket-match__team-label">{{ t('sportTournament.knockout.labels.away') }}</span>
          <span>{{ match.awayTeamName || t('sportTournament.knockout.match.placeholder') }}</span>
        </div>
        <strong class="tournament-bracket-match__team-score">{{ scoreValue(match.awayScore) }}</strong>
      </div>
    </div>

    <div class="tournament-bracket-match__meta">
      <span class="tournament-bracket-match__meta-chip">{{ t('sportTournament.knockout.labels.round') }}: {{ t(match.roundLabelKey) }}</span>
      <span v-if="match.winnerTeamName" class="tournament-bracket-match__meta-chip tournament-bracket-match__meta-chip--winner">
        {{ t('sportTournament.knockout.labels.winner') }}: {{ match.winnerTeamName }}
      </span>
      <span v-if="hasExtraTime()" class="tournament-bracket-match__meta-chip tournament-bracket-match__meta-chip--accent">
        {{ t('sportTournament.knockout.labels.extraTime') }}
      </span>
      <span v-if="hasPenaltyDecider()" class="tournament-bracket-match__meta-chip tournament-bracket-match__meta-chip--accent">
        {{ t('sportTournament.knockout.labels.penalties') }}
      </span>
    </div>

    <div class="tournament-bracket-match__actions">
      <Button
        type="button"
        class="w-full rounded-xl"
        outlined
        :label="isLocked() ? t('sportTournament.knockout.actions.lockedMatch') : t('sportTournament.knockout.actions.selectMatch')"
        :disabled="isLocked()"
        @click="emit('select', match)"
      />
    </div>
  </article>
</template>

<style scoped>
.tournament-bracket-match {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 1.2rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  position: relative;
  overflow: hidden;
}

.tournament-bracket-match--selected {
  border-color: rgba(0, 174, 239, 0.45);
  box-shadow: 0 18px 36px -28px rgba(0, 174, 239, 0.5);
}

.tournament-bracket-match--completed {
  border-color: rgba(141, 198, 63, 0.25);
  background: linear-gradient(180deg, rgba(240, 253, 244, 0.9) 0%, rgba(255, 255, 255, 0.98) 100%);
}

.tournament-bracket-match--live {
  border-color: rgba(253, 193, 22, 0.45);
  box-shadow: 0 18px 36px -30px rgba(253, 193, 22, 0.45);
}

.tournament-bracket-match--locked {
  opacity: 0.98;
}

.tournament-bracket-match--completed::before,
.tournament-bracket-match--live::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 0.2rem;
  background: linear-gradient(90deg, #8dc63f, #00aeef);
}

.tournament-bracket-match__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.tournament-bracket-match__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tournament-bracket-match__title {
  margin: 0.3rem 0 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.4;
}

.tournament-bracket-match__title-divider {
  color: #94a3b8;
  font-weight: 700;
}

.tournament-bracket-match__status {
  display: inline-flex;
  align-items: center;
  padding: 0.32rem 0.55rem;
  border-radius: 999px;
  background: rgba(241, 245, 249, 0.9);
  color: #475569;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.tournament-bracket-match__scoreboard {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tournament-bracket-match__team {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 0.8rem;
  border-radius: 0.95rem;
  background: rgba(248, 250, 252, 0.95);
  color: #0f172a;
}

.tournament-bracket-match__team-name {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  min-width: 0;
}

.tournament-bracket-match__team-label {
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tournament-bracket-match__team-name span:last-child {
  overflow: hidden;
  color: #0f172a;
  font-size: 0.96rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tournament-bracket-match__team-score {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 900;
}

.tournament-bracket-match__team--winner {
  background: rgba(220, 252, 231, 0.9);
  color: #166534;
}

.tournament-bracket-match__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.tournament-bracket-match__meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.95);
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
}

.tournament-bracket-match__meta-chip--winner {
  background: rgba(220, 252, 231, 0.9);
  color: #166534;
}

.tournament-bracket-match__meta-chip--accent {
  background: rgba(253, 193, 22, 0.16);
  color: #92400e;
}

@media (max-width: 768px) {
  .tournament-bracket-match {
    padding: 0.9rem;
  }

  .tournament-bracket-match__team {
    align-items: flex-start;
  }
}
</style>
