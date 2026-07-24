<script setup>
import { computed, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import AnalyticsFilterBar from '../components/AnalyticsFilterBar.vue'
import AnalyticsDetailHeaderSection from './AnalyticsDetailHeaderSection.vue'
import AnalyticsDetailSummarySection from './AnalyticsDetailSummarySection.vue'
import AnalyticsDetailTrendSection from './AnalyticsDetailTrendSection.vue'
import AnalyticsDetailBreakdownSection from './AnalyticsDetailBreakdownSection.vue'
import AnalyticsDetailDatasetSection from './AnalyticsDetailDatasetSection.vue'
import {
  createAnalyticsPresetFilters,
  createAnalyticsPresetLabels,
  resolveAnalyticsBreakdownTo,
  resolveAnalyticsChartItemTo,
  resolveAnalyticsDatasetRowTo,
  resolveAnalyticsMetricTo,
} from '../analyticsInteractionMap'
import { useAnalyticsDetailActions } from './composables/useAnalyticsDetailActions'
import { useAnalyticsDetailData } from './composables/useAnalyticsDetailData'
import { useAnalyticsDetailFilters } from './composables/useAnalyticsDetailFilters'

defineOptions({
  name: 'PreschoolAnalyticsDetailPage',
})

const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
})

const { t } = useLanguage()
const { filters, resetFilters, syncRoute, routeQuery } = useAnalyticsDetailFilters()
const { goBack } = useAnalyticsDetailActions(props.config.backRouteName)
const {
  loading,
  errorMessage,
  detail,
  filterOptions,
  hasDetailData,
  loadDetail,
} = useAnalyticsDetailData(props.config.fetcher)

function resolvePath(source, path) {
  return String(path).split('.').reduce((carry, key) => carry?.[key], source)
}

function resolveFirstPath(source, paths = []) {
  for (const path of paths) {
    const value = resolvePath(source, path)
    if (Array.isArray(value) ? value.length : value !== undefined && value !== null && `${value}`.trim() !== '') {
      return value
    }
  }
  return null
}

function normalizeSeries(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.series)) return value.series
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.rows)) return value.rows
  return []
}

const generatedAt = computed(() => detail.value.generatedAt ? `${t('preschoolAnalyticsPage.generatedAt')}: ${detail.value.generatedAt}` : '')

const metrics = computed(() => (props.config.summaryCards || []).map((metric) => ({
  label: t(metric.labelKey),
  value: resolveFirstPath(detail.value, metric.paths) ?? '—',
  caption: metric.captionKey ? t(metric.captionKey) : '',
  tone: metric.tone || 'slate',
  to: metric.interactionKey ? resolveAnalyticsMetricTo(props.config.domain, metric.interactionKey, filters.value) : metric.to || null,
  detailsLabel: metric.interactionKey ? t('preschoolAnalyticsPage.viewDetails') : '',
})))

const trendSeries = computed(() => {
  const trendConfig = props.config.trend
  if (!trendConfig) return []
  return normalizeSeries(resolveFirstPath(detail.value, trendConfig.sources || []))
})

const breakdownSections = computed(() => (props.config.breakdowns || []).map((section) => ({
  title: t(section.titleKey),
  subtitle: t(section.subtitleKey),
  items: normalizeSeries(resolveFirstPath(detail.value, section.sources || [])),
  emptyText: t(section.emptyKey || 'preschoolAnalyticsPage.noBreakdownData'),
  viewLabel: t('preschoolAnalyticsPage.viewDetails'),
  itemTo: (item) => resolveAnalyticsBreakdownTo(props.config.domain, item, filters.value),
})))

const datasetSections = computed(() => (props.config.datasets || []).map((section) => ({
  title: t(section.titleKey),
  subtitle: t(section.subtitleKey),
  columns: (section.columns || []).map((column) => ({
    key: column.key,
    label: t(column.labelKey),
  })),
  rows: normalizeSeries(resolveFirstPath(detail.value, section.sources || [])),
  emptyText: t(section.emptyKey || 'preschoolAnalyticsPage.noDatasetRows'),
  rowTo: (row) => resolveAnalyticsDatasetRowTo(props.config.domain, section.sectionKey || section.subtitleKey || section.titleKey, row, filters.value),
})))

const trendItemsTo = (item) => resolveAnalyticsChartItemTo(props.config.domain, item, filters.value)

const presetLabels = computed(() => createAnalyticsPresetLabels(t))

const detailLabels = computed(() => ({
  title: t(props.config.titleKey),
  subtitle: t(props.config.subtitleKey),
  backLabel: t('preschoolAnalyticsPage.backToAnalytics'),
  refreshLabel: t('preschoolAnalyticsPage.refresh'),
  filterTitle: t('preschoolAnalyticsPage.filters.title'),
  dateRange: t('preschoolAnalyticsPage.filters.dateRange'),
  academicYear: t('preschoolAnalyticsPage.filters.academicYear'),
  class: t('preschoolAnalyticsPage.filters.class'),
  teacher: t('preschoolAnalyticsPage.filters.teacher'),
  status: t('preschoolAnalyticsPage.filters.status'),
  apply: t('preschoolAnalyticsPage.filters.apply'),
  reset: t('preschoolAnalyticsPage.filters.reset'),
  savedFilters: t('preschoolAnalyticsPage.savedFilters'),
  compareMode: t('preschoolAnalyticsPage.compareMode'),
  comparisonUnavailable: t('preschoolAnalyticsPage.comparisonUnavailable'),
  filteredBy: t('preschoolAnalyticsPage.filteredBy'),
  appliedFilters: t('preschoolAnalyticsPage.appliedFilters'),
  clearFilters: t('preschoolAnalyticsPage.clearFilters'),
  drillDown: t('preschoolAnalyticsPage.drillDown'),
  noDrillDownAvailable: t('preschoolAnalyticsPage.noDrillDownAvailable'),
  openDetail: t('preschoolAnalyticsPage.openDetail'),
}))

