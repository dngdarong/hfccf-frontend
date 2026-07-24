<script setup>
import { computed, ref, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import AppStatusChip from '@/components/ui/AppStatusChip.vue'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import { useRoute, useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import {
  completeAttendanceSession,
  fetchAttendanceSession,
  fetchAttendanceSessions,
  openAttendanceSession,
  saveAttendanceSessionRecords,
} from '@/modules/preschool/services/api/preschoolAttendanceSessionApi'
import {
  fetchMyPreschoolClasses,
  fetchMyPreschoolStudents,
  fetchPreschoolAttendance,
  fetchPreschoolClasses,
  fetchPreschoolStudents,
  savePreschoolAttendance,
} from '@/modules/preschool/services/preschoolApi'
import {
  getSessionStatusKey,
  getSessionStatusTone,
  normalizeSessionStatus,
  resolveSessionProgress,
} from '@/modules/preschool/admin/pages/attendance/sessionUi'

defineOptions({ name: 'PreschoolAdminAttendanceStudentsPage' })

const { t, language } = useLanguage()
const toast = useToast()
const router = useRouter()
const route = useRoute()

function formatDateOfBirth(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return '—'
  }

  try {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return new Intl.DateTimeFormat(language.value === 'KH' ? 'km-KH' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  } catch {
    return '—'
  }
}

function formatGender(genderValue) {
  if (!genderValue) {
    return '—'
  }

  const key = String(genderValue).trim().toLowerCase()
  const translationKey = `preschoolEnrollment.genderOptions.${key}`

  if (t(translationKey) !== translationKey) {
    return t(translationKey)
  }

  return String(genderValue).trim()
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

const selectedClassId = ref(String(route.query.classId || ''))
const selectedDate = ref(String(route.query.date || todayIso()))
const selectedSessionId = ref(String(route.query.attendance_session_id || route.query.sessionId || ''))
const classOptions = ref([])
const sessionOptions = ref([])
const selectedSessionDetails = ref(null)
const students = ref([])
const attendanceMap = ref({})
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const hydratingSession = ref(false)
const isTeacherView = computed(() => route.name === 'dashboard-preschool-teacher-attendance')
const pageCopyKey = computed(() => (isTeacherView.value ? 'preschoolTeacherAttendancePage' : 'preschoolAdminAttendancePage'))
const emptyClassMessage = computed(() => t(`${pageCopyKey.value}.messages.noAssignedClasses`))
const emptyStudentMessage = computed(() => t(`${pageCopyKey.value}.messages.noAssignedStudents`))
const pageTitle = computed(() => t(`${pageCopyKey.value}.title`))
const pageSubtitle = computed(() => t(`${pageCopyKey.value}.subtitle`))
const classPlaceholder = computed(() => t(`${pageCopyKey.value}.placeholders.class`))
const notePlaceholder = computed(() => t(`${pageCopyKey.value}.placeholders.note`))
const saveButtonLabel = computed(() => t(`${pageCopyKey.value}.actions.save`))
const savingButtonLabel = computed(() => t(`${pageCopyKey.value}.actions.saving`))
const todayButtonLabel = computed(() => t(`${pageCopyKey.value}.actions.today`))
const markAllPresentLabel = computed(() => t(`${pageCopyKey.value}.actions.markAllPresent`))
const markAllAbsentLabel = computed(() => t(`${pageCopyKey.value}.actions.markAllAbsent`))
const clearAllLabel = computed(() => t(`${pageCopyKey.value}.actions.clearAll`))

const statusOptions = computed(() => [
  { value: 'present', label: t('preschoolAttendanceStatus.present'), short: t('preschoolAttendanceStatus.presentShort'), active: 'border-emerald-300 bg-emerald-50 text-emerald-700', ring: 'ring-emerald-200' },
  { value: 'absent', label: t('preschoolAttendanceStatus.absent'), short: t('preschoolAttendanceStatus.absentShort'), active: 'border-rose-300 bg-rose-50 text-rose-700', ring: 'ring-rose-200' },
  { value: 'late', label: t('preschoolAttendanceStatus.late'), short: t('preschoolAttendanceStatus.lateShort'), active: 'border-amber-300 bg-amber-50 text-amber-700', ring: 'ring-amber-200' },
  { value: 'excused', label: t('preschoolAttendanceStatus.excused'), short: t('preschoolAttendanceStatus.excusedShort'), active: 'border-sky-300 bg-sky-50 text-sky-700', ring: 'ring-sky-200' },
])

const selectedSession = computed(() => selectedSessionDetails.value || sessionOptions.value.find((session) => String(session.value) === String(selectedSessionId.value)) || null)
const selectedSessionStatus = computed(() => normalizeSessionStatus(selectedSession.value?.status || ''))
const isSessionMode = computed(() => Boolean(selectedSessionId.value))
const isSessionReadOnly = computed(() => ['completed', 'locked', 'cancelled'].includes(selectedSessionStatus.value))
const isSessionEditable = computed(() => !isSessionMode.value || selectedSessionStatus.value === 'open')
const visibleStudents = computed(() => {
  if (isTeacherView.value && !selectedClassId.value) {
    return []
  }

  if (!isTeacherView.value || !selectedClassId.value) {
    return students.value
  }

  return students.value.filter((student) => studentHasSelectedClass(student))
})
const markedCount = computed(() => Object.values(attendanceMap.value).filter((entry) => entry.status).length)
const summary = computed(() => t(`${pageCopyKey.value}.summary`, { marked: markedCount.value, total: visibleStudents.value.length }))
const sessionProgress = computed(() => resolveSessionProgress(selectedSession.value || {}, Object.values(attendanceMap.value)))
const sessionProgressLabel = computed(() => t('preschoolAttendanceSessionsPage.progress', { marked: sessionProgress.value.marked, total: sessionProgress.value.total, pending: sessionProgress.value.pending }))
const sessionStatusLabel = computed(() => t(`preschoolAttendanceSessionsPage.statuses.${getSessionStatusKey(selectedSessionStatus.value)}`) || selectedSessionStatus.value)
const detailsRouteName = computed(() => isTeacherView.value ? 'dashboard-preschool-teacher-attendance-session-details' : 'dashboard-preschool-admin-attendance-session-details')
const sessionHeaderSubtitle = computed(() => {
  if (!isSessionMode.value) {
    return pageSubtitle.value
  }

  if (selectedSessionStatus.value === 'scheduled') return t('preschoolAttendanceSessionsPage.messages.openScheduledSession')
  if (selectedSessionStatus.value === 'open') return t('preschoolAttendanceSessionsPage.messages.markAttendanceInSession')
  if (selectedSessionStatus.value === 'completed') return t('preschoolAttendanceSessionsPage.messages.viewCompletedSession')
  if (selectedSessionStatus.value === 'locked') return t('preschoolAttendanceSessionsPage.messages.cannotEditLockedSession')
  if (selectedSessionStatus.value === 'cancelled') return t('preschoolAttendanceSessionsPage.messages.cannotEditCancelledSession')
  return t('preschoolAttendanceSessionsPage.title')
})
const sessionActionLabel = computed(() => {
  if (!isSessionMode.value) return saveButtonLabel.value
  if (selectedSessionStatus.value === 'scheduled') return t('preschoolAttendanceSessionsPage.openSession')
  if (selectedSessionStatus.value === 'open') return t('preschoolAttendanceSessionsPage.actions.saveAttendance')
  if (['completed', 'locked', 'cancelled'].includes(selectedSessionStatus.value)) return t('preschoolAttendanceSessionsPage.actions.viewSession')
  return t('preschoolAttendanceSessionsPage.actions.saveAttendance')
})
const sessionModeStatusTone = computed(() => getSessionStatusTone(selectedSessionStatus.value))

function createAttendanceEntry(existing = {}) {
  return {
    status: '',
    note: '',
    existingId: null,
    ...existing,
  }
}

function buildMap(studentList, existingRecords) {
  const map = {}
  for (const s of studentList) {
    const existing = existingRecords.find((r) => String(r.studentId) === String(s.id))
    map[s.id] = createAttendanceEntry({
      status: existing?.status || '',
      note: existing?.note || '',
      existingId: existing?.id || null,
    })
  }
  return map
}

function ensureAttendanceEntries(studentList = visibleStudents.value) {
  if (!Array.isArray(studentList) || !studentList.length) return

  const next = { ...attendanceMap.value }
  let changed = false

  for (const student of studentList) {
    if (!next[student.id]) {
      next[student.id] = createAttendanceEntry()
      changed = true
    }
  }

  if (changed) {
    attendanceMap.value = next
  }
}

function studentHasSelectedClass(student, classId = selectedClassId.value) {
  if (!classId) return false

  const classIds = [
    ...(Array.isArray(student?.classes) ? student.classes : []),
    ...(Array.isArray(student?.classAssignments) ? student.classAssignments : []),
  ]
    .map((item) => String(item?.id || item?.classId || item?.class_id || '').trim())
    .filter(Boolean)

  return classIds.includes(String(classId))
}

function resolveErrorMessage(error, fallbackKey) {
  const status = error?.response?.status || error?.status

  if (status === 403) {
    return t(`${pageCopyKey.value}.messages.forbidden`)
  }

  if (status === 422) {
    return t(`${pageCopyKey.value}.messages.validationFailed`)
  }

  return error?.message || t(fallbackKey)
}

function isReadOnly() {
  return isSessionMode.value && isSessionReadOnly.value
}

async function loadClasses() {
  try {
    const res = isTeacherView.value
      ? await fetchMyPreschoolClasses({ page: 1, perPage: 100 })
      : await fetchPreschoolClasses({ page: 1, perPage: 100 })
    classOptions.value = (res.items || []).map((c) => ({ label: c.name, value: c.id }))

    if (isTeacherView.value) {
      const selectedExists = classOptions.value.some((option) => String(option.value) === String(selectedClassId.value))

      if (!selectedExists) {
        selectedClassId.value = String(classOptions.value[0]?.value || '')
      }
    }
  } catch {
    classOptions.value = []
    if (isTeacherView.value) {
      selectedClassId.value = ''
    }
  }
}

async function hydrateSelectedSession() {
  if (!selectedSessionId.value) {
    selectedSessionDetails.value = null
    return null
  }

  hydratingSession.value = true
  try {
    const session = await fetchAttendanceSession(selectedSessionId.value)
    selectedSessionDetails.value = session || null

    if (session) {
      selectedClassId.value = String(session.classId || selectedClassId.value || '')
      selectedDate.value = session.attendanceDate || selectedDate.value
      const value = String(session.id || session.sessionKey || selectedSessionId.value || '')
      selectedSessionId.value = value
      if (value && !sessionOptions.value.some((option) => String(option.value) === value)) {
        sessionOptions.value = [
          {
            ...session,
            label: `${session.className || '—'}${session.startTime ? ` · ${session.startTime}` : ''}${session.status ? ` · ${session.status}` : ''}`,
            value,
          },
          ...sessionOptions.value,
        ]
      }
    }

    return session
  } finally {
    hydratingSession.value = false
  }
}

async function loadSessions() {
  if (!selectedClassId.value || !selectedDate.value) {
    sessionOptions.value = []
    return
  }

  let response

  try {
    response = await fetchAttendanceSessions({
      date: selectedDate.value,
      classId: selectedClassId.value,
    })
  } catch {
    response = { items: [] }
  }

  sessionOptions.value = (response.items || []).map((session) => ({
    ...session,
    label: `${session.className || '—'}${session.startTime ? ` · ${session.startTime}` : ''}${session.status ? ` · ${session.status}` : ''}`,
    value: String(session.id || session.sessionKey || ''),
  }))

  if (selectedSessionId.value) {
    const matched = sessionOptions.value.find((session) => String(session.value) === String(selectedSessionId.value))
    if (!matched) {
      const selected = selectedSessionDetails.value
      if (selected) {
        sessionOptions.value = [
          {
            ...selected,
            label: `${selected.className || '—'}${selected.startTime ? ` · ${selected.startTime}` : ''}${selected.status ? ` · ${selected.status}` : ''}`,
            value: String(selected.id || selected.sessionKey || ''),
          },
          ...sessionOptions.value,
        ]
      }
    }
  }
}

async function loadDay() {
  if (!selectedClassId.value || !selectedDate.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const [studentsRes, attendanceRes] = await Promise.all([
      isTeacherView.value
        ? fetchMyPreschoolStudents({ page: 1, perPage: 200 })
        : fetchPreschoolStudents({ classId: selectedClassId.value, page: 1, perPage: 200 }),
      fetchPreschoolAttendance({
        classId: selectedClassId.value,
        attendanceDate: selectedDate.value,
        attendanceSessionId: selectedSessionId.value,
        page: 1,
        perPage: 200,
      }),
    ])
    students.value = studentsRes.items || []
    const scopedStudents = isTeacherView.value
      ? students.value.filter((student) => studentHasSelectedClass(student))
      : students.value
    attendanceMap.value = buildMap(scopedStudents, attendanceRes.items || [])
    ensureAttendanceEntries(scopedStudents)
  } catch (e) {
    errorMessage.value = resolveErrorMessage(e, `${pageCopyKey.value}.messages.loadFailed`)
  } finally {
    loading.value = false
  }
}

function markAll(status) {
  if (!isSessionEditable.value || isReadOnly()) return
  for (const id of Object.keys(attendanceMap.value)) attendanceMap.value[id].status = status
}

function clearAll() {
  if (!isSessionEditable.value || isReadOnly()) return
  for (const id of Object.keys(attendanceMap.value)) {
    attendanceMap.value[id].status = ''
    attendanceMap.value[id].note = ''
  }
}

function toggleStatus(studentId, value) {
  if (!attendanceMap.value[studentId] || !isSessionEditable.value || isReadOnly()) return
  attendanceMap.value[studentId].status = attendanceMap.value[studentId].status === value ? '' : value
}

async function saveAll() {
  if (!selectedClassId.value || !selectedDate.value || isReadOnly() || !isSessionEditable.value) return

  saving.value = true
  try {
    const payloads = (visibleStudents.value.length ? visibleStudents.value : students.value)
      .filter((s) => attendanceMap.value[s.id]?.status)
      .map((s) => {
        const entry = attendanceMap.value[s.id]
        return {
          studentId: s.id,
          status: entry.status,
          note: entry.note || '',
          attendance_session_id: selectedSessionId.value || '',
        }
      })

    if (selectedSessionId.value) {
      await saveAttendanceSessionRecords(selectedSessionId.value, payloads)
    } else {
      await Promise.all(payloads.map((payload) => savePreschoolAttendance({
        id: students.value.find((student) => String(student.id) === String(payload.studentId))?.attendanceId || '',
        student_id: payload.studentId,
        class_id: selectedClassId.value,
        attendance_date: selectedDate.value,
        status: payload.status,
        note: payload.note,
      })))
    }

    toast.add({ severity: 'success', summary: t(`${pageCopyKey.value}.messages.saved`), life: 3000 })
    await loadDay()
  } catch (error) {
    const message = resolveErrorMessage(error, `${pageCopyKey.value}.messages.saveFailed`)
    errorMessage.value = message
    toast.add({ severity: 'error', summary: message, life: 4000 })
  } finally {
    saving.value = false
  }
}

async function openSession() {
  if (!selectedSessionId.value || selectedSessionStatus.value !== 'scheduled') return

  saving.value = true
  try {
    const opened = await openAttendanceSession(selectedSessionId.value)
    if (opened) {
      selectedSessionDetails.value = opened
      selectedSessionId.value = String(opened.id || selectedSessionId.value)
    }
    toast.add({ severity: 'success', summary: t('preschoolAttendanceSessionsPage.messages.sessionOpened'), life: 3000 })
    await hydrateSelectedSession()
    await loadSessions()
    await loadDay()
  } catch {
    toast.add({ severity: 'error', summary: t('preschoolAttendanceSessionsPage.messages.sessionOpenFailed'), life: 4000 })
  } finally {
    saving.value = false
  }
}

async function completeSession() {
  if (!selectedSessionId.value || selectedSessionStatus.value !== 'open') return

  await saveAll()
  saving.value = true
  try {
    const completed = await completeAttendanceSession(selectedSessionId.value)
    if (completed) {
      selectedSessionDetails.value = completed
      selectedSessionId.value = String(completed.id || selectedSessionId.value)
    }
    toast.add({ severity: 'success', summary: t('preschoolAttendanceSessionsPage.messages.sessionCompleted'), life: 3000 })
    await hydrateSelectedSession()
    await loadSessions()
    await loadDay()
  } catch {
    toast.add({ severity: 'error', summary: t('preschoolAttendanceSessionsPage.messages.sessionCompleteFailed'), life: 4000 })
  } finally {
    saving.value = false
  }
}

watch([selectedClassId, selectedDate], async () => {
  if (hydratingSession.value || selectedSessionId.value) return
  if (selectedClassId.value && selectedDate.value) {
    await loadSessions()
    await loadDay()
  }
}, { immediate: true })

watch(selectedSessionId, async (value, previousValue) => {
  if (hydratingSession.value || value === previousValue) return
  if (value) {
    await hydrateSelectedSession()
    await loadSessions()
    await loadDay()
    return
  }

  selectedSessionDetails.value = null
  if (selectedClassId.value && selectedDate.value) {
    await loadSessions()
    await loadDay()
  }
})

watch(
  () => [
    isTeacherView.value ? 'teacher' : 'admin',
    route.query.classId,
    route.query.date,
    route.query.attendance_session_id,
    route.query.sessionId,
  ],
  async ([context, classId, date, attendanceSessionId, sessionId], [previousContext] = []) => {
    selectedClassId.value = String(classId || '')
    selectedDate.value = String(date || todayIso())
    selectedSessionId.value = String(attendanceSessionId || sessionId || '')

    if (context !== previousContext || !classOptions.value.length) {
      await loadClasses()
    }
  },
  { immediate: true },
)

watch(visibleStudents, (studentList) => {
  ensureAttendanceEntries(studentList)
}, { immediate: true })
</script>

<template>
  <MainLayout>
    <Toast />
    <section class="space-y-4">
      <HeaderSection :title="pageTitle" :subtitle="sessionHeaderSubtitle" />

      <div v-if="selectedSession" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-2">
              <AppStatusChip
                :status="sessionModeStatusTone"
                :label="sessionStatusLabel"
                :translate-label="false"
                size="xs"
              />
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {{ t('preschoolAttendanceSessionsPage.title') }}
              </span>
            </div>
            <h3 class="text-lg font-semibold text-slate-900">
              {{ selectedSession.className || '—' }}
            </h3>
            <p class="text-sm text-slate-600">
              {{ selectedSession.teacherName || t('common.unknown') }}
              <span v-if="selectedSession.roomName"> · {{ selectedSession.roomName }}</span>
            </p>
            <p class="text-sm text-slate-500">
              {{ selectedSession.attendanceDate || '—' }}
              <span v-if="selectedSession.startTime || selectedSession.endTime">
                · {{ selectedSession.startTime || '--:--' }} - {{ selectedSession.endTime || '--:--' }}
              </span>
            </p>
            <p class="text-xs text-slate-500">
              {{ selectedSession.generatedFromSchedule ? t('preschoolAttendanceSessionsPage.generatedFromSchedule') : t('preschoolAttendanceSessionsPage.manualSession') }}
            </p>
          </div>
          <div class="grid gap-2 sm:grid-cols-2 lg:min-w-[280px]">
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ t('preschoolAttendanceSessionsPage.attendanceProgress') }}</p>
              <p class="mt-1 text-sm font-medium text-slate-900">{{ sessionProgressLabel }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ t('preschoolAttendanceSessionsPage.studentCount') }}</p>
              <p class="mt-1 text-sm font-medium text-slate-900">{{ sessionProgress.total || selectedSession.studentCount || '—' }}</p>
            </div>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <Button
            v-if="selectedSessionStatus === 'scheduled'"
            type="button"
            variant="primary"
            size="md"
            rounded="xl"
            :loading="saving"
            :disabled="saving"
            @click="openSession"
          >
            {{ sessionActionLabel }}
          </Button>
          <Button
            v-if="['completed', 'locked', 'cancelled'].includes(selectedSessionStatus)"
            type="button"
            variant="ghost"
            size="md"
            rounded="xl"
            @click="router.push({ name: detailsRouteName, params: { id: selectedSession.id || selectedSessionId } })"
          >
            {{ t('preschoolAttendanceSessionsPage.actions.viewSession') }}
          </Button>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid gap-3 lg:grid-cols-3">
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t(`${pageCopyKey}.filters.class`) }}</span>
            <Select
              v-model="selectedClassId"
              :options="classOptions"
              option-label="label"
              option-value="value"
              class="min-w-[180px]"
              :placeholder="classPlaceholder"
              :disabled="loading || Boolean(selectedSessionId)"
            />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAttendanceSessionsPage.sessionDate') }}</span>
            <div class="flex items-center gap-1">
              <button type="button" class="flex h-10 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40" :disabled="loading || Boolean(selectedSessionId)" @click="selectedDate = new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() - 1)).toISOString().slice(0, 10)">‹</button>
              <input v-model="selectedDate" type="date" class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300" :disabled="loading || Boolean(selectedSessionId)">
              <button type="button" class="flex h-10 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40" :disabled="loading || Boolean(selectedSessionId)" @click="selectedDate = new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 1)).toISOString().slice(0, 10)">›</button>
            </div>
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAttendanceSessionsPage.title') }}</span>
            <Select
              v-model="selectedSessionId"
              :options="sessionOptions"
              option-label="label"
              option-value="value"
              class="min-w-[220px]"
              :placeholder="t('preschoolAttendanceSessionsPage.noSessionsToday')"
              :disabled="loading || Boolean(selectedSessionId)"
            />
          </label>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" size="md" rounded="xl" :disabled="loading || Boolean(selectedSessionId)" @click="selectedDate = todayIso()">
            {{ todayButtonLabel }}
          </Button>
        </div>
      </div>

      <div v-if="isSessionMode && selectedSessionStatus === 'scheduled'" class="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        {{ t('preschoolAttendanceSessionsPage.messages.openScheduledSession') }}
      </div>
      <div v-if="isSessionMode && selectedSessionStatus === 'open'" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        {{ t('preschoolAttendanceSessionsPage.messages.markAttendanceInSession') }}
      </div>
      <div v-if="isSessionMode && selectedSessionStatus === 'locked'" class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{{ t('preschoolAttendanceSessionsPage.messages.cannotEditLockedSession') }}</div>
      <div v-if="isSessionMode && selectedSessionStatus === 'cancelled'" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ t('preschoolAttendanceSessionsPage.messages.cannotEditCancelledSession') }}</div>
      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ errorMessage }}</div>
      <div
        v-if="isTeacherView && !classOptions.length && !loading"
        class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400"
      >
        {{ emptyClassMessage }}
      </div>
      <div v-else-if="!selectedClassId" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
        {{ t(`${pageCopyKey}.messages.selectClass`) }}
      </div>
      <div v-else-if="loading" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">{{ t('preschoolReportsShared.loading') }}</div>
      <div
        v-else-if="isTeacherView && !visibleStudents.length"
        class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400"
      >
        {{ emptyStudentMessage }}
      </div>
      <div v-else-if="!students.length" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">{{ t('preschoolAdminAttendancePage.messages.noStudents') }}</div>

      <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <span class="text-sm text-slate-500">{{ summary }}</span>
          <div class="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" size="sm" rounded="xl" :disabled="isReadOnly() || saving" @click="markAll('present')">{{ markAllPresentLabel }}</Button>
            <Button type="button" variant="ghost" size="sm" rounded="xl" :disabled="isReadOnly() || saving" @click="markAll('absent')">{{ markAllAbsentLabel }}</Button>
            <Button type="button" variant="ghost" size="sm" rounded="xl" :disabled="isReadOnly() || saving" @click="clearAll">{{ clearAllLabel }}</Button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAdminAttendancePage.columns.student') }}</th>
                <th class="px-4 py-3 font-semibold text-center">{{ t('preschoolAdminAttendancePage.columns.dateOfBirth') }}</th>
                <th class="px-4 py-3 font-semibold text-center">{{ t('preschoolAdminAttendancePage.columns.gender') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAdminAttendancePage.columns.status') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAdminAttendancePage.columns.note') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 bg-white">
              <tr v-for="(student, index) in visibleStudents" :key="student.id" :class="index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'">
                <td class="px-4 py-3">
                  <p class="font-medium text-slate-900">{{ student.fullName || student.name }}</p>
                  <p v-if="student.publicId || student.studentCode" class="text-xs text-slate-400">
                    {{ student.publicId || student.studentCode }}
                  </p>
                </td>
                <td class="px-4 py-3 text-center text-xs text-slate-600">{{ formatDateOfBirth(student.dateOfBirth) }}</td>
                <td class="px-4 py-3 text-center text-xs text-slate-600">{{ formatGender(student.gender) }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-1">
                    <button
                      v-for="opt in statusOptions"
                      :key="opt.value"
                      type="button"
                      class="min-w-[2.2rem] rounded-lg border px-2 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2"
                      :class="attendanceMap[student.id]?.status === opt.value ? `${opt.active} ${opt.ring}` : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'"
                      :disabled="isReadOnly() || !isSessionEditable"
                      :title="opt.label"
                      @click="toggleStatus(student.id, opt.value)"
                    >
                      {{ opt.short }}
                    </button>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <input
                    v-model="attendanceMap[student.id].note"
                    type="text"
                    class="w-full min-w-[140px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-300 focus:border-violet-300 focus:outline-none focus:ring-1 focus:ring-violet-200 disabled:opacity-50"
                    :placeholder="notePlaceholder"
                    :disabled="isReadOnly() || !isSessionEditable"
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p class="text-xs text-slate-400">{{ t(`${pageCopyKey}.messages.skippedNote`) }}</p>
          <div class="flex flex-wrap gap-2">
            <Button v-if="isSessionEditable" type="button" variant="primary" size="md" rounded="xl" :loading="saving" :disabled="isReadOnly() || saving || markedCount === 0" @click="saveAll">
              {{ saving ? savingButtonLabel : saveButtonLabel }}
            </Button>
            <Button v-if="selectedSessionStatus === 'open'" type="button" variant="ghost" size="md" rounded="xl" :loading="saving" :disabled="isReadOnly() || saving || markedCount === 0" @click="completeSession">
              {{ t('preschoolAttendanceSessionsPage.actions.completeSession') }}
            </Button>
          </div>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
