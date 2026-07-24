<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppStatusChip from '@/components/ui/AppStatusChip.vue'
import { useLanguage } from '@/composables/useLanguage'
import { formatDate, formatDatetime } from '@/utils/date'
import {
  cancelAttendanceSession,
  completeAttendanceSession,
  fetchAttendanceSession,
  lockAttendanceSession,
  openAttendanceSession,
  reopenAttendanceSession,
} from '@/modules/preschool/services/api/preschoolAttendanceSessionApi'
import { fetchPreschoolAttendance } from '@/modules/preschool/services/preschoolApi'
import { fetchPreschoolAttendanceAlerts } from '@/modules/preschool/services/api/preschoolAttendanceAlertApi'
import {
  buildSessionTimeline,
  getSessionStatusKey,
  getSessionStatusTone,
  normalizeSessionStatus,
  resolveSessionProgress,
} from '@/modules/preschool/admin/pages/attendance/sessionUi'

defineOptions({ name: 'PreschoolAttendanceSessionDetailsPage' })

const { t } = useLanguage()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const actionLoading = ref(false)
const errorMessage = ref('')
const session = ref(null)
const records = ref([])
const alerts = ref([])
const guardianContactLogs = ref([])

const isTeacherView = computed(() => String(route.name || '').includes('teacher'))
const sessionStatus = computed(() => normalizeSessionStatus(session.value?.status || ''))
const progress = computed(() => resolveSessionProgress(session.value || {}, records.value))
const sessionTimeline = computed(() => buildSessionTimeline(session.value || {}, records.value, alerts.value, guardianContactLogs.value))
const sessionStatusLabel = computed(() => t(`preschoolAttendanceSessionsPage.statuses.${getSessionStatusKey(sessionStatus.value)}`) || sessionStatus.value)
const sessionStatusTone = computed(() => getSessionStatusTone(sessionStatus.value))
const recentAlerts = computed(() => alerts.value.slice(0, 5))
const recentGuardianContacts = computed(() => guardianContactLogs.value.slice(0, 5))
const detailsRouteName = computed(() => isTeacherView.value ? 'dashboard-preschool-teacher-attendance-session-details' : 'dashboard-preschool-admin-attendance-session-details')
const entryRouteName = computed(() => isTeacherView.value ? 'dashboard-preschool-teacher-attendance' : 'dashboard-preschool-admin-attendance-students')

function sessionId() {
  return String(route.params.id || '').trim()
}

function countByStatus(status) {
  return records.value.filter((record) => normalizeSessionStatus(record.status) === status).length
}

function attendanceTone(status) {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'present') return 'success'
  if (normalized === 'absent') return 'danger'
  if (normalized === 'late') return 'warning'
  if (normalized === 'excused') return 'info'
  return 'neutral'
}

const summaryCards = computed(() => [
  { key: 'present', label: t('preschoolAttendanceStatus.present'), value: countByStatus('present'), tone: 'success' },
  { key: 'absent', label: t('preschoolAttendanceStatus.absent'), value: countByStatus('absent'), tone: 'danger' },
  { key: 'late', label: t('preschoolAttendanceStatus.late'), value: countByStatus('late'), tone: 'warning' },
  { key: 'excused', label: t('preschoolAttendanceStatus.excused'), value: countByStatus('excused'), tone: 'info' },
  { key: 'pending', label: t('preschoolAttendanceSessionsPage.pendingAttendance'), value: progress.value.pending, tone: 'neutral' },
])

const sessionInfoCards = computed(() => [
  { label: t('preschoolAttendanceSessionsPage.sessionFields.class'), value: session.value?.className || '—' },
  { label: t('preschoolAttendanceSessionsPage.sessionFields.teacher'), value: session.value?.teacherName || '—' },
  { label: t('preschoolAttendanceSessionsPage.sessionFields.room'), value: session.value?.roomName || '—' },
  { label: t('preschoolAttendanceSessionsPage.sessionFields.schedule'), value: session.value?.scheduleLabel || '—' },
  { label: t('preschoolAttendanceSessionsPage.sessionFields.generatedFrom'), value: session.value?.generatedFromSchedule ? t('preschoolAttendanceSessionsPage.generatedFromSchedule') : t('preschoolAttendanceSessionsPage.manualSession') },
  { label: t('preschoolAttendanceSessionsPage.sessionFields.openedAt'), value: formatDatetime(session.value?.openedAt || session.value?.opened_at) || '—' },
  { label: t('preschoolAttendanceSessionsPage.sessionFields.completedAt'), value: formatDatetime(session.value?.completedAt || session.value?.completed_at || session.value?.closedAt || session.value?.closed_at) || '—' },
  { label: t('preschoolAttendanceSessionsPage.sessionFields.lockedAt'), value: formatDatetime(session.value?.lockedAt || session.value?.locked_at) || '—' },
  { label: t('preschoolAttendanceSessionsPage.sessionFields.cancelledAt'), value: formatDatetime(session.value?.cancelledAt || session.value?.cancelled_at) || '—' },
])

