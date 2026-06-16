<script setup>
// Keep the student report body as a dedicated component so the page only
// handles selection logic while the rendered report stays consistent over time.
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { formatDate, formatDatetimeShort } from '@/utils/date'
import AttendanceSummaryCard from './AttendanceSummaryCard.vue'
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

/**
 * Whether the report data comes from a saved snapshot (finalized period)
 * or is generated live from current assessment records.
 * @returns {boolean}
 */
const isSnapshot = computed(() => props.report?.frozen || props.report?.source === 'snapshot')

/**
 * Assessments grouped by category for a cleaner visual hierarchy.
 * Each group: { name: string, items: Assessment[] }
 * @returns {Array<{name: string, code: string, items: Array}>}
 */
const assessmentsByCategory = computed(() => {
  const assessments = props.report?.assessments ?? []
  const map = new Map()
  for (const a of assessments) {
    const key = a.categoryId || a.category?.id || a.categoryName || 'other'
    if (!map.has(key)) {
      map.set(key, {
        name: a.categoryName || a.category?.name || t('preschoolReportsShared.labels.categoryFallback'),
        code: a.categoryCode || a.category?.code || '',
        items: [],
      })
    }
    map.get(key).items.push(a)
  }
  return [...map.values()]
})

/**
 * Summary stat cards — finalized count, average score, observations, latest date.
 * @returns {Array<{label: string, value: string|number, sub: string}>}
 */
const statCards = computed(() => [
  {
    label: t('preschoolReportsShared.summary.finalized'),
    value: props.report?.summary?.finalizedAssessments ?? 0,
    sub: t('preschoolReportsShared.summary.finalizedCaption'),
    color: 'text-violet-700',
    bg: 'bg-violet-50',
  },
  {
    label: t('preschoolReportsShared.summary.average'),
    value: props.report?.summary?.averageScore ?? '—',
    sub: t('preschoolReportsShared.summary.averageCaption'),
    color: 'text-sky-700',
    bg: 'bg-sky-50',
  },
  {
    label: t('preschoolReportsShared.summary.observations'),
    value: props.report?.summary?.observationCount ?? 0,
    sub: t('preschoolReportsShared.summary.observationsCaption'),
    color: 'text-amber-700',
    bg: 'bg-amber-50',
  },
  {
    label: t('preschoolReportsShared.summary.latest'),
    value: props.report?.summary?.latestAssessmentDate || '—',
    sub: t('preschoolReportsShared.summary.latestCaption'),
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
  },
])
</script>

