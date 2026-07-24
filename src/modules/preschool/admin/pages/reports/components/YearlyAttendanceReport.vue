<script setup>
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Avatar from 'primevue/avatar'
import { useLanguage } from '@/composables/useLanguage'
import AttendanceSummaryCards from './AttendanceSummaryCards.vue'

const props = defineProps({
  attendanceRecords: {
    type: Array,
    default: () => [],
  },
  students: {
    type: Array,
    default: () => [],
  },
  year: {
    type: Number,
    default: 2026,
  },
})

const { t } = useLanguage()

const monthlyBreakdown = computed(() => {
  const months = []
  for (let month = 1; month <= 12; month++) {
    const monthRecords = props.attendanceRecords.filter((r) => {
      const date = new Date(r.attendanceDate)
      return date.getMonth() === month - 1 && date.getFullYear() === props.year
    })

    const present = monthRecords.filter(r => r.status === 'present').length
    const absent = monthRecords.filter(r => r.status === 'absent').length
    const late = monthRecords.filter(r => r.status === 'late').length
    const excused = monthRecords.filter(r => r.status === 'excused').length
    const total = monthRecords.length

    months.push({
      month,
      monthName: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(props.year, month - 1)),
      present,
      absent,
      late,
      excused,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    })
  }
  return months
})

const studentAttendanceSummary = computed(() => {
  return props.students.map((student) => {
    const studentRecords = props.attendanceRecords.filter(r => r.studentId === student.id)
    const present = studentRecords.filter(r => r.status === 'present').length
    const absent = studentRecords.filter(r => r.status === 'absent').length
    const late = studentRecords.filter(r => r.status === 'late').length
    const excused = studentRecords.filter(r => r.status === 'excused').length
    const total = studentRecords.length

    return {
      student,
      present,
      absent,
      late,
      excused,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    }
  })
})
</script>

<template>
  <div class="space-y-6">
    <!-- Report Header -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-bold text-slate-900">
        {{ t('preschoolAttendanceReportPage.reports.yearly.title') || 'Yearly Attendance Report' }}
      </h2>
      <p class="mt-2 text-sm text-slate-600">{{ year }}</p>
    </div>

    <!-- Yearly Summary Cards -->
    <AttendanceSummaryCards :attendance-records="attendanceRecords" />

    <!-- Monthly Breakdown Table -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {{ t('preschoolAttendanceReportPage.reports.yearly.monthlyBreakdown') || 'Monthly Breakdown' }}
      </h2>

      <div class="overflow-x-auto">
        <DataTable
          :value="monthlyBreakdown"
          size="small"
          striped-rows
          responsive-layout="scroll"
        >
          <!-- Month -->
          <Column field="monthName" :header="t('preschoolAttendanceReportPage.table.month') || 'Month'" />

          <!-- Present -->
          <Column field="present" :header="t('preschoolAttendanceReportPage.table.present') || 'Present'" />

          <!-- Absent -->
          <Column field="absent" :header="t('preschoolAttendanceReportPage.table.absent') || 'Absent'" />

          <!-- Late -->
          <Column field="late" :header="t('preschoolAttendanceReportPage.table.late') || 'Late'" />

          <!-- Excused -->
          <Column field="excused" :header="t('preschoolAttendanceReportPage.table.excused') || 'Excused'" />

          <!-- Total -->
          <Column field="total" :header="t('preschoolAttendanceReportPage.table.total') || 'Total'" />

          <!-- Percentage -->
          <Column field="percentage" :header="t('preschoolAttendanceReportPage.table.percentage') || 'Percentage'">
            <template #body="{ data }">
              <span :class="data.percentage >= 80 ? 'text-green-700' : 'text-red-700'">
                {{ data.percentage }}%
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Student Yearly Attendance Table -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {{ t('preschoolAttendanceReportPage.table.student') || 'Students' }}
      </h2>

      <div class="overflow-x-auto">
        <DataTable
          :value="studentAttendanceSummary"
          size="small"
          striped-rows
          responsive-layout="scroll"
          :rows="20"
          paginator
        >
          <!-- Photo -->
          <Column header="Photo" style="width: 50px">
            <template #body="{ data }">
              <Avatar
                v-if="data.student.avatarUrl"
                :image="data.student.avatarUrl"
                shape="circle"
                size="small"
              />
              <Avatar
                v-else
                :label="data.student.firstName?.charAt(0) || ''"
                shape="circle"
                size="small"
              />
            </template>
          </Column>

          <!-- Student Code -->
          <Column field="student.studentCode" :header="t('preschoolAttendanceReportPage.table.code') || 'Code'" />

          <!-- Student Name -->
          <Column field="student.fullName" :header="t('preschoolAttendanceReportPage.table.student') || 'Student'" />

          <!-- Present -->
          <Column field="present" :header="t('preschoolAttendanceReportPage.table.present') || 'Present'" />

          <!-- Absent -->
          <Column field="absent" :header="t('preschoolAttendanceReportPage.table.absent') || 'Absent'" />

          <!-- Late -->
          <Column field="late" :header="t('preschoolAttendanceReportPage.table.late') || 'Late'" />

          <!-- Excused -->
          <Column field="excused" :header="t('preschoolAttendanceReportPage.table.excused') || 'Excused'" />

          <!-- Total -->
          <Column field="total" :header="t('preschoolAttendanceReportPage.table.total') || 'Total'" />

          <!-- Percentage -->
          <Column field="percentage" :header="t('preschoolAttendanceReportPage.table.percentage') || 'Percentage'">
            <template #body="{ data }">
              <span :class="data.percentage >= 80 ? 'text-green-700' : 'text-red-700'">
                {{ data.percentage }}%
              </span>
            </template>
          </Column>

          <!-- Status -->
          <Column field="student.status" :header="t('preschoolAttendanceReportPage.table.status') || 'Status'">
            <template #body="{ data }">
              <span
                :class="[
                  'inline-block rounded-full px-2 py-1 text-xs font-semibold',
                  data.student.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800',
                ]"
              >
                {{ data.student.status }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Empty State -->
      <div v-if="studentAttendanceSummary.length === 0" class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <i class="pi pi-inbox text-2xl text-slate-300" />
        <p class="mt-2 text-sm text-slate-500">
          {{ t('preschoolAttendanceReportPage.messages.noRecords') || 'No attendance records found' }}
        </p>
      </div>
    </div>
  </div>
</template>
