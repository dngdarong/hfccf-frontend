<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import AnalyticsMetricCard from '../components/AnalyticsMetricCard.vue'
import AnalyticsChartCard from '../components/AnalyticsChartCard.vue'
import AnalyticsBreakdownList from '../components/AnalyticsBreakdownList.vue'
import AnalyticsEmptyState from '../components/AnalyticsEmptyState.vue'

const props = defineProps({
  analytics: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  detailsTo: {
    type: Object,
    default: () => ({}),
  },
  chartItemTo: {
    type: Function,
    default: null,
  },
  breakdownItemTo: {
    type: Function,
    default: null,
  },
  emptyText: {
    type: String,
    default: '',
  },
})

const { t } = useLanguage()

function toSeries(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.series)) return value.series
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.rows)) return value.rows
  return []
}

const summary = computed(() => props.analytics?.summary || {})
const chartSeries = computed(() => toSeries(
  props.analytics?.charts?.attendance
  || props.analytics?.trends?.attendance
  || props.analytics?.datasets?.attendance
  || [],
))
const breakdownItems = computed(() => toSeries(
  props.analytics?.breakdowns?.byClass
  || props.analytics?.breakdowns?.classBreakdown
  || props.analytics?.datasets?.byClass
  || [],
))
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
      <p class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <AnalyticsEmptyState v-if="!Object.keys(summary).length" :title="emptyText" />

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCard :title="t('preschoolAnalyticsPage.attendanceRate')" :value="summary.attendanceRate ?? summary.attendance_rate ?? '—'" tone="emerald" :to="detailsTo.attendance || null" :details-label="t('preschoolAnalyticsPage.viewDetails')" />
        <AnalyticsMetricCard :title="t('preschoolAnalyticsPage.present')" :value="summary.present ?? '—'" tone="blue" />
        <AnalyticsMetricCard :title="t('preschoolAnalyticsPage.absent')" :value="summary.absent ?? '—'" tone="rose" />
        <AnalyticsMetricCard :title="`${t('preschoolAnalyticsPage.late')} / ${t('preschoolAnalyticsPage.excused')}`" :value="`${summary.late ?? 0} / ${summary.excused ?? 0}`" tone="amber" />
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <AnalyticsChartCard
          :title="t('preschoolAnalyticsPage.attendanceTrend')"
          :subtitle="t('preschoolAnalyticsPage.sections.attendance.subtitle')"
          chart-type="line"
          :series="chartSeries"
          :empty-text="t('preschoolAnalyticsPage.noTrendData')"
          :item-to="chartItemTo"
          :view-label="t('preschoolAnalyticsPage.viewDetails')"
        />
        <AnalyticsBreakdownList
          :title="t('preschoolAnalyticsPage.breakdown')"
          :subtitle="t('preschoolAnalyticsPage.byClass')"
          :items="breakdownItems"
          :empty-text="t('preschoolAnalyticsPage.noBreakdownData')"
          :item-to="breakdownItemTo"
          :view-label="t('preschoolAnalyticsPage.viewDetails')"
        />
      </div>
    </template>
  </section>
</template>
