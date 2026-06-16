<script setup>
import { useLanguage } from '@/composables/useLanguage'
import TournamentBracketRound from './TournamentBracketRound.vue'

defineOptions({
  name: 'TournamentBracket',
})

defineProps({
  bracket: {
    type: Object,
    default: () => ({}),
  },
  selectedMatchId: {
    type: String,
    default: '',
  },
  emptyText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select'])
const { t } = useLanguage()
</script>

<template>
  <section class="tournament-bracket">
    <div class="tournament-bracket__head">
      <div>
        <h3 class="tournament-bracket__title">{{ t('sportTournament.knockout.bracket.title') }}</h3>
        <p class="tournament-bracket__subtitle">{{ t('sportTournament.knockout.bracket.subtitle') }}</p>
      </div>
    </div>

    <div v-if="Array.isArray(bracket?.rounds) && bracket.rounds.length" class="tournament-bracket__track">
      <div class="tournament-bracket__grid">
        <TournamentBracketRound
          v-for="round in bracket.rounds"
          :key="round.key"
          :round="round"
          :selected-match-id="selectedMatchId"
          @select="emit('select', $event)"
        />
      </div>
    </div>

    <div v-else class="tournament-bracket__empty">
      <h4>{{ emptyText || t('sportTournament.knockout.bracket.empty') }}</h4>
      <p>{{ t('sportTournament.knockout.bracket.emptySubtitle') }}</p>
    </div>
  </section>
</template>

<style scoped>
.tournament-bracket {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1.35rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(237, 28, 36, 0.06), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 55px -40px rgba(15, 23, 42, 0.45);
}

.tournament-bracket__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.02rem;
  font-weight: 800;
}

.tournament-bracket__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.tournament-bracket__grid {
  display: flex;
  gap: 1rem;
  align-items: stretch;
  min-width: 100%;
}

.tournament-bracket__track {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 0.25rem;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

.tournament-bracket__empty {
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.94);
}

.tournament-bracket__empty h4 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.tournament-bracket__empty p {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.6;
}
</style>
