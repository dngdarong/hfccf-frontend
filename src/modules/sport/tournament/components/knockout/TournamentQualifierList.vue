<script setup>
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentQualifierList',
})

defineProps({
  qualifiers: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  emptyText: {
    type: String,
    default: '',
  },
})

const { t, te } = useLanguage()

function roleLabel(role) {
  const key = `sportTournament.knockout.roles.${String(role || 'qualified').trim().toLowerCase()}`
  return te(key) ? t(key) : String(role || '')
}

function pointsLabel(qualifier) {
  return `${Number(qualifier?.points || 0)} ${t('sportTournament.knockout.labels.points')}`
}

function differenceLabel(qualifier) {
  const value = Number(qualifier?.goalDifference || 0)
  return `${value >= 0 ? '+' : ''}${value} ${t('sportTournament.knockout.labels.goalDifference')}`
}
</script>

<template>
  <section class="knockout-qualifiers">
    <div class="knockout-qualifiers__head">
      <div>
        <h3 v-if="title" class="knockout-qualifiers__title">{{ title }}</h3>
        <p v-if="subtitle" class="knockout-qualifiers__subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <div v-if="qualifiers.length" class="knockout-qualifiers__grid">
      <article
        v-for="qualifier in qualifiers"
        :key="`${qualifier.groupId}-${qualifier.teamId}`"
        class="knockout-qualifiers__card"
      >
        <div class="knockout-qualifiers__card-head">
          <span class="knockout-qualifiers__seed">#{{ qualifier.bracketSeed }}</span>
          <span class="knockout-qualifiers__role">{{ roleLabel(qualifier.role) }}</span>
        </div>

        <h4 class="knockout-qualifiers__team">{{ qualifier.teamName }}</h4>
        <p class="knockout-qualifiers__group">{{ qualifier.groupName }}</p>

        <div class="knockout-qualifiers__meta">
          <span>{{ pointsLabel(qualifier) }}</span>
          <span>{{ differenceLabel(qualifier) }}</span>
          <span>{{ t('sportTournament.knockout.labels.groupPosition', { position: qualifier.position }) }}</span>
        </div>
      </article>
    </div>

    <div v-else class="knockout-qualifiers__empty">
      <h4>{{ emptyText || t('sportTournament.knockout.qualifiers.empty') }}</h4>
      <p>{{ t('sportTournament.knockout.qualifiers.emptySubtitle') }}</p>
    </div>
  </section>
</template>

<style scoped>
.knockout-qualifiers {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1.35rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(0, 174, 239, 0.08), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 55px -40px rgba(15, 23, 42, 0.45);
}

.knockout-qualifiers__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.knockout-qualifiers__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.02rem;
  font-weight: 800;
}

.knockout-qualifiers__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.knockout-qualifiers__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.9rem;
  align-items: stretch;
}

.knockout-qualifiers__card {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
  min-height: 100%;
}

.knockout-qualifiers__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.knockout-qualifiers__seed,
.knockout-qualifiers__role {
  display: inline-flex;
  align-items: center;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.knockout-qualifiers__seed {
  color: #0f172a;
  background: rgba(186, 230, 253, 0.45);
}

.knockout-qualifiers__role {
  color: #0369a1;
  background: rgba(125, 211, 252, 0.25);
}

.knockout-qualifiers__team {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  line-height: 1.4;
  font-weight: 800;
}

.knockout-qualifiers__group {
  margin: 0;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.5;
}

.knockout-qualifiers__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.knockout-qualifiers__meta span {
  padding: 0.28rem 0.5rem;
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.9);
  color: #475569;
  font-size: 0.76rem;
  font-weight: 700;
}

.knockout-qualifiers__empty {
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.94);
}

.knockout-qualifiers__empty h4 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.knockout-qualifiers__empty p {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .knockout-qualifiers {
    padding: 1rem;
  }

  .knockout-qualifiers__grid {
    grid-template-columns: 1fr;
  }
}
</style>
