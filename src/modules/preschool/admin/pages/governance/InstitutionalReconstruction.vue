<script setup>
// Keep institutional reconstruction read-only so leadership can inspect how
// historical Preschool state was assembled from immutable snapshots and audit
// trails without touching live operational data.
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
import {
  fetchInstitutionalReconstruction,
  fetchInstitutionalReconstructionContext,
} from '@/modules/preschool/services/api/preschoolGovernanceReviewApi'
import GovernanceAnalyticsCards from '@/modules/preschool/shared/components/governance/GovernanceAnalyticsCards.vue'
import ReconstructionContextPanel from '@/modules/preschool/shared/components/governance/ReconstructionContextPanel.vue'
import HistoricalStateSummary from '@/modules/preschool/shared/components/governance/HistoricalStateSummary.vue'
import InstitutionalReplayTimeline from '@/modules/preschool/shared/components/governance/InstitutionalReplayTimeline.vue'

defineOptions({
  name: 'PreschoolInstitutionalReconstructionPage',
})

const router = useRouter()
const { t } = useLanguage()
const { academicYears, terms, loadAcademicLifecycle } = usePreschoolAcademicLifecycle()

const loading = ref(false)
const errorMessage = ref('')
const reconstruction = ref({
  context: {},
  summary: {},
  academicContext: {},
  historicalState: {},
  timeline: [],
  references: {},
})
const classOptions = ref([])
const studentOptions = ref([])
const reportPeriodOptions = ref([])
const contextInput = ref('')

const filters = ref({
  academicYearId: '',
  termId: '',
  reportPeriodId: '',
  classId: '',
  studentId: '',
  snapshotType: '',
  lifecycleState: '',
  source: '',
  search: '',
})

const snapshotTypeOptions = computed(() => [
  { label: t('preschoolInstitutionalReconstructionPage.filters.allSnapshotTypes'), value: '' },
  { label: t('preschoolInstitutionalReconstructionPage.snapshotTypes.studentReport'), value: 'student_report' },
  { label: t('preschoolInstitutionalReconstructionPage.snapshotTypes.classroomReport'), value: 'classroom_report' },
  { label: t('preschoolInstitutionalReconstructionPage.snapshotTypes.progressSummary'), value: 'progress_summary' },
])

const lifecycleStateOptions = computed(() => [
  { label: t('preschoolInstitutionalReconstructionPage.filters.allStates'), value: '' },
  { label: t('preschoolInstitutionalReconstructionPage.states.finalized'), value: 'finalized' },
  { label: t('preschoolInstitutionalReconstructionPage.states.locked'), value: 'locked' },
  { label: t('preschoolInstitutionalReconstructionPage.states.archived'), value: 'archived' },
])

const academicYearOptions = computed(() => [
  { label: t('preschoolInstitutionalReconstructionPage.filters.allAcademicYears'), value: '' },
  ...academicYears.value.map((year) => ({
    label: year.label || year.code || `#${year.id}`,
    value: String(year.id || ''),
  })),
])

const termOptions = computed(() => [
  { label: t('preschoolInstitutionalReconstructionPage.filters.allTerms'), value: '' },
  ...terms.value.map((term) => ({
    label: term.name || term.code || `#${term.id}`,
    value: String(term.id || ''),
  })),
])

const classOptionsList = computed(() => [
  { label: t('preschoolInstitutionalReconstructionPage.filters.allClasses'), value: '' },
  ...classOptions.value.map((item) => ({
    label: item.label,
    value: String(item.value),
  })),
])

const studentOptionsList = computed(() => [
  { label: t('preschoolInstitutionalReconstructionPage.filters.allStudents'), value: '' },
  ...studentOptions.value.map((item) => ({
    label: item.label,
    value: String(item.value),
  })),
])

const reportPeriodOptionsList = computed(() => [
  { label: t('preschoolInstitutionalReconstructionPage.filters.allReportPeriods'), value: '' },
  ...reportPeriodOptions.value.map((item) => ({
    label: item.label,
    value: String(item.value),
  })),
])

const summaryCards = computed(() => {
  const summary = reconstruction.value.summary || {}

  return [
    {
      title: t('preschoolInstitutionalReconstructionPage.cards.snapshots'),
      value: summary.snapshotCount ?? 0,
      caption: t('preschoolInstitutionalReconstructionPage.cards.snapshotsCaption'),
    },
    {
      title: t('preschoolInstitutionalReconstructionPage.cards.audits'),
      value: summary.auditCount ?? 0,
      caption: t('preschoolInstitutionalReconstructionPage.cards.auditsCaption'),
    },
    {
      title: t('preschoolInstitutionalReconstructionPage.cards.exports'),
      value: summary.exportCount ?? 0,
      caption: t('preschoolInstitutionalReconstructionPage.cards.exportsCaption'),
    },
    {
      title: t('preschoolInstitutionalReconstructionPage.cards.assignments'),
      value: summary.assignmentCount ?? 0,
      caption: t('preschoolInstitutionalReconstructionPage.cards.assignmentsCaption'),
    },
  ]
})

function query() {
  return {
    academicYearId: filters.value.academicYearId,
    termId: filters.value.termId,
    reportPeriodId: filters.value.reportPeriodId,
    classId: filters.value.classId,
    studentId: filters.value.studentId,
    snapshotType: filters.value.snapshotType,
    lifecycleState: filters.value.lifecycleState,
    source: filters.value.source,
    search: filters.value.search,
  }
}

async function loadLookupOptions() {
  try {
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
  } catch {
    classOptions.value = []
    studentOptions.value = []
    reportPeriodOptions.value = []
  }
}

