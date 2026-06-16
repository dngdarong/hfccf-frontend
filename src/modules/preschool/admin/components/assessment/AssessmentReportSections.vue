<script setup>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ProgressIndicator from '@/modules/preschool/components/assessment-summary/ProgressIndicator.vue'
import StatCard from '@/modules/preschool/components/assessment-summary/StatCard.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AssessmentReportSections',
})

defineProps({
  summaryCards: {
    type: Array,
    required: true,
  },
  riskCards: {
    type: Array,
    required: true,
  },
  categoryPerformanceArray: {
    type: Array,
    required: true,
  },
  highRiskStudents: {
    type: Array,
    required: true,
  },
  periodComparison: {
    type: Array,
    required: true,
  },
  summaryTotal: {
    type: Number,
    required: true,
  },
  improvementTrend: {
    type: Object,
    default: null,
  },
  exportCount: {
    type: Number,
    default: 0,
  },
})

const { t } = useLanguage()

const categoryColumns = [
  { field: 'categoryName', headerKey: 'assessmentReports.categoryColumns.category' },
  { field: 'count', headerKey: 'assessmentReports.categoryColumns.assessments' },
  { field: 'average', headerKey: 'assessmentReports.categoryColumns.averageScore' },
  { field: 'highest', headerKey: 'assessmentReports.categoryColumns.highest' },
  { field: 'lowest', headerKey: 'assessmentReports.categoryColumns.lowest' },
]
</script>

