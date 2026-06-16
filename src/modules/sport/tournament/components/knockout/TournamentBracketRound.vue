<script setup>
import { useLanguage } from '@/composables/useLanguage'
import TournamentBracketMatch from './TournamentBracketMatch.vue'

defineOptions({
  name: 'TournamentBracketRound',
})

defineProps({
  round: {
    type: Object,
    default: () => ({}),
  },
  selectedMatchId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select'])
const { t } = useLanguage()
</script>

<template>
  <section class="tournament-bracket-round">
    <header class="tournament-bracket-round__head">
      <div>
        <p class="tournament-bracket-round__eyebrow">{{ t(round.labelKey) }}</p>
        <h4 class="tournament-bracket-round__title">{{ t('sportTournament.knockout.rounds.matches', { count: round.matches?.length || 0 }) }}</h4>
      </div>
    </header>

    <div class="tournament-bracket-round__matches">
      <TournamentBracketMatch
        v-for="match in round.matches || []"
        :key="match.id"
        :match="match"
        :selected="selectedMatchId === match.id"
        @select="emit('select', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.tournament-bracket-round {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  width: clamp(280px, 26vw, 340px);
  flex: 0 0 auto;
  padding: 1rem;
  border-radius: 1.35rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(0, 174, 239, 0.06), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 22px 48px -40px rgba(15, 23, 42, 0.4);
}

.tournament-bracket-round__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.tournament-bracket-round__eyebrow {
  margin: 0;
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 800;
}

.tournament-bracket-round__title {
  margin: 0.25rem 0 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tournament-bracket-round__matches {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
