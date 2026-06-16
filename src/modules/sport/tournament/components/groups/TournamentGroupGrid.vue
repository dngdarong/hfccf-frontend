<script setup>
import TournamentGroupCard from './TournamentGroupCard.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentGroupGrid',
})

defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
  editable: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['remove-team'])
const { t } = useLanguage()
</script>

<template>
  <section class="group-grid">
    <div class="group-grid__head">
      <div>
        <p class="group-grid__eyebrow">{{ t('sportTournament.groups.gridTitle') }}</p>
        <h3 class="group-grid__title">{{ t('sportTournament.groups.gridSubtitle') }}</h3>
      </div>
    </div>

    <div v-if="groups.length" class="group-grid__grid" :class="{ 'group-grid__grid--compact': compact }">
      <TournamentGroupCard
        v-for="group in groups"
        :key="group.id"
        :group="group"
        :editable="editable"
        :compact="compact"
        @remove-team="emit('remove-team', $event)"
      />
    </div>

    <div v-else class="group-grid__empty">
      {{ t('sportTournament.groups.emptyGrid') }}
    </div>
  </section>
</template>

<style scoped>
.group-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.group-grid__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.group-grid__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.group-grid__title {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 1.1rem;
  line-height: 1.3;
  font-weight: 800;
}

.group-grid__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.group-grid__grid--compact {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.group-grid__empty {
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  background: rgba(255, 255, 255, 0.9);
}

@media (max-width: 1024px) {
  .group-grid__grid,
  .group-grid__grid--compact {
    grid-template-columns: 1fr;
  }
}
</style>
