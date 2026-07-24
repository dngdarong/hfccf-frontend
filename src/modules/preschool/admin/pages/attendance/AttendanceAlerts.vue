<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { formatDate } from '@/utils/date'
import { fetchPreschoolClasses } from '@/modules/preschool/services/preschoolApi'
import { fetchAttendanceSettings } from '@/modules/preschool/services/api/preschoolAttendanceConfigurationApi'
import {
  fetchPreschoolAttendanceAlerts,
} from '@/modules/preschool/services/api/preschoolAttendanceAlertApi'
import {
  getAbsenceAlertDays,
  setAttendanceConfigurationSnapshot,
} from '@/modules/preschool/services/preschoolAttendanceConfigurationService'

defineOptions({ name: 'PreschoolAdminAttendanceAlertsPage' })

const { t } = useLanguage()
const router = useRouter()

const classOptions = ref([])
const alerts = ref([])
const summary = ref({
  total: 0,
  open: 0,
  acknowledged: 0,
  overdue: 0,
  byClass: [],
  bySeverity: [],
})
const loading = ref(false)
const errorMessage = ref('')
const selectedClassId = ref('')
const selectedStatus = ref('')
const selectedThreshold = ref(getAbsenceAlertDays() || 3)
const selectedDateFrom = ref('')
const selectedDateTo = ref('')

const thresholdOptions = [3, 5, 7, 10]
const statusOptions = computed(() => [
  { value: '', label: t('preschoolGuardianCommunicationPage.status.all') },
  { value: 'queued', label: t('preschoolGuardianCommunicationPage.status.queued') },
  { value: 'sent', label: t('preschoolGuardianCommunicationPage.status.sent') },
  { value: 'acknowledged', label: t('preschoolGuardianCommunicationPage.status.acknowledged') },
  { value: 'cancelled', label: t('preschoolGuardianCommunicationPage.status.cancelled') },
])

const summaryCards = computed(() => ([
  {
    key: 'total',
    label: t('preschoolAttendanceAlertsPage.labels.absenceAlert'),
    value: summary.value.total,
  },
  {
    key: 'open',
    label: t('preschoolAttendanceAlertsPage.labels.openAlerts'),
    value: summary.value.open,
  },
  {
    key: 'acknowledged',
    label: t('preschoolAttendanceAlertsPage.labels.acknowledgedAlerts'),
    value: summary.value.acknowledged,
  },
  {
    key: 'overdue',
    label: t('preschoolAttendanceAlertsPage.labels.overdueAlerts'),
    value: summary.value.overdue,
  },
]))

const visibleAlerts = computed(() => alerts.value)

function alertStatusLabel(alert) {
  const status = String(alert.status || '').toLowerCase()

  if (status === 'queued') return t('preschoolGuardianCommunicationPage.status.queued')
  if (status === 'sent') return t('preschoolGuardianCommunicationPage.status.sent')
  if (status === 'acknowledged') return t('preschoolGuardianCommunicationPage.status.acknowledged')
  if (status === 'cancelled') return t('preschoolGuardianCommunicationPage.status.cancelled')

  return status || t('common.unknown')
}

function followUpStatusLabel(alert) {
  const status = String(alert.followUpStatus || '').toLowerCase()

  if (status === 'overdue') return t('preschoolAttendanceAlertsPage.labels.overdueAlerts')
  if (status === 'acknowledged') return t('preschoolAttendanceAlertsPage.labels.acknowledgedAlerts')
  if (status === 'open') return t('preschoolAttendanceAlertsPage.labels.openAlerts')
  if (status === 'cancelled') return t('preschoolGuardianCommunicationPage.status.cancelled')

  return '—'
}

function severityLabel(severity) {
  const normalized = String(severity || '').toLowerCase()

  if (normalized === 'low') return t('preschoolGuardianCommunicationPage.severity.low')
  if (normalized === 'medium') return t('preschoolGuardianCommunicationPage.severity.medium')
  if (normalized === 'high') return t('preschoolGuardianCommunicationPage.severity.high')
  if (normalized === 'critical') return t('preschoolGuardianCommunicationPage.severity.critical')

  return normalized || t('common.unknown')
}

function severityClass(severity) {
  const normalized = String(severity || '').toLowerCase()
  if (normalized === 'critical') return 'bg-rose-100 text-rose-700'
  if (normalized === 'high') return 'bg-orange-100 text-orange-700'
  if (normalized === 'medium') return 'bg-amber-100 text-amber-700'
  return 'bg-sky-100 text-sky-700'
}

function alertTypeLabel(alert) {
  if (alert.alertLabel) return alert.alertLabel
  if (alert.alertType === 'repeated_absence') return t('preschoolAttendanceAlertsPage.labels.repeatedAbsence')
  if (alert.alertType === 'late_pattern') return 'Late Pattern'
  if (alert.alertType === 'attendance_exception') return 'Attendance Exception'
  return alert.alertType || t('common.unknown')
}

function thresholdText(alert) {
  const absenceCount = alert.absenceCount
  const threshold = alert.threshold ?? selectedThreshold.value

  if (absenceCount === null || absenceCount === undefined) {
    return '—'
  }

  return threshold ? `${absenceCount} / ${threshold}` : String(absenceCount)
}

