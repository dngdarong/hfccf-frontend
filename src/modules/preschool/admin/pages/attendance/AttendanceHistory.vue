<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import { formatDate } from '@/utils/date'
import {
  fetchPreschoolAttendance,
  fetchPreschoolClasses,
} from '@/modules/preschool/services/preschoolApi'

defineOptions({ name: 'PreschoolAdminAttendanceHistoryPage' })

const { t } = useLanguage()
const router = useRouter()

const records = ref([])
const classOptions = ref([])
const loading = ref(false)
const loadingClasses = ref(false)
const errorMessage = ref('')
const pagination = ref({ page: 1, perPage: 20, total: 0, totalPages: 1 })

const filters = ref({
  search: '',
  classId: '',
  status: '',
  date: '',
})

const statusOptions = [
  { value: '', label: '' },
  { value: 'present', label: 'present' },
  { value: 'absent', label: 'absent' },
  { value: 'late', label: 'late' },
  { value: 'excused', label: 'excused' },
]

function getTypeColumnLabel() {
  return t('preschoolAdminAttendanceHistoryPage.columns.student')
}

function getSearchPlaceholder() {
  return t('preschoolAdminAttendanceHistoryPage.placeholders.searchStudent')
    || t('preschoolAdminAttendanceHistoryPage.placeholders.search')
}

const STATUS_STYLE = {
  present: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  absent: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  late: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  excused: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
}

function buildStatusLabel(status) {
  if (!status) return '—'
  return t(`preschoolAttendanceStatus.${status}`) || status
}

async function loadClasses() {
  loadingClasses.value = true
  try {
    const res = await fetchPreschoolClasses({ page: 1, perPage: 100 })
    classOptions.value = (res.items || []).map((c) => ({
      label: c.name || c.code || String(c.id),
      value: c.id,
    }))
  } catch {
    classOptions.value = []
  } finally {
    loadingClasses.value = false
  }
}

async function loadRecords(page = 1) {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await fetchPreschoolAttendance({
      page,
      perPage: pagination.value.perPage,
      search: filters.value.search.trim(),
      classId: filters.value.classId,
      status: filters.value.status,
      attendanceDate: filters.value.date,
    })
    records.value = res.items || []
    pagination.value = {
      page: res.pagination?.page || page,
      perPage: res.pagination?.perPage || pagination.value.perPage,
      total: res.pagination?.total || records.value.length,
      totalPages: res.pagination?.totalPages || 1,
    }
  } catch (e) {
    errorMessage.value = e?.message || t('preschoolAdminAttendanceHistoryPage.messages.loadFailed')
    records.value = []
    pagination.value = { page, perPage: pagination.value.perPage, total: 0, totalPages: 1 }
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  loadRecords(1)
}

function goToPage(nextPage) {
  if (nextPage < 1 || nextPage > pagination.value.totalPages || nextPage === pagination.value.page) return
  loadRecords(nextPage)
}

