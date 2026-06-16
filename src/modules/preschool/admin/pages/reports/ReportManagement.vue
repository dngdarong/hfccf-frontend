<script setup>
// Keep the Preschool report overview explicit so the sidebar routes to a real
// data-driven landing page instead of a placeholder shell.
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { usePreschoolReports } from '@/modules/preschool/composables/usePreschoolReports'
import { fetchLifecycleAuditLogs } from '@/modules/preschool/services/api/preschoolLifecycleAuditApi'
import ReportSummaryCard from '@/modules/preschool/shared/components/report/ReportSummaryCard.vue'
import ReportSnapshotBadge from '@/modules/preschool/shared/components/report/ReportSnapshotBadge.vue'
import { formatDatetimeShort } from '@/utils/date'
import ReportPeriodStatusBadge from '@/modules/preschool/shared/components/report/ReportPeriodStatusBadge.vue'
import {
  formatAuditCodeFallback,
  resolveLifecycleActionLabel as resolveAuditActionLabel,
  resolveLifecycleEntityLabel as resolveAuditEntityLabel,
} from '@/modules/preschool/shared/utils/lifecycleAuditLabels'

defineOptions({
  name: 'PreschoolReportPeriodOverviewPage',
})

const router = useRouter()
const { t, te } = useLanguage()

const {
  errorMessage,
  loadLookupData,
  loadReportPeriodOptions,
  loading,
  reportPeriodLockMessage,
  reportPeriods,
  selectedReportPeriod,
  studentOptions,
} = usePreschoolReports()

const auditLogs = ref([])
const auditLoading = ref(false)
const auditError = ref('')

const overviewCards = computed(() => [
  {
    title: t('preschoolReportsPage.overview.periods'),
    value: reportPeriods.value.length,
    caption: t('preschoolReportsPage.overview.periodsCaption'),
  },
  {
    title: t('preschoolReportsPage.overview.students'),
    value: studentOptions.value.length,
    caption: t('preschoolReportsPage.overview.studentsCaption'),
  },
  {
    title: t('preschoolReportsPage.overview.finalized'),
    value: reportPeriods.value.filter((period) => period.isFinalized).length,
    caption: t('preschoolReportsPage.overview.finalizedCaption'),
  },
  {
    title: t('preschoolReportsPage.overview.locked'),
    value: reportPeriods.value.filter((period) => period.isLocked || period.isArchived).length,
    caption: t('preschoolReportsPage.overview.lockedCaption'),
  },
])

const selectedPeriodSummary = computed(() => selectedReportPeriod.value || null)

const periodStatusSummary = computed(() => [
  { label: t('preschoolLifecyclePage.reportPeriodStatuses.active'), value: reportPeriods.value.filter((period) => period.isActive).length },
  { label: t('preschoolLifecyclePage.reportPeriodStatuses.finalized'), value: reportPeriods.value.filter((period) => period.isFinalized).length },
  { label: t('preschoolLifecyclePage.reportPeriodStatuses.locked'), value: reportPeriods.value.filter((period) => period.isLocked).length },
  { label: t('preschoolLifecyclePage.reportPeriodStatuses.archived'), value: reportPeriods.value.filter((period) => period.isArchived).length },
])

function goToStudentReports() {
  router.push({ name: 'dashboard-preschool-admin-student-reports' })
}

function goToClassroomReports() {
  router.push({ name: 'dashboard-preschool-admin-classroom-reports' })
}

function goToAuditLogs() {
  router.push({ name: 'dashboard-preschool-admin-lifecycle-audit' })
}

function goToSnapshotArchive() {
  router.push({ name: 'dashboard-preschool-admin-report-snapshots' })
}

function goToExportGovernance() {
  router.push({ name: 'dashboard-preschool-admin-export-governance' })
}

function goToGovernanceReview() {
  router.push({ name: 'dashboard-preschool-admin-governance-review' })
}

function goToInstitutionalReconstruction() {
  router.push({ name: 'dashboard-preschool-admin-reconstruction' })
}

function goToGovernanceDiffAnalysis() {
  router.push({ name: 'dashboard-preschool-admin-governance-diff' })
}

