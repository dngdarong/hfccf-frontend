<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import AppStatusChip from '@/components/ui/AppStatusChip.vue'
import { useLanguage } from '@/composables/useLanguage'
import { formatDatetime } from '@/utils/date'
import {
  fetchScheduleSessionHistory,
} from '@/modules/preschool/services/api/preschoolScheduleApi'
import { openAttendanceSession } from '@/modules/preschool/services/api/preschoolAttendanceSessionApi'
import {
  buildSessionTimeline,
  getSessionStatusKey,
  getSessionStatusTone,
  normalizeSessionStatus,
} from '@/modules/preschool/admin/pages/attendance/sessionUi'

defineOptions({ name: 'PreschoolScheduleDetailsPage' })

const { t } = useLanguage()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const actionLoading = ref(false)
const errorMessage = ref('')
const history = ref({
  schedule: null,
  todaySession: null,
  recentSessions: [],
  summary: {},
  alerts: [],
  guardianContacts: [],
})

const isTeacherView = computed(() => route.name === 'dashboard-preschool-teacher-schedule-details')
const scheduleId = computed(() => String(route.params.id || '').trim())
const schedule = computed(() => history.value.schedule || null)
const todaySession = computed(() => history.value.todaySession || null)
const recentSessions = computed(() => history.value.recentSessions || [])
const summary = computed(() => history.value.summary || {})
const alerts = computed(() => history.value.alerts || [])
const guardianContacts = computed(() => history.value.guardianContacts || [])
const primarySession = computed(() => todaySession.value || null)
const sessionStatus = computed(() => normalizeSessionStatus(primarySession.value?.status || 'missing'))
const sessionStatusTone = computed(() => getSessionStatusTone(sessionStatus.value))
const sessionStatusLabel = computed(() => {
  if (!primarySession.value) {
    return t('preschoolSchedulesPage.details.noSessionGenerated')
  }

  return t(`preschoolAttendanceSessionsPage.statuses.${getSessionStatusKey(sessionStatus.value)}`) || sessionStatus.value
})
const primaryActionLabel = computed(() => {
  const key = getSessionStatusKey(sessionStatus.value)
  if (key === 'scheduled') return t('preschoolAttendanceSessionsPage.openSession')
  if (key === 'open') return t('preschoolAttendanceSessionsPage.actions.continueAttendance')
  return t('preschoolAttendanceSessionsPage.actions.viewSession')
})
const timelineSession = computed(() => todaySession.value || recentSessions.value[0] || null)
const sessionTimeline = computed(() =>
  buildSessionTimeline(
    timelineSession.value || {},
    [],
    alerts.value,
    guardianContacts.value,
  ),
)

function todayIso() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const summaryCards = computed(() => [
  { label: t('preschoolSchedulesPage.details.completionRate'), value: summary.value.completionRate ?? summary.value.completion_rate ?? '—' },
  { label: t('preschoolSchedulesPage.details.attendanceRate'), value: summary.value.attendanceRate ?? summary.value.attendance_rate ?? '—' },
  { label: t('preschoolSchedulesPage.details.recentSessions'), value: recentSessions.value.length },
  { label: t('preschoolSchedulesPage.details.relatedAttendanceAlerts'), value: alerts.value.length },
  { label: t('preschoolSchedulesPage.details.relatedGuardianContacts'), value: guardianContacts.value.length },
])

const todaySessionCards = computed(() => {
  if (!todaySession.value) return []

  const valueOrDash = (value) => value || '—'

  return [
    { label: t('preschoolAttendanceSessionsPage.sessionFields.class'), value: valueOrDash(todaySession.value.className || schedule.value?.className) },
    { label: t('preschoolAttendanceSessionsPage.sessionFields.teacher'), value: valueOrDash(todaySession.value.teacherName || schedule.value?.teacherName) },
    { label: t('preschoolAttendanceSessionsPage.sessionFields.room'), value: valueOrDash(todaySession.value.roomName || todaySession.value.room || schedule.value?.room) },
    { label: t('preschoolAttendanceSessionsPage.sessionFields.schedule'), value: valueOrDash(schedule.value?.activityLabel || schedule.value?.raw?.schedule || schedule.value?.dayOfWeek) },
    { label: t('preschoolAttendanceSessionsPage.sessionFields.generatedFrom'), value: todaySession.value.generatedFromSchedule ? t('preschoolAttendanceSessionsPage.generatedFromSchedule') : t('preschoolAttendanceSessionsPage.manualSession') },
    { label: t('preschoolAttendanceSessionsPage.sessionFields.openedAt'), value: formatDatetime(todaySession.value.openedAt) || '—' },
    { label: t('preschoolAttendanceSessionsPage.sessionFields.completedAt'), value: formatDatetime(todaySession.value.completedAt || todaySession.value.closedAt) || '—' },
    { label: t('preschoolAttendanceSessionsPage.sessionFields.lockedAt'), value: formatDatetime(todaySession.value.lockedAt) || '—' },
    { label: t('preschoolAttendanceSessionsPage.sessionFields.cancelledAt'), value: formatDatetime(todaySession.value.cancelledAt) || '—' },
  ]
})

