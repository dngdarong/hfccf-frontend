<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  attendanceRecords: {
    type: Array,
    default: () => [],
  },
})

const { t } = useLanguage()

const summary = computed(() => {
  if (!props.attendanceRecords || props.attendanceRecords.length === 0) {
    return {
      totalRecords: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      percentage: 0,
    }
  }

  const present = props.attendanceRecords.filter(r => r.status === 'present').length
  const absent = props.attendanceRecords.filter(r => r.status === 'absent').length
  const late = props.attendanceRecords.filter(r => r.status === 'late').length
  const excused = props.attendanceRecords.filter(r => r.status === 'excused').length
  const totalRecords = props.attendanceRecords.length

  return {
    totalRecords,
    present,
    absent,
    late,
    excused,
    percentage: totalRecords > 0 ? Math.round((present / totalRecords) * 100) : 0,
  }
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
      {{ t('preschoolAttendanceReportPage.summary.title') || 'Attendance Summary' }}
    </h2>

    <div class="grid gap-4 md:grid-cols-4">
      <!-- Total Records -->
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase text-slate-500">
          {{ t('preschoolAttendanceReportPage.summary.totalRecords') || 'Total Records' }}
        </p>
        <p class="mt-2 text-2xl font-bold text-slate-900">{{ summary.totalRecords }}</p>
      </div>

      <!-- Present -->
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase text-slate-500">
          {{ t('preschoolAttendanceReportPage.summary.present') || 'Present' }}
        </p>
        <p class="mt-2 text-2xl font-bold text-green-700">{{ summary.present }}</p>
      </div>

      <!-- Absent -->
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase text-slate-500">
          {{ t('preschoolAttendanceReportPage.summary.absent') || 'Absent' }}
        </p>
        <p class="mt-2 text-2xl font-bold text-red-700">{{ summary.absent }}</p>
      </div>

      <!-- Late & Excused & Percentage (grid 3 across on md, all stats shown) -->
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase text-slate-500">
          {{ t('preschoolAttendanceReportPage.summary.late') || 'Late' }}
        </p>
        <p class="mt-2 text-2xl font-bold text-yellow-700">{{ summary.late }}</p>
      </div>
    </div>

    <!-- Second row for remaining metrics -->
    <div class="mt-4 grid gap-4 md:grid-cols-4">
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase text-slate-500">
          {{ t('preschoolAttendanceReportPage.summary.excused') || 'Excused' }}
        </p>
        <p class="mt-2 text-2xl font-bold text-blue-700">{{ summary.excused }}</p>
      </div>

      <!-- Attendance Percentage -->
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase text-slate-500">
          {{ t('preschoolAttendanceReportPage.summary.percentage') || 'Attendance %' }}
        </p>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900">{{ summary.percentage }}%</span>
        </div>
      </div>

      <!-- Progress Bar (takes 2 columns) -->
      <div class="col-span-2">
        <p class="mb-2 text-xs font-semibold uppercase text-slate-500">Progress</p>
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
    </div>
  </div>
</template>
