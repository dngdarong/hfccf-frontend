<script setup>
// Keep the snapshot archive as an admin-only institutional reporting page so
// leadership can browse immutable history without mutating the underlying
// snapshot payloads or mixing the workflow into live report pages.
import { computed, onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import { useLanguage } from '@/composables/useLanguage'
import { usePreschoolAcademicLifecycle } from '@/modules/preschool/composables/usePreschoolAcademicLifecycle'
import { fetchPreschoolClasses, fetchPreschoolStudents } from '@/modules/preschool/services/preschoolApi'
import { fetchReportPeriods } from '@/modules/preschool/services/api/preschoolReportsApi'
import {
  exportSnapshotArchiveCsv,
  fetchSnapshotArchive,
  fetchSnapshotArchiveAnalytics,
  fetchSnapshotArchiveItem,
} from '@/modules/preschool/services/api/preschoolSnapshotArchiveApi'
import SnapshotAnalyticsCards from '@/modules/preschool/shared/components/report/SnapshotAnalyticsCards.vue'
import SnapshotArchiveTable from '@/modules/preschool/shared/components/report/SnapshotArchiveTable.vue'
import SnapshotDetailDialog from '@/modules/preschool/shared/components/report/SnapshotDetailDialog.vue'
import { DEFAULT_PAGINATION } from './constants/reportSnapshotArchiveConstants'

defineOptions({
  name: 'PreschoolReportSnapshotArchivePage',
})

const { t } = useLanguage()
const { academicYears, terms, loadAcademicLifecycle } = usePreschoolAcademicLifecycle()

const loading = ref(false)
const analyticsLoading = ref(false)
const exporting = ref(false)
const detailLoading = ref(false)
const errorMessage = ref('')
const analyticsError = ref('')
const archiveItems = ref([])
const analytics = ref({
  overview: {},
  typeCounts: [],
  stateCounts: [],
  academicYearCounts: [],
  termCounts: [],
  reportPeriodCounts: [],
  classComparison: [],
  generatedByCounts: [],
  generatedTrend: [],
})
const pagination = ref({ ...DEFAULT_PAGINATION })
const detailVisible = ref(false)
const selectedSnapshot = ref(null)
const selectedPreviousSnapshot = ref(null)
const selectedComparison = ref(null)
const selectedAuditTrail = ref([])

const classOptions = ref([])
const studentOptions = ref([])
const reportPeriodOptions = ref([])
const generatedByOptions = ref([])

const filters = ref({
  academicYearId: '',
  termId: '',
  reportPeriodId: '',
  classId: '',
  studentId: '',
  snapshotType: '',
  lifecycleState: '',
  generatedFrom: '',
  generatedTo: '',
  generatedBy: '',
  search: '',
})

const snapshotTypeOptions = computed(() => [
  { label: t('preschoolSnapshotArchivePage.filters.allSnapshotTypes'), value: '' },
  { label: t('preschoolSnapshotArchivePage.snapshotTypes.studentReport'), value: 'student_report' },
  { label: t('preschoolSnapshotArchivePage.snapshotTypes.classroomReport'), value: 'classroom_report' },
  { label: t('preschoolSnapshotArchivePage.snapshotTypes.progressSummary'), value: 'progress_summary' },
])

const lifecycleStateOptions = computed(() => [
  { label: t('preschoolSnapshotArchivePage.filters.allStates'), value: '' },
  { label: t('preschoolReportSnapshots.states.finalized'), value: 'finalized' },
  { label: t('preschoolReportSnapshots.states.locked'), value: 'locked' },
  { label: t('preschoolReportSnapshots.states.archived'), value: 'archived' },
])

const academicYearOptions = computed(() => [
  { label: t('preschoolSnapshotArchivePage.filters.allAcademicYears'), value: '' },
  ...academicYears.value.map((year) => ({
    label: year.label || year.code || `#${year.id}`,
    value: String(year.id || ''),
  })),
])

const termOptions = computed(() => [
  { label: t('preschoolSnapshotArchivePage.filters.allTerms'), value: '' },
  ...terms.value.map((term) => ({
    label: term.name || term.code || `#${term.id}`,
    value: String(term.id || ''),
  })),
])

const classFilterOptions = computed(() => [
  { label: t('preschoolSnapshotArchivePage.filters.allClasses'), value: '' },
  ...classOptions.value.map((item) => ({
    label: item.label,
    value: String(item.value),
  })),
])

const studentFilterOptions = computed(() => [
  { label: t('preschoolSnapshotArchivePage.filters.allStudents'), value: '' },
  ...studentOptions.value.map((item) => ({
    label: item.label,
    value: String(item.value),
  })),
])

const reportPeriodFilterOptions = computed(() => [
  { label: t('preschoolSnapshotArchivePage.filters.allReportPeriods'), value: '' },
  ...reportPeriodOptions.value.map((item) => ({
    label: item.label,
    value: String(item.value),
  })),
])

const generatedByFilterOptions = computed(() => [
  { label: t('preschoolSnapshotArchivePage.filters.allGeneratedBy'), value: '' },
  ...generatedByOptions.value.map((item) => ({
    label: item.label,
    value: String(item.value),
  })),
])

function snapshotQuery() {
  return {
    academicYearId: filters.value.academicYearId,
    termId: filters.value.termId,
    reportPeriodId: filters.value.reportPeriodId,
    classId: filters.value.classId,
    studentId: filters.value.studentId,
    snapshotType: filters.value.snapshotType,
    lifecycleState: filters.value.lifecycleState,
    generatedFrom: filters.value.generatedFrom,
    generatedTo: filters.value.generatedTo,
    generatedBy: filters.value.generatedBy,
    search: filters.value.search,
  }
}

async function loadLookupOptions() {
  const [classesResponse, studentsResponse, reportPeriodsResponse] = await Promise.all([
    fetchPreschoolClasses({ page: 1, perPage: 100 }),
    fetchPreschoolStudents({ page: 1, perPage: 100 }),
    fetchReportPeriods(),
  ])

  classOptions.value = (classesResponse.items || []).map((item) => ({
    label: item.name || item.code || `#${item.id}`,
    value: item.id,
    raw: item,
  }))

  studentOptions.value = (studentsResponse.items || []).map((item) => ({
    label: `${item.fullName || item.name}${(item.publicId || item.studentCode) ? ` (${item.publicId || item.studentCode})` : ''}`,
    value: item.id,
    raw: item,
  }))

  reportPeriodOptions.value = (reportPeriodsResponse || []).map((period) => ({
    label: `${period.label || period.periodLabel || period.period_label}${period.status ? ` (${period.status})` : ''}`,
    value: period.id,
    raw: period,
  }))
}

async function loadAnalytics() {
  analyticsLoading.value = true
  analyticsError.value = ''

  try {
    analytics.value = await fetchSnapshotArchiveAnalytics(snapshotQuery())
    generatedByOptions.value = (analytics.value.generatedByCounts || []).map((item) => ({
      label: item.generatedByName ? `${item.generatedByName}${item.generatedByRole ? ` (${item.generatedByRole})` : ''}` : `#${item.generatedByUserId || '-'}`,
      value: item.generatedByUserId,
      raw: item,
    }))
  } catch (error) {
    analytics.value = {
      overview: {},
      typeCounts: [],
      stateCounts: [],
      academicYearCounts: [],
      termCounts: [],
      reportPeriodCounts: [],
      classComparison: [],
      generatedByCounts: [],
      generatedTrend: [],
    }
    generatedByOptions.value = []
    analyticsError.value = error?.message || t('preschoolSnapshotArchivePage.errors.analytics')
  } finally {
    analyticsLoading.value = false
  }
}

async function loadArchive(page = 1) {
  loading.value = true
  errorMessage.value = ''

  try {
    const payload = await fetchSnapshotArchive({
      ...snapshotQuery(),
      page,
      perPage: pagination.value.perPage,
    })

    archiveItems.value = payload.items || []
    pagination.value = payload.pagination || pagination.value
  } catch (error) {
    archiveItems.value = []
    errorMessage.value = error?.message || t('preschoolSnapshotArchivePage.errors.loading')
  } finally {
    loading.value = false
  }
}

async function refreshArchive() {
  await Promise.all([loadArchive(1), loadAnalytics()])
}

function resetFilters() {
  filters.value = {
    academicYearId: '',
    termId: '',
    reportPeriodId: '',
    classId: '',
    studentId: '',
    snapshotType: '',
    lifecycleState: '',
    generatedFrom: '',
    generatedTo: '',
    generatedBy: '',
    search: '',
  }

  return refreshArchive()
}

function changePage(delta) {
  const nextPage = Math.min(
    Math.max((pagination.value.page || 1) + delta, 1),
    pagination.value.totalPages || 1,
  )

  return loadArchive(nextPage)
}

async function openSnapshot(item) {
  detailLoading.value = true
  detailVisible.value = true

  try {
    const payload = await fetchSnapshotArchiveItem(item.id)
    selectedSnapshot.value = payload.snapshot || null
    selectedPreviousSnapshot.value = payload.previousSnapshot || null
    selectedComparison.value = payload.comparison || null
    selectedAuditTrail.value = payload.auditTrail || []
  } catch (error) {
    selectedSnapshot.value = null
    selectedPreviousSnapshot.value = null
    selectedComparison.value = null
    selectedAuditTrail.value = []
    errorMessage.value = error?.message || t('preschoolSnapshotArchivePage.errors.detail')
  } finally {
    detailLoading.value = false
  }
}

async function exportCsv() {
  exporting.value = true

  try {
    const blob = await exportSnapshotArchiveCsv(snapshotQuery())
    const objectUrl = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = `preschool-snapshot-archive-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(objectUrl)
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolSnapshotArchivePage.errors.export')
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  await loadAcademicLifecycle()
  await loadLookupOptions()
  await refreshArchive()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolSnapshotArchivePage.title')"
        :subtitle="t('preschoolSnapshotArchivePage.subtitle')"
      />

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.filters.title') }}</h3>
            <p class="text-sm text-slate-500">{{ t('preschoolSnapshotArchivePage.filters.subtitle') }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" size="md" rounded="xl" :loading="analyticsLoading" @click="loadAnalytics">
              {{ t('preschoolSnapshotArchivePage.actions.refreshAnalytics') }}
            </Button>
            <Button type="button" variant="ghost" size="md" rounded="xl" :loading="exporting" @click="exportCsv">
              {{ t('preschoolSnapshotArchivePage.actions.exportCsv') }}
            </Button>
            <Button type="button" variant="primary" size="md" rounded="xl" :loading="loading" @click="refreshArchive">
              {{ t('preschoolSnapshotArchivePage.actions.applyFilters') }}
            </Button>
          </div>
        </div>

        <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>{{ t('preschoolSnapshotArchivePage.filters.academicYear') }}</span>
            <Select v-model="filters.academicYearId" :options="academicYearOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>{{ t('preschoolSnapshotArchivePage.filters.term') }}</span>
            <Select v-model="filters.termId" :options="termOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>{{ t('preschoolSnapshotArchivePage.filters.reportPeriod') }}</span>
            <Select v-model="filters.reportPeriodId" :options="reportPeriodFilterOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>{{ t('preschoolSnapshotArchivePage.filters.snapshotType') }}</span>
            <Select v-model="filters.snapshotType" :options="snapshotTypeOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>{{ t('preschoolSnapshotArchivePage.filters.class') }}</span>
            <Select v-model="filters.classId" :options="classFilterOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>{{ t('preschoolSnapshotArchivePage.filters.student') }}</span>
            <Select v-model="filters.studentId" :options="studentFilterOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>{{ t('preschoolSnapshotArchivePage.filters.state') }}</span>
            <Select v-model="filters.lifecycleState" :options="lifecycleStateOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>{{ t('preschoolSnapshotArchivePage.filters.generatedBy') }}</span>
            <Select v-model="filters.generatedBy" :options="generatedByFilterOptions" option-label="label" option-value="value" class="w-full" />
          </label>
        </div>

        <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>{{ t('preschoolSnapshotArchivePage.filters.generatedFrom') }}</span>
            <InputText v-model="filters.generatedFrom" type="date" class="w-full" />
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>{{ t('preschoolSnapshotArchivePage.filters.generatedTo') }}</span>
            <InputText v-model="filters.generatedTo" type="date" class="w-full" />
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>{{ t('preschoolSnapshotArchivePage.filters.search') }}</span>
            <InputText v-model="filters.search" type="search" class="w-full" :placeholder="t('preschoolSnapshotArchivePage.filters.searchPlaceholder')" />
          </label>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="md" rounded="xl" @click="resetFilters">
            {{ t('preschoolSnapshotArchivePage.actions.resetFilters') }}
          </Button>
          <Button type="button" variant="ghost" size="md" rounded="xl" :loading="loading" @click="loadArchive(1)">
            {{ t('preschoolSnapshotArchivePage.actions.reloadList') }}
          </Button>
        </div>
      </div>

      <div v-if="analyticsError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ analyticsError }}
      </div>

      <SnapshotAnalyticsCards :analytics="analytics" />

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <SnapshotArchiveTable
        :items="archiveItems"
        :loading="loading"
        :pagination="pagination"
        @view="openSnapshot"
        @page-change="changePage"
      />

      <SnapshotDetailDialog
        v-model:visible="detailVisible"
        :loading="detailLoading"
        :snapshot="selectedSnapshot"
        :previous-snapshot="selectedPreviousSnapshot"
        :comparison="selectedComparison"
        :audit-trail="selectedAuditTrail"
      />
    </section>
  </MainLayout>
</template>
