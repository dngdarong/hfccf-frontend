<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppStatusChip from '@/components/ui/AppStatusChip.vue'
import PreschoolDashboardSummary from '@/modules/preschool/admin/components/dashboard/PreschoolDashboardSummary.vue'
import PreschoolDashboardSpotlight from '@/modules/preschool/admin/components/dashboard/PreschoolDashboardSpotlight.vue'
import PreschoolDashboardActionList from '@/modules/preschool/admin/components/dashboard/PreschoolDashboardActionList.vue'
import PreschoolDashboardActivity from '@/modules/preschool/admin/components/dashboard/PreschoolDashboardActivity.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchPreschoolDashboard } from '@/modules/preschool/services/preschoolApi'
import { fetchTodayAttendanceSessions, openAttendanceSession } from '@/modules/preschool/services/api/preschoolAttendanceSessionApi'
import {
  getSessionStatusKey,
  getSessionStatusTone,
  normalizeSessionStatus,
  resolveSessionProgress,
} from '@/modules/preschool/admin/pages/attendance/sessionUi'

defineOptions({
  name: 'TeacherPreschoolDashboard',
})

const { t } = useLanguage()
const router = useRouter()

const dashboard = ref({
  summary: {
    students: 0,
    classes: 0,
    teachers: 0,
    attendanceToday: 0,
    pendingPayments: 0,
    overduePayments: 0,
  },
  recentAttendance: [],
  upcomingClasses: [],
  paymentSummary: {
    paid: 0,
    pending: 0,
    overdue: 0,
    cancelled: 0,
  },
})
const attendanceSessions = ref([])
const loading = ref(false)
const sessionsLoading = ref(false)
const errorMessage = ref('')
const sessionsErrorMessage = ref('')

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''
  sessionsErrorMessage.value = ''
  sessionsLoading.value = true

  try {
    dashboard.value = await fetchPreschoolDashboard()
  } catch {
    errorMessage.value = t('preschoolTeacherDashboardPage.errors.loadFailed')
  } finally {
    loading.value = false
  }

  try {
    const sessionPayload = await fetchTodayAttendanceSessions()
    attendanceSessions.value = sessionPayload.items || []
  } catch {
    sessionsErrorMessage.value = t('preschoolTeacherDashboardPage.attendanceSessions.errors.loadFailed')
    attendanceSessions.value = []
  } finally {
    sessionsLoading.value = false
  }
}

const cards = computed(() => [
  {
    title: t('preschoolTeacherDashboardPage.cards.students.title'),
    value: dashboard.value.summary.students || 0,
    label: t('preschoolTeacherDashboardPage.cards.students.label'),
    status: 'success',
  },
  {
    title: t('preschoolTeacherDashboardPage.cards.classes.title'),
    value: dashboard.value.summary.classes || 0,
    label: t('preschoolTeacherDashboardPage.cards.classes.label'),
    status: 'info',
  },
  {
    title: t('preschoolTeacherDashboardPage.cards.attendance.title'),
    value: dashboard.value.summary.attendanceToday || 0,
    label: t('preschoolTeacherDashboardPage.cards.attendance.label'),
    status: 'warning',
    actionLabel: todaySessions.value.length
      ? t('preschoolTeacherDashboardPage.cards.attendance.actions.viewToday')
      : t('preschoolTeacherDashboardPage.cards.attendance.actions.recordAttendance'),
    actionTo: { name: 'dashboard-preschool-teacher-attendance' },
  },
  {
    title: t('preschoolTeacherDashboardPage.cards.payments.title'),
    value: dashboard.value.summary.pendingPayments || 0,
    label: t('preschoolTeacherDashboardPage.cards.payments.label'),
    status: 'error',
  },
])

const actions = computed(() => [
  t('preschoolTeacherDashboardPage.actions.upcomingClasses', { count: dashboard.value.upcomingClasses.length || 0 }),
  t('preschoolTeacherDashboardPage.actions.overduePayments', { count: dashboard.value.summary.overduePayments || 0 }),
  t('preschoolTeacherDashboardPage.actions.paidPayments', { count: dashboard.value.paymentSummary?.paid || 0 }),
])