onMounted(async () => {
  await loadClasses()
  await loadRecords(1)
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolAdminAttendanceHistoryPage.title')"
        :subtitle="t('preschoolAdminAttendanceHistoryPage.subtitle')"
      />

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid gap-3 lg:grid-cols-5">
          <label class="flex flex-col gap-1.5 lg:col-span-2">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {{ t('preschoolAdminAttendanceHistoryPage.filters.search') }}
            </span>
            <input
              v-model="filters.search"
              type="text"
              class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-300"
              :placeholder="getSearchPlaceholder()"
            >
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {{ t('preschoolAdminAttendanceHistoryPage.filters.class') }}
            </span>
            <Select
              v-model="filters.classId"
              :options="classOptions"
              option-label="label"
              option-value="value"
              class="min-w-[180px]"
              :placeholder="t('preschoolAdminAttendanceHistoryPage.filters.allClasses')"
              :loading="loadingClasses"
            />
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {{ t('preschoolAdminAttendanceHistoryPage.filters.status') }}
            </span>
            <select
              v-model="filters.status"
              class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              <option value="">{{ t('preschoolAdminAttendanceHistoryPage.filters.allStatuses') }}</option>
              <option v-for="opt in statusOptions.slice(1)" :key="opt.value" :value="opt.value">
                {{ t(`preschoolAttendanceStatus.${opt.value}`) || opt.value }}
              </option>
            </select>
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {{ t('preschoolAdminAttendanceHistoryPage.filters.date') }}
            </span>
            <input
              v-model="filters.date"
              type="date"
              class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
          </label>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <Button type="button" variant="primary" size="md" rounded="xl" :loading="loading" @click="applyFilters">
            {{ t('preschoolAdminAttendanceHistoryPage.actions.apply') }}
          </Button>
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="router.push({ name: 'dashboard-preschool-admin-attendance' })">
            {{ t('preschoolAdminAttendanceHistoryPage.actions.back') }}
          </Button>
        </div>
      </div>

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
        {{ t('preschoolReportsShared.loading') }}
      </div>

      <div v-else-if="!records.length" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
        {{ t('preschoolAdminAttendanceHistoryPage.messages.empty') }}
      </div>

      <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="w-16 px-4 py-3 font-semibold">{{ t('preschoolAdminAttendanceHistoryPage.columns.no') }}</th>
                <th class="px-4 py-3 font-semibold">{{ getTypeColumnLabel() }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAdminAttendanceHistoryPage.columns.class') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAdminAttendanceHistoryPage.columns.date') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceSessionsPage.title') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAdminAttendanceHistoryPage.columns.status') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAdminAttendanceHistoryPage.columns.note') }}</th>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAdminAttendanceHistoryPage.columns.recordedBy') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="(record, index) in records" :key="record.id || `record-${record.attendanceDate}-${index}`">
                <td class="px-4 py-3 text-slate-400 tabular-nums">
                  {{ (pagination.page - 1) * pagination.perPage + index + 1 }}
                </td>
                <td class="px-4 py-3">
                  <p class="font-medium text-slate-900">{{ record.studentName || record.studentFullName || record.student || '—' }}</p>
                  <p v-if="record.studentId" class="text-xs text-slate-400">#{{ record.studentId }}</p>
                </td>
                <td class="px-4 py-3 text-slate-600">
                  {{ record.className || '—' }}
                </td>
                <td class="px-4 py-3 text-slate-700">
                  {{ formatDate(record.attendanceDate) }}
                </td>
                <td class="px-4 py-3 text-slate-600">
                  <div v-if="record.attendanceSession || record.attendanceSessionId" class="space-y-0.5">
                    <p class="font-medium text-slate-900">
                      {{ record.attendanceSession?.className || record.className || '—' }}
                    </p>
                    <p class="text-xs text-slate-400">
                      {{ record.attendanceSession?.attendanceDate || record.attendanceDate || '—' }}
                      <span v-if="record.attendanceSession?.startTime || record.attendanceSession?.endTime">
                        · {{ record.attendanceSession?.startTime || '--:--' }} - {{ record.attendanceSession?.endTime || '--:--' }}
                      </span>
                    </p>
                  </div>
                  <span v-else class="text-xs text-slate-400">{{ t('preschoolAttendanceSessionsPage.manualSession') }}</span>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    :class="STATUS_STYLE[record.status] || 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'"
                  >
                    {{ buildStatusLabel(record.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-500">
                  {{ record.note || '—' }}
                </td>
                <td class="px-4 py-3 text-slate-500">
                  {{ record.recordedByName || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p class="text-xs text-slate-400">
            {{ t('preschoolAdminAttendanceHistoryPage.pagination.summary', { page: pagination.page, lastPage: pagination.totalPages, total: pagination.total }) }}
          </p>
          <div class="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              rounded="xl"
              :disabled="pagination.page <= 1 || loading"
              @click="goToPage(pagination.page - 1)"
            >
              {{ t('preschoolAdminAttendanceHistoryPage.pagination.previous') }}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              rounded="xl"
              :disabled="pagination.page >= pagination.totalPages || loading"
              @click="goToPage(pagination.page + 1)"
            >
              {{ t('preschoolAdminAttendanceHistoryPage.pagination.next') }}
            </Button>
          </div>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
