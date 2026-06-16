<script setup>
// Keep timetable rows self-contained so the grid and management list can reuse
// the same card without duplicating class/teacher/time rendering logic.
import Button from '@/components/buttons/Button.vue'
import ScheduleStatusBadge from './ScheduleStatusBadge.vue'

defineProps({
  entry: {
    type: Object,
    required: true,
  },
  dayLabel: {
    type: String,
    default: '',
  },
  showActions: {
    type: Boolean,
    default: false,
  },
  editLabel: {
    type: String,
    default: '',
  },
  archiveLabel: {
    type: String,
    default: '',
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'archive'])
</script>

<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {{ dayLabel }}
        </p>
        <h3 class="text-base font-semibold text-slate-900">
          {{ entry.activityLabel }}
        </h3>
        <p class="text-sm text-slate-600">
          {{ entry.startTime }} - {{ entry.endTime }}
        </p>
      </div>
      <ScheduleStatusBadge :status="entry.status" :label="entry.status" />
    </div>

    <div class="mt-4 space-y-1 text-sm text-slate-600">
      <p>{{ entry.className }}</p>
      <p>{{ entry.teacherName }}</p>
      <p v-if="entry.room">{{ entry.room }}</p>
      <p v-if="entry.notes" class="text-slate-500">{{ entry.notes }}</p>
    </div>

    <div v-if="showActions" class="mt-4 flex flex-wrap gap-2">
      <Button v-if="editLabel" type="button" variant="ghost" size="sm" rounded="xl" :disabled="isLocked" @click="emit('edit', entry)">
        {{ editLabel }}
      </Button>
      <Button v-if="archiveLabel" type="button" variant="danger" size="sm" rounded="xl" :disabled="isLocked" @click="emit('archive', entry)">
        {{ archiveLabel }}
      </Button>
    </div>
  </article>
</template>
