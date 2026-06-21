<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { formatDate } from '@/utils/date'
import { fetchPreschoolAttendance, fetchPreschoolClasses } from '@/modules/preschool/services/preschoolApi'
import {
  fetchAttendanceSettings,
} from '@/modules/preschool/services/api/preschoolAttendanceConfigurationApi'
import {
  getAbsenceAlertDays,
  setAttendanceConfigurationSnapshot,
} from '@/modules/preschool/services/preschoolAttendanceConfigurationService'

defineOptions({ name: 'PreschoolAdminAttendanceAlertsPage' })

const { t } = useLanguage()
const router = useRouter()

const records = ref([])
const classOptions = ref([])
const loading = ref(false)
const errorMessage = ref('')
const selectedClassId = ref('')
const threshold = ref(getAbsenceAlertDays() || 3)

const thresholdOptions = [3, 5, 7, 10]

// Build consecutive-absence streaks from the raw records
const alerts = computed(() => {
  if (!records.value.length) return []

  // Group records by student
  const studentMap = {}
  for (const r of records.value) {
    const key = r.studentId
    if (!studentMap[key]) studentMap[key] = { name: r.studentName, className: r.className, records: [] }
    studentMap[key].records.push(r)
  }

  const results = []
  for (const [, data] of Object.entries(studentMap)) {
    // Sort dates descending
    const sorted = [...data.records].sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate))

    // Count consecutive non-present days from the most recent record
    let streak = 0
    let lastPresent = null
    for (const rec of sorted) {
      if (rec.status === 'present') {
        lastPresent = rec.attendanceDate
        break
      }
      streak++
    }

    if (streak >= threshold.value) {
      results.push({ name: data.name, className: data.className, streak, lastPresent })
    }
  }

  return results.sort((a, b) => b.streak - a.streak)
})

function severityLabel(streak) {
  if (streak >= 7) return t('preschoolAttendanceAlertsPage.severity.critical')
  if (streak >= 5) return t('preschoolAttendanceAlertsPage.severity.warning')
  return t('preschoolAttendanceAlertsPage.severity.watch')
}

function severityClass(streak) {
  if (streak >= 7) return 'bg-rose-100 text-rose-700'
  if (streak >= 5) return 'bg-amber-100 text-amber-700'
  return 'bg-sky-100 text-sky-700'
}

async function loadClasses() {
  try {
    const res = await fetchPreschoolClasses({ page: 1, perPage: 100 })
    classOptions.value = (res.items || []).map((c) => ({ label: c.name, value: c.id }))
  } catch { classOptions.value = [] }
}

async function loadData() {
  if (!selectedClassId.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    // Fetch last 30 days of data
    const dateTo = new Date().toISOString().slice(0, 10)
    const dateFromDate = new Date()
    dateFromDate.setDate(dateFromDate.getDate() - 30)
    const dateFrom = dateFromDate.toISOString().slice(0, 10)

    const res = await fetchPreschoolAttendance({
      classId: selectedClassId.value,
      dateFrom,
      dateTo,
      page: 1,
      perPage: 500,
    })
    records.value = res.items || []
  } catch (e) {
    errorMessage.value = e?.message || t('preschoolAttendanceAlertsPage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadClasses()

  try {
    const settings = await fetchAttendanceSettings()
    setAttendanceConfigurationSnapshot({ settings })
    threshold.value = getAbsenceAlertDays() || threshold.value
  } catch {
    // Fall back to the default threshold when settings are unavailable.
  }
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolAttendanceAlertsPage.title')"
        :subtitle="t('preschoolAttendanceAlertsPage.subtitle')"
      />

      <!-- Filters -->
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-end gap-3">
          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAttendanceAlertsPage.filters.class') }}</span>
            <select v-model="selectedClassId" class="h-10 min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
              <option value="">{{ t('preschoolAttendanceAlertsPage.filters.allClasses') }}</option>
              <option v-for="c in classOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAttendanceAlertsPage.filters.threshold') }}</span>
            <select v-model="threshold" class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
              <option v-for="n in thresholdOptions" :key="n" :value="n">{{ t('preschoolAttendanceAlertsPage.filters.thresholdDays', { n }) }}</option>
            </select>
          </label>
          <Button type="button" variant="primary" size="md" rounded="xl" :loading="loading" :disabled="!selectedClassId" @click="loadData">
            {{ t('preschoolAttendanceAlertsPage.actions.apply') }}
          </Button>
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="router.push({ name: 'dashboard-preschool-admin-attendance' })">
            {{ t('preschoolAttendanceAlertsPage.actions.back') }}
          </Button>
        </div>
      </div>

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ errorMessage }}</div>

      <!-- Empty / prompt states -->
      <div v-if="!selectedClassId" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
        {{ t('preschoolAttendanceAlertsPage.messages.empty') }}
      </div>
      <div v-else-if="loading" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
        {{ t('preschoolAttendanceAlertsPage.messages.loading') }}
      </div>
      <div v-else-if="!alerts.length && records.length" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-10 text-center text-sm text-emerald-700">
        {{ t('preschoolAttendanceAlertsPage.messages.noAlerts') }}
      </div>

      <!-- Alerts table -->
      <div v-else-if="alerts.length" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-4 py-3">
          <span class="text-sm font-semibold text-slate-900">{{ alerts.length }} {{ alerts.length === 1 ? 'student' : 'students' }} flagged</span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceAlertsPage.columns.student') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceAlertsPage.columns.class') }}</th>
                <th class="px-4 py-3 text-center font-semibold">{{ t('preschoolAttendanceAlertsPage.columns.streak') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceAlertsPage.columns.lastPresent') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceAlertsPage.columns.severity') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="alert in alerts" :key="alert.name + alert.className">
                <td class="px-4 py-3 font-medium text-slate-900">{{ alert.name }}</td>
                <td class="px-4 py-3 text-slate-600">{{ alert.className }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold" :class="severityClass(alert.streak)">
                    {{ alert.streak }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-500">{{ alert.lastPresent ? formatDate(alert.lastPresent) : '—' }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="severityClass(alert.streak)">
                    {{ severityLabel(alert.streak) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
