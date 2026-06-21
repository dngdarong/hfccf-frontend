<script setup>
import PreschoolReportSectionPage from './PreschoolReportSectionPage.vue'
import { fetchEnrollmentReports } from '@/modules/preschool/services/api/preschoolReportingApi'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({ name: 'PreschoolEnrollmentReportsPage' })

const { t } = useLanguage()
</script>

<template>
  <PreschoolReportSectionPage
    :title="t('preschoolReportsCenterPage.sections.enrollments.title')"
    :subtitle="t('preschoolReportsCenterPage.sections.enrollments.subtitle')"
    section-key="enrollments"
    export-section="enrollments"
    :fetcher="fetchEnrollmentReports"
    rows-key="admissions"
    chart-key="trend"
    :chart-title="t('preschoolReportsCenterPage.charts.enrollmentTrend')"
    :chart-subtitle="t('preschoolReportsCenterPage.sections.enrollments.subtitle')"
    :table-columns="[
      { key: 'label', label: t('preschoolReportsCenterPage.table.label') },
      { key: 'value', label: t('preschoolReportsCenterPage.table.count') },
    ]"
    :empty-state-key="'preschoolReportsCenterPage.emptyStates.enrollments'"
  />
</template>
