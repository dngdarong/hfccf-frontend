<script setup>
import { computed, onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import {
  fetchPreschoolClasses,
  fetchPreschoolStudents,
  fetchPreschoolAttendance,
} from '@/modules/preschool/services/preschoolApi'
import { fetchAcademicLifecycle } from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'
import MonthlyAttendanceReport from './components/MonthlyAttendanceReport.vue'
import YearlyAttendanceReport from './components/YearlyAttendanceReport.vue'
import ReportSwitcher from './components/ReportSwitcher.vue'
import FilterSummary from './components/FilterSummary.vue'
import ReportExportToolbar from './components/ReportExportToolbar.vue'
import ReportStatistics from './components/ReportStatistics.vue'
import { fetchAllPages } from './reportPaginationHelper'

defineOptions({
  name: 'AttendanceReportPage',
})

const { t } = useLanguage()

const loading = ref(false)
const reportGenerated = ref(false)
const errorMessage = ref('')

const reportPeriod = ref('monthly')
const academicYearId = ref('')
const classId = ref('')
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

const filterOptions = ref({
  academicYears: [],
  classes: [],
})

const reportData = ref({
  reportType: 'attendance',
  mode: 'monthly',
  period: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
  summary: {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    percentage: 0,
  },
  items: [],
  monthlyBreakdown: [],
  class: null,
  monthlyAttendance: [],
  yearlyAttendance: [],
  students: [],
})

const months = computed(() => [
  { label: t('preschoolAttendanceReportPage.months.january') || 'January', value: 1 },
  { label: t('preschoolAttendanceReportPage.months.february') || 'February', value: 2 },
  { label: t('preschoolAttendanceReportPage.months.march') || 'March', value: 3 },
  { label: t('preschoolAttendanceReportPage.months.april') || 'April', value: 4 },
  { label: t('preschoolAttendanceReportPage.months.may') || 'May', value: 5 },
  { label: t('preschoolAttendanceReportPage.months.june') || 'June', value: 6 },
  { label: t('preschoolAttendanceReportPage.months.july') || 'July', value: 7 },
  { label: t('preschoolAttendanceReportPage.months.august') || 'August', value: 8 },
  { label: t('preschoolAttendanceReportPage.months.september') || 'September', value: 9 },
  { label: t('preschoolAttendanceReportPage.months.october') || 'October', value: 10 },
  { label: t('preschoolAttendanceReportPage.months.november') || 'November', value: 11 },
  { label: t('preschoolAttendanceReportPage.months.december') || 'December', value: 12 },
])

const yearOptions = computed(() => {
  const years = []
  const currentYear = new Date().getFullYear()
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push({ label: String(i), value: i })
  }
  return years
})

const canGenerate = computed(() => {
  return academicYearId.value && classId.value && (
    reportPeriod.value === 'yearly' ? selectedYear.value : (selectedMonth.value && selectedYear.value)
  )
})

const selectedAcademicYearLabel = computed(() => {
  return filterOptions.value.academicYears.find(y => y.value === academicYearId.value)?.label || ''
})

const selectedClassLabel = computed(() => {
  return filterOptions.value.classes.find(c => c.value === classId.value)?.label || ''
})

const selectedMonthLabel = computed(() => {
  return months.value.find(m => m.value === selectedMonth.value)?.label || ''
})

async function loadFilterOptions() {
  try {
    const lifecycle = await fetchAcademicLifecycle()
    filterOptions.value.academicYears = (lifecycle.academicYears || []).map(ay => ({
      label: ay.label || ay.code,
      value: ay.id,
    }))

    if (filterOptions.value.academicYears.length > 0) {
      academicYearId.value = filterOptions.value.academicYears[0].value
    }

    const classes = await fetchPreschoolClasses()
    filterOptions.value.classes = (classes.items || []).map(c => ({
      label: c.name,
      value: c.id,
    }))

    if (filterOptions.value.classes.length > 0) {
      classId.value = filterOptions.value.classes[0].value
    }
  } catch {
    errorMessage.value = t('preschoolAttendanceReportPage.messages.loadFailed') || 'Failed to load filters'
  }
}

function getDateRange() {
  if (reportPeriod.value === 'monthly') {
    const year = selectedYear.value
    const month = selectedMonth.value
    const from = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
    return { from, to }
  } else {
    const year = selectedYear.value
    return { from: `${year}-01-01`, to: `${year}-12-31` }
  }
}

