<script setup>
// Keep governance review admin-only so override, blocked-write, and export
// history stay auditable without creating any new edit path on historical
// Preschool data.
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
  fetchGovernanceReview,
  fetchGovernanceReviewAnalytics,
  fetchInstitutionalReplay,
} from '@/modules/preschool/services/api/preschoolGovernanceReviewApi'
import GovernanceAnalyticsCards from '@/modules/preschool/shared/components/governance/GovernanceAnalyticsCards.vue'
import InstitutionalReplayTimeline from '@/modules/preschool/shared/components/governance/InstitutionalReplayTimeline.vue'
import {
  resolveLifecycleActionLabel,
  resolveLifecycleContextLabel,
  resolveLifecycleEntityLabel,
} from '@/modules/preschool/shared/utils/lifecycleAuditLabels'
import { DEFAULT_REVIEW, DEFAULT_ANALYTICS, DEFAULT_REPLAY, DEFAULT_FILTERS } from './constants/governanceReviewConstants'
import {
  normalizeClassItem,
  normalizeStudentItem,
  normalizeReportPeriodItem,
  buildQueryPayload,
  buildOverviewCards,
  buildReviewSections,
  resolveAuditEntityContext as resolveAuditEntityContextHelper,
} from './utils/governanceReviewHelpers'

defineOptions({
  name: 'PreschoolGovernanceReviewPage',
})

const router = useRouter()
const { t, te } = useLanguage()
const { academicYears, terms, loadAcademicLifecycle } = usePreschoolAcademicLifecycle()

const loading = ref(false)
const analyticsLoading = ref(false)
const replayLoading = ref(false)
const errorMessage = ref('')
const analyticsError = ref('')
const review = ref({ ...DEFAULT_REVIEW })
const analytics = ref({ ...DEFAULT_ANALYTICS })
const replay = ref({ ...DEFAULT_REPLAY })
const classOptions = ref([])
const studentOptions = ref([])
const reportPeriodOptions = ref([])

const filters = ref({ ...DEFAULT_FILTERS })

const academicYearOptions = computed(() => [
  { label: t('preschoolGovernanceReviewPage.filters.allAcademicYears'), value: '' },
  ...academicYears.value.map((year) => ({
    label: year.label || year.code || `#${year.id}`,
    value: String(year.id || ''),
  })),
])

const termOptions = computed(() => [
  { label: t('preschoolGovernanceReviewPage.filters.allTerms'), value: '' },
  ...terms.value.map((term) => ({
    label: term.name || term.code || `#${term.id}`,
    value: String(term.id || ''),
  })),
])

const classOptionsList = computed(() => [
  { label: t('preschoolGovernanceReviewPage.filters.allClasses'), value: '' },
  ...classOptions.value.map((item) => ({
    label: item.label,
    value: String(item.value),
  })),
])

const studentOptionsList = computed(() => [
  { label: t('preschoolGovernanceReviewPage.filters.allStudents'), value: '' },
  ...studentOptions.value.map((item) => ({
    label: item.label,
    value: String(item.value),
  })),
])

const reportPeriodOptionsList = computed(() => [
  { label: t('preschoolGovernanceReviewPage.filters.allReportPeriods'), value: '' },
  ...reportPeriodOptions.value.map((item) => ({
    label: item.label,
    value: String(item.value),
  })),
])

const reviewSections = computed(() => buildReviewSections(review.value, t))

const overviewCards = computed(() => buildOverviewCards(analytics.value.overview || {}, t))

function query() {
  return buildQueryPayload(filters.value)
}

async function loadLookupOptions() {
  try {
    const [classesResponse, studentsResponse, reportPeriodsResponse] = await Promise.all([
      fetchPreschoolClasses({ page: 1, perPage: 100 }),
      fetchPreschoolStudents({ page: 1, perPage: 100 }),
      fetchReportPeriods(),
    ])

    classOptions.value = (classesResponse.items || []).map(normalizeClassItem)
    studentOptions.value = (studentsResponse.items || []).map(normalizeStudentItem)
    reportPeriodOptions.value = (reportPeriodsResponse || []).map(normalizeReportPeriodItem)
  } catch {
    classOptions.value = []
    studentOptions.value = []
    reportPeriodOptions.value = []
  }
}

async function loadReview() {
  loading.value = true
  errorMessage.value = ''

  try {
    review.value = await fetchGovernanceReview(query())
  } catch (error) {
    review.value = { ...DEFAULT_REVIEW }
    errorMessage.value = error?.message || t('preschoolGovernanceReviewPage.errors.review')
  } finally {
    loading.value = false
  }
}

