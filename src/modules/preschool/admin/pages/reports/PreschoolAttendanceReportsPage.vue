<script setup>
import PreschoolReportSectionPage from './PreschoolReportSectionPage.vue'
import { fetchAttendanceReports } from '@/modules/preschool/services/api/preschoolReportingApi'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({ name: 'PreschoolAttendanceReportsPage' })

const { t } = useLanguage()
</script>

<template>
  <PreschoolReportSectionPage
    :title="t('preschoolReportsCenterPage.sections.attendance.title')"
    :subtitle="t('preschoolReportsCenterPage.sections.attendance.subtitle')"
    section-key="attendance"
    export-section="attendance"
    :fetcher="fetchAttendanceReports"
    rows-key="classBreakdown"
    chart-key="trend"
    :chart-title="t('preschoolReportsCenterPage.charts.attendanceTrend')"
    :chart-subtitle="t('preschoolReportsCenterPage.sections.attendance.subtitle')"
    :table-columns="[
      { key: 'label', label: t('preschoolReportsCenterPage.table.label') },
      { key: 'value', label: t('preschoolReportsCenterPage.table.value') },
    ]"
    :empty-state-key="'preschoolReportsCenterPage.emptyStates.attendance'"
  />
</template>
