<script setup>
import Card from 'primevue/card'
import Button from '@/components/buttons/Button.vue'

defineProps({
  session: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  t: { type: Function, required: true },
})

defineEmits(['open-schedule', 'retry'])
</script>

<template>
  <Card class="coach-dashboard-card h-full">
    <template #title>{{ t('sportCoachDashboard.nextTraining.title') }}</template>
    <template #content>
      <div v-if="loading" class="text-sm text-slate-500">{{ t('sportCoachDashboard.states.loading') }}</div>
      <div v-else-if="error" class="space-y-3 text-sm text-red-600">
        <p class="m-0">{{ error }}</p>
        <Button text size="small" :label="t('sportCoachDashboard.states.retry')" @click="$emit('retry')" />
      </div>
      <div v-else-if="session" class="space-y-2">
        <p class="m-0 text-base font-bold text-slate-900">{{ session.title }}</p>
        <p class="m-0 text-sm text-slate-600">{{ session.team || '—' }}</p>
        <p class="m-0 text-sm text-slate-600">
          {{ session.date || '—' }} · {{ session.startTime || '—' }}–{{ session.endTime || '—' }}
        </p>
        <p v-if="session.venue" class="m-0 text-sm text-slate-600">{{ session.venue }}</p>
      </div>
      <p v-else class="m-0 text-sm text-slate-500">{{ t('sportCoachDashboard.nextTraining.empty') }}</p>
      <Button
        class="mt-4"
        text
        size="small"
        icon="pi pi-calendar"
        :label="t('sportCoachDashboard.actions.viewSchedule')"
        @click="$emit('open-schedule')"
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
