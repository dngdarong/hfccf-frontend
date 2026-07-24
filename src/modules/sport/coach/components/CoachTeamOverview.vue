<script setup>
import Card from 'primevue/card'
import Button from '@/components/buttons/Button.vue'

const props = defineProps({
  teams: { type: Array, default: () => [] },
  matches: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  t: { type: Function, required: true },
})

defineEmits(['open-teams', 'retry'])

function nextMatch(team) {
  const teamId = String(team?.id ?? '')
  return props.matches.find((match) =>
    String(match?.homeTeamId ?? '') === teamId || String(match?.awayTeamId ?? '') === teamId,
  )
}
</script>

<template>
  <Card class="coach-dashboard-card h-full">
    <template #title>{{ t('sportCoachDashboard.teamOverview.title') }}</template>
    <template #content>
      <div v-if="loading" class="text-sm text-slate-500">{{ t('sportCoachDashboard.states.loading') }}</div>
      <div v-else-if="error" class="space-y-3 text-sm text-red-600">
        <p class="m-0">{{ error }}</p>
        <Button text size="small" :label="t('sportCoachDashboard.states.retry')" @click="$emit('retry')" />
      </div>
      <div v-else-if="teams.length" class="space-y-3">
        <div v-for="team in teams" :key="team.id" class="rounded-xl bg-slate-50 p-3">
          <p class="m-0 font-bold text-slate-900">{{ team.name }}</p>
          <p class="m-0 text-sm text-slate-600">
            {{ t('sportCoachDashboard.teamOverview.activePlayers', { count: team.activePlayersCount ?? team.playersCount ?? 0 }) }}
          </p>
          <p v-if="nextMatch(team)" class="m-0 text-sm text-slate-600">
            {{ t('sportCoachDashboard.teamOverview.nextMatch', { match: `${nextMatch(team).homeTeam} vs ${nextMatch(team).awayTeam}` }) }}
          </p>
        </div>
      </div>
      <p v-else class="m-0 text-sm text-slate-500">{{ t('sportCoachDashboard.teamOverview.empty') }}</p>
      <Button
        class="mt-4"
        text
        size="small"
        icon="pi pi-users"
        :label="t('sportCoachDashboard.actions.openTeams')"
        @click="$emit('open-teams')"
      />
    </template>
  </Card>
</template>

<style scoped>
.coach-dashboard-card {
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  box-shadow: 0 18px 34px -34px rgba(15, 23, 42, 0.25);
}
</style>