async function loadClasses() {
  try {
    const response = await fetchPreschoolClasses({ page: 1, perPage: 100 })
    classOptions.value = (response.items || []).map((classRecord) => ({
      label: classRecord.name,
      value: classRecord.id,
    }))
  } catch {
    classOptions.value = []
  }
}

async function loadSettings() {
  try {
    const settings = await fetchAttendanceSettings()
    setAttendanceConfigurationSnapshot({ settings })
    selectedThreshold.value = getAbsenceAlertDays() || selectedThreshold.value
  } catch {
    // Keep the current threshold when settings are unavailable.
  }
}

async function loadAlerts() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchPreschoolAttendanceAlerts({
      classId: selectedClassId.value || undefined,
      status: selectedStatus.value || undefined,
      dateFrom: selectedDateFrom.value || undefined,
      dateTo: selectedDateTo.value || undefined,
      threshold: selectedThreshold.value || undefined,
      perPage: 100,
      page: 1,
    })

    alerts.value = response.items || []
    summary.value = response.summary || summary.value
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolAttendanceAlertsPage.messages.loadFailed')
    alerts.value = []
    summary.value = {
      total: 0,
      open: 0,
      acknowledged: 0,
      overdue: 0,
      byClass: [],
      bySeverity: [],
    }
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  void loadAlerts()
}

function resetFilters() {
  selectedClassId.value = ''
  selectedStatus.value = ''
  selectedThreshold.value = getAbsenceAlertDays() || 3
  selectedDateFrom.value = ''
  selectedDateTo.value = ''
  void loadAlerts()
}

function goBack() {
  router.push({ name: 'dashboard-preschool-admin-attendance' })
}

onMounted(async () => {
  await Promise.all([loadClasses(), loadSettings()])
  await loadAlerts()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolAttendanceAlertsPage.title')"
        :subtitle="t('preschoolAttendanceAlertsPage.subtitle')"
      />

      <p class="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {{ t('preschoolAttendanceAlertsPage.labels.alertCreatedFromAttendanceRecord') }}
      </p>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-end gap-3">
          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAttendanceAlertsPage.filters.class') }}</span>
            <select v-model="selectedClassId" class="h-10 min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
              <option value="">{{ t('preschoolAttendanceAlertsPage.filters.allClasses') }}</option>
              <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAttendanceAlertsPage.labels.alertStatus') }}</span>
            <select v-model="selectedStatus" class="h-10 min-w-[170px] rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
              <option v-for="option in statusOptions" :key="option.value || 'all'" :value="option.value">{{ option.label }}</option>
            </select>
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAttendanceAlertsPage.labels.consecutiveAbsences') }}</span>
            <select v-model="selectedThreshold" class="h-10 min-w-[150px] rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
              <option v-for="value in thresholdOptions" :key="value" :value="value">{{ value }}</option>
            </select>
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAttendanceAlertsPage.filters.dateFrom') }}</span>
            <input v-model="selectedDateFrom" type="date" class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAttendanceAlertsPage.filters.dateTo') }}</span>
            <input v-model="selectedDateTo" type="date" class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
          </label>

          <Button type="button" variant="primary" size="md" rounded="xl" :loading="loading" @click="applyFilters">
            {{ t('preschoolAttendanceAlertsPage.actions.apply') }}
          </Button>
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="resetFilters">
            {{ t('preschoolAttendanceAlertsPage.actions.reset') }}
          </Button>
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="goBack">
            {{ t('preschoolAttendanceAlertsPage.actions.back') }}
          </Button>
        </div>
      </div>

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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

      <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
        {{ t('preschoolAttendanceAlertsPage.messages.loading') }}
      </div>
      <div v-else-if="!visibleAlerts.length" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
        {{ t('preschoolAttendanceAlertsPage.labels.noAttendanceAlerts') }}
      </div>
      <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-4 py-3">
          <span class="text-sm font-semibold text-slate-900">{{ summary.total }} {{ t('preschoolAttendanceAlertsPage.labels.attendanceAlerts') }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceAlertsPage.columns.student') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceAlertsPage.columns.class') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceAlertsPage.columns.guardian') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceAlertsPage.columns.alertType') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceAlertsPage.columns.status') }}</th>
                <th class="px-4 py-3 text-center font-semibold">{{ t('preschoolAttendanceAlertsPage.columns.consecutiveAbsences') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceAlertsPage.columns.severity') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceAlertsPage.columns.createdAt') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceAlertsPage.columns.guardianFollowUp') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="alert in visibleAlerts" :key="alert.id" data-testid="attendance-alert-row">
                <td class="px-4 py-3 font-medium text-slate-900">{{ alert.studentName || '—' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ alert.className || '—' }}</td>
                <td class="px-4 py-3 text-slate-600">
                  <div class="font-medium text-slate-900">{{ alert.guardianName || '—' }}</div>
                  <div class="text-xs text-slate-500">{{ alert.guardianPhone || '—' }}</div>
                </td>
                <td class="px-4 py-3">
                  <div class="font-medium text-slate-900">{{ alertTypeLabel(alert) }}</div>
                  <div class="text-xs text-slate-500">{{ alert.sourceType || '—' }}</div>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {{ alertStatusLabel(alert) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center text-slate-700">{{ thresholdText(alert) }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="severityClass(alert.severity)">
                    {{ severityLabel(alert.severity) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-500">{{ alert.createdAt ? formatDate(alert.createdAt) : '—' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ followUpStatusLabel(alert) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
