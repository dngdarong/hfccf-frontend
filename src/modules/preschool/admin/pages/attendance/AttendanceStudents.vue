<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useLanguage } from '@/composables/useLanguage'
import { fetchAcademicLifecycle } from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'
import {
  fetchPreschoolAttendance,
  fetchPreschoolClasses,
  fetchPreschoolStudents,
  savePreschoolAttendance,
} from '@/modules/preschool/services/preschoolApi'

defineOptions({ name: 'PreschoolAdminAttendanceStudentsPage' })

const { t } = useLanguage()
const toast = useToast()
const router = useRouter()
const route = useRoute()

const selectedClassId = ref(String(route.query.classId || ''))
const selectedDate = ref(String(route.query.date || todayIso()))
const classOptions = ref([])
const students = ref([])
const attendanceMap = ref({})
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const lifecycleContext = ref({})

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

const statusOptions = computed(() => [
  { value: 'present', label: t('preschoolAttendanceStatus.present'), short: t('preschoolAttendanceStatus.presentShort'), active: 'border-emerald-300 bg-emerald-50 text-emerald-700', ring: 'ring-emerald-200' },
  { value: 'absent',  label: t('preschoolAttendanceStatus.absent'),  short: t('preschoolAttendanceStatus.absentShort'),  active: 'border-rose-300 bg-rose-50 text-rose-700',       ring: 'ring-rose-200' },
  { value: 'late',    label: t('preschoolAttendanceStatus.late'),    short: t('preschoolAttendanceStatus.lateShort'),    active: 'border-amber-300 bg-amber-50 text-amber-700',    ring: 'ring-amber-200' },
  { value: 'excused', label: t('preschoolAttendanceStatus.excused'), short: t('preschoolAttendanceStatus.excusedShort'), active: 'border-sky-300 bg-sky-50 text-sky-700',          ring: 'ring-sky-200' },
])

const isLocked = computed(() => ['closed', 'archived'].includes(String(lifecycleContext.value.term_status || '').toLowerCase()))
const markedCount = computed(() => Object.values(attendanceMap.value).filter((e) => e.status).length)
const summary = computed(() => t('preschoolAdminAttendancePage.summary', { marked: markedCount.value, total: students.value.length }))

function shiftDate(days) {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + days)
  selectedDate.value = d.toISOString().slice(0, 10)
}

function buildMap(studentList, existingRecords) {
  const map = {}
  for (const s of studentList) {
    const existing = existingRecords.find((r) => String(r.studentId) === String(s.id))
    map[s.id] = { status: existing?.status || '', note: existing?.note || '', existingId: existing?.id || null }
  }
  return map
}

async function loadClasses() {
  try {
    const res = await fetchPreschoolClasses({ page: 1, perPage: 100 })
    classOptions.value = (res.items || []).map((c) => ({ label: c.name, value: c.id }))
  } catch { classOptions.value = [] }
}

