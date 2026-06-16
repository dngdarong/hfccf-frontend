<script setup>
// Keep attendance rollups separate because report pages need a compact summary
// without knowing how the backend groups present, late, absent, and excused.
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useLanguage()

/**
 * Attendance rate as a 0–100 integer, shown as a visual progress bar.
 * Computed from presentCount / attendanceCount so it updates reactively.
 * @returns {number}
 */
const attendanceRate = computed(() => {
  const total = props.summary.attendanceCount ?? 0
  const present = props.summary.presentCount ?? 0
  if (!total) return 0
  return Math.round((present / total) * 100)
})

const rateColor = computed(() => {
  if (attendanceRate.value >= 90) return 'bg-emerald-500'
  if (attendanceRate.value >= 75) return 'bg-amber-400'
  return 'bg-rose-500'
})
</script>

<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolReportsShared.attendanceTitle') }}</h3>
        <p class="text-xs text-slate-500">{{ t('preschoolReportsShared.attendanceSubtext') }}</p>
      </div>
      <!-- Attendance rate badge -->
      <div class="text-right">
        <span class="text-2xl font-bold text-slate-800">{{ attendanceRate }}%</span>
        <p class="text-xs text-slate-400">{{ t('preschoolReportsShared.attendance.rateLabel') }}</p>
      </div>
    </div>

    <!-- Attendance rate bar -->
    <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="rateColor"
        :style="{ width: `${attendanceRate}%` }"
      />
    </div>

    <!-- Count grid -->
    <dl class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
      <div class="rounded-xl bg-slate-50 p-3 sm:col-span-1">
        <dt class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolReportsShared.attendance.total') }}</dt>
        <dd class="mt-1 text-xl font-bold text-slate-900">{{ summary.attendanceCount ?? 0 }}</dd>
      </div>
      <div class="rounded-xl bg-emerald-50 p-3">
        <dt class="text-xs uppercase tracking-wide text-emerald-700">{{ t('preschoolReportsShared.attendance.present') }}</dt>
        <dd class="mt-1 text-xl font-bold text-emerald-800">{{ summary.presentCount ?? 0 }}</dd>
      </div>
      <div class="rounded-xl bg-amber-50 p-3">
        <dt class="text-xs uppercase tracking-wide text-amber-700">{{ t('preschoolReportsShared.attendance.late') }}</dt>
        <dd class="mt-1 text-xl font-bold text-amber-800">{{ summary.lateCount ?? 0 }}</dd>
      </div>
      <div class="rounded-xl bg-rose-50 p-3">
        <dt class="text-xs uppercase tracking-wide text-rose-700">{{ t('preschoolReportsShared.attendance.absent') }}</dt>
        <dd class="mt-1 text-xl font-bold text-rose-800">{{ summary.absentCount ?? 0 }}</dd>
      </div>
      <div class="rounded-xl bg-blue-50 p-3">
        <dt class="text-xs uppercase tracking-wide text-blue-700">{{ t('preschoolReportsShared.attendance.excused') }}</dt>
        <dd class="mt-1 text-xl font-bold text-blue-800">{{ summary.excusedCount ?? 0 }}</dd>
      </div>
    </dl>

    <p v-if="summary.latestAttendanceDate" class="mt-3 text-xs text-slate-400">
      {{ t('preschoolReportsShared.attendance.latest', { date: summary.latestAttendanceDate }) }}
    </p>
  </article>
</template>
