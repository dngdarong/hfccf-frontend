<script setup>
import PreschoolReportSectionPage from './PreschoolReportSectionPage.vue'
import { fetchHealthReports } from '@/modules/preschool/services/api/preschoolReportingApi'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({ name: 'PreschoolHealthReportsPage' })

const { t } = useLanguage()
</script>

<template>
  <PreschoolReportSectionPage
    :title="t('preschoolReportsCenterPage.sections.health.title')"
    :subtitle="t('preschoolReportsCenterPage.sections.health.subtitle')"
    section-key="health"
    export-section="health"
    :fetcher="fetchHealthReports"
    rows-key="incidents"
    chart-key="alerts"
    :chart-title="t('preschoolReportsCenterPage.charts.healthAlerts')"
    :chart-subtitle="t('preschoolReportsCenterPage.sections.health.subtitle')"
    :table-columns="[
      { key: 'label', label: t('preschoolReportsCenterPage.table.label') },
      { key: 'value', label: t('preschoolReportsCenterPage.table.value') },
    ]"
    :empty-state-key="'preschoolReportsCenterPage.emptyStates.health'"
  />
</template>
