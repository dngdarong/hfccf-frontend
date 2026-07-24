<script setup>
// Keep the weekly timetable rendering isolated so management and read-only
// pages can reuse the same layout and empty-state behavior.
import { computed, ref } from 'vue'
import ScheduleStatusBadge from './ScheduleStatusBadge.vue'
import AppStatusChip from '@/components/ui/AppStatusChip.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import { getScheduleSessionStatusTone, normalizeScheduleSessionStatus } from './scheduleSessionOverlay'

const getStatusTone = (status) => getScheduleSessionStatusTone(status)
const normalizeSessionStatus = (status) => normalizeScheduleSessionStatus(status)

const dayNames = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
}

const getDayName = (dayOfWeek) => dayNames[dayOfWeek] || '-'

const currentPage = ref(1)
const itemsPerPage = 10

const props = defineProps({
  entries: {
    type: Array,
    default: () => [],
  },
  dayLabel: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingLabel: {
    type: String,
    default: '',
  },
  emptyLabel: {
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

const emit = defineEmits(['edit', 'archive', 'session-action', 'session-view'])

const totalPages = computed(() => Math.ceil(props.entries.length / itemsPerPage))

const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return props.entries.slice(start, end)
})
</script>

<template>
  <div class="schedule-card">
    <div
      v-if="loading"
      class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500"
    >
      {{ loadingLabel }}
    </div>

    <div v-else-if="!entries.length" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
      {{ emptyLabel }}
    </div>

    <div v-else class="space-y-4">
      <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50">
              <th class="border-r border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-900 w-12">No.</th>
              <th class="border-r border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900">Day</th>
              <th class="border-r border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900">Class</th>
              <th class="border-r border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900">Time</th>
              <th class="border-r border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900">Room</th>
              <th class="border-r border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-slate-900">Session</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in paginatedEntries" :key="entry.id" class="border-b border-slate-200 transition-colors hover:bg-slate-50">
            <td class="border-r border-slate-200 px-4 py-3 text-center text-sm text-slate-600 font-semibold">{{ index + 1 }}</td>
            <td class="border-r border-slate-200 px-4 py-3 text-sm text-slate-600">{{ getDayName(entry.dayOfWeek) }}</td>
            <td class="border-r border-slate-200 px-4 py-3 text-sm text-slate-900 font-semibold">{{ entry.activityLabel }}</td>
            <td class="border-r border-slate-200 px-4 py-3 text-sm text-slate-600">{{ entry.startTime }} - {{ entry.endTime }}</td>
            <td class="border-r border-slate-200 px-4 py-3 text-sm text-slate-600">{{ entry.room || '-' }}</td>
            <td class="border-r border-slate-200 px-4 py-3 text-sm">
              <ScheduleStatusBadge :status="entry.status" :label="entry.status" />
            </td>
            <td class="px-4 py-3 text-sm">
              <AppStatusChip
                v-if="entry.session"
                :status="getStatusTone(entry.session?.status)"
                :label="entry.session?.statusLabel || entry.session?.status"
                :translate-label="false"
                size="xs"
              />
              <span v-else class="inline-flex items-center rounded-full border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                {{ noSessionLabel }}
              </span>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-center">
        <Pagination v-model="currentPage" :total-pages="totalPages" class="mt-2" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}
</style>
