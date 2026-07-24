<script setup>
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Avatar from 'primevue/avatar'

const props = defineProps({
  students: {
    type: Array,
    required: true,
  },
})

const summary = computed(() => {
  if (!props.students || props.students.length === 0) {
    return {
      totalStudents: 0,
      averageAttendance: 0,
      averageAssessment: null,
      activeStudents: 0,
    }
  }

  const totalStudents = props.students.length
  const activeStudents = props.students.filter(s => s.student?.status === 'active').length

  const attendancePercentages = props.students
    .map(s => s.attendancePercentage)
    .filter(a => a !== null && a !== undefined)
  const averageAttendance = attendancePercentages.length > 0
    ? Math.round(attendancePercentages.reduce((a, b) => a + b, 0) / attendancePercentages.length)
    : 0

  const assessmentScores = props.students
    .filter(s => s.latestAssessment?.score !== null && s.latestAssessment?.score !== undefined)
    .map(s => Number(s.latestAssessment.score))
  const averageAssessment = assessmentScores.length > 0
    ? (assessmentScores.reduce((a, b) => a + b, 0) / assessmentScores.length).toFixed(1)
    : null

  return {
    totalStudents,
    averageAttendance,
    averageAssessment,
    activeStudents,
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid gap-4 md:grid-cols-4">
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase text-slate-500">Total Students</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">{{ summary.totalStudents }}</p>
      </div>

      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase text-slate-500">Active Students</p>
        <p class="mt-2 text-2xl font-bold text-green-700">{{ summary.activeStudents }}</p>
      </div>

      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase text-slate-500">Avg. Attendance</p>
        <div class="mt-2 flex items-baseline gap-1">
          <span class="text-2xl font-bold text-slate-900">{{ summary.averageAttendance }}%</span>
        </div>
      </div>

      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase text-slate-500">Avg. Assessment</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">{{ summary.averageAssessment || '—' }}</p>
      </div>
    </div>

    <!-- Class Table -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Students</h2>

      <div class="overflow-x-auto">
        <DataTable
          :value="students"
          size="small"
          striped-rows
          responsive-layout="scroll"
          :rows="20"
          paginator
        >
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
          <Column field="student.studentCode" header="Student Code" />
          <Column field="student.fullName" header="Name" />
          <Column field="student.gender" header="Gender" />
          <Column field="student.classes[0].name" header="Class">
            <template #body="{ data }">
              {{ data.student.classes?.[0]?.name || '—' }}
            </template>
          </Column>
          <Column field="attendancePercentage" header="Attendance %">
            <template #body="{ data }">
              <span :class="data.attendancePercentage >= 80 ? 'text-green-700' : 'text-red-700'">
                {{ data.attendancePercentage }}%
              </span>
            </template>
          </Column>
          <Column field="latestAssessment.score" header="Latest Assessment">
            <template #body="{ data }">
              {{ data.latestAssessment?.score || '—' }}
            </template>
          </Column>
          <Column field="student.status" header="Status">
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
    </div>
  </div>
</template>
