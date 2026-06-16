<script setup>
import TournamentFixtureCard from './TournamentFixtureCard.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentFixtureList',
})

defineProps({
  fixtures: {
    type: Array,
    default: () => [],
  },
  editable: {
    type: Boolean,
    default: false,
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select', 'update-status'])
const { t } = useLanguage()
</script>

<template>
  <section class="fixture-list">
    <div v-if="fixtures.length" class="fixture-list__grid">
      <TournamentFixtureCard
        v-for="fixture in fixtures"
        :key="fixture.id"
        :fixture="fixture"
        :editable="editable"
        :status-options="statusOptions"
        @select="emit('select', $event)"
        @update-status="emit('update-status', $event)"
      />
    </div>

    <div v-else class="fixture-list__empty">
      <h4>{{ emptyText || t('sportTournament.fixtures.empty.title') }}</h4>
      <p>{{ t('sportTournament.fixtures.empty.subtitle') }}</p>
    </div>
  </section>
</template>

<style scoped>
.fixture-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fixture-list__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.fixture-list__empty {
  padding: 1.35rem;
  border-radius: 1.25rem;
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.95);
}

.fixture-list__empty h4 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.fixture-list__empty p {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .fixture-list__grid {
    grid-template-columns: 1fr;
  }
}
</style>
