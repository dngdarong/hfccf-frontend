<script setup>
import { computed } from 'vue'
import TournamentGroupTeamList from './TournamentGroupTeamList.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentGroupCard',
})

const props = defineProps({
  group: {
    type: Object,
    default: () => ({}),
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

const statusLabel = computed(() => {
  if (props.group?.locked) return t('sportTournament.groups.status.locked')
  if (props.group?.isFull) return t('sportTournament.groups.status.complete')
  if (props.group?.assignedCount) return t('sportTournament.groups.status.inProgress')
  return t('sportTournament.groups.status.empty')
})
</script>

<template>
  <article class="group-card" :class="{ 'group-card--compact': compact }">
    <div class="group-card__head">
      <div class="group-card__copy">
        <div class="group-card__title-row">
          <h4 class="group-card__title">{{ group.name }}</h4>
          <span class="group-card__badge">{{ statusLabel }}</span>
        </div>
        <p class="group-card__meta">
          {{ group.assignedCount || 0 }} / {{ group.capacity || 0 }}
          {{ t('sportTournament.groups.teamCount') }}
          <span class="group-card__dot">•</span>
          {{ group.qualificationSlots || 0 }} {{ t('sportTournament.groups.qualificationSlots') }}
        </p>
      </div>

      <div class="group-card__count">
        <strong>{{ group.assignedCount || 0 }}</strong>
        <span>{{ t('sportTournament.groups.teams') }}</span>
      </div>
    </div>

    <TournamentGroupTeamList
      :teams="group.teams"
      :editable="editable && !group.locked"
      :compact="compact"
      @remove-team="emit('remove-team', $event)"
    />

    <div v-if="group.remainingSlots > 0" class="group-card__slots">
      <span v-for="slot in group.remainingSlots" :key="slot" class="group-card__slot">
        {{ t('sportTournament.groups.emptySlot') }}
      </span>
    </div>
  </article>
</template>

<style scoped>
.group-card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid #dce6f2;
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 20px 45px -35px rgba(15, 23, 42, 0.45);
}

.group-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.group-card__copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.group-card__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.group-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.02rem;
  line-height: 1.3;
  font-weight: 800;
}

.group-card__badge {
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: rgba(0, 174, 239, 0.12);
  color: #0369a1;
  font-size: 0.7rem;
  font-weight: 800;
}

.group-card__meta {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.5;
}

.group-card__dot {
  margin: 0 0.35rem;
}

.group-card__count {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  align-items: flex-end;
  padding: 0.6rem 0.8rem;
  border-radius: 0.95rem;
  background: rgba(248, 250, 252, 0.95);
  border: 1px solid #dce6f2;
}

.group-card__count strong {
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 900;
}

.group-card__count span {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.group-card__slots {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.group-card__slot {
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  font-size: 0.72rem;
}

.group-card--compact {
  padding: 0.9rem;
}
</style>
