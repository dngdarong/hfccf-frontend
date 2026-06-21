<script setup>
import PreschoolReportSectionPage from './PreschoolReportSectionPage.vue'
import { fetchPaymentReports } from '@/modules/preschool/services/api/preschoolReportingApi'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({ name: 'PreschoolPaymentReportsPage' })

const { t } = useLanguage()
</script>

<template>
  <PreschoolReportSectionPage
    :title="t('preschoolReportsCenterPage.sections.payments.title')"
    :subtitle="t('preschoolReportsCenterPage.sections.payments.subtitle')"
    section-key="payments"
    export-section="payments"
    :fetcher="fetchPaymentReports"
    rows-key="revenue"
    chart-key="revenue"
    :chart-title="t('preschoolReportsCenterPage.charts.paymentTrend')"
    :chart-subtitle="t('preschoolReportsCenterPage.sections.payments.subtitle')"
    :table-columns="[
      { key: 'label', label: t('preschoolReportsCenterPage.table.label') },
      { key: 'value', label: t('preschoolReportsCenterPage.table.amount') },
    ]"
    :empty-state-key="'preschoolReportsCenterPage.emptyStates.payments'"
  />
</template>
