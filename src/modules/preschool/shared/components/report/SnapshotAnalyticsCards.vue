<script setup>
// Keep institutional snapshot metrics in a tiny component so the archive page
// can surface counts, state splits, and class comparisons without becoming a
// monolithic reporting dashboard.
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import ReportSummaryCard from './ReportSummaryCard.vue'

const props = defineProps({
  analytics: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useLanguage()

const overviewCards = computed(() => {
  const overview = props.analytics?.overview || {}

  return [
    {
      title: t('preschoolSnapshotArchivePage.cards.totalSnapshots'),
      value: overview.totalSnapshots ?? 0,
      caption: t('preschoolSnapshotArchivePage.cards.totalSnapshotsCaption'),
    },
    {
      title: t('preschoolSnapshotArchivePage.cards.studentReports'),
      value: overview.studentReportSnapshots ?? 0,
      caption: t('preschoolSnapshotArchivePage.cards.studentReportsCaption'),
    },
    {
      title: t('preschoolSnapshotArchivePage.cards.classroomReports'),
      value: overview.classroomReportSnapshots ?? 0,
      caption: t('preschoolSnapshotArchivePage.cards.classroomReportsCaption'),
    },
    {
      title: t('preschoolSnapshotArchivePage.cards.progressSummaries'),
      value: overview.progressSummarySnapshots ?? 0,
      caption: t('preschoolSnapshotArchivePage.cards.progressSummariesCaption'),
    },
  ]
})
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolInstitutionalReportingPage.title') }}</h3>
        <p class="text-sm text-slate-500">{{ t('preschoolInstitutionalReportingPage.subtitle') }}</p>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ReportSummaryCard
        v-for="card in overviewCards"
        :key="card.title"
        :title="card.title"
        :value="card.value"
        :caption="card.caption"
      />
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.sections.byState') }}</h4>
        <ul class="mt-3 space-y-2 text-sm text-slate-600">
          <li v-for="item in analytics.stateCounts || []" :key="item.lifecycleState" class="flex items-center justify-between gap-3">
            <span class="truncate">{{ t(`preschoolReportSnapshots.states.${item.lifecycleState}`) || item.lifecycleState }}</span>
            <span class="font-semibold text-slate-900">{{ item.total }}</span>
          </li>
          <li v-if="!(analytics.stateCounts || []).length" class="text-slate-500">
            {{ t('preschoolSnapshotArchivePage.emptyStateCounts') }}
          </li>
        </ul>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.sections.byType') }}</h4>
        <ul class="mt-3 space-y-2 text-sm text-slate-600">
          <li v-for="item in analytics.typeCounts || []" :key="item.snapshotType" class="flex items-center justify-between gap-3">
            <span class="truncate">{{ item.snapshotType }}</span>
            <span class="font-semibold text-slate-900">{{ item.total }}</span>
          </li>
          <li v-if="!(analytics.typeCounts || []).length" class="text-slate-500">
            {{ t('preschoolSnapshotArchivePage.emptyTypeCounts') }}
          </li>
        </ul>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.sections.byClass') }}</h4>
        <ul class="mt-3 space-y-2 text-sm text-slate-600">
          <li v-for="item in (analytics.classComparison || []).slice(0, 5)" :key="`${item.classId || 'none'}-${item.snapshotCount}`" class="space-y-1">
            <div class="flex items-center justify-between gap-3">
              <span class="truncate">{{ item.className || t('preschoolSnapshotArchivePage.emptyClassName') }}</span>
              <span class="font-semibold text-slate-900">{{ item.snapshotCount }}</span>
            </div>
            <p class="text-xs text-slate-500">
              {{ t('preschoolSnapshotArchivePage.labels.averageScore') }}: {{ item.averageScore ?? '-' }}
            </p>
          </li>
          <li v-if="!(analytics.classComparison || []).length" class="text-slate-500">
            {{ t('preschoolSnapshotArchivePage.emptyClassComparison') }}
          </li>
        </ul>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.sections.yearlyAttendanceTrend') }}</h4>
        <ul class="mt-3 space-y-2 text-sm text-slate-600">
          <li v-for="item in (analytics.yearlyAttendanceTrend || []).slice(0, 5)" :key="item.academicYearId || item.academicYearLabel" class="flex items-center justify-between gap-3">
            <span class="truncate">{{ item.academicYearLabel || item.academicYearId || '-' }}</span>
            <span class="font-semibold text-slate-900">{{ item.attendanceCount }}</span>
          </li>
          <li v-if="!(analytics.yearlyAttendanceTrend || []).length" class="text-slate-500">
            {{ t('preschoolSnapshotArchivePage.emptyYearlyAttendanceTrend') }}
          </li>
        </ul>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.sections.termAttendanceTrend') }}</h4>
        <ul class="mt-3 space-y-2 text-sm text-slate-600">
          <li v-for="item in (analytics.termAttendanceTrend || []).slice(0, 5)" :key="item.termId || item.termLabel" class="flex items-center justify-between gap-3">
            <span class="truncate">{{ item.termLabel || item.termId || '-' }}</span>
            <span class="font-semibold text-slate-900">{{ item.attendanceCount }}</span>
          </li>
          <li v-if="!(analytics.termAttendanceTrend || []).length" class="text-slate-500">
            {{ t('preschoolSnapshotArchivePage.emptyTermAttendanceTrend') }}
          </li>
        </ul>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.sections.reportPeriodCompletion') }}</h4>
        <ul class="mt-3 space-y-2 text-sm text-slate-600">
          <li v-for="item in (analytics.reportPeriodCompletionOverview || []).slice(0, 5)" :key="item.reportPeriodId || item.reportPeriodLabel" class="space-y-1">
            <div class="flex items-center justify-between gap-3">
              <span class="truncate">{{ item.reportPeriodLabel || item.reportPeriodId || '-' }}</span>
              <span class="font-semibold text-slate-900">{{ item.snapshotCount }}</span>
            </div>
            <p class="text-xs text-slate-500">
              {{ t('preschoolSnapshotArchivePage.labels.finalizedCount') }}: {{ item.finalizedCount }} |
              {{ t('preschoolSnapshotArchivePage.labels.lockedCount') }}: {{ item.lockedCount }} |
              {{ t('preschoolSnapshotArchivePage.labels.archivedCount') }}: {{ item.archivedCount }}
            </p>
          </li>
          <li v-if="!(analytics.reportPeriodCompletionOverview || []).length" class="text-slate-500">
            {{ t('preschoolSnapshotArchivePage.emptyReportPeriodCompletion') }}
          </li>
        </ul>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.sections.assessmentCategoryTrend') }}</h4>
        <ul class="mt-3 space-y-2 text-sm text-slate-600">
          <li v-for="item in (analytics.assessmentCategoryTrend || []).slice(0, 5)" :key="item.categoryKey || item.categoryName" class="space-y-1">
            <div class="flex items-center justify-between gap-3">
              <span class="truncate">{{ item.categoryName || item.categoryKey || '-' }}</span>
              <span class="font-semibold text-slate-900">{{ item.assessmentCount }}</span>
            </div>
            <p class="text-xs text-slate-500">
              {{ t('preschoolSnapshotArchivePage.labels.averageScore') }}: {{ item.averageScore ?? '-' }}
            </p>
          </li>
          <li v-if="!(analytics.assessmentCategoryTrend || []).length" class="text-slate-500">
            {{ t('preschoolSnapshotArchivePage.emptyAssessmentCategoryTrend') }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
