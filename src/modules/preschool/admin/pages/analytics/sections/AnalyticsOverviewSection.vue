<script setup>
import AnalyticsMetricCard from '../components/AnalyticsMetricCard.vue'
import AnalyticsEmptyState from '../components/AnalyticsEmptyState.vue'
import { useLanguage } from '@/composables/useLanguage'

defineProps({
  analytics: {
    type: Object,
    default: () => ({}),
  },
  detailsTo: {
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
  emptyText: {
    type: String,
    default: '',
  },
})

const { t } = useLanguage()

function pickMetric(source, keys, fallback = '') {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null && `${value}`.trim() !== '') {
      return value
    }
  }

  return fallback
}
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
      <p class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <AnalyticsEmptyState
      v-if="!Object.keys(analytics.summary || {}).length"
      :title="emptyText"
    />

    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AnalyticsMetricCard
        :title="t('preschoolAnalyticsPage.attendanceRate')"
        :value="pickMetric(analytics.summary, ['attendanceRate', 'attendance_rate'], '—')"
        :caption="pickMetric(analytics.summary, ['attendanceRateCaption'], '')"
        tone="emerald"
        :to="detailsTo.attendance || null"
        :details-label="t('preschoolAnalyticsPage.viewDetails')"
      />
      <AnalyticsMetricCard
        :title="t('preschoolAnalyticsPage.sessionsGenerated')"
        :value="pickMetric(analytics.summary, ['sessionsGenerated', 'sessions_generated'], '—')"
        :caption="pickMetric(analytics.summary, ['sessionsGeneratedCaption'], '')"
        tone="blue"
        :to="detailsTo.sessions || null"
        :details-label="t('preschoolAnalyticsPage.viewDetails')"
      />
      <AnalyticsMetricCard
        :title="t('preschoolAnalyticsPage.openAlerts')"
        :value="pickMetric(analytics.summary, ['openAlerts', 'open_alerts'], '—')"
        :caption="pickMetric(analytics.summary, ['openAlertsCaption'], '')"
        tone="rose"
        :to="detailsTo.alerts || null"
        :details-label="t('preschoolAnalyticsPage.viewDetails')"
      />
      <AnalyticsMetricCard
        :title="t('preschoolAnalyticsPage.guardianContacts')"
        :value="pickMetric(analytics.summary, ['guardianContacts', 'guardian_contacts'], '—')"
        :caption="pickMetric(analytics.summary, ['guardianContactsCaption'], '')"
        tone="amber"
        :to="detailsTo.guardianContacts || null"
        :details-label="t('preschoolAnalyticsPage.viewDetails')"
      />
    </div>
  </section>
</template>
