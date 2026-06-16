<script setup>
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentKnockoutValidationPanel',
})

defineProps({
  validation: {
    type: Object,
    default: () => ({ ready: false, issues: [] }),
  },
  bracketSize: {
    type: Number,
    default: 0,
  },
})

const { t } = useLanguage()

function issueLabel(issue) {
  const code = String(issue?.code || '').trim()

  if (code === 'missingStandings') return t('sportTournament.knockout.validation.missingStandings')
  if (code === 'invalidBracketSize') return t('sportTournament.knockout.validation.invalidBracketSize', { value: issue?.value || 0 })
  if (code === 'tournamentLocked') return t('sportTournament.knockout.validation.tournamentLocked')
  if (code === 'stateNotReady') return t('sportTournament.knockout.validation.stateNotReady')
  if (code === 'drawWithoutPenaltyWinner') return t('sportTournament.knockout.validation.drawWithoutPenaltyWinner')
  return t('sportTournament.knockout.validation.unknownIssue')
}
</script>

<template>
  <section class="knockout-validation">
    <div class="knockout-validation__head">
      <div>
        <h3 class="knockout-validation__title">{{ t('sportTournament.knockout.validation.title') }}</h3>
        <p class="knockout-validation__subtitle">{{ t('sportTournament.knockout.validation.subtitle') }}</p>
      </div>

      <div class="knockout-validation__pill" :class="{ 'knockout-validation__pill--ready': validation.ready }">
        {{ validation.ready ? t('sportTournament.knockout.validation.ready') : t('sportTournament.knockout.validation.notReady') }}
      </div>
    </div>

    <div class="knockout-validation__summary">
      <span>{{ t('sportTournament.knockout.validation.bracketSize') }}: <strong>{{ bracketSize || '-' }}</strong></span>
      <span>{{ t('sportTournament.knockout.validation.issueCount') }}: <strong>{{ validation.issues.length }}</strong></span>
    </div>

    <div v-if="validation.issues.length" class="knockout-validation__issues">
      <article v-for="issue in validation.issues" :key="issue.code" class="knockout-validation__issue">
        <strong>{{ issueLabel(issue) }}</strong>
      </article>
    </div>

    <div v-else class="knockout-validation__issues knockout-validation__issues--empty">
      <article class="knockout-validation__issue">
        <strong>{{ t('sportTournament.knockout.validation.noIssues') }}</strong>
      </article>
    </div>
  </section>
</template>

<style scoped>
.knockout-validation {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1.35rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(253, 193, 22, 0.1), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 55px -40px rgba(15, 23, 42, 0.45);
}

.knockout-validation__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.knockout-validation__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.02rem;
  font-weight: 800;
}

.knockout-validation__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.knockout-validation__pill {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(254, 226, 226, 0.9);
  color: #b91c1c;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.knockout-validation__pill--ready {
  background: rgba(220, 252, 231, 0.95);
  color: #166534;
}

.knockout-validation__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
}

.knockout-validation__summary strong {
  color: #0f172a;
}

.knockout-validation__issues {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.knockout-validation__issue {
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid #fed7aa;
  background: rgba(255, 247, 237, 0.95);
  color: #9a3412;
}

.knockout-validation__issues--empty .knockout-validation__issue {
  border-color: #bbf7d0;
  background: rgba(240, 253, 244, 0.95);
  color: #166534;
}
</style>
