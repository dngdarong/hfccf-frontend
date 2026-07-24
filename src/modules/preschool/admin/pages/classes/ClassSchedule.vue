<script setup>
// Keep the class timetable page focused on selection and read-only rendering so
// it can remain light-weight and reuse the shared timetable grid.
import { computed, onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import { useRoute, useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import { usePreschoolClassSchedule } from '@/modules/preschool/composables/usePreschoolClassSchedule'
import ScheduleDayTabs from '@/modules/preschool/shared/components/schedule/ScheduleDayTabs.vue'
import WeeklyTimetableGrid from '@/modules/preschool/shared/components/schedule/WeeklyTimetableGrid.vue'
import { PreschoolScheduleDay } from '@/modules/preschool/services/scheduleConstants'
import {
  buildScheduleSessionIndex,
  getScheduleSessionActionKey,
  getScheduleSessionActionTone,
  normalizeScheduleSessionStatus,
  resolveScheduleSession,
} from '@/modules/preschool/shared/components/schedule/scheduleSessionOverlay'
import {
  fetchTodayAttendanceSessions,
  openAttendanceSession,
} from '@/modules/preschool/services/api/preschoolAttendanceSessionApi'

defineOptions({
  name: 'PreschoolClassSchedulePage',
})

const router = useRouter()
const route = useRoute()
const { t } = useLanguage()
const {
  classOptions,
  classSummary,
  errorMessage,
  loadClassOptions,
  loadClassSchedule,
  loading,
  schedules,
  selectedClassId,
  setSelectedClassId,
} = usePreschoolClassSchedule()
const todaySessions = ref([])

const dayOptions = computed(() => [
  { label: t('preschoolSchedulesShared.days.monday'), value: PreschoolScheduleDay.MONDAY },
  { label: t('preschoolSchedulesShared.days.tuesday'), value: PreschoolScheduleDay.TUESDAY },
  { label: t('preschoolSchedulesShared.days.wednesday'), value: PreschoolScheduleDay.WEDNESDAY },
  { label: t('preschoolSchedulesShared.days.thursday'), value: PreschoolScheduleDay.THURSDAY },
  { label: t('preschoolSchedulesShared.days.friday'), value: PreschoolScheduleDay.FRIDAY },
  { label: t('preschoolSchedulesShared.days.saturday'), value: PreschoolScheduleDay.SATURDAY },
  { label: t('preschoolSchedulesShared.days.sunday'), value: PreschoolScheduleDay.SUNDAY },
])

const selectedDayOfWeek = ref('')
function todayIso() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const sessionIndex = computed(() => buildScheduleSessionIndex(todaySessions.value))
const visibleEntries = computed(() =>
  selectedDayOfWeek.value
    ? schedules.value.filter((entry) => String(entry.dayOfWeek) === String(selectedDayOfWeek.value))
    : schedules.value,
)
const scheduleEntries = computed(() =>
  visibleEntries.value.map((entry) => {
    const session = resolveScheduleSession(entry, sessionIndex.value, todayIso())
    return {
      ...entry,
      session: session
        ? {
            ...session,
            statusLabel: t(`preschoolAttendanceSessionsPage.statuses.${normalizeScheduleSessionStatus(session.status)}`) || session.status,
            actionLabel: t(`preschoolAttendanceSessionsPage.actions.${getScheduleSessionActionKey(session.status)}`),
            actionTone: getScheduleSessionActionTone(session.status),
          }
        : null,
    }
  }),
)
const selectedDayLabel = computed(() => {
  const option = dayOptions.value.find((item) => String(item.value) === String(selectedDayOfWeek.value))

  return option?.label || t('preschoolSchedulesPage.classView.title')
})

async function refreshClassSchedule() {
  await loadClassSchedule(selectedClassId.value)
}

async function loadTodaySessions() {
  try {
    const response = await fetchTodayAttendanceSessions()
    todaySessions.value = response.items || []
  } catch {
    todaySessions.value = []
  }
}

async function handleClassChange(classId) {
  setSelectedClassId(classId)
  await loadClassSchedule(classId)
}

function goBack() {
  router.push({ name: 'dashboard-preschool-admin-schedules' })
}

function handleSessionAction(entry) {
  const session = entry?.session
  const sessionId = String(session?.id || '').trim()
  if (!sessionId) return

  const status = normalizeScheduleSessionStatus(session.status)
  if (status === 'scheduled') {
    openAttendanceSession(sessionId).then(() => {
      router.push({
        name: 'dashboard-preschool-admin-attendance-students',
        query: {
          classId: session.classId || selectedClassId.value || '',
          date: session.attendanceDate || todayIso(),
          attendance_session_id: sessionId,
          sessionId,
        },
      })
    })
    return
  }

  if (status === 'open') {
    router.push({
      name: 'dashboard-preschool-admin-attendance-students',
      query: {
        classId: session.classId || selectedClassId.value || '',
        date: session.attendanceDate || todayIso(),
        attendance_session_id: sessionId,
        sessionId,
      },
    })
    return
  }

  router.push({
    name: 'dashboard-preschool-admin-attendance-session-details',
    params: { id: sessionId },
  })
}

function handleSessionView(entry) {
  const sessionId = String(entry?.session?.id || '').trim()
  if (!sessionId) return

  router.push({
    name: 'dashboard-preschool-admin-attendance-session-details',
    params: { id: sessionId },
  })
}

onMounted(async () => {
  const classId = String(route.query.classId || '').trim()

  await loadClassOptions()

  if (classId) {
    setSelectedClassId(classId)
  }

  if (selectedClassId.value) {
    await loadClassSchedule(selectedClassId.value)
  }

  await loadTodaySessions()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolSchedulesPage.classView.title')"
        :subtitle="t('preschoolSchedulesPage.classView.subtitle')"
      />

      <div
        v-if="errorMessage"
        class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      >
        {{ errorMessage }}
      </div>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <Select
          :model-value="selectedClassId"
          :options="classOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolSchedulesPage.filters.class')"
          @update:model-value="handleClassChange"
        />

        <div class="flex items-end gap-2">
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="goBack">
            {{ t('preschoolSchedulesPage.actions.back') }}
          </Button>
          <Button type="button" variant="primary" size="md" rounded="xl" @click="refreshClassSchedule">
            {{ t('preschoolSchedulesPage.actions.refresh') }}
          </Button>
        </div>
      </div>

      <div v-if="classSummary" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {{ classSummary.code }}
        </p>
        <h3 class="text-lg font-semibold text-slate-900">{{ classSummary.name }}</h3>
        <p class="text-sm text-slate-600">
          {{ classSummary.teacherName || t('preschoolSchedulesPage.classView.subtitle') }}
        </p>
      </div>

      <ScheduleDayTabs
        :days="dayOptions"
        :model-value="selectedDayOfWeek"
        @update:model-value="selectedDayOfWeek = $event"
      />

      <WeeklyTimetableGrid
        :loading="loading"
        :loading-label="t('preschoolSchedulesShared.loading.grid')"
        :day-label="selectedDayLabel"
        :entries="scheduleEntries"
        :empty-label="t('preschoolSchedulesPage.empty')"
        :show-session-actions="true"
        :session-view-label="t('preschoolSchedulesPage.actions.viewDetails')"
        :no-session-label="t('preschoolSchedulesPage.sessions.noSessionGenerated')"
        @session-action="handleSessionAction"
        @session-view="handleSessionView"
      />
    </section>
  </MainLayout>
</template>
