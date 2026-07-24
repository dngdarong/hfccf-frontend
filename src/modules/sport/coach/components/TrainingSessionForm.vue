<script setup>
import { computed, reactive, watch } from 'vue'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Button from '@/components/buttons/Button.vue'

defineOptions({ name: 'TrainingSessionForm' })

const props = defineProps({
  session: { type: Object, default: null },
  teamOptions: { type: Array, default: () => [] },
  coachOptions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  serverErrors: { type: Object, default: () => ({}) },
  errorMessage: { type: String, default: '' },
  t: { type: Function, required: true },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  teamId: '', coachUserId: '', title: '', trainingType: 'technical',
  startDate: null, startTime: '08:00', endDate: null, endTime: '10:00',
  venue: '', focus: '', status: 'scheduled', intensity: 'medium', notes: '',
})
const localErrors = reactive({})

const mode = computed(() => (props.session ? 'edit' : 'create'))
const trainingTypeOptions = computed(() => [
  { value: 'technical', label: props.t('coachTrainingSchedule.trainingType.technical') },
  { value: 'tactical', label: props.t('coachTrainingSchedule.trainingType.tactical') },
  { value: 'fitness', label: props.t('coachTrainingSchedule.trainingType.fitness') },
  { value: 'recovery', label: props.t('coachTrainingSchedule.trainingType.recovery') },
  { value: 'match_preparation', label: props.t('coachTrainingSchedule.trainingType.matchPreparation') },
])
const statusOptions = computed(() => ['scheduled', 'live', 'completed', 'postponed', 'cancelled']
  .map((value) => ({ value, label: props.t(`coachTrainingSchedule.status.${value}`) })))
const intensityOptions = computed(() => ['low', 'medium', 'high']
  .map((value) => ({ value, label: props.t(`coachTrainingSchedule.intensity.${value}`) })))

function parseDate(value) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

