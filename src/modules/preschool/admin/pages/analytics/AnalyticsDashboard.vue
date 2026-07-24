<script setup>
import { computed, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useAnalyticsFilters } from './composables/useAnalyticsFilters'
import { useAnalyticsActions } from './composables/useAnalyticsActions'
import { useAnalyticsData } from './composables/useAnalyticsData'
import {
  createAnalyticsPresetFilters,
  createAnalyticsPresetLabels,
  createAnalyticsRoute,
  resolveAnalyticsBreakdownTo,
  resolveAnalyticsChartItemTo,
} from './analyticsInteractionMap'
import AnalyticsHeaderSection from './sections/AnalyticsHeaderSection.vue'
import AnalyticsFilterBar from './components/AnalyticsFilterBar.vue'
import AnalyticsOverviewSection from './sections/AnalyticsOverviewSection.vue'
import AttendanceAnalyticsSection from './sections/AttendanceAnalyticsSection.vue'
import SessionAnalyticsSection from './sections/SessionAnalyticsSection.vue'
import ScheduleAnalyticsSection from './sections/ScheduleAnalyticsSection.vue'
import AlertAnalyticsSection from './sections/AlertAnalyticsSection.vue'
import GuardianAnalyticsSection from './sections/GuardianAnalyticsSection.vue'
import StudentAnalyticsSection from './sections/StudentAnalyticsSection.vue'
import TeacherAnalyticsSection from './sections/TeacherAnalyticsSection.vue'
import ReportLauncherSection from './sections/ReportLauncherSection.vue'

defineOptions({
  name: 'PreschoolAnalyticsDashboardPage',
})

const { t } = useLanguage()
const { filters, resetFilters, syncRoute } = useAnalyticsFilters()
const {
  loading,
  errorMessage,
  filterOptions,
  dashboard,
  attendance,
  sessions,
  schedules,
  alerts,
  students,
  teachers,
  guardianContacts,
  loadAnalytics,
  hasAnalyticsData,
} = useAnalyticsData()
const { openReportDataset } = useAnalyticsActions()

const filterLabels = computed(() => ({
  title: t('preschoolAnalyticsPage.filters.title'),
  subtitle: '',
  dateRange: t('preschoolAnalyticsPage.filters.dateRange'),
  academicYear: t('preschoolAnalyticsPage.filters.academicYear'),
  class: t('preschoolAnalyticsPage.filters.class'),
  teacher: t('preschoolAnalyticsPage.filters.teacher'),
  status: t('preschoolAnalyticsPage.filters.status'),
  apply: t('preschoolAnalyticsPage.filters.apply'),
  reset: t('preschoolAnalyticsPage.filters.reset'),
  savedFilters: t('preschoolAnalyticsPage.savedFilters'),
}))

const presetItems = computed(() => createAnalyticsPresetLabels(t))

const reportLaunchers = computed(() => [
  {
    key: 'attendance',
    label: t('preschoolAnalyticsPage.attendanceReport'),
    description: t('preschoolAnalyticsPage.reportDataset'),
    action: t('common.actions.viewAll'),
  },
  {
    key: 'sessions',
    label: t('preschoolAnalyticsPage.sessionReport'),
    description: t('preschoolAnalyticsPage.reportDataset'),
    action: t('common.actions.viewAll'),
  },
  {
    key: 'schedules',
    label: t('preschoolAnalyticsPage.scheduleReport'),
    description: t('preschoolAnalyticsPage.reportDataset'),
    action: t('common.actions.viewAll'),
  },
])

const detailLinks = computed(() => ({
  attendance: createAnalyticsRoute('dashboard-preschool-admin-analytics-attendance', filters.value),
  sessions: createAnalyticsRoute('dashboard-preschool-admin-analytics-sessions', filters.value),
  alerts: createAnalyticsRoute('dashboard-preschool-admin-analytics-alerts', filters.value),
  students: createAnalyticsRoute('dashboard-preschool-admin-analytics-students', filters.value),
  teachers: createAnalyticsRoute('dashboard-preschool-admin-analytics-teachers', filters.value),
  guardianContacts: createAnalyticsRoute('dashboard-preschool-admin-analytics-guardian-contacts', filters.value),
}))

const interactionResolvers = computed(() => ({
  attendance: {
    chartItemTo: (item) => resolveAnalyticsChartItemTo('attendance', item, filters.value),
    breakdownItemTo: (item) => resolveAnalyticsBreakdownTo('attendance', item, filters.value),
  },
  sessions: {
    chartItemTo: (item) => resolveAnalyticsChartItemTo('sessions', item, filters.value),
    breakdownItemTo: (item) => resolveAnalyticsBreakdownTo('sessions', item, filters.value),
  },
  schedules: {
    chartItemTo: null,
    breakdownItemTo: null,
  },
  alerts: {
    chartItemTo: (item) => resolveAnalyticsChartItemTo('alerts', item, filters.value),
    breakdownItemTo: (item) => resolveAnalyticsBreakdownTo('alerts', item, filters.value),
  },
  guardianContacts: {
    chartItemTo: (item) => resolveAnalyticsChartItemTo('guardianContacts', item, filters.value),
    breakdownItemTo: (item) => resolveAnalyticsBreakdownTo('guardianContacts', item, filters.value),
  },
  students: {
    chartItemTo: (item) => resolveAnalyticsChartItemTo('students', item, filters.value),
    breakdownItemTo: (item) => resolveAnalyticsBreakdownTo('students', item, filters.value),
  },
  teachers: {
    chartItemTo: (item) => resolveAnalyticsChartItemTo('teachers', item, filters.value),
    breakdownItemTo: (item) => resolveAnalyticsBreakdownTo('teachers', item, filters.value),
  },
}))

