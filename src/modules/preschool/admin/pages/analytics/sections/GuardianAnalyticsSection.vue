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
const breakdownItems = computed(() => toSeries(
  props.analytics?.breakdowns?.byMethod
  || props.analytics?.breakdowns?.contactMethod
  || props.analytics?.datasets?.byMethod
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
        <AnalyticsMetricCard :title="t('preschoolAnalyticsPage.contactLogs')" :value="summary.contactLogs ?? summary.total ?? '—'" tone="blue" :to="detailsTo.guardianContacts || null" :details-label="t('preschoolAnalyticsPage.viewDetails')" />
        <AnalyticsMetricCard :title="t('preschoolAnalyticsPage.followUps')" :value="summary.followUps ?? summary.follow_ups ?? '—'" tone="amber" :to="detailsTo.guardianContacts || null" :details-label="t('preschoolAnalyticsPage.viewDetails')" />
        <AnalyticsMetricCard :title="t('preschoolAnalyticsPage.completed')" :value="summary.completed ?? '—'" tone="emerald" :to="detailsTo.guardianContacts || null" :details-label="t('preschoolAnalyticsPage.viewDetails')" />
        <AnalyticsMetricCard :title="t('preschoolAnalyticsPage.outstanding')" :value="summary.outstandingFollowUps ?? summary.outstanding ?? '—'" tone="rose" :to="detailsTo.guardianContacts || null" :details-label="t('preschoolAnalyticsPage.viewDetails')" />
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <AnalyticsChartCard
          :title="t('preschoolAnalyticsPage.trend')"
          :subtitle="t('preschoolAnalyticsPage.sections.guardians.subtitle')"
          chart-type="bar"
          :series="toSeries(analytics?.charts?.guardianContacts || analytics?.trends?.guardianContacts || [])"
          :empty-text="t('preschoolAnalyticsPage.noTrendData')"
          :item-to="chartItemTo"
          :view-label="t('preschoolAnalyticsPage.viewDetails')"
        />
        <AnalyticsBreakdownList
          :title="t('preschoolAnalyticsPage.breakdown')"
          :subtitle="t('preschoolAnalyticsPage.byMethod')"
          :items="breakdownItems"
          :empty-text="t('preschoolAnalyticsPage.noBreakdownData')"
          :item-to="breakdownItemTo"
          :view-label="t('preschoolAnalyticsPage.viewDetails')"
        />
      </div>
    </template>
  </section>
</template>
