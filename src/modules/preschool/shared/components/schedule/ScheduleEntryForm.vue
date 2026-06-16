<script setup>
// Keep the schedule editor self-contained so the management page can focus on
// orchestration while this form owns validation-friendly field layout.
import { reactive, watch } from 'vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import ScheduleConflictNotice from './ScheduleConflictNotice.vue'

const props = defineProps({
  entry: {
    type: Object,
    default: null,
  },
  classOptions: {
    type: Array,
    default: () => [],
  },
  teacherOptions: {
    type: Array,
    default: () => [],
  },
  dayOptions: {
    type: Array,
    default: () => [],
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  conflicts: {
    type: Array,
    default: () => [],
  },
  saving: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  submitLabel: {
    type: String,
    default: '',
  },
  cancelLabel: {
    type: String,
    default: '',
  },
  emptyClassLabel: {
    type: String,
    default: '',
  },
  emptyTeacherLabel: {
    type: String,
    default: '',
  },
  fieldLabels: {
    type: Object,
    default: () => ({}),
  },
  placeholders: {
    type: Object,
    default: () => ({}),
  },
  conflictTitle: {
    type: String,
    default: '',
  },
  conflictSubtitle: {
    type: String,
    default: '',
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  lockMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive(createEmptyForm())

function createEmptyForm() {
  return {
    class_id: '',
    teacher_user_id: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    room: '',
    activity_label: '',
    notes: '',
    status: 'active',
    effective_from: '',
    effective_until: '',
  }
}

function syncForm(entry = null) {
  const source = entry || {}
  form.class_id = source.classId || source.class_id || ''
  form.teacher_user_id = source.teacherUserId || source.teacher_user_id || ''
  form.day_of_week = source.dayOfWeek || source.day_of_week || ''
  form.start_time = source.startTime || source.start_time || ''
  form.end_time = source.endTime || source.end_time || ''
  form.room = source.room || ''
  form.activity_label = source.activityLabel || source.activity_label || ''
  form.notes = source.notes || ''
  form.status = source.status || 'active'
  form.effective_from = source.effectiveFrom || source.effective_from || ''
  form.effective_until = source.effectiveUntil || source.effective_until || ''
}

watch(
  () => props.entry,
  (entry) => syncForm(entry),
  { immediate: true },
)

function submitForm() {
  emit('submit', { ...form })
}
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div
      v-if="isLocked && lockMessage"
      class="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      {{ lockMessage }}
    </div>

    <div class="space-y-1">
      <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
      <p v-if="subtitle" class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <div class="mt-4 grid gap-4 md:grid-cols-2">
      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ fieldLabels.classLabel }}</span>
        <Select
          v-model="form.class_id"
          :options="classOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="emptyClassLabel"
          :disabled="isLocked"
        />
      </label>

      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ fieldLabels.teacherLabel }}</span>
        <Select
          v-model="form.teacher_user_id"
          :options="teacherOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="emptyTeacherLabel"
          :disabled="isLocked"
        />
      </label>

      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ fieldLabels.dayLabel }}</span>
        <Select
          v-model="form.day_of_week"
          :options="dayOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="placeholders.day"
          :disabled="isLocked"
        />
      </label>

      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ fieldLabels.statusLabel }}</span>
        <Select
          v-model="form.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="placeholders.status"
          :disabled="isLocked"
        />
      </label>

      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ fieldLabels.startTimeLabel }}</span>
        <InputText v-model="form.start_time" type="time" class="w-full" :disabled="isLocked" />
      </label>

      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ fieldLabels.endTimeLabel }}</span>
        <InputText v-model="form.end_time" type="time" class="w-full" :disabled="isLocked" />
      </label>

      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ fieldLabels.roomLabel }}</span>
        <InputText v-model="form.room" class="w-full" :placeholder="placeholders.room" :disabled="isLocked" />
      </label>

      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ fieldLabels.activityLabel }}</span>
        <InputText v-model="form.activity_label" class="w-full" :placeholder="placeholders.activity" :disabled="isLocked" />
      </label>

      <label class="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
        <span>{{ fieldLabels.notesLabel }}</span>
        <Textarea v-model="form.notes" rows="3" class="w-full" :disabled="isLocked" />
      </label>

      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ fieldLabels.effectiveFromLabel }}</span>
        <InputText v-model="form.effective_from" type="date" class="w-full" :disabled="isLocked" />
      </label>

      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ fieldLabels.effectiveUntilLabel }}</span>
        <InputText v-model="form.effective_until" type="date" class="w-full" :disabled="isLocked" />
      </label>
    </div>

    <div class="mt-4">
      <ScheduleConflictNotice
        :conflicts="conflicts"
        :title="conflictTitle"
        :subtitle="conflictSubtitle"
      />
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <Button type="button" variant="primary" size="md" rounded="xl" :loading="saving" :disabled="isLocked" @click="submitForm">
        {{ submitLabel }}
      </Button>
      <Button type="button" variant="ghost" size="md" rounded="xl" :disabled="isLocked" @click="emit('cancel')">
        {{ cancelLabel }}
      </Button>
    </div>
  </section>
</template>
