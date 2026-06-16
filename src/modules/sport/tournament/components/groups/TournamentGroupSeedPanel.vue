<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentGroupSeedPanel',
})

const props = defineProps({
  teams: {
    type: Array,
    default: () => [],
  },
  seededMode: {
    type: Boolean,
    default: true,
  },
})

const { t } = useLanguage()

const sortedSeeds = computed(() =>
  [...props.teams]
    .filter((team) => Boolean(team?.seeded) || (team?.seedRank !== null && team?.seedRank !== undefined))
    .sort((left, right) => {
      const leftRank = left?.seedRank === null || left?.seedRank === undefined ? Number.POSITIVE_INFINITY : Number(left.seedRank)
      const rightRank = right?.seedRank === null || right?.seedRank === undefined ? Number.POSITIVE_INFINITY : Number(right.seedRank)

      if (leftRank !== rightRank) return leftRank - rightRank
      return String(left?.name || '').localeCompare(String(right?.name || ''))
    }),
)
</script>

<template>
  <section class="seed-panel">
    <div class="seed-panel__head">
      <div>
        <p class="seed-panel__eyebrow">{{ t('sportTournament.groups.seeds.title') }}</p>
        <p class="seed-panel__subtitle">{{ t('sportTournament.groups.seeds.subtitle') }}</p>
      </div>
    </div>

    <div v-if="seededMode" class="seed-panel__list">
      <article v-for="team in sortedSeeds" :key="team.id" class="seed-panel__item">
        <span class="seed-panel__rank">#{{ team.seedRank || 0 }}</span>
        <div class="seed-panel__copy">
          <h4 class="seed-panel__title">{{ team.name }}</h4>
          <p class="seed-panel__text">{{ team.status || '-' }}</p>
        </div>
      </article>

      <div v-if="!sortedSeeds.length" class="seed-panel__empty">
        {{ t('sportTournament.groups.seeds.empty') }}
      </div>
    </div>

    <div v-else class="seed-panel__empty">
      {{ t('sportTournament.groups.seeds.disabled') }}
    </div>
  </section>
</template>

<style scoped>
.seed-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.1rem;
  border: 1px solid #dce6f2;
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 25px 55px -40px rgba(15, 23, 42, 0.45);
}

.seed-panel__eyebrow {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.seed-panel__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.seed-panel__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.seed-panel__item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.85rem 0.95rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(248, 250, 252, 0.96);
}

.seed-panel__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.1rem;
  height: 2.1rem;
  padding: 0 0.5rem;
  border-radius: 999px;
  background: rgba(253, 193, 22, 0.18);
  color: #a16207;
  font-size: 0.82rem;
  font-weight: 900;
}

.seed-panel__copy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.seed-panel__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.93rem;
  line-height: 1.35;
  font-weight: 800;
}

.seed-panel__text {
  margin: 0;
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.4;
}

.seed-panel__empty {
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  background: rgba(248, 250, 252, 0.96);
}

@media (max-width: 768px) {
  .seed-panel__list {
    grid-template-columns: 1fr;
  }
}
</style>
