<script setup>
// Keep export governance on its own admin page so institutional exports,
// snapshot-backed downloads, and historical comparison stay read-only and
// separate from live report editing surfaces.
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import { usePreschoolAcademicLifecycle } from '@/modules/preschool/composables/usePreschoolAcademicLifecycle'
import { fetchPreschoolClasses, fetchPreschoolStudents } from '@/modules/preschool/services/preschoolApi'
import { fetchReportPeriods } from '@/modules/preschool/services/api/preschoolReportsApi'
import ReportSummaryCard from '@/modules/preschool/shared/components/report/ReportSummaryCard.vue'
import ExportHistoryTable from '@/modules/preschool/shared/components/report/ExportHistoryTable.vue'
import ExportDetailDialog from '@/modules/preschool/shared/components/report/ExportDetailDialog.vue'
import HistoricalComparisonPanel from '@/modules/preschool/shared/components/report/HistoricalComparisonPanel.vue'
import InstitutionalTimeline from '@/modules/preschool/shared/components/report/InstitutionalTimeline.vue'
import {
  compareExportGovernanceContexts,
  downloadExportGovernanceCsv,
  fetchExportGovernanceAnalytics,
  fetchExportGovernanceComparisonOptions,
  fetchExportGovernanceHistory,
  fetchExportGovernanceRecord,
  fetchExportGovernanceTimeline,
} from '@/modules/preschool/services/api/preschoolExportGovernanceApi'
import {
  ROUTE_NAMES,
  DEFAULT_FILTERS,
  DEFAULT_PAGINATION,
  DEFAULT_ANALYTICS,
  DEFAULT_COMPARISON_OPTIONS,
} from './constants/reportExportGovernanceConstants'
import {
  buildExportTypeOptions,
  buildExportFormatOptions,
  buildSourceOptions,
  buildAcademicYearOptions,
  buildTermOptions,
  buildReportPeriodFilterOptions,
  buildActorFilterOptions,
  buildSummaryCards,
  buildClassOptions,
  buildStudentOptions,
  buildReportPeriodOptions,
  exportQuery,
  downloadCsvFile,
} from './utils/reportExportGovernanceHelpers'

defineOptions({
  name: 'PreschoolReportExportGovernancePage',
})

const router = useRouter()
const { t } = useLanguage()
const { academicYears, terms, loadAcademicLifecycle } = usePreschoolAcademicLifecycle()

const loading = ref(false)
const timelineLoading = ref(false)
const comparisonLoading = ref(false)
const detailLoading = ref(false)
const errorMessage = ref('')
const analyticsError = ref('')
const historyItems = ref([])
const analytics = ref({ ...DEFAULT_ANALYTICS })
const comparisonOptions = ref({ ...DEFAULT_COMPARISON_OPTIONS })
const comparisonResult = ref(null)
const timelineItems = ref([])
const detailVisible = ref(false)
const selectedRecord = ref(null)
const selectedRecordDetail = ref(null)
const pagination = ref({ ...DEFAULT_PAGINATION })

const classOptions = ref([])
const studentOptions = ref([])
const reportPeriodOptions = ref([])

const filters = ref({ ...DEFAULT_FILTERS })

const exportTypeOptions = computed(() => buildExportTypeOptions(t))

const exportFormatOptions = computed(() => buildExportFormatOptions(t))

const sourceOptions = computed(() => buildSourceOptions(t))

const academicYearOptions = computed(() => buildAcademicYearOptions(t, academicYears.value))

const termOptions = computed(() => buildTermOptions(t, terms.value))

const reportPeriodFilterOptions = computed(() => buildReportPeriodFilterOptions(t, reportPeriodOptions.value))

const actorFilterOptions = computed(() => buildActorFilterOptions(t, analytics.value.actorCounts))

const summaryCards = computed(() => buildSummaryCards(t, analytics.value))

function getExportQuery() {
  return exportQuery(filters.value)
}

