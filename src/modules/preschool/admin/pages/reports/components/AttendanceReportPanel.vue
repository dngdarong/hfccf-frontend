<script setup>
import { computed, onMounted, ref } from 'vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import * as XLSX from 'xlsx'
import { useLanguage } from '@/composables/useLanguage'
import {
  fetchPreschoolClasses,
  fetchPreschoolStudents,
  fetchPreschoolAttendance,
} from '@/modules/preschool/services/preschoolApi'
import { fetchAcademicLifecycle } from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'
import {
  downloadMonthlyAttendanceReportPdf,
  fetchMonthlyAttendanceReport,
} from '@/modules/preschool/services/api/preschoolReportsApi'
import MonthlyAttendanceReport from './MonthlyAttendanceReport.vue'
import YearlyAttendanceReport from './YearlyAttendanceReport.vue'
import FilterSummary from './FilterSummary.vue'
import ExportMenu from './ExportMenu.vue'
import ReportStatistics from './ReportStatistics.vue'
import { fetchAllPages } from '../reportPaginationHelper'

defineOptions({
  name: 'AttendanceReportPanel',
})

const { t } = useLanguage()

const loading = ref(false)
const reportGenerated = ref(false)
const errorMessage = ref('')
const exportLoading = ref(false)

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
  monthlyAttendance: [],
  yearlyAttendance: [],
  students: [],
  classInfo: null,
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

    if (reportPeriod.value === 'monthly') {
      const monthlyReport = await fetchMonthlyAttendanceReport({
        academicYearId: academicYearId.value,
        classId: classId.value,
        month: selectedMonth.value,
        year: selectedYear.value,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
      })

      reportData.value.monthlyAttendance = monthlyReport.attendanceRecords || []
      reportData.value.students = monthlyReport.students || []
      reportData.value.classInfo = monthlyReport.classInfo || null
    } else {
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

      reportData.value.yearlyAttendance = attendanceData.items || []
      reportData.value.students = studentsData.items || []
      reportData.value.classInfo = null
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
    monthlyAttendance: [],
    yearlyAttendance: [],
    students: [],
    classInfo: null,
  }
}

function changeReportPeriod() {
  reportGenerated.value = false
}

async function exportReport(format) {
  try {
    exportLoading.value = true

    const timestamp = new Date().toISOString().split('T')[0]
    const reportTypeLabel = reportPeriod.value === 'monthly' ? 'Monthly' : 'Yearly'
    const filename = `AttendanceReport_${reportTypeLabel}_${timestamp}`

    if (format === 'pdf') {
      await exportToPdf(filename)
    } else if (format === 'excel') {
      exportToExcel(filename)
    } else if (format === 'csv') {
      exportToCsv(filename)
    } else if (format === 'print') {
      window.print()
    }
  } catch (error) {
    errorMessage.value = 'Failed to export report'
    console.error('Error exporting report:', error)
  } finally {
    exportLoading.value = false
  }
}

async function exportToPdf(filename) {
  if (reportPeriod.value !== 'monthly') {
    throw new Error('Yearly Attendance PDF export is not implemented yet.')
  }

  const dateRange = getDateRange()
  const file = await downloadMonthlyAttendanceReportPdf({
    academicYearId: academicYearId.value,
    classId: classId.value,
    month: selectedMonth.value,
    year: selectedYear.value,
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
    filename: `${filename}.pdf`,
  })

  if (file?.blob) {
    downloadPdfBlob(file.blob, file.filename || `${filename}.pdf`)
  }
}

function downloadPdfBlob(pdfBlob, filename) {
  if (!(pdfBlob instanceof Blob) || pdfBlob.size === 0) {
    throw new Error('Generated PDF blob is empty.')
  }

  const objectUrl = URL.createObjectURL(pdfBlob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  link.remove()

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 0)
}

function displayValue(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  return value
}

function mapGenderToKhmer(gender) {
  return {
    male: 'ប្រុស',
    female: 'ស្រី',
    other: 'ផ្សេងៗ',
  }[String(gender || '').toLowerCase()] || displayValue(gender)
}