async function loadDay() {
  if (!selectedClassId.value || !selectedDate.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    const [studentsRes, attendanceRes] = await Promise.all([
      fetchPreschoolStudents({ classId: selectedClassId.value, page: 1, perPage: 200 }),
      fetchPreschoolAttendance({ classId: selectedClassId.value, attendanceDate: selectedDate.value, page: 1, perPage: 200 }),
    ])
    students.value = studentsRes.items || []
    attendanceMap.value = buildMap(students.value, attendanceRes.items || [])
    try {
      const lifecycle = await fetchAcademicLifecycle()
      lifecycleContext.value = lifecycle.currentContext || {}
    } catch { lifecycleContext.value = {} }
  } catch (e) {
    errorMessage.value = e?.message || t('preschoolAdminAttendancePage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

function markAll(status) {
  for (const id of Object.keys(attendanceMap.value)) attendanceMap.value[id].status = status
}

function clearAll() {
  for (const id of Object.keys(attendanceMap.value)) { attendanceMap.value[id].status = ''; attendanceMap.value[id].note = '' }
}

function toggleStatus(studentId, value) {
  if (!attendanceMap.value[studentId]) return
  attendanceMap.value[studentId].status = attendanceMap.value[studentId].status === value ? '' : value
}

async function saveAll() {
  if (!selectedClassId.value || !selectedDate.value || isLocked.value) return
  saving.value = true
  try {
    const tasks = students.value.filter((s) => attendanceMap.value[s.id]?.status).map((s) => {
      const entry = attendanceMap.value[s.id]
      return savePreschoolAttendance({
        ...(entry.existingId ? { id: entry.existingId } : {}),
        student_id: s.id, class_id: selectedClassId.value, attendance_date: selectedDate.value,
        status: entry.status, note: entry.note || '',
      })
    })
    await Promise.all(tasks)
    toast.add({ severity: 'success', summary: t('preschoolAdminAttendancePage.messages.saved'), life: 3000 })
    await loadDay()
  } catch {
    toast.add({ severity: 'error', summary: t('preschoolAdminAttendancePage.messages.saveFailed'), life: 4000 })
  } finally { saving.value = false }
}

watch([selectedClassId, selectedDate], () => { if (selectedClassId.value && selectedDate.value) loadDay() })
onMounted(async () => { await loadClasses(); if (selectedClassId.value) loadDay() })
</script>

<template>
  <MainLayout>
    <Toast />
    <section class="space-y-4">
      <HeaderSection :title="t('preschoolAdminAttendancePage.title')" :subtitle="t('preschoolAdminAttendancePage.subtitle')" />

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-end gap-3">
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAdminAttendancePage.filters.class') }}</span>
            <Select v-model="selectedClassId" :options="classOptions" option-label="label" option-value="value" class="min-w-[180px]" :placeholder="t('preschoolAdminAttendancePage.placeholders.class')" :disabled="loading" />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAdminAttendancePage.filters.date') }}</span>
            <div class="flex items-center gap-1">
              <button type="button" class="flex h-10 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40" :disabled="loading" @click="shiftDate(-1)">‹</button>
              <input v-model="selectedDate" type="date" class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300" :disabled="loading">
              <button type="button" class="flex h-10 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40" :disabled="loading" @click="shiftDate(1)">›</button>
            </div>
          </label>
          <Button type="button" variant="ghost" size="md" rounded="xl" :disabled="loading" @click="selectedDate = todayIso()">Today</Button>
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="router.push({ name: 'dashboard-preschool-admin-attendance' })">{{ t('preschoolAdminAttendancePage.actions.back') }}</Button>
        </div>
      </div>

      <div v-if="isLocked" class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{{ t('preschoolLifecyclePage.messages.termClosed') }}</div>
      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ errorMessage }}</div>
      <div v-if="!selectedClassId" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">{{ t('preschoolAdminAttendancePage.messages.selectClass') }}</div>
      <div v-else-if="loading" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">{{ t('preschoolReportsShared.loading') }}</div>
      <div v-else-if="!students.length" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">{{ t('preschoolAdminAttendancePage.messages.noStudents') }}</div>

      <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <span class="text-sm text-slate-500">{{ summary }}</span>
          <div class="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" size="sm" rounded="xl" :disabled="isLocked || saving" @click="markAll('present')">{{ t('preschoolAdminAttendancePage.actions.markAllPresent') }}</Button>
            <Button type="button" variant="ghost" size="sm" rounded="xl" :disabled="isLocked || saving" @click="markAll('absent')">{{ t('preschoolAdminAttendancePage.actions.markAllAbsent') }}</Button>
            <Button type="button" variant="ghost" size="sm" rounded="xl" :disabled="isLocked || saving" @click="clearAll">{{ t('preschoolAdminAttendancePage.actions.clearAll') }}</Button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAdminAttendancePage.columns.student') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAdminAttendancePage.columns.status') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAdminAttendancePage.columns.note') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 bg-white">
              <tr v-for="(student, index) in students" :key="student.id" :class="index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'">
                <td class="px-4 py-3">
                  <p class="font-medium text-slate-900">{{ student.fullName || student.name }}</p>
                  <p v-if="student.publicId || student.studentCode" class="text-xs text-slate-400">
                    {{ student.publicId || student.studentCode }}
                  </p>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-1">
                    <button v-for="opt in statusOptions" :key="opt.value" type="button"
                      class="min-w-[2.2rem] rounded-lg border px-2 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2"
                      :class="attendanceMap[student.id]?.status === opt.value ? `${opt.active} ${opt.ring}` : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'"
                      :disabled="isLocked" :title="opt.label" @click="toggleStatus(student.id, opt.value)">
                      {{ opt.short }}
                    </button>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <input v-model="attendanceMap[student.id].note" type="text"
                    class="w-full min-w-[140px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-300 focus:border-violet-300 focus:outline-none focus:ring-1 focus:ring-violet-200 disabled:opacity-50"
                    :placeholder="t('preschoolAdminAttendancePage.placeholders.note')" :disabled="isLocked">
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p class="text-xs text-slate-400">{{ t('preschoolAdminAttendancePage.messages.skippedNote') }}</p>
          <Button type="button" variant="primary" size="md" rounded="xl" :loading="saving" :disabled="isLocked || saving || markedCount === 0" @click="saveAll">
            {{ saving ? t('preschoolAdminAttendancePage.actions.saving') : t('preschoolAdminAttendancePage.actions.save') }}
          </Button>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