function goBack() {
  router.back()
}

function goToAttendanceAlerts() {
  router.push({ name: 'dashboard-preschool-admin-attendance-alerts' })
}

function getGuardianContactTone(status) {
  const normalized = String(status || '').trim().toLowerCase().replace(/[_-]+/g, ' ')
  if (normalized === 'completed' || normalized === 'acknowledged') return 'success'
  if (normalized === 'overdue') return 'danger'
  if (normalized === 'follow up required') return 'warning'
  return 'neutral'
}

function resolveCardValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  return value
}

async function loadData() {
  const id = scheduleId.value
  if (!id) return

  loading.value = true
  errorMessage.value = ''

  try {
    history.value = await fetchScheduleSessionHistory(id)
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolSchedulesPage.details.loadFailed')
    history.value = {
      schedule: null,
      todaySession: null,
      recentSessions: [],
      summary: {},
      alerts: [],
      guardianContacts: [],
    }
  } finally {
    loading.value = false
  }
}

async function primaryAction() {
  if (!primarySession.value) return

  actionLoading.value = true
  try {
    const status = normalizeSessionStatus(primarySession.value.status || '')
    const sessionId = String(primarySession.value.id || '').trim()

    if (status === 'scheduled') {
      await openAttendanceSession(sessionId)
      await router.push({
        name: isTeacherView.value ? 'dashboard-preschool-teacher-attendance' : 'dashboard-preschool-admin-attendance-students',
        query: {
          classId: primarySession.value.classId || schedule.value?.classId || '',
          date: primarySession.value.attendanceDate || todayIso(),
          attendance_session_id: sessionId,
          sessionId,
        },
      })
      return
    }

    if (status === 'open') {
      await router.push({
        name: isTeacherView.value ? 'dashboard-preschool-teacher-attendance' : 'dashboard-preschool-admin-attendance-students',
        query: {
          classId: primarySession.value.classId || schedule.value?.classId || '',
          date: primarySession.value.attendanceDate || todayIso(),
          attendance_session_id: sessionId,
          sessionId,
        },
      })
      return
    }

    await router.push({
      name: isTeacherView.value ? 'dashboard-preschool-teacher-attendance-session-details' : 'dashboard-preschool-admin-attendance-session-details',
      params: { id: sessionId },
    })
  } finally {
    actionLoading.value = false
  }
}

