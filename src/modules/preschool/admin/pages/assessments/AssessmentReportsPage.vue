<script setup>
import { computed, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useAssessmentData } from '@/modules/preschool/composables/useAssessmentData'
import { useAssessmentReports } from '@/modules/preschool/composables/useAssessmentReports'
import AssessmentPageHeader from '@/modules/preschool/admin/components/assessment/AssessmentPageHeader.vue'
import AssessmentReportSections from '@/modules/preschool/admin/components/assessment/AssessmentReportSections.vue'

defineOptions({
  name: 'PreschoolAssessmentReportsPage',
})

const { loadAllLookupData } = useAssessmentData()
const { t } = useLanguage()
const {
  summaryStats,
  riskAnalysis,
  categoryPerformanceArray,
  highRiskStudents,
  periodComparison,
  getRiskPercentage,
  getImprovementTrend,
  exportData,
} = useAssessmentReports()

onMounted(async () => {
  await loadAllLookupData()
})

const summaryCards = computed(() => [
  { iconClass: 'pi pi-chart-bar', label: t('assessmentReports.summaryCards.totalAssessments'), value: summaryStats.value.total, color: 'blue' },
  { iconClass: 'pi pi-check-circle', label: t('assessmentReports.summaryCards.completed'), value: summaryStats.value.completed, color: 'emerald' },
  { iconClass: 'pi pi-star', label: t('assessmentReports.summaryCards.averageScore'), value: summaryStats.value.average || '-', unit: '/100', color: 'purple' },
  { iconClass: 'pi pi-chart-line', label: t('assessmentReports.summaryCards.medianScore'), value: summaryStats.value.median || '-', unit: '/100', color: 'amber' },
])

const riskCards = computed(() => [
  { iconClass: 'pi pi-star', label: t('assessmentReports.riskCards.excellent'), value: riskAnalysis.value.excellent || 0, percentage: getRiskPercentage('excellent'), color: 'blue' },
  { iconClass: 'pi pi-thumbs-up', label: t('assessmentReports.riskCards.good'), value: riskAnalysis.value.good || 0, percentage: getRiskPercentage('good'), color: 'emerald' },
  { iconClass: 'pi pi-minus-circle', label: t('assessmentReports.riskCards.fair'), value: riskAnalysis.value.fair || 0, percentage: getRiskPercentage('fair'), color: 'amber' },
  { iconClass: 'pi pi-exclamation-triangle', label: t('assessmentReports.riskCards.atRisk'), value: riskAnalysis.value.atRisk || 0, percentage: getRiskPercentage('at-risk'), color: 'red' },
])

const improvementTrend = computed(() => getImprovementTrend())
</script>

<template>
  <MainLayout>
    <div class="space-y-8">
      <AssessmentPageHeader
        :title="t('assessmentReports.title')"
        :subtitle="t('assessmentReports.subtitle')"
      />

      <AssessmentReportSections
        :summary-cards="summaryCards"
        :risk-cards="riskCards"
        :category-performance-array="categoryPerformanceArray"
        :high-risk-students="highRiskStudents"
        :period-comparison="periodComparison"
        :summary-total="summaryStats.total"
        :improvement-trend="improvementTrend"
        :export-count="exportData.length"
      >
        <template #export-actions>
          <Button :label="t('assessmentReports.exportActions.pdf')" icon="pi pi-file-pdf" size="sm" variant="secondary" />
          <Button :label="t('assessmentReports.exportActions.excel')" icon="pi pi-file-excel" size="sm" variant="secondary" />
          <Button :label="t('assessmentReports.exportActions.csv')" icon="pi pi-file-csv" size="sm" variant="secondary" />
          <Button :label="t('assessmentReports.exportActions.copy')" icon="pi pi-copy" size="sm" variant="secondary" />
        </template>
      </AssessmentReportSections>
    </div>
  </MainLayout>
</template>
