<script setup>
// Keep timetable rows self-contained so the grid and management list can reuse
// the same card without duplicating class/teacher/time rendering logic.
import { computed } from 'vue'
import Button from '@/components/buttons/Button.vue'
import AppStatusChip from '@/components/ui/AppStatusChip.vue'
import ScheduleStatusBadge from './ScheduleStatusBadge.vue'
import {
  getScheduleSessionActionTone,
  getScheduleSessionStatusTone,
  normalizeScheduleSessionStatus,
} from './scheduleSessionOverlay'

const props = defineProps({
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
  viewLabel: {
    type: String,
    default: '',
  },
  session: {
    type: Object,
    default: null,
  },
  sessionViewLabel: {
    type: String,
    default: '',
  },
  sessionActionLabel: {
    type: String,
    default: '',
  },
  noSessionLabel: {
    type: String,
    default: '',
  },
  showSessionActions: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'archive', 'view', 'session-action', 'session-view'])

const isArchived = computed(() => String(props.entry?.status || '').toLowerCase() === 'archived')
const sessionStatus = computed(() => normalizeScheduleSessionStatus(props.session?.status || ''))
const sessionStatusTone = computed(() => getScheduleSessionStatusTone(sessionStatus.value))
const sessionActionTone = computed(() => getScheduleSessionActionTone(sessionStatus.value))
const showSessionDetailsAction = computed(() => ['scheduled', 'open'].includes(sessionStatus.value))
const sessionStatusLabel = computed(() => {
  if (!props.session) return props.noSessionLabel
  return props.session?.statusLabel || props.session?.status || ''
})
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

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <AppStatusChip
        v-if="session"
        :status="sessionStatusTone"
        :label="sessionStatusLabel"
        :translate-label="false"
        size="xs"
      />
      <span
        v-else-if="noSessionLabel"
        class="inline-flex items-center rounded-full border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500"
      >
        {{ noSessionLabel }}
      </span>
    </div>

    <div class="mt-4 space-y-1 text-sm text-slate-600">
      <p>{{ entry.className }}</p>
      <p>{{ entry.teacherName }}</p>
      <p v-if="entry.room">{{ entry.room }}</p>
      <p v-if="entry.notes" class="text-slate-500">{{ entry.notes }}</p>
    </div>

    <div v-if="showSessionActions && session" class="mt-4 flex flex-wrap gap-2">
      <Button
        v-if="sessionActionLabel || session?.actionLabel"
        type="button"
        :variant="session?.actionTone || sessionActionTone"
        size="sm"
        rounded="xl"
        @click="emit('session-action', entry)"
      >
        {{ session?.actionLabel || sessionActionLabel }}
      </Button>
      <Button
        v-if="sessionViewLabel && showSessionDetailsAction"
        type="button"
        variant="ghost"
        size="sm"
        rounded="xl"
        @click="emit('session-view', entry)"
      >
        {{ sessionViewLabel }}
      </Button>
    </div>

    <div v-if="showActions" class="mt-4 flex flex-wrap gap-2">
      <Button
        v-if="isArchived && viewLabel"
        type="button"
        variant="ghost"
        size="sm"
        rounded="xl"
        @click="emit('view', entry)"
      >
        {{ viewLabel }}
      </Button>
      <template v-else>
        <Button v-if="editLabel" type="button" variant="ghost" size="sm" rounded="xl" :disabled="isLocked" @click="emit('edit', entry)">
          {{ editLabel }}
        </Button>
        <Button v-if="archiveLabel" type="button" variant="danger" size="sm" rounded="xl" :disabled="isLocked" @click="emit('archive', entry)">
          {{ archiveLabel }}
        </Button>
      </template>
    </div>
  </article>
</template>
