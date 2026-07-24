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
  props.analytics?.charts?.sessions
  || props.analytics?.trends?.sessions
  || props.analytics?.datasets?.sessions
  || [],
))
const breakdownItems = computed(() => toSeries(
  props.analytics?.breakdowns?.byTeacher
  || props.analytics?.breakdowns?.teacherBreakdown
  || props.analytics?.datasets?.byTeacher
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
        <AnalyticsMetricCard :title="t('preschoolAnalyticsPage.sessionsGenerated')" :value="summary.sessionsGenerated ?? summary.generated ?? '—'" tone="blue" :to="detailsTo.sessions || null" :details-label="t('preschoolAnalyticsPage.viewDetails')" />
        <AnalyticsMetricCard :title="t('preschoolAnalyticsPage.sessionsCompleted')" :value="summary.sessionsCompleted ?? summary.completed ?? '—'" tone="emerald" :to="detailsTo.sessions || null" :details-label="t('preschoolAnalyticsPage.viewDetails')" />
        <AnalyticsMetricCard :title="t('preschoolAnalyticsPage.missingSessions')" :value="summary.missingSessions ?? summary.missing ?? '—'" tone="rose" :to="detailsTo.sessions || null" :details-label="t('preschoolAnalyticsPage.viewDetails')" />
        <AnalyticsMetricCard :title="t('preschoolAnalyticsPage.completionRate')" :value="summary.completionRate ?? summary.completion_rate ?? '—'" tone="violet" />
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <AnalyticsChartCard
          :title="t('preschoolAnalyticsPage.trend')"
          :subtitle="t('preschoolAnalyticsPage.sections.sessions.subtitle')"
          chart-type="bar"
          :series="chartSeries"
          :empty-text="t('preschoolAnalyticsPage.noTrendData')"
          :item-to="chartItemTo"
          :view-label="t('preschoolAnalyticsPage.viewDetails')"
        />
        <AnalyticsBreakdownList
          :title="t('preschoolAnalyticsPage.breakdown')"
          :subtitle="t('preschoolAnalyticsPage.byTeacher')"
          :items="breakdownItems"
          :empty-text="t('preschoolAnalyticsPage.noBreakdownData')"
          :item-to="breakdownItemTo"
          :view-label="t('preschoolAnalyticsPage.viewDetails')"
        />
      </div>
    </template>
  </section>
</template>
