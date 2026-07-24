<script setup>
import Card from 'primevue/card'
import Button from '@/components/buttons/Button.vue'

defineProps({
  t: { type: Function, required: true },
})

defineEmits(['attendance', 'schedule', 'teams'])
</script>

<template>
  <Card class="coach-dashboard-card">
    <template #title>{{ t('sportCoachDashboard.quickActions.title') }}</template>
    <template #content>
      <div class="flex flex-wrap gap-3">
        <Button size="small" icon="pi pi-check-square" :label="t('sportCoachDashboard.actions.markAttendance')" @click="$emit('attendance')" />
        <Button size="small" outlined icon="pi pi-calendar" :label="t('sportCoachDashboard.actions.viewSchedule')" @click="$emit('schedule')" />
        <Button size="small" outlined icon="pi pi-users" :label="t('sportCoachDashboard.actions.openTeams')" @click="$emit('teams')" />
      </div>
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
