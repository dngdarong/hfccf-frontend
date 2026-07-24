<script setup>
// Keep classroom reporting in its own component so the classroom page can
// focus on selection while the summary table stays easy to extend later.
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import ReportSummaryCard from './ReportSummaryCard.vue'
import AttendanceSummaryCard from './AttendanceSummaryCard.vue'
import ReportSnapshotBadge from './ReportSnapshotBadge.vue'
import TeacherObservationPanel from './TeacherObservationPanel.vue'

const props = defineProps({
  report: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const { t } = useLanguage()

const summaryCards = computed(() => [
  {
    title: t('preschoolReportsShared.summary.finalized'),
    value: props.report?.summary?.finalizedAssessments ?? 0,
    caption: t('preschoolReportsShared.summary.finalizedCaption'),
  },
  {
    title: t('preschoolReportsShared.summary.average'),
    value: props.report?.summary?.averageScore ?? '-',
    caption: t('preschoolReportsShared.summary.averageCaption'),
  },
  {
    title: t('preschoolReportsShared.summary.students'),
    value: props.report?.summary?.studentCount ?? 0,
    caption: t('preschoolReportsShared.summary.studentsCaption'),
  },
  {
    title: t('preschoolReportsShared.summary.observations'),
    value: props.report?.summary?.observationCount ?? 0,
    caption: t('preschoolReportsShared.summary.observationsCaption'),
  },
])
</script>

<template>
  <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
    {{ t('preschoolReportsShared.loading') }}
  </div>

  <div v-else-if="!report" class="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
    {{ t('preschoolReportsShared.emptyReport') }}
  </div>

  <div v-else class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolReportSnapshots.labels.classroomReportTitle') }}</h3>
        <p class="text-sm text-slate-500">{{ t('preschoolReportSnapshots.labels.classroomReportSubtitle') }}</p>
      </div>
      <ReportSnapshotBadge :snapshot="report.snapshot" :source="report.source" :frozen="report.frozen" :generated-at="report.generatedAt" />
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

    <AttendanceSummaryCard :summary="report.attendanceSummary" />

    <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-200 px-4 py-3">
        <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolClassroomReportsPage.studentsTitle') }}</h3>
      </div>
      <div v-if="!report.studentSummaries?.length" class="px-4 py-8 text-sm text-slate-500">
        {{ t('preschoolClassroomReportsPage.emptyStudents') }}
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">{{ t('preschoolClassroomReportsPage.studentColumns.name') }}</th>
              <th class="px-4 py-3">{{ t('preschoolClassroomReportsPage.studentColumns.assessments') }}</th>
              <th class="px-4 py-3">{{ t('preschoolClassroomReportsPage.studentColumns.average') }}</th>
              <th class="px-4 py-3">{{ t('preschoolClassroomReportsPage.studentColumns.attendance') }}</th>
              <th class="px-4 py-3">{{ t('preschoolClassroomReportsPage.studentColumns.latest') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="item in report.studentSummaries" :key="item.student?.id">
              <td class="px-4 py-3 font-medium text-slate-900">
                {{ item.student?.fullName || item.student?.name || '-' }}
              </td>
              <td class="px-4 py-3 text-slate-600">{{ item.assessmentCount ?? 0 }}</td>
              <td class="px-4 py-3 text-slate-600">{{ item.averageScore ?? '-' }}</td>
              <td class="px-4 py-3 text-slate-600">
                {{ t('preschoolReportsShared.attendance.totalShort', { count: item.attendanceSummary?.attendanceCount ?? 0 }) }}
              </td>
              <td class="px-4 py-3 text-slate-600">{{ item.latestAssessmentDate || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <TeacherObservationPanel :items="report.observations" />

    <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-200 px-4 py-3">
        <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolReportsShared.assessmentsTitle') }}</h3>
      </div>
      <div v-if="!report.assessments?.length" class="px-4 py-8 text-sm text-slate-500">
        {{ t('preschoolReportsShared.emptyAssessments') }}
      </div>
      <ul v-else class="divide-y divide-slate-100">
        <li v-for="assessment in report.assessments" :key="assessment.id" class="px-4 py-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="space-y-1">
              <p class="text-sm font-semibold text-slate-900">
                {{ assessment.studentName || assessment.student?.fullName || '-' }}
              </p>
              <p class="text-xs text-slate-500">
                {{ assessment.categoryName || assessment.category?.name || t('preschoolReportsShared.labels.categoryFallback') }} • {{ assessment.assessmentDate || '-' }}
              </p>
            </div>
            <div class="text-right text-sm text-slate-600">
              <p>{{ t('preschoolReportsShared.labels.score', { score: assessment.score ?? '-' }) }}</p>
              <p>{{ assessment.rating || '-' }}</p>
            </div>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>