const notes = computed(() =>
  (dashboard.value.recentAttendance || []).slice(0, 5).map((item) => ({
    title: `${item.studentName || t('preschoolTeacherDashboardPage.cards.students.title')} - ${item.className || t('preschoolTeacherDashboardPage.cards.classes.title')}`,
    text: `${item.attendanceDate || '-'} • ${item.status || '-'}`,
  })),
)

const spotlightTitle = computed(() =>
  dashboard.value.upcomingClasses[0]
    ? `${dashboard.value.upcomingClasses[0].name} ${t('preschoolTeacherDashboardPage.spotlight.nextSuffix')}`
    : t('preschoolTeacherDashboardPage.spotlight.noUpcomingClasses'),
)

const spotlightText = computed(() =>
  dashboard.value.upcomingClasses[0]
    ? `${dashboard.value.upcomingClasses[0].teacherDisplayName || t('preschoolTeacherDashboardPage.spotlight.assignedTeacher')} has ${dashboard.value.upcomingClasses[0].studentsCount || 0} enrolled students.`
    : t('preschoolTeacherDashboardPage.spotlight.fallback'),
)

const todaySessions = computed(() => attendanceSessions.value.slice(0, 4))

function getSessionProgress(session) {
  const progress = resolveSessionProgress(session || {}, [])
  const total = Number(session?.studentCount ?? session?.totalStudents ?? progress.total ?? 0) || 0
  const marked = Number(session?.recordedStudents ?? session?.recordsCount ?? progress.marked ?? 0) || 0
  const pending = Number(session?.missingStudents ?? session?.pendingCount ?? Math.max(total - marked, 0)) || 0

  return {
    total,
    marked,
    pending,
  }
}

function getSessionDisplayStatus(session) {
  const status = normalizeSessionStatus(session.status)
  const progress = getSessionProgress(session)

  if (['completed', 'locked', 'cancelled'].includes(status)) {
    return status
  }

  if (status === 'open' && progress.marked === 0 && progress.total > 0) {
    return 'missing'
  }

  if (progress.pending > 0 && progress.marked > 0) {
    return 'missing'
  }

  return status
}

function getSessionActionKey(session) {
  const status = normalizeSessionStatus(session.status)
  const progress = getSessionProgress(session)

  if (['completed', 'locked', 'cancelled'].includes(status)) {
    return 'viewDetails'
  }

  if (status === 'scheduled') {
    return 'recordAttendance'
  }

  if (status === 'open' && progress.marked === 0) {
    return 'recordNow'
  }

  if (status === 'open') {
    return 'continueAttendance'
  }

  if (progress.pending > 0) {
    return progress.marked > 0 ? 'continueAttendance' : 'recordNow'
  }

  return 'viewDetails'
}

function getSessionActionLabel(session) {
  return t(`preschoolTeacherDashboardPage.attendanceSessions.actions.${getSessionActionKey(session)}`)
}

function getSessionCardTone(session) {
  return getSessionDisplayStatus(session) === 'missing'
    ? 'danger'
    : getSessionStatusTone(getSessionDisplayStatus(session))
}

function getSessionProgressLabel(session) {
  const progress = getSessionProgress(session)
  return t('preschoolTeacherDashboardPage.attendanceSessions.progressLabel', {
    completed: progress.marked,
    total: progress.total,
  })
}

function getSessionSummaryLabel(session) {
  const progress = getSessionProgress(session)

  if (progress.total <= 0) {
    return t('preschoolTeacherDashboardPage.attendanceSessions.noRoster')
  }

  if (progress.pending > 0) {
    return t('preschoolTeacherDashboardPage.attendanceSessions.pendingSummary', {
      completed: progress.marked,
      pending: progress.pending,
      total: progress.total,
    })
  }

  return t('preschoolTeacherDashboardPage.attendanceSessions.completedSummary', {
    completed: progress.marked,
    total: progress.total,
  })
}