const appliedFilterChips = computed(() => {
  const chipSource = [
    ['academicYearId', detailLabels.value.academicYear],
    ['classId', detailLabels.value.class],
    ['teacherUserId', detailLabels.value.teacher],
    ['dateFrom', detailLabels.value.dateRange],
    ['dateTo', detailLabels.value.dateRange],
    ['status', detailLabels.value.status],
  ]

  return chipSource
    .filter(([key]) => Boolean(filters.value[key]))
    .map(([key, label]) => ({
      key,
      label,
      value: filters.value[key],
    }))
})

async function refresh() {
  await syncRoute(filters.value)
  await loadDetail(filters.value)
}

function resetAndRefresh() {
  resetFilters()
  return syncRoute(filters.value).then(() => loadDetail(filters.value))
}

function applyPreset(presetKey) {
  const nextFilters = createAnalyticsPresetFilters(presetKey, filters.value)
  filters.value = nextFilters
  return syncRoute(nextFilters).then(() => loadDetail(nextFilters))
}

function handleBack() {
  return goBack(routeQuery.value)
}

onMounted(() => {
  loadDetail(filters.value)
})
</script>

<template>
  <MainLayout>
    <section class="space-y-6">
      <HeaderSection
        :title="detailLabels.title"
        :subtitle="detailLabels.subtitle"
      />

      <AnalyticsDetailHeaderSection
        :title="detailLabels.title"
        :subtitle="detailLabels.subtitle"
        :generated-at="generatedAt"
        :back-label="detailLabels.backLabel"
        :refresh-label="detailLabels.refreshLabel"
        :loading="loading"
        @back="handleBack"
        @refresh="refresh"
      />

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">{{ detailLabels.appliedFilters }}</h3>
            <p class="text-sm text-slate-500">{{ detailLabels.filteredBy }}</p>
          </div>
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            @click="resetAndRefresh"
          >
            {{ detailLabels.clearFilters }}
          </button>
        </div>
        <div v-if="appliedFilterChips.length" class="flex flex-wrap gap-2">
          <span
            v-for="chip in appliedFilterChips"
            :key="chip.key"
            class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
          >
            {{ chip.label }}: {{ chip.value }}
          </span>
        </div>
        <p v-else class="text-sm text-slate-500">{{ detailLabels.noDrillDownAvailable }}</p>
        <div class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          {{ detailLabels.compareMode }}: {{ detailLabels.comparisonUnavailable }}
        </div>
      </section>

      <AnalyticsFilterBar
        v-model="filters"
        :options="filterOptions"
        :labels="{
          title: detailLabels.filterTitle,
          subtitle: '',
          dateRange: detailLabels.dateRange,
          academicYear: detailLabels.academicYear,
          class: detailLabels.class,
          teacher: detailLabels.teacher,
          status: detailLabels.status,
          apply: detailLabels.apply,
          reset: detailLabels.reset,
          savedFilters: detailLabels.savedFilters,
        }"
        :presets="presetLabels"
        :loading="loading"
        @apply="refresh"
        @reset="resetAndRefresh"
        @preset="applyPreset"
      />

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <AnalyticsDetailSummarySection
        :title="detailLabels.title"
        :subtitle="detailLabels.subtitle"
        :metrics="metrics"
        :empty-text="t('preschoolAnalyticsPage.noDetailData')"
      />

      <AnalyticsDetailTrendSection
        v-if="props.config.trend"
        :title="t(props.config.trend.titleKey)"
        :subtitle="t(props.config.trend.subtitleKey)"
        :chart-type="props.config.trend.chartType || 'line'"
        :series="trendSeries"
        :empty-text="t(props.config.trend.emptyKey || 'preschoolAnalyticsPage.noTrendData')"
        :item-to="trendItemsTo"
        :view-label="t('preschoolAnalyticsPage.viewDetails')"
      />

      <AnalyticsDetailBreakdownSection
        v-for="section in breakdownSections"
        :key="section.title"
        :title="section.title"
        :subtitle="section.subtitle"
        :items="section.items"
        :empty-text="section.emptyText"
        :view-label="section.viewLabel"
        :item-to="section.itemTo"
      />

      <AnalyticsDetailDatasetSection
        v-for="section in datasetSections"
        :key="section.title + section.subtitle"
        :title="section.title"
        :subtitle="section.subtitle"
        :columns="section.columns"
        :rows="section.rows"
        :empty-text="t('preschoolAnalyticsPage.noDatasetRows')"
        :row-to="section.rowTo"
      />

      <div v-if="!loading && !hasDetailData" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
        {{ t('preschoolAnalyticsPage.noDetailData') }}
      </div>
    </section>
  </MainLayout>
</template>
