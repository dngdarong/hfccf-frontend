<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import {
  getTournamentWorkflowSteps,
  getTournamentProgressPercent,
  getTournamentStateLabelKey,
} from '../../composables/useTournamentStateMachine'

defineOptions({
  name: 'TournamentStateTimeline',
})

const props = defineProps({
  state: {
    type: String,
    default: 'draft',
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const { t, te } = useLanguage()

const steps = computed(() => getTournamentWorkflowSteps(props.state))
const progressPercent = computed(() => getTournamentProgressPercent(props.state))
const currentStateLabel = computed(() => {
  const key = getTournamentStateLabelKey(props.state)
  return te(key) ? t(key) : String(props.state || 'draft')
})

function stepLabel(step) {
  return te(step.labelKey) ? t(step.labelKey) : step.state
}

function stepDescription(step) {
  return te(step.descriptionKey) ? t(step.descriptionKey) : ''
}
</script>

<template>
  <section class="tournament-timeline">
    <div class="tournament-timeline__head">
      <div>
        <p class="tournament-timeline__eyebrow">{{ t('sportTournament.detail.workflow.eyebrow') }}</p>
        <h3 class="tournament-timeline__title">{{ t('sportTournament.detail.workflow.title') }}</h3>
        <p class="tournament-timeline__subtitle">
          {{ t('sportTournament.detail.workflow.subtitle') }}
        </p>
      </div>

      <div class="tournament-timeline__progress">
        <strong>{{ progressPercent }}%</strong>
        <span>{{ currentStateLabel }}</span>
      </div>
    </div>

    <div class="tournament-timeline__track" :class="{ 'tournament-timeline__track--compact': compact }">
      <article
        v-for="(step, index) in steps"
        :key="step.state"
        class="tournament-timeline__step"
        :class="{
          'tournament-timeline__step--complete': step.isComplete,
          'tournament-timeline__step--current': step.isCurrent,
          'tournament-timeline__step--upcoming': step.isUpcoming,
        }"
      >
        <div class="tournament-timeline__marker">
          <span class="tournament-timeline__dot">{{ index + 1 }}</span>
        </div>
        <div class="tournament-timeline__copy">
          <h4 class="tournament-timeline__step-title">{{ stepLabel(step) }}</h4>
          <p v-if="!compact && stepDescription(step)" class="tournament-timeline__step-text">
            {{ stepDescription(step) }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.tournament-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #dce6f2;
  border-radius: 1.35rem;
  background:
    radial-gradient(circle at top left, rgba(141, 198, 63, 0.08), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 55px -40px rgba(15, 23, 42, 0.45);
}

.tournament-timeline__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.tournament-timeline__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tournament-timeline__title {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 1.12rem;
  line-height: 1.3;
  font-weight: 800;
}

.tournament-timeline__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.tournament-timeline__progress {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  align-items: flex-end;
  min-width: 5rem;
  padding: 0.75rem 0.9rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
}

.tournament-timeline__progress strong {
  color: #0f172a;
  font-size: 1.08rem;
  font-weight: 900;
}

.tournament-timeline__progress span {
  color: #475569;
  font-size: 0.85rem;
  line-height: 1.4;
  text-align: right;
}

.tournament-timeline__track {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.tournament-timeline__track--compact {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.tournament-timeline__step {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;
  border: 1px solid #dce6f2;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.96);
  min-width: 0;
}

.tournament-timeline__step--current {
  border-color: rgba(0, 174, 239, 0.3);
  box-shadow: 0 14px 30px -24px rgba(0, 174, 239, 0.6);
}

.tournament-timeline__step--complete {
  border-color: rgba(141, 198, 63, 0.28);
}

.tournament-timeline__step--upcoming {
  opacity: 0.88;
}

.tournament-timeline__marker {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.tournament-timeline__dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: #0ea5e9;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 900;
}

.tournament-timeline__step--complete .tournament-timeline__dot {
  background: #8dc63f;
}

.tournament-timeline__step--upcoming .tournament-timeline__dot {
  background: #94a3b8;
}

.tournament-timeline__copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.tournament-timeline__step-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.35;
  font-weight: 800;
}

.tournament-timeline__step-text {
  margin: 0;
  color: #64748b;
  font-size: 0.86rem;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .tournament-timeline__track,
  .tournament-timeline__track--compact {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .tournament-timeline {
    padding: 1rem;
  }

  .tournament-timeline__head {
    flex-direction: column;
  }

  .tournament-timeline__progress {
    align-items: flex-start;
  }

  .tournament-timeline__progress span {
    text-align: left;
  }

  .tournament-timeline__track,
  .tournament-timeline__track--compact {
    grid-template-columns: 1fr;
  }
}
</style>