function parseTime(value, fallback) {
  const match = String(value || '').match(/T?(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : fallback
}

function resetForm(session = null) {
  form.teamId = session?.teamId ? String(session.teamId) : ''
  form.coachUserId = session?.coachUserId ? String(session.coachUserId) : ''
  form.title = session?.title || ''
  form.trainingType = session?.trainingType || 'technical'
  form.startDate = parseDate(session?.startsAt)
  form.startTime = parseTime(session?.startsAt, '08:00')
  form.endDate = parseDate(session?.endsAt) || form.startDate
  form.endTime = parseTime(session?.endsAt, '10:00')
  form.venue = session?.venue || ''
  form.focus = session?.focus || ''
  form.status = session?.status || 'scheduled'
  form.intensity = session?.intensity || 'medium'
  form.notes = session?.notes || ''
  Object.keys(localErrors).forEach((key) => delete localErrors[key])
}

watch(() => props.session, (session) => resetForm(session), { immediate: true })

function formatDate(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return ''
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

function formatDateTime(date, time) {
  return `${formatDate(date)} ${time}:00`
}

function validationMessage(field) {
  if (localErrors[field]) return localErrors[field]
  const aliases = {
    teamId: 'team_id', coachUserId: 'coach_user_id', trainingType: 'training_type',
    startDate: 'starts_at', startTime: 'starts_at', endDate: 'ends_at', endTime: 'ends_at',
  }
  const value = props.serverErrors[field] || props.serverErrors[aliases[field]]
  return Array.isArray(value) ? value[0] : value || ''
}

function validate() {
  Object.keys(localErrors).forEach((key) => delete localErrors[key])
  if (!form.teamId) localErrors.teamId = props.t('coachTrainingSchedule.validation.teamRequired')
  if (!form.title.trim()) localErrors.title = props.t('coachTrainingSchedule.validation.titleRequired')
  if (!form.trainingType) localErrors.trainingType = props.t('coachTrainingSchedule.validation.trainingTypeRequired')
  if (!form.startDate) localErrors.startDate = props.t('coachTrainingSchedule.validation.startRequired')
  if (!form.startTime) localErrors.startTime = props.t('coachTrainingSchedule.validation.startRequired')
  if (!form.endDate) localErrors.endDate = props.t('coachTrainingSchedule.validation.endRequired')
  if (!form.endTime) localErrors.endTime = props.t('coachTrainingSchedule.validation.endRequired')
  if (form.startDate && form.startTime && form.endDate && form.endTime) {
    const start = new Date(`${formatDate(form.startDate)}T${form.startTime}`)
    const end = new Date(`${formatDate(form.endDate)}T${form.endTime}`)
    if (end <= start) localErrors.endTime = props.t('coachTrainingSchedule.validation.endAfterStart')
  }
  return Object.keys(localErrors).length === 0
}

function submit() {
  if (props.loading || !validate()) return
  emit('submit', {
    teamId: form.teamId, coachUserId: form.coachUserId || null, title: form.title.trim(),
    trainingType: form.trainingType, startsAt: formatDateTime(form.startDate, form.startTime),
    endsAt: formatDateTime(form.endDate, form.endTime), venue: form.venue.trim(),
    focus: form.focus.trim(), status: form.status, intensity: form.intensity, notes: form.notes.trim(),
  })
}
</script>

<template>
  <form class="training-session-form space-y-4" novalidate @submit.prevent="submit">
    <div v-if="Object.keys(serverErrors).length" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
      {{ t('coachTrainingSchedule.validation.serverError') }}
    </div>
    <div v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
      {{ errorMessage }}
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <label class="training-session-form__field"><span>{{ t('coachTrainingSchedule.fields.team') }} <em>*</em></span><Select v-model="form.teamId" :options="teamOptions" option-label="name" option-value="id" :placeholder="t('coachTrainingSchedule.placeholders.team')" :invalid="Boolean(validationMessage('teamId'))" /><small v-if="validationMessage('teamId')">{{ validationMessage('teamId') }}</small></label>
      <label class="training-session-form__field"><span>{{ t('coachTrainingSchedule.fields.coach') }}</span><Select v-model="form.coachUserId" :options="coachOptions" option-label="fullName" option-value="id" show-clear :placeholder="t('coachTrainingSchedule.placeholders.coach')" /></label>
    </div>
    <label class="training-session-form__field"><span>{{ t('coachTrainingSchedule.fields.title') }} <em>*</em></span><InputText v-model="form.title" class="w-full" :invalid="Boolean(validationMessage('title'))" /><small v-if="validationMessage('title')">{{ validationMessage('title') }}</small></label>
    <div class="grid gap-4 md:grid-cols-2">
      <label class="training-session-form__field"><span>{{ t('coachTrainingSchedule.fields.trainingType') }} <em>*</em></span><Select v-model="form.trainingType" :options="trainingTypeOptions" option-label="label" option-value="value" :invalid="Boolean(validationMessage('trainingType'))" /><small v-if="validationMessage('trainingType')">{{ validationMessage('trainingType') }}</small></label>
      <label class="training-session-form__field"><span>{{ t('coachTrainingSchedule.fields.venue') }}</span><InputText v-model="form.venue" class="w-full" /></label>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <label class="training-session-form__field"><span>{{ t('coachTrainingSchedule.fields.startDate') }} <em>*</em></span><DatePicker v-model="form.startDate" date-format="yy-mm-dd" show-icon class="w-full" :invalid="Boolean(validationMessage('startDate'))" /><small v-if="validationMessage('startDate')">{{ validationMessage('startDate') }}</small></label>
      <label class="training-session-form__field"><span>{{ t('coachTrainingSchedule.fields.startTime') }} <em>*</em></span><InputText v-model="form.startTime" type="time" class="w-full" :invalid="Boolean(validationMessage('startTime'))" /><small v-if="validationMessage('startTime')">{{ validationMessage('startTime') }}</small></label>
      <label class="training-session-form__field"><span>{{ t('coachTrainingSchedule.fields.endDate') }} <em>*</em></span><DatePicker v-model="form.endDate" date-format="yy-mm-dd" show-icon class="w-full" :invalid="Boolean(validationMessage('endDate'))" /><small v-if="validationMessage('endDate')">{{ validationMessage('endDate') }}</small></label>
      <label class="training-session-form__field"><span>{{ t('coachTrainingSchedule.fields.endTime') }} <em>*</em></span><InputText v-model="form.endTime" type="time" class="w-full" :invalid="Boolean(validationMessage('endTime'))" /><small v-if="validationMessage('endTime')">{{ validationMessage('endTime') }}</small></label>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <label class="training-session-form__field"><span>{{ t('coachTrainingSchedule.fields.status') }}</span><Select v-model="form.status" :options="statusOptions" option-label="label" option-value="value" /></label>
      <label class="training-session-form__field"><span>{{ t('coachTrainingSchedule.fields.intensity') }}</span><Select v-model="form.intensity" :options="intensityOptions" option-label="label" option-value="value" /></label>
    </div>
    <label class="training-session-form__field"><span>{{ t('coachTrainingSchedule.fields.focus') }}</span><InputText v-model="form.focus" class="w-full" /></label>
    <label class="training-session-form__field"><span>{{ t('coachTrainingSchedule.fields.notes') }}</span><Textarea v-model="form.notes" rows="3" auto-resize class="w-full" /></label>
    <div class="flex justify-end gap-2 pt-2"><Button type="button" text :label="t('common.cancel')" :disabled="loading" @click="emit('cancel')" /><Button type="submit" :loading="loading" :label="mode === 'edit' ? t('coachTrainingSchedule.actions.update') : t('coachTrainingSchedule.actions.save')" /></div>
  </form>
</template>

<style scoped>
.training-session-form__field { display: flex; flex-direction: column; gap: 0.35rem; color: #334155; font-size: 0.875rem; font-weight: 700; }
.training-session-form__field em { color: #dc2626; font-style: normal; }
.training-session-form__field small { color: #dc2626; font-weight: 500; }
</style>