watch(
  () => route.params.id,
  () => {
    loadData()
  },
  { immediate: true },
)
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolSchedulesPage.details.title')"
        :subtitle="t('preschoolSchedulesPage.details.subtitle')"
      />

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-2">
              <AppStatusChip :status="sessionStatusTone" :label="sessionStatusLabel" :translate-label="false" size="xs" />
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {{ t('preschoolSchedulesPage.details.title') }}
              </span>
            </div>
            <h2 class="text-2xl font-semibold text-slate-900">
              {{ schedule?.className || '—' }}
            </h2>
            <p class="text-sm text-slate-600">
              {{ schedule?.teacherName || '—' }}
              <span v-if="schedule?.room"> · {{ schedule.room }}</span>
            </p>
            <p class="text-sm text-slate-500">
              {{ schedule?.dayOfWeek || '—' }}
              <span v-if="schedule?.startTime || schedule?.endTime">
                · {{ schedule?.startTime || '--:--' }} - {{ schedule?.endTime || '--:--' }}
              </span>
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" size="md" rounded="xl" @click="goBack">
              {{ t('preschoolSchedulesPage.actions.back') }}
            </Button>
            <Button
              v-if="primarySession"
              type="button"
              variant="primary"
              size="md"
              rounded="xl"
              :loading="actionLoading"
              :disabled="actionLoading"
              @click="primaryAction"
            >
              {{ primaryActionLabel }}
            </Button>
            <Button v-if="!isTeacherView" type="button" variant="ghost" size="md" rounded="xl" @click="goToAttendanceAlerts">
              {{ t('preschoolSchedulesPage.details.viewAlerts') }}
            </Button>
          </div>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <article
          v-for="card in summaryCards"
          :key="card.label"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {{ card.label }}
          </p>
          <p class="mt-2 text-3xl font-semibold text-slate-900">
            {{ resolveCardValue(card.value) }}
          </p>
        </article>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="border-b border-slate-100 pb-3">
          <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolSchedulesPage.details.scheduleInformation') }}</h3>
        </div>
        <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="item in [
              { label: t('preschoolAttendanceSessionsPage.sessionFields.class'), value: schedule?.className || '—' },
              { label: t('preschoolAttendanceSessionsPage.sessionFields.teacher'), value: schedule?.teacherName || '—' },
              { label: t('preschoolAttendanceSessionsPage.sessionFields.room'), value: schedule?.room || '—' },
              { label: t('preschoolAttendanceSessionsPage.sessionFields.schedule'), value: schedule?.activityLabel || schedule?.raw?.schedule || t('preschoolSchedulesPage.details.noSessionGenerated') || '—' },
              { label: t('preschoolSchedulesPage.details.todaySession'), value: todaySession?.status ? t(`preschoolAttendanceSessionsPage.statuses.${getSessionStatusKey(normalizeSessionStatus(todaySession.status))}`) || todaySession.status : t('preschoolSchedulesPage.details.noSessionGenerated') },
              { label: t('preschoolSchedulesPage.details.sessionSummary'), value: resolveCardValue(summary?.totalSessions ?? summary?.total_sessions ?? recentSessions.length) },
            ]"
            :key="item.label"
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {{ item.label }}
            </p>
            <p class="mt-2 text-sm font-medium text-slate-900">
              {{ item.value }}
            </p>
          </article>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolSchedulesPage.details.todaySession') }}</h3>
          </div>
          <div v-if="!todaySession" class="py-6 text-sm text-slate-400">
            {{ t('preschoolSchedulesPage.details.noSessionGenerated') }}
          </div>
          <div v-else class="mt-4 grid gap-3 md:grid-cols-2">
            <article
              v-for="item in todaySessionCards"
              :key="item.label"
              class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ item.label }}</p>
              <p class="mt-2 text-sm font-medium text-slate-900">{{ item.value }}</p>
            </article>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolSchedulesPage.details.recentSessions') }}</h3>
          </div>
          <div v-if="!recentSessions.length" class="py-6 text-sm text-slate-400">
            {{ t('preschoolSchedulesPage.details.noSessionHistory') }}
          </div>
          <div v-else class="mt-4 space-y-3">
            <article v-for="session in recentSessions" :key="session.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-medium text-slate-900">{{ session.attendanceDate || session.createdAt || '—' }}</p>
                  <p class="text-xs text-slate-500">
                    {{ session.className || schedule?.className || '—' }}
                    <span v-if="session.teacherName || schedule?.teacherName"> · {{ session.teacherName || schedule?.teacherName }}</span>
                  </p>
                </div>
                <AppStatusChip
                  :status="getSessionStatusTone(normalizeSessionStatus(session.status))"
                  :label="t(`preschoolAttendanceSessionsPage.statuses.${getSessionStatusKey(normalizeSessionStatus(session.status))}`) || session.status || '—'"
                  :translate-label="false"
                  size="xs"
                />
              </div>
              <p class="mt-2 text-sm text-slate-600">
                {{ session.roomName || session.room || schedule?.room || '—' }}
              </p>
            </article>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolSchedulesPage.details.relatedAttendanceAlerts') }}</h3>
          </div>
          <div v-if="!alerts.length" class="py-6 text-sm text-slate-400">
            {{ t('preschoolSchedulesPage.details.noRelatedAlerts') }}
          </div>
          <div v-else class="mt-4 space-y-3">
            <article v-for="alert in alerts" :key="alert.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="font-medium text-slate-900">{{ alert.studentName || '—' }}</p>
              <p class="text-xs text-slate-500">{{ alert.alertLabel || alert.alertType || '—' }}</p>
              <p class="mt-2 text-sm text-slate-600">{{ alert.message || alert.note || '—' }}</p>
            </article>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolSchedulesPage.details.relatedGuardianContacts') }}</h3>
          </div>
          <div v-if="!guardianContacts.length" class="py-6 text-sm text-slate-400">
            {{ t('preschoolSchedulesPage.details.noRelatedContacts') }}
          </div>
          <div v-else class="mt-4 space-y-3">
            <article v-for="log in guardianContacts" :key="log.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-medium text-slate-900">{{ log.guardianName || log.studentName || '—' }}</p>
                  <p class="text-xs text-slate-500">{{ log.note || '—' }}</p>
                  <p class="mt-1 text-xs text-slate-500">{{ formatDatetime(log.createdAt) || log.createdAt || '—' }}</p>
                </div>
                <AppStatusChip
                  :status="getGuardianContactTone(log.followUpStatus || log.status)"
                  :label="log.followUpStatus || log.status || '—'"
                  :translate-label="false"
                  size="xs"
                />
              </div>
            </article>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolSchedulesPage.details.sessionTimeline') }}</h3>
          </div>
          <div v-if="!sessionTimeline.length" class="py-6 text-sm text-slate-400">
            {{ t('preschoolSchedulesPage.details.noSessionHistory') }}
          </div>
          <ol v-else class="mt-4 space-y-3">
            <li v-for="item in sessionTimeline" :key="`${item.key}-${item.createdAt}`" class="flex gap-3">
              <div class="mt-1 h-2.5 w-2.5 rounded-full bg-violet-500" />
              <div class="min-w-0">
                <p class="text-sm font-medium text-slate-900">{{ item.label || item.key }}</p>
                <p class="text-xs text-slate-500">{{ formatDatetime(item.createdAt) || item.createdAt || '—' }}</p>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </section>
  </MainLayout>
</template>