<template>
  <div class="space-y-8">
    <section class="space-y-4">
      <h3 class="text-xl font-bold text-slate-900">{{ t('assessmentReports.summaryStatistics') }}</h3>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          v-for="card in summaryCards"
          :key="card.label"
          :icon="card.label"
          :icon-class="card.iconClass"
          :label="card.label"
          :value="card.value"
          :unit="card.unit"
          :color="card.color"
        />
      </div>
    </section>

    <section class="space-y-4">
      <h3 class="text-xl font-bold text-slate-900">{{ t('assessmentReports.riskLevelDistribution') }}</h3>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="card in riskCards"
          :key="card.label"
          :class="[
            'rounded-2xl border p-4 shadow-sm',
            card.color === 'blue' ? 'border-blue-200 bg-blue-50' :
            card.color === 'emerald' ? 'border-emerald-200 bg-emerald-50' :
            card.color === 'amber' ? 'border-amber-200 bg-amber-50' :
            'border-red-200 bg-red-50',
          ]"
        >
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <i :class="[card.iconClass, 'text-lg text-slate-700']" />
              <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                {{ card.label }}
              </span>
            </div>
            <div class="text-3xl font-bold text-slate-900">{{ card.value }}</div>
            <div class="text-xs text-slate-600">{{ card.percentage }}{{ t('assessmentReports.riskCards.ofTotal') }}</div>
            <ProgressIndicator
              :current="card.value"
              :total="summaryTotal"
              show-percentage
              :color="card.color"
            />
          </div>
        </article>
      </div>
    </section>

    <section class="space-y-4">
      <h3 class="text-xl font-bold text-slate-900">{{ t('assessmentReports.categoryPerformance') }}</h3>
      <DataTable
        :value="categoryPerformanceArray"
        striped-rows
        show-gridlines
        responsive-layout="scroll"
        class="w-full"
      >
        <Column
          v-for="column in categoryColumns"
          :key="column.field"
          :field="column.field"
          :header="t(column.headerKey)"
        />
        <Column :header="t('assessmentReports.categoryColumns.scoreRange')">
          <template #body="{ data }">
            <span class="font-bold text-blue-700">
              {{ data.average }}/100
            </span>
          </template>
        </Column>
        <Column :header="t('assessmentReports.categoryColumns.qualityMix')">
          <template #body="{ data }">
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span>{{ t('assessmentReports.categoryColumns.excellent') }}</span>
                <span class="font-semibold">{{ data.excellentCount }}</span>
              </div>
              <div class="flex justify-between">
                <span>{{ t('assessmentReports.categoryColumns.good') }}</span>
                <span class="font-semibold">{{ data.goodCount }}</span>
              </div>
              <div class="flex justify-between">
                <span>{{ t('assessmentReports.categoryColumns.fair') }}</span>
                <span class="font-semibold">{{ data.fairCount }}</span>
              </div>
              <div class="flex justify-between">
                <span>{{ t('assessmentReports.categoryColumns.needsImprovement') }}</span>
                <span class="font-semibold">{{ data.needsImprovementCount }}</span>
              </div>
            </div>
          </template>
        </Column>
      </DataTable>
    </section>

    <section class="space-y-4">
      <h3 class="text-xl font-bold text-slate-900">{{ t('assessmentReports.topRiskStudents') }}</h3>
      <DataTable
        :value="highRiskStudents"
        striped-rows
        show-gridlines
        responsive-layout="scroll"
        class="w-full"
      >
        <Column :field="'student.fullName'" :header="t('assessmentReports.studentColumns.student')" />
        <Column :field="'category.name'" :header="t('assessmentReports.studentColumns.category')" />
        <Column field="assessmentDate" :header="t('assessmentReports.studentColumns.date')">
          <template #body="{ data }">
            {{ data.assessmentDate ? new Date(data.assessmentDate).toLocaleDateString() : '-' }}
          </template>
        </Column>
        <Column field="score" :header="t('assessmentReports.studentColumns.score')" />
        <Column field="rating" :header="t('assessmentReports.studentColumns.rating')" />
        <Column field="observation" :header="t('assessmentReports.studentColumns.observation')">
          <template #body="{ data }">
            <span class="max-w-sm text-sm text-slate-600">
              {{ data.observation?.substring(0, 60) }}{{ data.observation?.length > 60 ? '...' : '' }}
            </span>
          </template>
        </Column>
      </DataTable>
    </section>

    <section class="space-y-4">
      <h3 class="text-xl font-bold text-slate-900">{{ t('assessmentReports.periodComparison') }}</h3>
      <DataTable
        :value="periodComparison"
        striped-rows
        show-gridlines
        responsive-layout="scroll"
        class="w-full"
      >
        <Column field="period" :header="t('assessmentReports.periodColumns.period')" />
        <Column field="count" :header="t('assessmentReports.periodColumns.assessments')" />
        <Column field="average" :header="t('assessmentReports.periodColumns.averageScore')" />
        <Column :header="t('assessmentReports.periodColumns.ratingMix')">
          <template #body="{ data }">
            <div class="flex flex-wrap gap-2 text-xs">
            <span class="rounded bg-blue-100 px-2 py-1 text-blue-700">{{ t('assessmentReports.categoryColumns.excellent') }} {{ data.excellent }}</span>
            <span class="rounded bg-emerald-100 px-2 py-1 text-emerald-700">{{ t('assessmentReports.categoryColumns.good') }} {{ data.good }}</span>
            <span class="rounded bg-amber-100 px-2 py-1 text-amber-700">{{ t('assessmentReports.categoryColumns.fair') }} {{ data.fair }}</span>
            <span class="rounded bg-red-100 px-2 py-1 text-red-700">{{ t('assessmentReports.categoryColumns.needsImprovement') }} {{ data.needsImprovement }}</span>
            </div>
          </template>
        </Column>
      </DataTable>
    </section>

    <section v-if="improvementTrend" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
      <h3 class="font-bold text-emerald-900">{{ t('assessmentReports.improvementTrend') }}</h3>
      <div class="mt-4 text-center">
        <div class="text-4xl font-bold text-emerald-700">
          {{ improvementTrend.improved ? '↑' : '↓' }} {{ improvementTrend.change }}
        </div>
        <p class="mt-2 text-emerald-800">
          <span v-if="improvementTrend.improved" class="font-semibold">{{ t('assessmentReports.improvement.improvementDetected') }}</span>
          <span v-else class="font-semibold">{{ t('assessmentReports.improvement.declineDetected') }}</span>
          {{ improvementTrend.percentage }}{{ t('assessmentReports.improvement.changeOverTime') }}
        </p>
      </div>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 class="font-semibold text-slate-900">{{ t('assessmentReports.exportReports') }}</h3>
      <div class="mt-3 flex flex-wrap gap-2">
        <slot name="export-actions" />
      </div>
      <p class="mt-3 text-sm text-slate-600">
        {{ t('assessmentReports.exportNote', { count: exportCount }) }}
      </p>
    </section>
  </div>
</template>
