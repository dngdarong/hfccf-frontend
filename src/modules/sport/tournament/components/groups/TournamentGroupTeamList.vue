<script setup>
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentGroupTeamList',
})

defineProps({
  teams: {
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

function seedLabel(team) {
  if (team?.seedRank === null || team?.seedRank === undefined) return ''
  return `#${team.seedRank}`
}
</script>

<template>
  <div class="group-team-list" :class="{ 'group-team-list--compact': compact }">
    <div v-if="teams.length" class="group-team-list__items">
      <article v-for="team in teams" :key="team.id" class="group-team-list__item">
        <div class="group-team-list__copy">
          <div class="group-team-list__title-row">
            <h5 class="group-team-list__title">{{ team.name }}</h5>
            <span v-if="team.seeded || (team.seedRank !== null && team.seedRank !== undefined)" class="group-team-list__seed">
              {{ t('sportTournament.groups.seeded') }} {{ seedLabel(team) }}
            </span>
          </div>
          <p class="group-team-list__meta">{{ team.status || '-' }}</p>
        </div>

        <Button
          v-if="editable"
          type="button"
          severity="secondary"
          text
          class="group-team-list__remove"
          :label="t('sportTournament.groups.removeTeam')"
          @click="emit('remove-team', team.id)"
        />
      </article>
    </div>

    <div v-else class="group-team-list__empty">
      {{ t('sportTournament.groups.emptyGroup') }}
    </div>
  </div>
</template>

<style scoped>
.group-team-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.group-team-list__items {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.group-team-list__item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 0.9rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(248, 250, 252, 0.96);
}

.group-team-list__copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.group-team-list__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.group-team-list__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.92rem;
  line-height: 1.35;
  font-weight: 800;
}

.group-team-list__seed {
  padding: 0.16rem 0.55rem;
  border-radius: 999px;
  background: rgba(141, 198, 63, 0.14);
  color: #4d7c0f;
  font-size: 0.72rem;
  font-weight: 800;
}

.group-team-list__meta {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.4;
}

.group-team-list__empty {
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.5;
  background: rgba(255, 255, 255, 0.82);
}

.group-team-list--compact .group-team-list__item {
  padding: 0.75rem 0.85rem;
}
</style>