async function loadAnalytics() {
  analyticsLoading.value = true
  analyticsError.value = ''

  try {
    analytics.value = await fetchGovernanceReviewAnalytics(query())
  } catch (error) {
    analytics.value = { ...DEFAULT_ANALYTICS }
    analyticsError.value = error?.message || t('preschoolGovernanceReviewPage.errors.analytics')
  } finally {
    analyticsLoading.value = false
  }
}

async function loadReplay() {
  replayLoading.value = true

  try {
    replay.value = await fetchInstitutionalReplay(query())
  } catch {
    replay.value = { ...DEFAULT_REPLAY }
  } finally {
    replayLoading.value = false
  }
}

function refresh() {
  return Promise.all([loadReview(), loadAnalytics(), loadReplay()])
}

function goToReconstruction() {
  router.push({ name: 'dashboard-preschool-admin-reconstruction' })
}

function goToExportGovernance() {
  router.push({ name: 'dashboard-preschool-admin-export-governance' })
}

function goToSnapshotArchive() {
  router.push({ name: 'dashboard-preschool-admin-report-snapshots' })
}

function goToGovernanceDiffAnalysis() {
  router.push({ name: 'dashboard-preschool-admin-governance-diff' })
}

function goToGovernanceCases() {
  router.push({ name: 'dashboard-preschool-admin-governance-cases' })
}

function resolveAuditAction(item = {}) {
  return resolveLifecycleActionLabel(t, item.actionType || item.title, te)
}

function resolveAuditEntity(item = {}) {
  return resolveLifecycleEntityLabel(t, item.entityType, te)
}

function resolveAuditContext(item = {}) {
  return resolveLifecycleContextLabel(t, item.context, te)
}

function resolveAuditEntityContext(item = {}) {
  const entity = resolveAuditEntity(item)
  const context = resolveAuditContext(item)
  return resolveAuditEntityContextHelper(entity, context)
}

