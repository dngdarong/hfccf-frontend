<script setup>
import PreschoolReportSectionPage from './PreschoolReportSectionPage.vue'
import { fetchGuardianReports } from '@/modules/preschool/services/api/preschoolReportingApi'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({ name: 'PreschoolGuardianReportsPage' })

const { t } = useLanguage()
</script>

<template>
  <PreschoolReportSectionPage
    :title="t('preschoolReportsCenterPage.sections.guardians.title')"
    :subtitle="t('preschoolReportsCenterPage.sections.guardians.subtitle')"
    section-key="guardians"
    export-section="guardians"
    :fetcher="fetchGuardianReports"
    rows-key="issues"
    chart-key="communications"
    :chart-title="t('preschoolReportsCenterPage.charts.guardianTrend')"
    :chart-subtitle="t('preschoolReportsCenterPage.sections.guardians.subtitle')"
    :table-columns="[
      { key: 'label', label: t('preschoolReportsCenterPage.table.label') },
      { key: 'value', label: t('preschoolReportsCenterPage.table.count') },
    ]"
    :empty-state-key="'preschoolReportsCenterPage.emptyStates.guardians'"
  />
</template>
