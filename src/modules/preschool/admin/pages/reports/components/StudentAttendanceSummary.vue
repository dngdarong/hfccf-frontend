<script setup>
import { computed } from 'vue'

const props = defineProps({
  attendance: {
    type: Object,
    default: null,
  },
})

const summary = computed(() => {
  if (!props.attendance || !props.attendance.items) {
    return {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
      percentage: 0,
    }
  }

  const items = props.attendance.items || []
  const present = items.filter(a => a.status === 'present').length
  const absent = items.filter(a => a.status === 'absent').length
  const late = items.filter(a => a.status === 'late').length
  const excused = items.filter(a => a.status === 'excused').length
  const total = items.length

  return {
    present,
    absent,
    late,
    excused,
    total,
    percentage: total > 0 ? Math.round((present / total) * 100) : 0,
  }
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Attendance Summary</h2>

    <div v-if="summary.total === 0" class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <i class="pi pi-calendar text-2xl text-slate-300" />
      <p class="mt-2 text-sm text-slate-500">No attendance records available.</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Attendance Progress Bar -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-slate-700">Overall Attendance Rate</p>
          <span :class="[
            'inline-block rounded-full px-3 py-1 text-xs font-semibold',
            summary.percentage >= 80
              ? 'bg-green-100 text-green-800'
              : summary.percentage >= 60
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800',
          ]">
            {{ summary.percentage }}%
          </span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            :style="{ width: `${summary.percentage}%` }"
            :class="[
              'h-full transition-all duration-500 ease-out',
              summary.percentage >= 80
                ? 'bg-green-500'
                : summary.percentage >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500',
            ]"
          />
        </div>
      </div>

      <!-- Metrics Grid -->
      <div class="grid gap-4 md:grid-cols-5">
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs font-semibold uppercase text-slate-500">Present</p>
          <p class="mt-2 text-2xl font-bold text-green-700">{{ summary.present }}</p>
        </div>

        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs font-semibold uppercase text-slate-500">Absent</p>
          <p class="mt-2 text-2xl font-bold text-red-700">{{ summary.absent }}</p>
        </div>

        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs font-semibold uppercase text-slate-500">Late</p>
          <p class="mt-2 text-2xl font-bold text-yellow-700">{{ summary.late }}</p>
        </div>

        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs font-semibold uppercase text-slate-500">Excused</p>
          <p class="mt-2 text-2xl font-bold text-blue-700">{{ summary.excused }}</p>
        </div>

        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs font-semibold uppercase text-slate-500">Total Records</p>
          <p class="mt-2 text-2xl font-bold text-slate-900">{{ summary.total }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