onMounted(async () => {
  await loadAcademicLifecycle()
  await loadLookupOptions()
  await refresh()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolGovernanceReviewPage.title')"
        :subtitle="t('preschoolGovernanceReviewPage.subtitle')"
      />

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid gap-3 lg:grid-cols-4">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolGovernanceReviewPage.filters.academicYear') }}</span>
            <Select v-model="filters.academicYearId" :options="academicYearOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolGovernanceReviewPage.filters.term') }}</span>
            <Select v-model="filters.termId" :options="termOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolGovernanceReviewPage.filters.reportPeriod') }}</span>
            <Select v-model="filters.reportPeriodId" :options="reportPeriodOptionsList" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolGovernanceReviewPage.filters.source') }}</span>
            <InputText v-model="filters.source" class="w-full" :placeholder="t('preschoolGovernanceReviewPage.filters.sourcePlaceholder')" />
          </label>
        </div>

        <div class="mt-4 grid gap-3 lg:grid-cols-4">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolGovernanceReviewPage.filters.class') }}</span>
            <Select v-model="filters.classId" :options="classOptionsList" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolGovernanceReviewPage.filters.student') }}</span>
            <Select v-model="filters.studentId" :options="studentOptionsList" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolGovernanceReviewPage.filters.actor') }}</span>
            <InputText v-model="filters.actorUserId" class="w-full" :placeholder="t('preschoolGovernanceReviewPage.filters.actorPlaceholder')" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolGovernanceReviewPage.filters.actionType') }}</span>
            <InputText v-model="filters.actionType" class="w-full" :placeholder="t('preschoolGovernanceReviewPage.filters.actionTypePlaceholder')" />
          </label>
        </div>

        <div class="mt-4 grid gap-3 lg:grid-cols-4">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolGovernanceReviewPage.filters.entityType') }}</span>
            <InputText v-model="filters.entityType" class="w-full" :placeholder="t('preschoolGovernanceReviewPage.filters.entityTypePlaceholder')" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolGovernanceReviewPage.filters.exportType') }}</span>
            <InputText v-model="filters.exportType" class="w-full" :placeholder="t('preschoolGovernanceReviewPage.filters.exportTypePlaceholder')" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolGovernanceReviewPage.filters.exportFormat') }}</span>
            <InputText v-model="filters.exportFormat" class="w-full" :placeholder="t('preschoolGovernanceReviewPage.filters.exportFormatPlaceholder')" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolGovernanceReviewPage.filters.search') }}</span>
            <InputText v-model="filters.search" class="w-full" :placeholder="t('preschoolGovernanceReviewPage.filters.searchPlaceholder')" />
          </label>
        </div>

        <div class="mt-4 grid gap-3 lg:grid-cols-4">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolGovernanceReviewPage.filters.generatedFrom') }}</span>
            <InputText v-model="filters.generatedFrom" type="date" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolGovernanceReviewPage.filters.generatedTo') }}</span>
            <InputText v-model="filters.generatedTo" type="date" class="w-full" />
          </label>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToSnapshotArchive">
            {{ t('preschoolGovernanceReviewPage.actions.openSnapshotArchive') }}
          </Button>
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToExportGovernance">
            {{ t('preschoolGovernanceReviewPage.actions.openExportGovernance') }}
          </Button>
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToGovernanceDiffAnalysis">
            {{ t('preschoolGovernanceDiffPage.actions.openDiffAnalysis') }}
          </Button>
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToGovernanceCases">
            {{ t('preschoolGovernanceCasesPage.actions.openGovernanceCases') }}
          </Button>
          <Button type="button" variant="secondary" size="md" rounded="xl" @click="goToReconstruction">
            {{ t('preschoolGovernanceReviewPage.actions.openReconstruction') }}
          </Button>
          <Button type="button" variant="primary" size="md" rounded="xl" :loading="loading || analyticsLoading || replayLoading" @click="refresh">
            {{ t('preschoolGovernanceReviewPage.actions.refresh') }}
          </Button>
        </div>
      </div>

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>
      <div v-if="analyticsError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ analyticsError }}
      </div>

      <GovernanceAnalyticsCards
        :cards="overviewCards"
      />

      <div class="grid gap-4 lg:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolGovernanceReviewPage.analytics.overrideActors') }}</h3>
          <ul class="mt-3 space-y-2 text-sm text-slate-600">
            <li v-for="item in analytics.overrideActorCounts.slice(0, 5)" :key="item.actorUserId" class="flex items-center justify-between gap-3">
              <span class="truncate">{{ item.actorName || `#${item.actorUserId || '-'}` }}</span>
              <span class="font-semibold text-slate-900">{{ item.total }}</span>
            </li>
            <li v-if="!analytics.overrideActorCounts.length" class="text-slate-500">
              {{ t('preschoolGovernanceReviewPage.empty.overrideActors') }}
            </li>
          </ul>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolGovernanceReviewPage.analytics.exportActors') }}</h3>
          <ul class="mt-3 space-y-2 text-sm text-slate-600">
            <li v-for="item in analytics.exportActorCounts.slice(0, 5)" :key="item.actorUserId" class="flex items-center justify-between gap-3">
              <span class="truncate">{{ item.actorName || `#${item.actorUserId || '-'}` }}</span>
              <span class="font-semibold text-slate-900">{{ item.total }}</span>
            </li>
            <li v-if="!analytics.exportActorCounts.length" class="text-slate-500">
              {{ t('preschoolGovernanceReviewPage.empty.exportActors') }}
            </li>
          </ul>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolGovernanceReviewPage.analytics.blockedTrend') }}</h3>
          <ul class="mt-3 space-y-2 text-sm text-slate-600">
            <li v-for="item in analytics.blockedWriteTrend.slice(-5)" :key="item.day" class="flex items-center justify-between gap-3">
              <span>{{ item.day }}</span>
              <span class="font-semibold text-slate-900">{{ item.total }}</span>
            </li>
            <li v-if="!analytics.blockedWriteTrend.length" class="text-slate-500">
              {{ t('preschoolGovernanceReviewPage.empty.blockedTrend') }}
            </li>
          </ul>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-3">
        <div
          v-for="section in reviewSections"
          :key="section.title"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-1"
        >
          <div class="space-y-1">
            <h3 class="text-sm font-semibold text-slate-900">{{ section.title }}</h3>
            <p class="text-sm text-slate-500">{{ section.description }}</p>
          </div>
          <div v-if="!section.items.length" class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            {{ section.emptyLabel }}
          </div>
          <div v-else class="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table class="min-w-full divide-y divide-slate-200 text-sm">
              <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="px-4 py-3">{{ t('preschoolGovernanceReviewPage.columns.action') }}</th>
                  <th class="px-4 py-3">{{ t('preschoolGovernanceReviewPage.columns.entity') }}</th>
                  <th class="px-4 py-3">{{ t('preschoolGovernanceReviewPage.columns.actor') }}</th>
                  <th class="px-4 py-3">{{ t('preschoolGovernanceReviewPage.columns.context') }}</th>
                  <th class="px-4 py-3">{{ t('preschoolGovernanceReviewPage.columns.recordedAt') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-for="item in section.items" :key="item.id">
                  <td class="px-4 py-3 text-slate-900">{{ resolveAuditAction(item) }}</td>
                  <td class="px-4 py-3 text-slate-600">
                    <div class="space-y-1">
                      <p>{{ resolveAuditEntity(item) }}</p>
                      <p class="text-xs text-slate-500">#{{ item.entityId || '-' }}</p>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-slate-600">{{ item.actor?.displayName || item.actor?.roleCode || '-' }}</td>
                  <td class="px-4 py-3 text-slate-600">
                    <div class="space-y-1">
                      <p>{{ resolveAuditEntityContext(item) }}</p>
                      <p v-if="item.context?.academicYearId">{{ t('preschoolGovernanceReviewPage.context.academicYear') }}: {{ item.context.academicYearId }}</p>
                      <p v-if="item.context?.termId">{{ t('preschoolGovernanceReviewPage.context.term') }}: {{ item.context.termId }}</p>
                      <p v-if="item.context?.reportPeriodId">{{ t('preschoolGovernanceReviewPage.context.reportPeriod') }}: {{ item.context.reportPeriodId }}</p>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-slate-600">{{ item.recordedAt || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolGovernanceReviewPage.sections.anomalyReview') }}</h3>
          <dl class="mt-3 space-y-2 text-sm text-slate-600">
            <div class="flex items-center justify-between gap-3">
              <dt>{{ t('preschoolGovernanceReviewPage.anomaly.overrideEvents') }}</dt>
              <dd class="font-semibold text-slate-900">{{ review.anomalyReview.overrideEvents ?? 0 }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt>{{ t('preschoolGovernanceReviewPage.anomaly.blockedWrites') }}</dt>
              <dd class="font-semibold text-slate-900">{{ review.anomalyReview.blockedWrites ?? 0 }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt>{{ t('preschoolGovernanceReviewPage.anomaly.snapshotFreezes') }}</dt>
              <dd class="font-semibold text-slate-900">{{ review.anomalyReview.snapshotFreezes ?? 0 }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt>{{ t('preschoolGovernanceReviewPage.anomaly.exportEvents') }}</dt>
              <dd class="font-semibold text-slate-900">{{ review.anomalyReview.exportEvents ?? 0 }}</dd>
            </div>
          </dl>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolGovernanceReviewPage.sections.integrityReview') }}</h3>
          <div class="mt-3 space-y-3 text-sm text-slate-600">
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolGovernanceReviewPage.integrity.snapshotStates') }}</p>
              <p class="mt-1">{{ (review.integrityReview.snapshotStates || []).map((item) => `${item.state}:${item.total}`).join(', ') || '-' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolGovernanceReviewPage.integrity.reportPeriodStates') }}</p>
              <p class="mt-1">{{ (review.integrityReview.reportPeriodStates || []).map((item) => `${item.status}:${item.total}`).join(', ') || '-' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolGovernanceReviewPage.integrity.academicYearStates') }}</p>
              <p class="mt-1">{{ (review.integrityReview.academicYearStates || []).map((item) => `${item.status}:${item.total}`).join(', ') || '-' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolGovernanceReviewPage.integrity.termStates') }}</p>
              <p class="mt-1">{{ (review.integrityReview.termStates || []).map((item) => `${item.status}:${item.total}`).join(', ') || '-' }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolGovernanceReviewPage.sections.retentionReview') }}</h3>
          <div class="mt-3 space-y-3 text-sm text-slate-600">
            <p>{{ t('preschoolGovernanceReviewPage.retention.archivedAcademicYears') }}: <span class="font-semibold text-slate-900">{{ review.retentionReview.archivedAcademicYears ?? 0 }}</span></p>
            <p>{{ t('preschoolGovernanceReviewPage.retention.archivedTerms') }}: <span class="font-semibold text-slate-900">{{ review.retentionReview.archivedTerms ?? 0 }}</span></p>
            <p>{{ t('preschoolGovernanceReviewPage.retention.archivedReportPeriods') }}: <span class="font-semibold text-slate-900">{{ review.retentionReview.archivedReportPeriods ?? 0 }}</span></p>
            <p>{{ t('preschoolGovernanceReviewPage.retention.window') }}: <span class="font-semibold text-slate-900">{{ review.retentionReview.retentionWindowDays ?? 0 }} {{ t('preschoolGovernanceReviewPage.retention.days') }}</span></p>
            <p class="text-xs text-slate-500">{{ review.retentionReview.retentionNotes || '-' }}</p>
          </div>
        </div>
      </div>

      <InstitutionalReplayTimeline
        :title="t('preschoolGovernanceReviewPage.replay.title')"
        :subtitle="t('preschoolGovernanceReviewPage.replay.subtitle')"
        :items="replay.items"
        :loading="replayLoading"
        :empty-label="t('preschoolGovernanceReviewPage.replay.empty')"
      />
    </section>
  </MainLayout>
</template>