async function refreshAnalytics() {
  await syncRoute(filters.value)
  await loadAnalytics(filters.value)
}

function resetAndRefresh() {
  resetFilters()
  return syncRoute(filters.value).then(() => loadAnalytics(filters.value))
}

function applyPreset(presetKey) {
  const nextFilters = createAnalyticsPresetFilters(presetKey, filters.value)
  filters.value = nextFilters
  return syncRoute(nextFilters).then(() => loadAnalytics(nextFilters))
}

onMounted(() => {
  refreshAnalytics()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-6">
      <HeaderSection
        :title="t('preschoolAnalyticsPage.title')"
        :subtitle="t('preschoolAnalyticsPage.subtitle')"
      />

      <AnalyticsHeaderSection
        :title="t('preschoolAnalyticsPage.title')"
        :subtitle="t('preschoolAnalyticsPage.subtitle')"
        :generated-at="dashboard.generatedAt ? `${t('preschoolAnalyticsPage.generatedAt')}: ${dashboard.generatedAt}` : ''"
        :loading="loading"
        :refresh-label="t('preschoolAnalyticsPage.refresh')"
        @refresh="refreshAnalytics"
      />

      <AnalyticsFilterBar
        v-model="filters"
        :options="filterOptions"
        :labels="filterLabels"
        :presets="presetItems"
        :loading="loading"
        @apply="refreshAnalytics"
        @reset="resetAndRefresh"
        @preset="applyPreset"
      />

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <AnalyticsOverviewSection
        :analytics="dashboard"
        :title="t('preschoolAnalyticsPage.overview')"
        :subtitle="t('preschoolAnalyticsPage.subtitle')"
        :details-to="detailLinks"
        :empty-text="t('preschoolAnalyticsPage.noAnalyticsData')"
      />

      <AttendanceAnalyticsSection
        :analytics="attendance"
        :title="t('preschoolAnalyticsPage.attendanceAnalytics')"
        :subtitle="t('preschoolAnalyticsPage.sections.attendance.subtitle')"
        :details-to="detailLinks"
        :chart-item-to="interactionResolvers.attendance.chartItemTo"
        :breakdown-item-to="interactionResolvers.attendance.breakdownItemTo"
        :empty-text="t('preschoolAnalyticsPage.noAnalyticsData')"
      />

      <SessionAnalyticsSection
        :analytics="sessions"
        :title="t('preschoolAnalyticsPage.sessionAnalytics')"
        :subtitle="t('preschoolAnalyticsPage.sections.sessions.subtitle')"
        :details-to="detailLinks"
        :chart-item-to="interactionResolvers.sessions.chartItemTo"
        :breakdown-item-to="interactionResolvers.sessions.breakdownItemTo"
        :empty-text="t('preschoolAnalyticsPage.noAnalyticsData')"
      />

      <ScheduleAnalyticsSection
        :analytics="schedules"
        :title="t('preschoolAnalyticsPage.scheduleAnalytics')"
        :subtitle="t('preschoolAnalyticsPage.sections.schedules.subtitle')"
        :details-to="detailLinks"
        :chart-item-to="interactionResolvers.schedules.chartItemTo"
        :breakdown-item-to="interactionResolvers.schedules.breakdownItemTo"
        :empty-text="t('preschoolAnalyticsPage.noAnalyticsData')"
      />

      <AlertAnalyticsSection
        :analytics="alerts"
        :title="t('preschoolAnalyticsPage.alertAnalytics')"
        :subtitle="t('preschoolAnalyticsPage.sections.alerts.subtitle')"
        :details-to="detailLinks"
        :chart-item-to="interactionResolvers.alerts.chartItemTo"
        :breakdown-item-to="interactionResolvers.alerts.breakdownItemTo"
        :empty-text="t('preschoolAnalyticsPage.noAnalyticsData')"
      />

      <GuardianAnalyticsSection
        :analytics="guardianContacts"
        :title="t('preschoolAnalyticsPage.guardianAnalytics')"
        :subtitle="t('preschoolAnalyticsPage.sections.guardians.subtitle')"
        :details-to="detailLinks"
        :chart-item-to="interactionResolvers.guardianContacts.chartItemTo"
        :breakdown-item-to="interactionResolvers.guardianContacts.breakdownItemTo"
        :empty-text="t('preschoolAnalyticsPage.noAnalyticsData')"
      />

      <StudentAnalyticsSection
        :analytics="students"
        :title="t('preschoolAnalyticsPage.studentAnalytics')"
        :subtitle="t('preschoolAnalyticsPage.sections.students.subtitle')"
        :details-to="detailLinks"
        :breakdown-item-to="interactionResolvers.students.breakdownItemTo"
        :empty-text="t('preschoolAnalyticsPage.noAnalyticsData')"
      />

      <TeacherAnalyticsSection
        :analytics="teachers"
        :title="t('preschoolAnalyticsPage.teacherAnalytics')"
        :subtitle="t('preschoolAnalyticsPage.sections.teachers.subtitle')"
        :details-to="detailLinks"
        :chart-item-to="interactionResolvers.teachers.chartItemTo"
        :breakdown-item-to="interactionResolvers.teachers.breakdownItemTo"
        :empty-text="t('preschoolAnalyticsPage.noAnalyticsData')"
      />

      <ReportLauncherSection
        :items="reportLaunchers"
        :title="t('preschoolAnalyticsPage.reportLauncher')"
        :subtitle="t('preschoolAnalyticsPage.subtitle')"
        @open="openReportDataset"
      />

      <div v-if="!loading && !hasAnalyticsData" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
        {{ t('preschoolAnalyticsPage.noAnalyticsData') }}
      </div>
    </section>
  </MainLayout>
</template>
