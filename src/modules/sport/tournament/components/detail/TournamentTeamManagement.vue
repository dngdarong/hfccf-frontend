<script setup>
import { ref, computed, watch } from 'vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  teams: { type: Array, default: () => [] },
  availableTeams: { type: Array, default: () => [] },
  removingTeamId: { type: String, default: '' },
  pending: { type: Boolean, default: false },
})

const emit = defineEmits(['attach', 'remove'])
const { t } = useLanguage()
const selectedTeamId = ref('')

// Ensure availableTeams is always a valid array
const validAvailableTeams = computed(() => {
  return Array.isArray(props.availableTeams) ? props.availableTeams : []
})

// Reset selected team when available teams change
watch(() => validAvailableTeams.value, () => {
  if (!validAvailableTeams.value.find(team => team.id === selectedTeamId.value)) {
    selectedTeamId.value = ''
  }
})

// Safely handle team attach
function handleAttachTeam() {
  if (selectedTeamId.value) {
    emit('attach', selectedTeamId.value)
    selectedTeamId.value = ''
  }
}

// Safely handle team remove
function handleRemoveTeam(teamId) {
  if (teamId) {
    emit('remove', teamId)
  }
}
</script>

<template>
  <section class="tournament-team-management">
    <div class="tournament-team-management__head">
      <div>
        <p class="tournament-team-management__eyebrow">{{ t('sportTournament.detail.teams.eyebrow') }}</p>
        <h3>{{ t('sportTournament.detail.teams.title') }}</h3>
      </div>
      <div class="tournament-team-management__attach">
        <Select v-model="selectedTeamId" :options="validAvailableTeams" option-label="name" option-value="id" :placeholder="t('sportTournament.detail.teams.select')" :disabled="pending || !validAvailableTeams.length" />
        <Button type="button" :label="t('sportTournament.detail.teams.attach')" :disabled="pending || !selectedTeamId" @click="handleAttachTeam" />
      </div>
    </div>
    <p v-if="!teams.length" class="tournament-team-management__empty">{{ t('sportTournament.detail.teams.empty') }}</p>
    <div v-else class="tournament-team-management__list">
      <div v-for="team in teams" :key="team.teamId || team.id" class="tournament-team-management__item">
        <span>{{ team.name }}</span>
        <Button type="button" text severity="danger" :label="t('sportTournament.detail.teams.remove')" :disabled="pending || removingTeamId === String(team.teamId || team.id)" @click="handleRemoveTeam(team.teamId || team.id)" />
      </div>
    </div>
  </section>
</template>