function actionLabel() {
  if (sessionStatus.value === 'scheduled') return t('preschoolAttendanceSessionsPage.openSession')
  if (sessionStatus.value === 'open') return t('preschoolAttendanceSessionsPage.actions.continueAttendance')
  if (sessionStatus.value === 'locked') return isTeacherView.value ? t('preschoolAttendanceSessionsPage.actions.viewSession') : t('preschoolAttendanceSessionsPage.actions.reopenSession')
  if (sessionStatus.value === 'cancelled') return t('preschoolAttendanceSessionsPage.actions.viewDetails')
  return t('preschoolAttendanceSessionsPage.actions.viewSession')
}

async function loadData() {
  const id = sessionId()
  if (!id) return

  loading.value = true
  errorMessage.value = ''

  try {
    const loadedSession = await fetchAttendanceSession(id)
    session.value = loadedSession

    const attendanceResponse = await fetchPreschoolAttendance({
      attendanceSessionId: id,
      classId: loadedSession?.classId || '',
      attendanceDate: loadedSession?.attendanceDate || '',
      page: 1,
      perPage: 500,
    })
    records.value = attendanceResponse.items || []

    const alertResponse = await fetchPreschoolAttendanceAlerts({
      classId: loadedSession?.classId || undefined,
      dateFrom: loadedSession?.attendanceDate || undefined,
      dateTo: loadedSession?.attendanceDate || undefined,
      perPage: 20,
      page: 1,
    })
    alerts.value = alertResponse.items || []

    const contacts = [
      ...(loadedSession?.guardianContactLogs || []),
      ...records.value.flatMap((record) => Array.isArray(record.raw?.guardianContactLogs) ? record.raw.guardianContactLogs : []),
    ]
    guardianContactLogs.value = contacts

  } catch (error) {
    errorMessage.value = error?.message || t('preschoolAttendanceSessionsPage.messages.loadFailed')
    session.value = null
    records.value = []
    alerts.value = []
    guardianContactLogs.value = []
  } finally {
    loading.value = false
  }
}

async function performAction() {
  if (!session.value) return

  actionLoading.value = true
  try {
    if (sessionStatus.value === 'scheduled') {
      session.value = await openAttendanceSession(sessionId())
      await router.push({
        name: entryRouteName.value,
        query: {
          classId: session.value?.classId || '',
          date: session.value?.attendanceDate || '',
          attendance_session_id: sessionId(),
          sessionId: sessionId(),
        },
      })
    } else if (sessionStatus.value === 'open') {
      await router.push({
        name: entryRouteName.value,
        query: {
          classId: session.value?.classId || '',
          date: session.value?.attendanceDate || '',
          attendance_session_id: sessionId(),
          sessionId: sessionId(),
        },
      })
    } else if (sessionStatus.value === 'locked') {
      if (isTeacherView.value) {
        await router.push({
          name: entryRouteName.value,
          query: {
            classId: session.value?.classId || '',
            date: session.value?.attendanceDate || '',
            attendance_session_id: sessionId(),
            sessionId: sessionId(),
          },
        })
      } else {
        session.value = await reopenAttendanceSession(sessionId())
        await loadData()
      }
    } else {
      await router.push({
        name: detailsRouteName.value,
        params: { id: sessionId() },
      })
    }
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolAttendanceSessionsPage.messages.loadFailed')
  } finally {
    actionLoading.value = false
  }
}

async function completeSession() {
  if (!session.value || isTeacherView.value || sessionStatus.value !== 'open') return

  actionLoading.value = true
  try {
    session.value = await completeAttendanceSession(sessionId())
    await loadData()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolAttendanceSessionsPage.messages.loadFailed')
  } finally {
    actionLoading.value = false
  }
}