<template>
  <!-- Loading skeleton -->
  <div
    v-if="loading"
    class="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400"
  >
    {{ t('preschoolReportsShared.loading') }}
  </div>

  <!-- Empty / no period selected yet -->
  <div
    v-else-if="!report"
    class="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400"
  >
    {{ t('preschoolReportsShared.emptyReport') }}
  </div>

  <div v-else class="space-y-4">

    <!-- ── Data freshness notice ──────────────────────────────────────────────
         Plain language instead of "Immutable Snapshot" / "Frozen Report". -->
    <div
      class="flex flex-wrap items-center gap-2 rounded-2xl border px-4 py-2.5"
      :class="isSnapshot
        ? 'border-amber-200 bg-amber-50'
        : 'border-emerald-200 bg-emerald-50'"
    >
      <span
        class="inline-flex items-center gap-1.5 text-xs font-semibold"
        :class="isSnapshot ? 'text-amber-700' : 'text-emerald-700'"
      >
        <span
          class="inline-block h-1.5 w-1.5 rounded-full"
          :class="isSnapshot ? 'bg-amber-500' : 'bg-emerald-500'"
        />
        {{ isSnapshot
          ? t('preschoolReportsShared.dataSource.snapshot')
          : t('preschoolReportsShared.dataSource.live') }}
      </span>
      <span class="text-xs text-slate-500">
        {{ isSnapshot
          ? t('preschoolReportsShared.dataSource.snapshotNote')
          : t('preschoolReportsShared.dataSource.liveNote') }}
      </span>
      <span v-if="report.generatedAt" class="ml-auto text-xs text-slate-400">
        {{ t('preschoolReportsShared.dataSource.asOf') }} {{ formatDatetimeShort(report.generatedAt) }}
      </span>
    </div>

    <!-- ── Summary stat cards ─────────────────────────────────────────────── -->
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ card.label }}</p>
        <div class="mt-2 text-3xl font-bold" :class="card.color">{{ card.value }}</div>
        <p class="mt-1 text-xs text-slate-400">{{ card.sub }}</p>
      </div>
    </div>

    <!-- ── Attendance summary ─────────────────────────────────────────────── -->
    <AttendanceSummaryCard :summary="report.attendanceSummary" />

    <!-- ── Category performance ───────────────────────────────────────────── -->
    <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-100 px-4 py-3">
        <h3 class="text-sm font-semibold text-slate-900">
          {{ t('preschoolReportsShared.categoryPerformanceTitle') }}
        </h3>
        <p class="mt-0.5 text-xs text-slate-500">
          {{ t('preschoolReportsShared.categoryPerformanceSubtitle') }}
        </p>
      </div>

      <div v-if="!report.categorySummaries?.length" class="px-4 py-8 text-sm text-slate-400">
        {{ t('preschoolReportsShared.emptyCategorySummaries') }}
      </div>

      <ul v-else class="divide-y divide-slate-100">
        <li
          v-for="cat in report.categorySummaries"
          :key="cat.category?.id"
          class="flex items-center gap-4 px-4 py-3"
        >
          <!-- Category name + assessment count -->
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-800">
              {{ cat.category?.name || '—' }}
            </p>
            <p class="text-xs text-slate-400">
              {{ t('preschoolReportsShared.assessmentCount', { count: cat.count }) }}
            </p>
          </div>

          <!-- Score bar + numeric average -->
          <div class="flex w-32 flex-shrink-0 items-center gap-2">
            <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-violet-500 transition-all"
                :style="{ width: cat.averageScore != null ? `${Math.min(100, (cat.averageScore / 10) * 100)}%` : '0%' }"
              />
            </div>
            <span class="w-8 text-right text-sm font-semibold text-slate-700">
              {{ cat.averageScore ?? '—' }}
            </span>
          </div>
        </li>
      </ul>
    </section>

    <!-- ── Teacher observations ───────────────────────────────────────────── -->
    <TeacherObservationPanel :items="report.observations" />

    <!-- ── Assessments grouped by category ───────────────────────────────── -->
    <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-100 px-4 py-3">
        <h3 class="text-sm font-semibold text-slate-900">
          {{ t('preschoolReportsShared.assessmentsTitle') }}
        </h3>
        <p class="mt-0.5 text-xs text-slate-500">
          {{ t('preschoolReportsShared.assessmentsSubtitle') }}
        </p>
      </div>

      <div v-if="!report.assessments?.length" class="px-4 py-8 text-sm text-slate-400">
        {{ t('preschoolReportsShared.emptyAssessments') }}
      </div>

      <!-- Category groups -->
      <div v-else class="divide-y divide-slate-100">
        <div v-for="group in assessmentsByCategory" :key="group.name">
          <!-- Category header row -->
          <div class="bg-slate-50 px-4 py-2">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {{ group.name }}
            </span>
            <span class="ml-2 text-xs text-slate-400">
              {{ t('preschoolReportsShared.assessmentCount', { count: group.items.length }) }}
            </span>
          </div>

          <!-- Individual assessment rows -->
          <ul class="divide-y divide-slate-50">
            <li
              v-for="assessment in group.items"
              :key="assessment.id"
              class="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
            >
              <div class="min-w-0 flex-1 space-y-1">
                <p class="text-sm text-slate-700">{{ assessment.periodLabel || '—' }}</p>
                <p class="text-xs text-slate-400">
                  {{ formatDate(assessment.assessmentDate) }}
                  <template v-if="assessment.assessedByName"> · {{ assessment.assessedByName }}</template>
                </p>
                <p v-if="assessment.observation || assessment.teacherComment" class="text-sm text-slate-600 italic">
                  "{{ assessment.observation || assessment.teacherComment }}"
                </p>
              </div>
              <div class="flex-shrink-0 text-right">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  :class="assessment.score != null
                    ? 'bg-violet-50 text-violet-700'
                    : 'bg-slate-100 text-slate-500'"
                >
                  {{ assessment.score != null
                    ? t('preschoolReportsShared.labels.score', { score: assessment.score })
                    : '—' }}
                </span>
                <p v-if="assessment.rating" class="mt-1 text-xs text-slate-400">{{ assessment.rating }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