function getSessionActionRoute(session) {
  const status = normalizeSessionStatus(session.status)
  const sessionId = String(session.id || session.sessionKey || '').trim()

  if (!sessionId) {
    return { name: 'dashboard-preschool-teacher-attendance' }
  }

  if (['completed', 'locked', 'cancelled'].includes(status)) {
    return {
      name: 'dashboard-preschool-teacher-attendance-session-details',
      params: { id: sessionId },
    }
  }

  return {
    name: 'dashboard-preschool-teacher-attendance',
    query: {
      classId: session.classId || '',
      date: session.attendanceDate || new Date().toISOString().slice(0, 10),
      attendance_session_id: sessionId,
      sessionId,
    },
  }
}

function goToMySchedule() {
  router.push({ name: 'dashboard-preschool-teacher-schedule' })
}

function goToAttendancePage() {
  router.push({
    name: 'dashboard-preschool-teacher-attendance',
    query: {
      date: new Date().toISOString().slice(0, 10),
    },
  })
}

function sessionStatusLabel(status) {
  return t(`preschoolAttendanceSessionsPage.statuses.${getSessionStatusKey(status)}`) || String(status || '—')
}

async function takeAttendance(session) {
  const status = normalizeSessionStatus(session.status)
  const sessionId = String(session.id || session.sessionKey || '').trim()

  if (!sessionId) return

  try {
    if (status === 'scheduled') {
      const openedSession = await openAttendanceSession(sessionId)
      await router.push({
        name: 'dashboard-preschool-teacher-attendance',
        query: {
          classId: openedSession?.classId || session.classId || '',
          date: openedSession?.attendanceDate || session.attendanceDate || new Date().toISOString().slice(0, 10),
          attendance_session_id: openedSession?.id || sessionId,
          sessionId: openedSession?.id || sessionId,
        },
      })
      return
    }

    await router.push(getSessionActionRoute(session))
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolTeacherDashboardPage.errors.loadFailed')
  }
}