async function lockSession() {
  if (!session.value || isTeacherView.value) return
  actionLoading.value = true
  try {
    session.value = await lockAttendanceSession(sessionId())
    await loadData()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolAttendanceSessionsPage.messages.loadFailed')
  } finally {
    actionLoading.value = false
  }
}

async function cancelSession() {
  if (!session.value || isTeacherView.value) return
  const reason = window.prompt(t('preschoolAttendanceSessionsPage.prompts.cancelReason')) || ''
  actionLoading.value = true
  try {
    session.value = await cancelAttendanceSession(sessionId(), reason)
    await loadData()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolAttendanceSessionsPage.messages.loadFailed')
  } finally {
    actionLoading.value = false
  }
}

function goToAttendanceAlerts() {
  router.push({ name: 'dashboard-preschool-admin-attendance-alerts' })
}

function goToStudentProfile(studentId) {
  if (!studentId || isTeacherView.value) return
  router.push({ name: 'dashboard-preschool-admin-student-profile', params: { id: studentId } })
}

function goBack() {
  router.back()
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
        :title="t('preschoolAttendanceSessionsPage.detailsTitle')"
        :subtitle="t('preschoolAttendanceSessionsPage.detailsSubtitle')"
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
                {{ t('preschoolAttendanceSessionsPage.title') }}
              </span>
            </div>
            <h2 class="text-2xl font-semibold text-slate-900">
              {{ session?.className || '—' }}
            </h2>
            <p class="text-sm text-slate-600">
              {{ session?.teacherName || '—' }}
              <span v-if="session?.roomName"> · {{ session.roomName }}</span>
            </p>
            <p class="text-sm text-slate-500">
              {{ session?.attendanceDate || '—' }}
              <span v-if="session?.startTime || session?.endTime">
                · {{ session?.startTime || '--:--' }} - {{ session?.endTime || '--:--' }}
              </span>
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" size="md" rounded="xl" @click="goBack">
              {{ t('preschoolAttendanceSessionsPage.actions.back') }}
            </Button>
            <Button
              v-if="session"
              type="button"
              variant="primary"
              size="md"
              rounded="xl"
              :loading="actionLoading"
              :disabled="actionLoading"
              @click="performAction"
            >
              {{ actionLabel() }}
            </Button>
            <Button
              v-if="!isTeacherView && sessionStatus === 'open'"
              type="button"
              variant="ghost"
              size="md"
              rounded="xl"
              :loading="actionLoading"
              :disabled="actionLoading"
              @click="completeSession"
            >
              {{ t('preschoolAttendanceSessionsPage.actions.completeSession') }}
            </Button>
            <Button
              v-if="!isTeacherView && sessionStatus === 'open'"
              type="button"
              variant="ghost"
              size="md"
              rounded="xl"
              :loading="actionLoading"
              :disabled="actionLoading"
              @click="lockSession"
            >
              {{ t('preschoolAttendanceSessionsPage.actions.lockSession') }}
            </Button>
            <Button
              v-if="!isTeacherView && sessionStatus === 'open'"
              type="button"
              variant="ghost"
              size="md"
              rounded="xl"
              :loading="actionLoading"
              :disabled="actionLoading"
              @click="cancelSession"
            >
              {{ t('preschoolAttendanceSessionsPage.actions.cancelSession') }}
            </Button>
            <Button
              v-if="!isTeacherView"
              type="button"
              variant="ghost"
              size="md"
              rounded="xl"
              @click="goToAttendanceAlerts"
            >
              {{ t('preschoolAttendanceSessionsPage.actions.viewRelatedAlerts') }}
            </Button>
          </div>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <article
          v-for="card in summaryCards"
          :key="card.key"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {{ card.label }}
          </p>
          <p class="mt-2 text-3xl font-semibold text-slate-900">
            {{ card.value }}
          </p>
        </article>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="border-b border-slate-100 pb-3">
          <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolAttendanceSessionsPage.sessionInformation') }}</h3>
        </div>
        <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="item in sessionInfoCards"
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

      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolAttendanceSessionsPage.attendanceRecords') }}</h3>
            <p class="text-xs text-slate-500">{{ progress.marked }} / {{ progress.total }}</p>
          </div>
          <Button v-if="!loading && !isTeacherView" type="button" variant="ghost" size="sm" rounded="xl" @click="goToAttendanceAlerts">
            {{ t('preschoolAttendanceSessionsPage.actions.viewRelatedAlerts') }}
          </Button>
        </div>
        <div v-if="loading" class="px-4 py-8 text-center text-sm text-slate-400">
          {{ t('preschoolReportsShared.loading') }}
        </div>
        <div v-else-if="!records.length" class="px-4 py-8 text-center text-sm text-slate-400">
          {{ t('preschoolAttendanceSessionsPage.messages.noAttendanceRecords') }}
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceSessionsPage.columns.student') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceSessionsPage.columns.status') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceSessionsPage.columns.note') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceSessionsPage.columns.guardianContact') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="record in records" :key="record.id">
                <td class="px-4 py-3">
                  <button
                    type="button"
                    class="text-left font-medium text-slate-900 hover:text-violet-700 disabled:cursor-default disabled:hover:text-slate-900"
                    :disabled="isTeacherView || !record.studentId"
                    @click="goToStudentProfile(record.studentId)"
                  >
                    {{ record.studentName || '—' }}
                  </button>
                </td>
                <td class="px-4 py-3">
                  <AppStatusChip
                    :status="attendanceTone(record.status)"
                    :label="t(`preschoolAttendanceStatus.${record.status}`) || record.status || '—'"
                    :translate-label="false"
                    size="xs"
                  />
                </td>
                <td class="px-4 py-3 text-slate-600">
                  {{ record.note || '—' }}
                </td>
                <td class="px-4 py-3 text-slate-600">
                  {{ record.guardianContactLabel || record.raw?.guardianContactLabel || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolAttendanceSessionsPage.relatedAttendanceAlerts') }}</h3>
          </div>
          <div v-if="!recentAlerts.length" class="py-6 text-sm text-slate-400">
            {{ t('preschoolAttendanceSessionsPage.messages.noRelatedAlerts') }}
          </div>
          <div v-else class="mt-4 space-y-3">
            <article v-for="alert in recentAlerts" :key="alert.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-medium text-slate-900">{{ alert.studentName || '—' }}</p>
                  <p class="text-xs text-slate-500">
                    {{ alert.className || '—' }}
                    <span v-if="alert.guardianName"> · {{ alert.guardianName }}</span>
                  </p>
                </div>
                <AppBadge variant="warning" size="xs" :label="alert.alertLabel || alert.alertType || t('preschoolAttendanceAlertsPage.labels.repeatedAbsence')" />
              </div>
              <p class="mt-2 text-sm text-slate-600">{{ alert.message || '—' }}</p>
              <p class="mt-2 text-xs text-slate-500">{{ formatDate(alert.createdAt) || alert.createdAt || '—' }}</p>
            </article>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolAttendanceSessionsPage.relatedGuardianContactLogs') }}</h3>
          </div>
          <div v-if="!recentGuardianContacts.length" class="py-6 text-sm text-slate-400">
            {{ t('preschoolAttendanceSessionsPage.messages.noRelatedContacts') }}
          </div>
          <div v-else class="mt-4 space-y-3">
            <article v-for="contact in recentGuardianContacts" :key="contact.id || contact.createdAt" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="font-medium text-slate-900">{{ contact.guardianName || contact.studentName || '—' }}</p>
                  <p class="text-xs text-slate-500">{{ contact.note || '—' }}</p>
                </div>
                <AppBadge variant="info" size="xs" :label="contact.followUpStatus || contact.status || t('common.unknown')" />
              </div>
              <p class="mt-2 text-xs text-slate-500">{{ formatDatetime(contact.createdAt) || contact.createdAt || '—' }}</p>
            </article>
          </div>
        </section>
      </div>

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="border-b border-slate-100 pb-3">
          <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolAttendanceSessionsPage.sessionTimeline') }}</h3>
        </div>
        <div v-if="!sessionTimeline.length" class="py-6 text-sm text-slate-400">
          {{ t('preschoolAttendanceSessionsPage.messages.noTimeline') }}
        </div>
        <ol v-else class="mt-4 space-y-3">
          <li v-for="item in sessionTimeline" :key="`${item.key}-${item.createdAt}`" class="flex gap-3">
            <div class="mt-1 h-2.5 w-2.5 rounded-full bg-violet-500" />
            <div class="min-w-0">
              <p class="text-sm font-medium text-slate-900">{{ t(`preschoolAttendanceSessionsPage.timeline.${item.key}`) || item.label }}</p>
              <p class="text-xs text-slate-500">{{ formatDatetime(item.createdAt) || item.createdAt || '—' }}</p>
            </div>
          </li>
        </ol>
      </section>
    </section>
  </MainLayout>
</template>
