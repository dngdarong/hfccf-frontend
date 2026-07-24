<script setup>
// Keep the teacher self-schedule page dedicated to read-only viewing so the
// teacher flow stays discoverable without mixing in admin controls.
import { computed, onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import { usePreschoolTeacherSchedule } from '@/modules/preschool/composables/usePreschoolTeacherSchedule'
import WeeklyTimetableGrid from '@/modules/preschool/shared/components/schedule/WeeklyTimetableGrid.vue'
import { PreschoolScheduleDay } from '@/modules/preschool/services/scheduleConstants'
import {
  getScheduleSessionActionKey,
  getScheduleSessionActionTone,
  normalizeScheduleSessionStatus,
  buildScheduleSessionIndex,
  resolveScheduleSession,
} from '@/modules/preschool/shared/components/schedule/scheduleSessionOverlay'
import {
  fetchTodayAttendanceSessions,
  openAttendanceSession,
} from '@/modules/preschool/services/api/preschoolAttendanceSessionApi'

defineOptions({
  name: 'TeacherPreschoolSchedulePage',
})

const router = useRouter()
const { t } = useLanguage()
const {
  errorMessage,
  isTermLocked,
  isReportPeriodLocked,
  loadMySchedule,
  loading,
  lockMessage,
  schedules,
  teacherSummary,
} =
  usePreschoolTeacherSchedule()

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
const searchQuery = ref('')
const todaySessions = ref([])
function todayIso() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const sessionIndex = computed(() => buildScheduleSessionIndex(todaySessions.value))
const visibleEntries = computed(() => {
  let result = schedules.value

  // Filter by day
  if (selectedDayOfWeek.value) {
    result = result.filter((entry) => String(entry.dayOfWeek) === String(selectedDayOfWeek.value))
  }

  // Filter by search query
  const q = searchQuery.value.toLowerCase()
  if (!q) return result
  return result.filter((entry) =>
    entry.activityLabel?.toLowerCase().includes(q) ||
    entry.className?.toLowerCase().includes(q) ||
    entry.teacherName?.toLowerCase().includes(q),
  )
})
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

  return option?.label || t('preschoolSchedulesPage.myView.title')
})

async function loadScheduleTodaySessions() {
  try {
    const response = await fetchTodayAttendanceSessions()
    todaySessions.value = response.items || []
  } catch (error) {
    if (error?.response?.status === 403 || error?.status === 403) {
      todaySessions.value = []
      return
    }

    todaySessions.value = []
  }
}

async function refreshSchedule() {
  await loadMySchedule()
  await loadScheduleTodaySessions()
}

function handleSessionAction(entry) {
  const session = entry?.session
  const sessionId = String(session?.id || '').trim()
  if (!sessionId) return

  const status = normalizeScheduleSessionStatus(session.status)

  if (status === 'scheduled') {
    openAttendanceSession(sessionId).then(() => {
      router.push({
        name: 'dashboard-preschool-teacher-attendance',
        query: {
          classId: session.classId || entry.classId || '',
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
      name: 'dashboard-preschool-teacher-attendance',
      query: {
        classId: session.classId || entry.classId || '',
        date: session.attendanceDate || todayIso(),
        attendance_session_id: sessionId,
        sessionId,
      },
    })
    return
  }

  router.push({
    name: 'dashboard-preschool-teacher-attendance-session-details',
    params: { id: sessionId },
  })
}

function handleSessionView(entry) {
  const sessionId = String(entry?.session?.id || '').trim()
  if (!sessionId) return

  router.push({
    name: 'dashboard-preschool-teacher-attendance-session-details',
    params: { id: sessionId },
  })
}

onMounted(() => {
  void refreshSchedule()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolSchedulesPage.myView.title')"
        :subtitle="t('preschoolSchedulesPage.myView.subtitle')"
      />

      <div
        v-if="errorMessage"
        class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="(isTermLocked || isReportPeriodLocked) && lockMessage"
        class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      >
        {{ lockMessage }}
      </div>

      <div class="flex justify-end">
        <Button type="button" variant="primary" size="md" rounded="xl" @click="refreshSchedule">
          {{ t('preschoolSchedulesPage.actions.refresh') }}
        </Button>
      </div>

      <!-- Filters -->
      <div class="schedule-filters">
        <div class="flex gap-3 items-end">
          <!-- Day Filter -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-600">Day</label>
            <Select
              v-model="selectedDayOfWeek"
              :options="dayOptions"
              option-label="label"
              option-value="value"
              placeholder="All Days"
              class="w-40"
              show-clear
            />
          </div>

          <!-- Search -->
          <div class="flex-1 relative">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-600 block mb-1.5">Search</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search class, teacher..."
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>
      </div>

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

<style scoped>
.schedule-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}
</style>
