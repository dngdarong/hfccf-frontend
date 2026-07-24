<script setup>
import { computed } from 'vue'

const props = defineProps({
  students: {
    type: Array,
    default: () => [],
  },
  attendanceRecords: {
    type: Array,
    default: () => [],
  },
  classLabel: {
    type: String,
    default: '',
  },
})

const statistics = computed(() => {
  const totalStudents = props.students.length
  const totalRecords = props.attendanceRecords.length

  const presentCount = props.attendanceRecords.filter(r => r.status === 'present').length
  const absentCount = props.attendanceRecords.filter(r => r.status === 'absent').length
  const lateCount = props.attendanceRecords.filter(r => r.status === 'late').length
  const excusedCount = props.attendanceRecords.filter(r => r.status === 'excused').length

  const presentPercentage = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0
  const absentPercentage = totalRecords > 0 ? Math.round((absentCount / totalRecords) * 100) : 0
  const latePercentage = totalRecords > 0 ? Math.round((lateCount / totalRecords) * 100) : 0
  const excusedPercentage = totalRecords > 0 ? Math.round((excusedCount / totalRecords) * 100) : 0

  return {
    totalStudents,
    totalRecords,
    presentCount,
    absentCount,
    lateCount,
    excusedCount,
    presentPercentage,
    absentPercentage,
    latePercentage,
    excusedPercentage,
  }
})

const stats = [
  {
    icon: 'pi-users',
    label: 'Total Students',
    value: () => statistics.value.totalStudents,
    color: 'blue',
  },
  {
    icon: 'pi-check-circle',
    label: 'Present',
    value: () => `${statistics.value.presentCount} (${statistics.value.presentPercentage}%)`,
    color: 'emerald',
  },
  {
    icon: 'pi-times-circle',
    label: 'Absent',
    value: () => `${statistics.value.absentCount} (${statistics.value.absentPercentage}%)`,
    color: 'rose',
  },
  {
    icon: 'pi-clock',
    label: 'Late',
    value: () => `${statistics.value.lateCount} (${statistics.value.latePercentage}%)`,
    color: 'amber',
  },
  {
    icon: 'pi-shield',
    label: 'Excused',
    value: () => `${statistics.value.excusedCount} (${statistics.value.excusedPercentage}%)`,
    color: 'blue',
  },
]

</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h3 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">Statistics</h3>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-lg border border-slate-200 bg-slate-50 p-3"
      >
        <div class="flex items-start gap-2">
          <i :class="[`pi ${stat.icon}`, 'text-slate-400 text-sm flex-shrink-0 mt-0.5']" />
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-slate-600">
              {{ stat.label }}
            </p>
            <p class="text-sm font-bold text-slate-900 mt-1">
              {{ stat.value() }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
