<script setup>
import PreschoolReportSectionPage from './PreschoolReportSectionPage.vue'
import { fetchAssessmentReports } from '@/modules/preschool/services/api/preschoolReportingApi'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({ name: 'PreschoolAssessmentReportsPage' })

const { t } = useLanguage()
</script>

<template>
  <PreschoolReportSectionPage
    :title="t('preschoolReportsCenterPage.sections.assessments.title')"
    :subtitle="t('preschoolReportsCenterPage.sections.assessments.subtitle')"
    section-key="assessments"
    export-section="assessments"
    :fetcher="fetchAssessmentReports"
    rows-key="table"
    chart-key="performance"
    :chart-title="t('preschoolReportsCenterPage.charts.assessmentTrend')"
    :chart-subtitle="t('preschoolReportsCenterPage.sections.assessments.subtitle')"
    :table-columns="[
      { key: 'label', label: t('preschoolReportsCenterPage.table.label') },
      { key: 'value', label: t('preschoolReportsCenterPage.table.score') },
    ]"
    :empty-state-key="'preschoolReportsCenterPage.emptyStates.assessments'"
  />
</template>