async function loadReconstruction() {
  loading.value = true
  errorMessage.value = ''

  try {
    reconstruction.value = contextInput.value.trim()
      ? await fetchInstitutionalReconstructionContext(contextInput.value.trim(), query())
      : await fetchInstitutionalReconstruction(query())
  } catch (error) {
    reconstruction.value = {
      context: {},
      summary: {},
      academicContext: {},
      historicalState: {},
      timeline: [],
      references: {},
    }
    errorMessage.value = error?.message || t('preschoolInstitutionalReconstructionPage.errors.loading')
  } finally {
    loading.value = false
  }
}

function goToGovernanceReview() {
  router.push({ name: 'dashboard-preschool-admin-governance-review' })
}

function goToExportGovernance() {
  router.push({ name: 'dashboard-preschool-admin-export-governance' })
}

function goToSnapshotArchive() {
  router.push({ name: 'dashboard-preschool-admin-report-snapshots' })
}

onMounted(async () => {
  await loadAcademicLifecycle()
  await loadLookupOptions()
  await loadReconstruction()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolInstitutionalReconstructionPage.title')"
        :subtitle="t('preschoolInstitutionalReconstructionPage.subtitle')"
      />

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid gap-3 lg:grid-cols-4">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolInstitutionalReconstructionPage.filters.academicYear') }}</span>
            <Select v-model="filters.academicYearId" :options="academicYearOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolInstitutionalReconstructionPage.filters.term') }}</span>
            <Select v-model="filters.termId" :options="termOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolInstitutionalReconstructionPage.filters.reportPeriod') }}</span>
            <Select v-model="filters.reportPeriodId" :options="reportPeriodOptionsList" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolInstitutionalReconstructionPage.filters.context') }}</span>
            <InputText v-model="contextInput" class="w-full" :placeholder="t('preschoolInstitutionalReconstructionPage.filters.contextPlaceholder')" />
          </label>
        </div>

        <div class="mt-4 grid gap-3 lg:grid-cols-4">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolInstitutionalReconstructionPage.filters.class') }}</span>
            <Select v-model="filters.classId" :options="classOptionsList" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolInstitutionalReconstructionPage.filters.student') }}</span>
            <Select v-model="filters.studentId" :options="studentOptionsList" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolInstitutionalReconstructionPage.filters.snapshotType') }}</span>
            <Select v-model="filters.snapshotType" :options="snapshotTypeOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolInstitutionalReconstructionPage.filters.lifecycleState') }}</span>
            <Select v-model="filters.lifecycleState" :options="lifecycleStateOptions" option-label="label" option-value="value" class="w-full" />
          </label>
        </div>

        <div class="mt-4 grid gap-3 lg:grid-cols-4">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolInstitutionalReconstructionPage.filters.source') }}</span>
            <InputText v-model="filters.source" class="w-full" :placeholder="t('preschoolInstitutionalReconstructionPage.filters.sourcePlaceholder')" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolInstitutionalReconstructionPage.filters.search') }}</span>
            <InputText v-model="filters.search" class="w-full" :placeholder="t('preschoolInstitutionalReconstructionPage.filters.searchPlaceholder')" />
          </label>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToSnapshotArchive">
            {{ t('preschoolInstitutionalReconstructionPage.actions.openSnapshotArchive') }}
          </Button>
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToExportGovernance">
            {{ t('preschoolInstitutionalReconstructionPage.actions.openExportGovernance') }}
          </Button>
          <Button type="button" variant="secondary" size="md" rounded="xl" @click="goToGovernanceReview">
            {{ t('preschoolInstitutionalReconstructionPage.actions.openGovernanceReview') }}
          </Button>
          <Button type="button" variant="primary" size="md" rounded="xl" :loading="loading" @click="loadReconstruction">
            {{ t('preschoolInstitutionalReconstructionPage.actions.refresh') }}
          </Button>
        </div>
      </div>

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <GovernanceAnalyticsCards :cards="summaryCards" />

      <ReconstructionContextPanel
        :context="reconstruction.context"
        :academic-context="reconstruction.academicContext"
        :references="reconstruction.references"
      />

      <HistoricalStateSummary
        :summary="reconstruction.summary"
        :retention-review="reconstruction.historicalState?.retentionReview || reconstruction.summary?.retentionReview || {}"
      />

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolInstitutionalReconstructionPage.sections.historicalState') }}</h3>
          <div class="mt-4 space-y-4 text-sm text-slate-600">
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolInstitutionalReconstructionPage.historical.snapshots') }}</p>
              <p class="mt-1">{{ (reconstruction.historicalState?.snapshots || []).length }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolInstitutionalReconstructionPage.historical.audits') }}</p>
              <p class="mt-1">{{ (reconstruction.historicalState?.audits || []).length }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolInstitutionalReconstructionPage.historical.exports') }}</p>
              <p class="mt-1">{{ (reconstruction.historicalState?.exports || []).length }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolInstitutionalReconstructionPage.historical.assignments') }}</p>
              <p class="mt-1">{{ (reconstruction.historicalState?.assignments || []).length }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolInstitutionalReconstructionPage.historical.reportPeriods') }}</p>
              <p class="mt-1">{{ (reconstruction.historicalState?.reportPeriods || []).length }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolInstitutionalReconstructionPage.sections.lifecycleReplay') }}</h3>
          <InstitutionalReplayTimeline
            class="mt-4 border-0 p-0 shadow-none"
            :title="t('preschoolInstitutionalReconstructionPage.replay.title')"
            :subtitle="t('preschoolInstitutionalReconstructionPage.replay.subtitle')"
            :items="reconstruction.timeline || []"
            :loading="loading"
            :empty-label="t('preschoolInstitutionalReconstructionPage.replay.empty')"
          />
        </div>
      </div>
    </section>
  </MainLayout>
</template>