async function generateReport() {
  if (!canGenerate.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const dateRange = getDateRange()

    // Fetch all pages to ensure complete dataset
    const [attendanceData, studentsData] = await Promise.all([
      fetchAllPages(fetchPreschoolAttendance, {
        classId: classId.value,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
      }),
      fetchAllPages(fetchPreschoolStudents, {
        classId: classId.value,
      }),
    ])

    const attendanceItems = attendanceData.items || []
    const students = studentsData.items || []
    const selectedClass = filterOptions.value.classes.find(c => c.value === classId.value)

    // Calculate summary
    const summary = {
      present: attendanceItems.filter(a => a.status === 'present').length,
      absent: attendanceItems.filter(a => a.status === 'absent').length,
      late: attendanceItems.filter(a => a.status === 'late').length,
      excused: attendanceItems.filter(a => a.status === 'excused').length,
      percentage: attendanceItems.length > 0
        ? Math.round((attendanceItems.filter(a => a.status === 'present').length / attendanceItems.length) * 100)
        : 0,
    }

    if (reportPeriod.value === 'monthly') {
      reportData.value = {
        reportType: 'attendance',
        mode: 'monthly',
        period: { year: selectedYear.value, month: selectedMonth.value },
        summary,
        items: attendanceItems,
        monthlyBreakdown: [],
        class: selectedClass ? { id: selectedClass.value, name: selectedClass.label } : null,
        monthlyAttendance: attendanceItems,
        yearlyAttendance: [],
        students,
      }
    } else {
      reportData.value = {
        reportType: 'attendance',
        mode: 'yearly',
        period: { year: selectedYear.value },
        summary,
        items: attendanceItems,
        monthlyBreakdown: [],
        class: selectedClass ? { id: selectedClass.value, name: selectedClass.label } : null,
        monthlyAttendance: [],
        yearlyAttendance: attendanceItems,
        students,
      }
    }

    reportGenerated.value = true
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to generate report'
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  reportGenerated.value = false
  selectedMonth.value = new Date().getMonth() + 1
  selectedYear.value = new Date().getFullYear()
  reportData.value = {
    reportType: 'attendance',
    mode: 'monthly',
    period: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
    summary: {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      percentage: 0,
    },
    items: [],
    monthlyBreakdown: [],
    class: null,
    monthlyAttendance: [],
    yearlyAttendance: [],
    students: [],
  }
}

function changeReportPeriod() {
  reportGenerated.value = false
}

function handleExportError(error) {
  errorMessage.value = error.error || 'Failed to export report'
  console.error('Export failed:', error)
}

onMounted(() => {
  loadFilterOptions()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-5">
      <HeaderSection
        :title="t('preschoolReportsPage.reportTypes.attendance')"
        :subtitle="t('preschoolReportsPage.reportTypeDesc.attendance')"
      />

      <div v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        <div class="flex items-center gap-2">
          <i class="pi pi-exclamation-triangle" />
          {{ errorMessage }}
        </div>
      </div>

      <!-- Report Navigation -->
      <ReportSwitcher />

      <!-- Filters Card -->
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">{{ t('preschoolReportsPage.filters') }}</h3>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <!-- Report Period -->
          <label class="block">
            <span class="mb-2 block text-xs font-semibold text-slate-700">{{ t('preschoolReportsPage.scope') }}</span>
            <Select
              v-model="reportPeriod"
              :options="[
                { label: t('preschoolReportsPage.periodTypes.monthly') || 'Monthly', value: 'monthly' },
                { label: t('preschoolReportsPage.periodTypes.annual') || 'Yearly', value: 'yearly' },
              ]"
              option-label="label"
              option-value="value"
              class="w-full"
              @update:model-value="changeReportPeriod"
            />
          </label>

          <!-- Academic Year -->
          <label class="block">
            <span class="mb-2 block text-xs font-semibold text-slate-700">{{ t('preschoolReportsPage.reportYear') || 'Academic Year' }}</span>
            <Select
              v-model="academicYearId"
              :options="filterOptions.academicYears"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </label>

          <!-- Class -->
          <label class="block">
            <span class="mb-2 block text-xs font-semibold text-slate-700">{{ t('preschoolReportsPage.reportClass') || 'Class' }}</span>
            <Select
              v-model="classId"
              :options="filterOptions.classes"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </label>

          <!-- Month (Monthly only) -->
          <label v-if="reportPeriod === 'monthly'" class="block">
            <span class="mb-2 block text-xs font-semibold text-slate-700">{{ t('preschoolReportsPage.reportMonth') || 'Month' }}</span>
            <Select
              v-model="selectedMonth"
              :options="months"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </label>

          <!-- Year -->
          <label class="block">
            <span class="mb-2 block text-xs font-semibold text-slate-700">{{ t('preschoolReportsPage.reportYear') || 'Year' }}</span>
            <Select
              v-model="selectedYear"
              :options="yearOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </label>
        </div>

        <div class="mt-4 flex gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            rounded="lg"
            :loading="loading"
            :disabled="!canGenerate"
            @click="generateReport"
          >
            {{ t('preschoolReportsPage.generateReport') || 'Generate Report' }}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="md"
            rounded="lg"
            @click="resetFilters"
          >
            {{ t('preschoolReportsPage.reset') || 'Reset' }}
          </Button>
        </div>
      </div>

      <!-- Filter Summary -->
      <FilterSummary
        v-if="reportGenerated"
        :academic-year-label="selectedAcademicYearLabel"
        :class-label="selectedClassLabel"
        :report-period="reportPeriod"
        :month-label="selectedMonthLabel"
        :year="selectedYear"
        @clear-filters="resetFilters"
      />

      <!-- Report Content -->
      <template v-if="reportGenerated">
        <ReportStatistics
          :students="reportData.students"
          :attendance-records="reportPeriod === 'monthly' ? reportData.monthlyAttendance : reportData.yearlyAttendance"
          :class-label="selectedClassLabel"
        />

        <div class="report-export-content rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <MonthlyAttendanceReport
            v-if="reportPeriod === 'monthly'"
            :attendance-records="reportData.monthlyAttendance"
            :students="reportData.students"
            :month="selectedMonth"
            :year="selectedYear"
          />
          <YearlyAttendanceReport
            v-else
            :attendance-records="reportData.yearlyAttendance"
            :students="reportData.students"
            :year="selectedYear"
          />
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">
            {{ t('preschoolReportsPage.export') || 'Export' }}
          </h3>
          <ReportExportToolbar
            :report-type="reportData.reportType"
            :report-data="reportData"
            :report-name="`${reportPeriod === 'monthly' ? selectedMonth : selectedYear}-Report`"
            @export:error="handleExportError"
          />
        </div>
      </template>

      <!-- Empty State -->
      <div v-else class="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16">
        <div class="text-center">
          <i class="pi pi-chart-bar mb-4 text-3xl text-slate-300" />
          <p class="text-sm text-slate-600">
            {{ t('preschoolReportsPage.emptyState') || 'Select filters and click "Generate Report" to view data' }}
          </p>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