function formatDateOnly(value) {
  if (!value) {
    return '—'
  }

  const text = String(value)
  const match = text.match(/^\d{4}-\d{2}-\d{2}/)

  return match ? match[0] : text
}

function statusMark(status) {
  return {
    present: 'P',
    absent: 'A',
    late: 'L',
    excused: 'E',
  }[String(status || '').toLowerCase()] || ''
}

function recordDateKey(record) {
  const value = record?.attendanceDate || record?.attendance_date
  if (!value) {
    return ''
  }

  return formatDateOnly(value)
}

function resolveStudentName(student) {
  return displayValue(student.fullName || [student.firstName, student.lastName].filter(Boolean).join(' '))
}

function buildRecordsByStudentDate(records) {
  const lookup = new Map()

  for (const record of records) {
    const studentId = record?.studentId ?? record?.student_id
    const date = recordDateKey(record)
    if (studentId === null || studentId === undefined || !date) {
      continue
    }

    lookup.set(`${studentId}|${date}`, record)
  }

  return lookup
}

function rowWithCells(columnCount, cells = {}) {
  const row = Array.from({ length: columnCount }, () => '')

  for (const [columnIndex, value] of Object.entries(cells)) {
    row[Number(columnIndex)] = value
  }

  return row
}

function buildMonthlyAttendanceRows() {
  const records = Array.isArray(reportData.value.monthlyAttendance)
    ? reportData.value.monthlyAttendance
    : []
  const students = Array.isArray(reportData.value.students)
    ? reportData.value.students
    : []

  const dayCount = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
  const dayNumbers = Array.from({ length: dayCount }, (_, index) => index + 1)
  const columnCount = 4 + dayCount
  const footerStartColumn = Math.max(4, columnCount - 8)
  const recordsByStudentDate = buildRecordsByStudentDate(records)
  const summary = {
    present: records.filter(record => record?.status === 'present').length,
    absent: records.filter(record => record?.status === 'absent').length,
    late: records.filter(record => record?.status === 'late').length,
    excused: records.filter(record => record?.status === 'excused').length,
  }

  return [
    ['ព្រះរាជាណាចក្រកម្ពុជា'],
    ['ជាតិ សាសនា ព្រះមហាក្សត្រ'],
    [],
    ['បញ្ជីវត្តមានសិស្សប្រចាំខែ'],
    rowWithCells(columnCount, {
      0: `ថ្នាក់៖ ${displayValue(reportData.value.classInfo?.name || selectedClassLabel.value)}`,
      2: `ឆ្នាំសិក្សា៖ ${displayValue(selectedAcademicYearLabel.value)}`,
      4: `ខែ៖ ${displayValue(selectedMonthLabel.value)}`,
      8: `ឆ្នាំ៖ ${selectedYear.value}`,
    }),
    [],
    ['ល.រ', 'គោត្តនាម-នាម', 'ភេទ', 'ថ្ងៃខែឆ្នាំកំណើត', ...dayNumbers],
    ...students.map((student, index) => {
      return [
        index + 1,
        resolveStudentName(student),
        mapGenderToKhmer(student.gender),
        formatDateOnly(student.dateOfBirth || student.date_of_birth),
        ...dayNumbers.map((dayNumber) => {
          const date = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`
          return statusMark(recordsByStudentDate.get(`${student.id}|${date}`)?.status)
        }),
      ]
    }),
    [],
    rowWithCells(columnCount, {
      0: 'សង្ខេប',
    }),
    rowWithCells(columnCount, {
      0: 'សិស្សសរុប',
      1: students.length,
      3: 'វត្តមាន',
      4: summary.present,
      6: 'អវត្តមាន',
      7: summary.absent,
      9: 'មកយឺត',
      10: summary.late,
      12: 'មានច្បាប់',
      13: summary.excused,
    }),
    [],
    rowWithCells(columnCount, {
      0: 'សម្គាល់',
      1: 'P = វត្តមាន',
      4: 'A = អវត្តមាន',
      7: 'L = មកយឺត',
      10: 'E = មានច្បាប់',
    }),
    [],
    rowWithCells(columnCount, {
      [footerStartColumn]: 'ថ្ងៃ',
      [footerStartColumn + 2]: 'ខែ',
      [footerStartColumn + 4]: 'ឆ្នាំ',
      [footerStartColumn + 6]: 'ពុទ្ធសករាជ ២៥៧',
    }),
    rowWithCells(columnCount, {
      [footerStartColumn]: 'បាត់ដំបង ថ្ងៃទី',
      [footerStartColumn + 3]: 'ខែ',
      [footerStartColumn + 5]: 'ឆ្នាំ',
    }),
    [],
    rowWithCells(columnCount, {
      [footerStartColumn]: 'ហត្ថលេខា',
    }),
    [],
    rowWithCells(columnCount, {
      [footerStartColumn]: '________________',
    }),
  ]
}

function mergeRange(startRow, startColumn, endRow, endColumn) {
  return {
    s: { r: startRow, c: startColumn },
    e: { r: endRow, c: endColumn },
  }
}

function applyMonthlyAttendanceSheetLayout(sheet, rowCount) {
  const dayCount = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
  const lastColumn = 3 + dayCount
  const studentCount = reportData.value.students.length
  const summaryTitleRow = 8 + studentCount
  const summaryValueRow = summaryTitleRow + 1
  const legendRow = summaryValueRow + 2
  const footerStartRow = legendRow + 2
  const footerStartColumn = Math.max(4, lastColumn - 7)

  sheet['!merges'] = [
    mergeRange(0, 0, 0, lastColumn),
    mergeRange(1, 0, 1, lastColumn),
    mergeRange(3, 0, 3, lastColumn),
    mergeRange(4, 0, 4, 1),
    mergeRange(4, 2, 4, 3),
    mergeRange(4, 4, 4, Math.min(7, lastColumn)),
    mergeRange(4, 8, 4, Math.min(11, lastColumn)),
    mergeRange(summaryTitleRow, 0, summaryTitleRow, lastColumn),
    mergeRange(legendRow, 0, legendRow, lastColumn),
    mergeRange(footerStartRow, footerStartColumn, footerStartRow, lastColumn),
    mergeRange(footerStartRow + 1, footerStartColumn, footerStartRow + 1, lastColumn),
    mergeRange(footerStartRow + 3, footerStartColumn, footerStartRow + 3, lastColumn),
    mergeRange(footerStartRow + 5, footerStartColumn, footerStartRow + 5, lastColumn),
  ]
  sheet['!cols'] = [
    { wch: 6 },
    { wch: 34 },
    { wch: 10 },
    { wch: 16 },
    ...Array.from({ length: dayCount }, () => ({ wch: 4 })),
  ]
  sheet['!rows'] = Array.from({ length: rowCount }, (_, index) => {
    if (index <= 3) return { hpt: index === 3 ? 24 : 20 }
    if (index === 4) return { hpt: 24 }
    if (index === 6) return { hpt: 8 }
    if (index === 7) return { hpt: 26 }
    if (index >= 8 && index < 8 + studentCount) return { hpt: 22 }
    if ([summaryTitleRow, summaryValueRow, legendRow].includes(index)) return { hpt: 24 }
    if (index >= footerStartRow) return { hpt: 22 }
    return { hpt: 20 }
  })
  sheet['!freeze'] = { xSplit: 0, ySplit: 7 }
}

function buildObjectRows(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return []
  }

  const headers = Object.keys(records[0] || {})

  return [
    headers,
    ...records.map(record => headers.map(header => record?.[header] ?? '')),
  ]
}

function exportToExcel(filename) {
  const workbook = XLSX.utils.book_new()

  if (reportPeriod.value === 'monthly') {
    const rows = buildMonthlyAttendanceRows()
    const attendanceSheet = XLSX.utils.aoa_to_sheet(rows)
    applyMonthlyAttendanceSheetLayout(attendanceSheet, rows.length)
    XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'បញ្ជីវត្តមានប្រចាំខែ')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
    return
  }

  const metaData = [
    ['Attendance Report'],
    ['Type', reportPeriod.value === 'monthly' ? 'Monthly' : 'Yearly'],
    ['Generated On', new Date().toLocaleString()],
    ['Academic Year', filterOptions.value.academicYears.find(y => y.value === academicYearId.value)?.label || 'All'],
    ['Class', reportData.value.classInfo?.name || 'All Classes'],
  ]
  if (reportPeriod.value === 'monthly') {
    metaData.push(['Month', `${selectedMonth.value}/${selectedYear.value}`])
  } else {
    metaData.push(['Year', selectedYear.value])
  }

  const metaSheet = XLSX.utils.aoa_to_sheet(metaData)
  XLSX.utils.book_append_sheet(workbook, metaSheet, 'Report Info')

  if (reportPeriod.value === 'monthly' && reportData.value.monthlyAttendance.length > 0) {
    const attendanceSheet = XLSX.utils.aoa_to_sheet(buildMonthlyAttendanceRows())
    XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Monthly Attendance')
  } else if (reportPeriod.value === 'yearly' && reportData.value.yearlyAttendance.length > 0) {
    const attendanceSheet = XLSX.utils.aoa_to_sheet(buildObjectRows(reportData.value.yearlyAttendance))
    XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Yearly Attendance')
  }

  if (reportData.value.students.length > 0) {
    const studentData = reportData.value.students.map(s => [
      s.firstName || '',
      s.lastName || '',
      s.enrollmentNumber || '',
    ])
    studentData.unshift(['First Name', 'Last Name', 'Enrollment Number'])
    const studentSheet = XLSX.utils.aoa_to_sheet(studentData)
    XLSX.utils.book_append_sheet(workbook, studentSheet, 'Students')
  }

  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

function exportToCsv(filename) {
  const records = reportPeriod.value === 'monthly'
    ? reportData.value.monthlyAttendance
    : reportData.value.yearlyAttendance

  if (records.length === 0) return

  const headers = Object.keys(records[0])
  const csvContent = [
    headers.join(','),
    ...records.map(record => headers.map(h => {
      const value = record[h]
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    }).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

onMounted(() => {
  loadFilterOptions()
})
</script>

<template>
  <div class="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <div class="flex items-center gap-2">
        <i class="pi pi-exclamation-triangle" />
        {{ errorMessage }}
      </div>
    </div>

    <!-- Filters Card -->
    <div class="rounded-xl border border-slate-200 bg-slate-50 p-6">
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

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-12">
      <div class="text-center">
        <i class="pi pi-spinner pi-spin mb-4 text-3xl text-slate-300" />
        <p class="text-sm text-slate-600">
          {{ t('preschoolReportsPage.loadingData') || 'Loading data...' }}
        </p>
      </div>
    </div>

    <!-- Report Content -->
    <template v-else-if="reportGenerated">
      <ReportStatistics
        :students="reportData.students"
        :attendance-records="reportPeriod === 'monthly' ? reportData.monthlyAttendance : reportData.yearlyAttendance"
        :class-label="selectedClassLabel"
      />

      <div class="preschool-attendance-report-content rounded-xl border border-slate-200 bg-white p-6">
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

      <div class="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h3 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">Export</h3>
        <ExportMenu :loading="exportLoading" @export="exportReport" />
      </div>
    </template>

    <!-- Empty State -->
    <div v-else class="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-12">
      <div class="text-center">
        <i class="pi pi-chart-bar mb-4 text-3xl text-slate-300" />
        <p class="text-sm text-slate-600">
          {{ t('preschoolReportsPage.emptyState') || 'Select filters and click "Generate Report" to view data' }}
        </p>
      </div>
    </div>
  </div>
</template>