function goToGovernanceCases() {
  router.push({ name: 'dashboard-preschool-admin-governance-cases' })
}

async function loadAuditPreview() {
  auditLoading.value = true
  auditError.value = ''

  try {
    const payload = await fetchLifecycleAuditLogs({ perPage: 5 })
    auditLogs.value = payload.items || []
  } catch (error) {
    auditLogs.value = []
    auditError.value = error?.message || t('preschoolLifecycleAuditPage.loadingError')
  } finally {
    auditLoading.value = false
  }
}

function formatAuditReason(reason) {
  return resolveAuditActionLabel(t, reason, te)
}

function formatEntityReference(entityId) {
  return formatAuditCodeFallback(entityId)
}

onMounted(async () => {
  await loadLookupData()
  await loadReportPeriodOptions()
  await loadAuditPreview()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolReportsPage.title')"
        :subtitle="t('preschoolReportsPage.subtitle')"
      />

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportSummaryCard
          v-for="card in overviewCards"
          :key="card.title"
          :title="card.title"
          :value="card.value"
          :caption="card.caption"
        />
      </div>

      <div v-if="selectedPeriodSummary" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolReportsPage.selectedPeriod.title') }}</h3>
            <p class="text-sm text-slate-500">{{ t('preschoolReportsPage.selectedPeriod.subtitle') }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <ReportPeriodStatusBadge :status="selectedPeriodSummary.status" />
            <ReportSnapshotBadge
              v-if="selectedPeriodSummary.summarySnapshot || selectedPeriodSummary.reportSnapshot"
              :snapshot="selectedPeriodSummary.reportSnapshot || selectedPeriodSummary.summarySnapshot"
            />
          </div>
        </div>
        <div
          v-if="reportPeriodLockMessage"
          class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {{ reportPeriodLockMessage }}
        </div>
        <div
          v-if="selectedPeriodSummary.summarySnapshot || selectedPeriodSummary.reportSnapshot"
          class="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
        >
          <p class="font-medium text-slate-900">{{ t('preschoolReportSnapshots.labels.immutableSnapshot') }}</p>
          <p class="mt-1">
            {{ formatDatetimeShort(selectedPeriodSummary.reportSnapshot?.generatedAt || selectedPeriodSummary.summarySnapshot?.generatedAt) }}
          </p>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolReportsPage.overview.listTitle') }}</h3>
            <p class="text-sm text-slate-500">{{ t('preschoolReportsPage.overview.listSubtitle') }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button type="button" variant="primary" size="md" rounded="xl" @click="goToStudentReports">
              {{ t('preschoolReportsPage.actions.openStudentReports') }}
            </Button>
            <Button type="button" variant="secondary" size="md" rounded="xl" @click="goToClassroomReports">
              {{ t('preschoolReportsPage.actions.openClassroomReports') }}
            </Button>
            <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToAuditLogs">
              {{ t('preschoolLifecycleAuditPage.actions.openAuditLogs') }}
            </Button>
            <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToSnapshotArchive">
              {{ t('preschoolSnapshotArchivePage.actions.openArchive') }}
            </Button>
            <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToExportGovernance">
              {{ t('preschoolExportGovernancePage.actions.openGovernance') }}
            </Button>
            <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToGovernanceReview">
              {{ t('preschoolGovernanceReviewPage.actions.openGovernanceReview') }}
            </Button>
            <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToInstitutionalReconstruction">
              {{ t('preschoolGovernanceReviewPage.actions.openReconstruction') }}
            </Button>
              <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToGovernanceDiffAnalysis">
                {{ t('preschoolGovernanceDiffPage.actions.openDiffAnalysis') }}
              </Button>
              <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToGovernanceCases">
                {{ t('preschoolGovernanceCasesPage.actions.openGovernanceCases') }}
              </Button>
            </div>
        </div>

        <div v-if="errorMessage" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ errorMessage }}
        </div>

        <div v-if="loading" class="mt-4 px-1 py-6 text-sm text-slate-500">
          {{ t('preschoolReportsPage.loading') }}
        </div>

        <div v-else-if="!reportPeriods.length" class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          {{ t('preschoolReportsPage.emptyOverview') }}
        </div>

        <div v-else class="mt-4 overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3">{{ t('preschoolReportsPage.periodColumns.label') }}</th>
                <th class="px-4 py-3">{{ t('preschoolReportsPage.periodColumns.status') }}</th>
                <th class="px-4 py-3">{{ t('preschoolReportsPage.periodColumns.dates') }}</th>
                <th class="px-4 py-3">{{ t('preschoolReportsPage.periodColumns.assessments') }}</th>
                <th class="px-4 py-3">{{ t('preschoolReportsPage.periodColumns.students') }}</th>
                <th class="px-4 py-3">{{ t('preschoolReportsPage.periodColumns.classes') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr v-for="period in reportPeriods" :key="period.label">
                <td class="px-4 py-3 font-medium text-slate-900">{{ period.label }}</td>
                <td class="px-4 py-3">
                  <ReportPeriodStatusBadge :status="period.status" />
                </td>
                <td class="px-4 py-3 text-slate-600">{{ period.fromDate || '-' }} - {{ period.toDate || '-' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ period.assessmentCount ?? 0 }}</td>
                <td class="px-4 py-3 text-slate-600">{{ period.studentCount ?? 0 }}</td>
                <td class="px-4 py-3 text-slate-600">{{ period.classCount ?? 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolLifecycleAuditPage.previewTitle') }}</h3>
            <p class="text-sm text-slate-500">{{ t('preschoolLifecycleAuditPage.previewSubtitle') }}</p>
          </div>
          <div class="grid gap-2 sm:grid-cols-4">
            <StatusBadge
              v-for="status in periodStatusSummary"
              :key="status.label"
              :status="status.value > 0 ? 'success' : 'warning'"
              :label="`${status.label}: ${status.value}`"
              :translate-label="false"
              :dot="false"
            />
          </div>
        </div>

        <div v-if="auditError" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ auditError }}
        </div>

        <div v-if="auditLoading" class="mt-4 px-1 py-6 text-sm text-slate-500">
          {{ t('preschoolLifecycleAuditPage.loading') }}
        </div>

        <div v-else-if="!auditLogs.length" class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          {{ t('preschoolLifecycleAuditPage.empty') }}
        </div>

        <div v-else class="mt-4 overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3">{{ t('preschoolLifecycleAuditPage.columns.action') }}</th>
                <th class="px-4 py-3">{{ t('preschoolLifecycleAuditPage.columns.entity') }}</th>
                <th class="px-4 py-3">{{ t('preschoolLifecycleAuditPage.columns.context') }}</th>
                <th class="px-4 py-3">{{ t('preschoolLifecycleAuditPage.columns.reason') }}</th>
                <th class="px-4 py-3">{{ t('preschoolLifecycleAuditPage.columns.at') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr v-for="item in auditLogs" :key="item.id">
                <td class="px-4 py-3">
                  <div class="space-y-1">
                    <p class="font-medium text-slate-900">{{ resolveAuditActionLabel(item.actionType) }}</p>
                    <p class="text-xs text-slate-500">{{ item.actor?.roleCode || item.actorRole || '-' }}</p>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-600">
                  <div class="space-y-1">
                    <p>{{ resolveAuditEntityLabel(item.entityType) }}</p>
                    <p class="text-xs text-slate-500">{{ formatEntityReference(item.entityId) }}</p>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-600">
                  <div class="space-y-1">
                    <p>{{ item.reportPeriod?.periodLabel || formatEntityReference(item.reportPeriodId) }}</p>
                    <p class="text-xs text-slate-500">
                      {{ item.actor?.firstName || item.actor?.lastName ? `${item.actor.firstName || ''} ${item.actor.lastName || ''}`.trim() : '-' }}
                    </p>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-600">
                  <div class="space-y-1">
                    <p>{{ formatAuditReason(item.lockReason || item.overrideReason) }}</p>
                    <p v-if="item.lockCode" class="text-xs text-slate-500">{{ humanizeAuditCode(item.lockCode) }}</p>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-600">{{ formatDatetimeShort(item.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