async function loadLookupOptions() {
  try {
    const [classesResponse, studentsResponse, reportPeriodsResponse] = await Promise.all([
      fetchPreschoolClasses({ page: 1, perPage: 100 }),
      fetchPreschoolStudents({ page: 1, perPage: 100 }),
      fetchReportPeriods(),
    ])

    classOptions.value = buildClassOptions(classesResponse.items || [])
    studentOptions.value = buildStudentOptions(studentsResponse.items || [])
    reportPeriodOptions.value = buildReportPeriodOptions(reportPeriodsResponse || [])
  } catch {
    classOptions.value = []
    studentOptions.value = []
    reportPeriodOptions.value = []
  }
}

async function loadAnalytics() {
  analyticsError.value = ''

  try {
    analytics.value = await fetchExportGovernanceAnalytics(getExportQuery())
  } catch (error) {
    analytics.value = { ...DEFAULT_ANALYTICS }
    analyticsError.value = error?.message || t('preschoolExportGovernancePage.errors.analytics')
  }
}

async function loadComparisonOptions() {
  try {
    comparisonOptions.value = await fetchExportGovernanceComparisonOptions(getExportQuery())
  } catch {
    comparisonOptions.value = { ...DEFAULT_COMPARISON_OPTIONS }
  }
}

async function loadHistory(page = 1) {
  loading.value = true
  errorMessage.value = ''

  try {
    const payload = await fetchExportGovernanceHistory({
      ...getExportQuery(),
      page,
      perPage: pagination.value.perPage,
    })

    historyItems.value = payload.items || []
    pagination.value = {
      page: payload.pagination?.page || page,
      perPage: payload.pagination?.perPage || pagination.value.perPage,
      total: payload.pagination?.total || 0,
      totalPages: payload.pagination?.totalPages || 1,
    }
  } catch (error) {
    historyItems.value = []
    errorMessage.value = error?.message || t('preschoolExportGovernancePage.errors.history')
  } finally {
    loading.value = false
  }
}

async function loadTimeline() {
  timelineLoading.value = true

  try {
    timelineItems.value = await fetchExportGovernanceTimeline({
      ...getExportQuery(),
      limit: 50,
    })
  } catch {
    timelineItems.value = []
  } finally {
    timelineLoading.value = false
  }
}

async function reloadAll(page = pagination.value.page || 1) {
  await Promise.all([
    loadAnalytics(),
    loadComparisonOptions(),
    loadHistory(page),
    loadTimeline(),
  ])
}

function applyFilters() {
  pagination.value.page = 1
  reloadAll(1)
}

async function openRecordDetail(record) {
  selectedRecord.value = record
  selectedRecordDetail.value = null
  detailVisible.value = true
  detailLoading.value = true

  try {
    selectedRecordDetail.value = await fetchExportGovernanceRecord(record.id)
  } catch (error) {
    selectedRecordDetail.value = null
    errorMessage.value = error?.message || t('preschoolExportGovernancePage.errors.history')
  } finally {
    detailLoading.value = false
  }
}

async function downloadRecord(record) {
  try {
    const blob = await downloadExportGovernanceCsv(record.id)
    downloadCsvFile({ blob, fileName: record.fileName, id: record.id })
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolExportGovernancePage.errors.history')
  }
}

async function runComparison(payload) {
  comparisonLoading.value = true

  try {
    comparisonResult.value = await compareExportGovernanceContexts(payload)
  } catch {
    comparisonResult.value = null
  } finally {
    comparisonLoading.value = false
  }
}

function goToSnapshotArchive() {
  router.push({ name: ROUTE_NAMES.SNAPSHOT_ARCHIVE })
}

function goToAuditLogs() {
  router.push({ name: ROUTE_NAMES.AUDIT_LOGS })
}

function handlePageChange(nextPage) {
  pagination.value.page = nextPage
  loadHistory(nextPage)
}

