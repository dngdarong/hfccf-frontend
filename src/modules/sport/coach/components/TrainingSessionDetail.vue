<script setup>
import StatusBadge from '@/components/badges/StatusBadge.vue'

defineOptions({ name: 'TrainingSessionDetail' })

const props = defineProps({
  session: { type: Object, default: null },
  t: { type: Function, required: true },
})

function statusTone(status) {
  return { scheduled: 'pending', live: 'info', completed: 'success', postponed: 'warning', cancelled: 'danger' }[status] || 'info'
}

function display(value) {
  if (value && typeof value === 'object') return value.name || value.fullName || value.username || '—'
  return value || '—'
}

function trainingTypeLabel(value) {
  const key = value === 'match_preparation' ? 'matchPreparation' : value
  return value ? props.t(`coachTrainingSchedule.trainingType.${key}`) : '—'
}
</script>

<template>
  <div v-if="session" class="grid gap-4 text-sm md:grid-cols-2">
    <div><dt>{{ t('coachTrainingSchedule.fields.team') }}</dt><dd>{{ display(session.team) }}</dd></div>
    <div><dt>{{ t('coachTrainingSchedule.fields.coach') }}</dt><dd>{{ display(session.coach?.fullName || session.coach?.username) }}</dd></div>
    <div class="md:col-span-2"><dt>{{ t('coachTrainingSchedule.fields.title') }}</dt><dd>{{ display(session.title) }}</dd></div>
    <div><dt>{{ t('coachTrainingSchedule.fields.trainingType') }}</dt><dd>{{ trainingTypeLabel(session.trainingType) }}</dd></div>
    <div><dt>{{ t('coachTrainingSchedule.fields.venue') }}</dt><dd>{{ display(session.venue) }}</dd></div>
    <div><dt>{{ t('coachTrainingSchedule.fields.startDate') }}</dt><dd>{{ display(session.date) }}</dd></div>
    <div><dt>{{ t('coachTrainingSchedule.fields.startTime') }}</dt><dd>{{ display(`${session.startTime} - ${session.endTime}`) }}</dd></div>
    <div><dt>{{ t('coachTrainingSchedule.fields.status') }}</dt><dd><StatusBadge :status="statusTone(session.status)" :label="t(`coachTrainingSchedule.status.${session.status}`)" :translate-label="false" size="sm" /></dd></div>
    <div><dt>{{ t('coachTrainingSchedule.fields.intensity') }}</dt><dd>{{ display(t(`coachTrainingSchedule.intensity.${session.intensity}`)) }}</dd></div>
    <div class="md:col-span-2"><dt>{{ t('coachTrainingSchedule.fields.focus') }}</dt><dd>{{ display(session.focus) }}</dd></div>
    <div class="md:col-span-2"><dt>{{ t('coachTrainingSchedule.fields.notes') }}</dt><dd class="whitespace-pre-wrap">{{ display(session.notes) }}</dd></div>
    <div v-if="session.createdAt" class="md:col-span-2"><dt>{{ t('coachTrainingSchedule.fields.createdAt') }}</dt><dd>{{ session.createdAt }}</dd></div>
  </div>
</template>

<style scoped>
dt { color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
dd { margin-top: 0.25rem; color: #0f172a; font-weight: 600; }
</style>
