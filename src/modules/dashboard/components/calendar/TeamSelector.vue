<script setup>
import { computed } from 'vue'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'

const emit = defineEmits(['update:query', 'update:selectedTeamIds'])

const props = defineProps({
  teams: {
    type: Array,
    default: () => [],
  },
  selectedTeamIds: {
    type: Array,
    default: () => [],
  },
  query: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: 'Teams',
  },
  searchPlaceholder: {
    type: String,
    default: 'Search teams',
  },
  emptyLabel: {
    type: String,
    default: 'No teams match your search.',
  },
})

const filteredTeams = computed(() => {
  const query = props.query.trim().toLowerCase()
  if (!query) return props.teams

  return props.teams.filter((team) => {
    const haystack = `${team.name} ${team.group || ''}`.toLowerCase()
    return haystack.includes(query)
  })
})

function toggleTeam(teamId, checked) {
  const next = checked
    ? [...props.selectedTeamIds, teamId]
    : props.selectedTeamIds.filter((currentId) => currentId !== teamId)

  emit('update:selectedTeamIds', next)
}
</script>

<template>
  <div class="team-selector">
    <label class="team-selector__label" for="event-team-search">{{ label }}</label>
    <InputText
      id="event-team-search"
      :model-value="query"
      :placeholder="searchPlaceholder"
      class="team-selector__search"
      @update:model-value="$emit('update:query', $event)"
    />

    <div class="team-selector__list">
      <label v-for="team in filteredTeams" :key="team.id" class="team-selector__item">
        <Checkbox
          :binary="true"
          :input-id="`team-${team.id}`"
          :model-value="selectedTeamIds.includes(team.id)"
          @update:model-value="toggleTeam(team.id, $event)"
        />
        <span class="team-selector__name">{{ team.name }}</span>
        <span v-if="team.group" class="team-selector__group">{{ team.group }}</span>
      </label>

      <div v-if="!filteredTeams.length" class="team-selector__empty">{{ emptyLabel }}</div>
    </div>
  </div>
</template>

<style scoped>
.team-selector {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.team-selector__label {
  color: #334155;
  font-size: 0.82rem;
  font-weight: 800;
}

.team-selector__search {
  width: 100%;
}

.team-selector__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 12rem;
  overflow-y: auto;
  padding-right: 0.15rem;
}

.team-selector__item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border: 1px solid #e5ecf2;
  border-radius: 0.95rem;
  padding: 0.72rem 0.85rem;
  background: #fafcfd;
}

.team-selector__name {
  color: #1d1d1b;
  font-size: 0.86rem;
  font-weight: 700;
}

.team-selector__group {
  margin-left: auto;
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 600;
}

.team-selector__empty {
  border: 1px dashed #dbe4ea;
  border-radius: 0.95rem;
  padding: 0.85rem;
  color: #64748b;
  font-size: 0.82rem;
  text-align: center;
}
</style>