onMounted(async () => {
  await loadAcademicLifecycle()
  await loadLookupOptions()
  await reloadAll(1)
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolExportGovernancePage.title')"
        :subtitle="t('preschoolExportGovernancePage.subtitle')"
      />

      <div class="flex flex-wrap gap-2">
        <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToSnapshotArchive">
          {{ t('preschoolExportGovernancePage.actions.openSnapshotArchive') }}
        </Button>
        <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToAuditLogs">
          {{ t('preschoolExportGovernancePage.actions.openAuditLogs') }}
        </Button>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportSummaryCard
          v-for="card in summaryCards"
          :key="card.title"
          :title="card.title"
          :value="card.value"
          :caption="card.caption"
        />
      </div>

      <div
        v-if="analyticsError"
        class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      >
        {{ analyticsError }}
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid gap-3 lg:grid-cols-4">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolExportGovernancePage.filters.exportType') }}</span>
            <Select v-model="filters.exportType" :options="exportTypeOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolExportGovernancePage.filters.exportFormat') }}</span>
            <Select v-model="filters.exportFormat" :options="exportFormatOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolExportGovernancePage.filters.exportSource') }}</span>
            <Select v-model="filters.source" :options="sourceOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolExportGovernancePage.filters.actor') }}</span>
            <Select v-model="filters.actorUserId" :options="actorFilterOptions" option-label="label" option-value="value" class="w-full" />
          </label>
        </div>

        <div class="mt-4 grid gap-3 lg:grid-cols-4">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolExportGovernancePage.filters.academicYear') }}</span>
            <Select v-model="filters.academicYearId" :options="academicYearOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolExportGovernancePage.filters.term') }}</span>
            <Select v-model="filters.termId" :options="termOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolExportGovernancePage.filters.reportPeriod') }}</span>
            <Select v-model="filters.reportPeriodId" :options="reportPeriodFilterOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolExportGovernancePage.filters.search') }}</span>
            <InputText v-model="filters.search" class="w-full" :placeholder="t('preschoolExportGovernancePage.filters.searchPlaceholder')" />
          </label>
        </div>

        <div class="mt-4 grid gap-3 lg:grid-cols-4">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolExportGovernancePage.filters.exportedFrom') }}</span>
            <InputText v-model="filters.exportedFrom" type="date" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolExportGovernancePage.filters.exportedTo') }}</span>
            <InputText v-model="filters.exportedTo" type="date" class="w-full" />
          </label>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="applyFilters">
            {{ t('preschoolExportGovernancePage.actions.refresh') }}
          </Button>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolExportGovernancePage.history.title') }}</h3>
            <p class="text-sm text-slate-500">{{ t('preschoolExportGovernancePage.history.subtitle') }}</p>
          </div>
        </div>
        <div v-if="errorMessage" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ errorMessage }}
        </div>
        <ExportHistoryTable
          class="mt-4"
          :items="historyItems"
          :loading="loading"
          @view="openRecordDetail"
          @download="downloadRecord"
        />

        <div class="mt-4 flex items-center justify-between text-sm text-slate-500">
          <p>{{ t('preschoolExportGovernancePage.pagination.summary', { total: pagination.total || historyItems.length }) }}</p>
          <p>{{ t('preschoolExportGovernancePage.pagination.page', { page: pagination.page || 1, totalPages: pagination.totalPages || 1 }) }}</p>
        </div>
        <div class="mt-3 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" rounded="lg" :disabled="pagination.page <= 1" @click="handlePageChange((pagination.page || 1) - 1)">
            {{ t('preschoolExportGovernancePage.pagination.previous') }}
          </Button>
          <Button type="button" variant="ghost" size="sm" rounded="lg" :disabled="pagination.page >= pagination.totalPages" @click="handlePageChange((pagination.page || 1) + 1)">
            {{ t('preschoolExportGovernancePage.pagination.next') }}
          </Button>
        </div>
      </div>

      <HistoricalComparisonPanel
        :options="comparisonOptions"
        :academic-years="academicYears"
        :terms="terms"
        :report-periods="reportPeriodOptions"
        :classes="classOptions"
        :students="studentOptions"
        :loading="comparisonLoading"
        :result="comparisonResult"
        @compare="runComparison"
      />

      <InstitutionalTimeline
        :items="timelineItems"
        :loading="timelineLoading"
      />

      <ExportDetailDialog
        v-model:visible="detailVisible"
        :loading="detailLoading"
        :record="selectedRecord"
        :detail="selectedRecordDetail"
        @download="downloadRecord"
      />
    </section>
  </MainLayout>
</template>