function actionLabel(session) {
  return getSessionActionLabel(session)
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <MainLayout>
    <section class="preschool-dashboard-page">
      <HeaderSection
        :title="t('preschoolTeacherDashboardPage.title')"
        :subtitle="t('preschoolTeacherDashboardPage.subtitle')"
      />

      <div class="flex flex-wrap items-center gap-2">
        <Button type="button" variant="primary" size="md" rounded="xl" @click="goToMySchedule">
          {{ t('preschoolTeacherDashboardPage.actions.mySchedule') }}
        </Button>
      </div>

      <div
        v-if="errorMessage"
        class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="loading"
        class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500"
      >
        {{ t('preschoolTeacherDashboardPage.loading') }}
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolTeacherDashboardPage.attendanceSessions.title') }}</h3>
            <p class="text-xs text-slate-500">{{ t('preschoolTeacherDashboardPage.attendanceSessions.subtitle') }}</p>
          </div>
          <p class="text-xs text-slate-500">
            {{ todaySessions.length }} {{ t('preschoolTeacherDashboardPage.attendanceSessions.todayCount') }}
          </p>
        </div>
        <div v-if="sessionsLoading" class="px-4 py-8 text-center text-sm text-slate-500">
          {{ t('preschoolTeacherDashboardPage.attendanceSessions.loading') }}
        </div>
        <div v-else-if="sessionsErrorMessage" class="px-4 py-8 text-center text-sm text-rose-600">
          <p>{{ sessionsErrorMessage }}</p>
          <Button type="button" variant="ghost" size="sm" rounded="xl" class="mt-3" @click="goToAttendancePage">
            {{ t('preschoolTeacherDashboardPage.attendanceSessions.actions.openAttendance') }}
          </Button>
        </div>
        <div v-else-if="!todaySessions.length" class="px-4 py-8 text-center text-sm text-slate-500">
          <p>{{ t('preschoolTeacherDashboardPage.attendanceSessions.empty.title') }}</p>
          <p class="mt-1 text-xs text-slate-400">{{ t('preschoolTeacherDashboardPage.attendanceSessions.empty.subtitle') }}</p>
          <Button type="button" variant="primary" size="sm" rounded="xl" class="mt-4" @click="goToAttendancePage">
            {{ t('preschoolTeacherDashboardPage.attendanceSessions.actions.openAttendance') }}
          </Button>
        </div>
        <div v-else class="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="session in todaySessions"
            :key="session.sessionKey || session.id"
            class="rounded-2xl border p-4"
            :class="getSessionDisplayStatus(session) === 'missing' ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50'"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {{ session.classCode || t('preschoolAttendanceSessionsPage.sessionDate') }}
                </p>
                <h4 class="mt-1 truncate font-semibold text-slate-900">{{ session.className || '—' }}</h4>
                <p class="mt-1 text-xs text-slate-500">
                  {{ session.attendanceDate || '—' }}
                  <span v-if="session.startTime || session.endTime">
                    · {{ session.startTime || '--:--' }} - {{ session.endTime || '--:--' }}
                  </span>
                </p>
              </div>
              <AppStatusChip
                :status="getSessionCardTone(session)"
                :label="sessionStatusLabel(getSessionDisplayStatus(session))"
                :translate-label="false"
                size="xs"
              />
            </div>
            <div v-if="getSessionDisplayStatus(session) === 'missing'" class="mt-3">
              <AppBadge
                :label="t('preschoolTeacherDashboardPage.attendanceSessions.warning')"
                variant="danger"
                size="sm"
              />
            </div>
            <div class="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
              <div>
                <p class="uppercase tracking-wide text-slate-400">{{ t('preschoolTeacherDashboardPage.attendanceSessions.labels.students') }}</p>
                <p class="mt-0.5 text-slate-700">{{ session.studentCount ?? '—' }}</p>
              </div>
              <div>
                <p class="uppercase tracking-wide text-slate-400">{{ t('preschoolTeacherDashboardPage.attendanceSessions.labels.completed') }}</p>
                <p class="mt-0.5 text-slate-700">{{ session.recordedStudents ?? session.recordsCount ?? '—' }}</p>
              </div>
              <div>
                <p class="uppercase tracking-wide text-slate-400">{{ t('preschoolAttendanceDashboardPage.operationalSummary.room') }}</p>
                <p class="mt-0.5 truncate text-slate-700">{{ session.roomName || '—' }}</p>
              </div>
              <div>
                <p class="uppercase tracking-wide text-slate-400">{{ t('preschoolTeacherDashboardPage.attendanceSessions.labels.progress') }}</p>
                <p class="mt-0.5 text-slate-700">{{ getSessionProgressLabel(session) }}</p>
              </div>
            </div>
            <div class="mt-3">
              <div class="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  class="h-full rounded-full"
                  :class="getSessionDisplayStatus(session) === 'missing' ? 'bg-rose-600' : 'bg-slate-800'"
                  :style="{ width: `${Math.min(100, Math.max(0, session.completionRate ?? 0))}%` }"
                />
              </div>
              <p class="mt-2 text-xs text-slate-500">
                {{ getSessionSummaryLabel(session) }}
              </p>
            </div>
            <div class="mt-3 flex items-center justify-between gap-2">
              <p class="text-xs text-slate-500">
                {{ session.generatedFromSchedule ? t('preschoolAttendanceSessionsPage.generatedFromSchedule') : t('preschoolAttendanceSessionsPage.manualSession') }}
              </p>
              <Button type="button" variant="primary" size="sm" rounded="xl" @click="takeAttendance(session)">
                {{ actionLabel(session) }}
              </Button>
            </div>
          </article>
        </div>
      </div>

      <PreschoolDashboardSummary :cards="cards" />

      <div class="preschool-dashboard-page__grid">
        <PreschoolDashboardSpotlight
          :title="spotlightTitle"
          :text="spotlightText"
        />
        <PreschoolDashboardActionList :title="t('preschoolTeacherDashboardPage.quickStats')" :items="actions" />
      </div>

      <PreschoolDashboardActivity :items="notes" />
    </section>
  </MainLayout>
</template>

<style scoped>
.preschool-dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.preschool-dashboard-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.9fr);
  gap: 1rem;
  align-items: start;
}

@media (max-width: 980px) {
  .preschool-dashboard-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
