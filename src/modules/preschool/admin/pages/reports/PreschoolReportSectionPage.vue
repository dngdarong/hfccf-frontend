<script setup>
import { onMounted, computed } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import { usePreschoolReportSection } from '@/modules/preschool/composables/usePreschoolReportSection'
import ReportFilterBar from '@/modules/preschool/shared/components/report/ReportFilterBar.vue'
import ReportSummaryCards from '@/modules/preschool/shared/components/report/ReportSummaryCards.vue'
import ReportExportMenu from '@/modules/preschool/shared/components/report/ReportExportMenu.vue'
import ReportTable from '@/modules/preschool/shared/components/report/ReportTable.vue'
import ReportChart from '@/modules/preschool/shared/components/report/ReportChart.vue'
import EmptyReportState from '@/modules/preschool/shared/components/report/EmptyReportState.vue'

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  sectionKey: { type: String, default: '' },
  fetcher: { type: Function, required: true },
  rowsKey: { type: String, default: 'rows' },
  chartKey: { type: String, default: 'trend' },
  tableColumns: { type: Array, default: () => [] },
  emptyStateKey: { type: String, default: 'preschoolReportsCenterPage.emptyStates.table' },
  visibleFilters: { type: Array, default: () => ['academicYear', 'term', 'dateRange', 'class', 'teacher', 'status'] },
  filterOptions: { type: Object, default: () => ({}) },
  exportSection: { type: String, default: '' },
  chartTitle: { type: String, default: '' },
  chartSubtitle: { type: String, default: '' },
})

const { t } = useLanguage()

const {
  applyFilters,
  downloadExport,
  errorMessage,
  exporting,
  filterOptions,
  filters,
  loadReport,
  loading,
  report,
  resetFilters,
  selectedFormat,
  visibleFilters,
} = usePreschoolReportSection(props.fetcher, props.exportSection || props.sectionKey, {
  visibleFilters: props.visibleFilters,
  filterOptions: props.filterOptions,
})

const rows = computed(() => report.value[props.rowsKey] || [])
const chartSeries = computed(() => report.value[props.chartKey] || [])
const cards = computed(() => report.value.cards || [])

function getEmptyStateText() {
  return t(props.emptyStateKey)
}

onMounted(() => {
  loadReport()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection :title="title" :subtitle="subtitle" />

      <ReportFilterBar
        v-model="filters"
        :options="filterOptions"
        :visible-filters="visibleFilters"
        :loading="loading"
        :labels="{
          academicYear: t('preschoolReportsCenterPage.filters.academicYear'),
          term: t('preschoolReportsCenterPage.filters.term'),
          dateFrom: t('preschoolReportsCenterPage.filters.dateFrom'),
          dateTo: t('preschoolReportsCenterPage.filters.dateTo'),
          class: t('preschoolReportsCenterPage.filters.class'),
          teacher: t('preschoolReportsCenterPage.filters.teacher'),
          status: t('preschoolReportsCenterPage.filters.status'),
          apply: t('preschoolReportsCenterPage.filters.apply'),
          reset: t('preschoolReportsCenterPage.filters.reset'),
        }"
        @apply="applyFilters"
        @reset="resetFilters"
      />

      <ReportSummaryCards :cards="cards" />

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <ReportChart
          :title="chartTitle"
          :subtitle="chartSubtitle"
          :series="chartSeries"
          :empty-text="t('preschoolReportsCenterPage.emptyStates.chart')"
        />

        <ReportExportMenu
          v-model="selectedFormat"
          :formats="[
            { label: t('preschoolReportsCenterPage.exports.formats.pdf'), value: 'pdf' },
            { label: t('preschoolReportsCenterPage.exports.formats.excel'), value: 'excel' },
            { label: t('preschoolReportsCenterPage.exports.formats.csv'), value: 'csv' },
          ]"
          :labels="{
            title: t('preschoolReportsCenterPage.exports.title'),
            export: t('preschoolReportsCenterPage.exports.export'),
          }"
          :exporting="exporting"
          @export="downloadExport"
        />
      </div>

      <ReportTable
        :title="title"
        :columns="tableColumns"
        :rows="rows"
        :loading="loading"
        :loading-text="t('preschoolReportsCenterPage.loading')"
        :empty-text="getEmptyStateText()"
      />

      <EmptyReportState
        v-if="!loading && !rows.length && !chartSeries.length && !cards.length"
        :title="t('preschoolReportsCenterPage.emptyStates.dashboard')"
        :subtitle="t('preschoolReportsCenterPage.messages.loadFailed')"
      />

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>
    </section>
  </MainLayout>
</template>
