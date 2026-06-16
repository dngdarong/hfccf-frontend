<script setup>
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentKnockoutHeader',
})

defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  stateLabel: {
    type: String,
    default: '',
  },
  stats: {
    type: Array,
    default: () => [],
  },
})

const { t } = useLanguage()
</script>

<template>
  <section class="knockout-header">
    <div class="knockout-header__copy">
      <p class="knockout-header__eyebrow">{{ t('sportTournament.knockout.title') }}</p>
      <div class="knockout-header__title-row">
        <div>
          <h2 class="knockout-header__title">{{ title }}</h2>
          <p class="knockout-header__subtitle">{{ subtitle }}</p>
        </div>

        <span v-if="stateLabel" class="knockout-header__status">{{ stateLabel }}</span>
      </div>
    </div>

    <div v-if="stats.length" class="knockout-header__stats">
      <article
        v-for="stat in stats"
        :key="`${stat.label}-${stat.value}`"
        class="knockout-header__stat"
        :class="{ 'knockout-header__stat--accent': stat.emphasis }"
      >
        <span class="knockout-header__stat-label">{{ stat.label }}</span>
        <strong class="knockout-header__stat-value">{{ stat.value }}</strong>
      </article>
    </div>

    <div class="knockout-header__actions">
      <slot name="actions" />
    </div>
  </section>
</template>

<style scoped>
.knockout-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(0, 174, 239, 0.14), transparent 28%),
    radial-gradient(circle at top right, rgba(237, 28, 36, 0.08), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -44px rgba(15, 23, 42, 0.48);
}

.knockout-header__copy {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.knockout-header__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.knockout-header__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.knockout-header__title {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.5rem, 2vw, 2rem);
  line-height: 1.15;
  font-weight: 900;
}

.knockout-header__subtitle {
  margin: 0.45rem 0 0;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.65;
}

.knockout-header__status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(0, 174, 239, 0.12);
  color: #0369a1;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  white-space: nowrap;
}

.knockout-header__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.knockout-header__stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.9rem 1rem;
  border-radius: 1.1rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.94);
}

.knockout-header__stat--accent {
  border-color: rgba(141, 198, 63, 0.3);
  background: rgba(240, 253, 244, 0.92);
}

.knockout-header__stat-label {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.knockout-header__stat-value {
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.45;
  font-weight: 900;
}

.knockout-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (max-width: 1024px) {
  .knockout-header__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .knockout-header {
    padding: 1.15rem;
  }

  .knockout-header__title-row {
    flex-direction: column;
  }

  .knockout-header__stats {
    grid-template-columns: 1fr;
  }
}
</style>
