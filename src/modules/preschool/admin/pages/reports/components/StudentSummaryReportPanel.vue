<script setup>
import { onMounted, ref } from 'vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import * as XLSX from 'xlsx'
import { useLanguage } from '@/composables/useLanguage'
import {
  fetchPreschoolClasses,
  fetchPreschoolStudents,
  fetchPreschoolStudent,
  fetchPreschoolAttendance,
} from '@/modules/preschool/services/preschoolApi'
import { fetchAcademicLifecycle } from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'
import { downloadStudentSummaryReportPdf } from '@/modules/preschool/services/api/preschoolReportsApi'
import StudentIdentityCard from './StudentIdentityCard.vue'
import StudentAttendanceSummary from './StudentAttendanceSummary.vue'
import ClassSummaryTable from './ClassSummaryTable.vue'

defineOptions({
  name: 'StudentSummaryReportPanel',
})

const { t } = useLanguage()

const loading = ref(false)
const reportGenerated = ref(false)
const errorMessage = ref('')
const exportLoading = ref(false)
const scopeType = ref('individual')
const academicYearId = ref('')
const classId = ref('')
const studentId = ref('')

const filterOptions = ref({
  academicYears: [],
  classes: [],
  students: [],
})

const reportData = ref({
  student: null,
  attendance: null,
  classStudents: [],
})

async function loadFilterOptions() {
  try {
    const lifecycle = await fetchAcademicLifecycle()
    filterOptions.value.academicYears = (lifecycle.academicYears || []).map((ay) => ({
      label: ay.label || ay.code,
      value: ay.id,
    }))

    if (filterOptions.value.academicYears.length > 0) {
      academicYearId.value = filterOptions.value.academicYears[0].value
    }

    const classes = await fetchPreschoolClasses()
    filterOptions.value.classes = (classes.items || []).map((c) => ({
      label: c.name,
      value: c.id,
    }))

    if (filterOptions.value.classes.length > 0) {
      classId.value = filterOptions.value.classes[0].value
      await loadStudents()
    }
  } catch {
    errorMessage.value =
      t('preschoolReportsPage.messages.loadFailed') || 'Failed to load filter options'
  }
}

async function loadStudents() {
  if (!classId.value) {
    filterOptions.value.students = []
    return
  }

  try {
    const students = await fetchPreschoolStudents({ classId: classId.value, perPage: 100 })
    filterOptions.value.students = (students.items || []).map((s) => ({
      label: `${s.fullName} (${s.studentCode || s.publicId})`,
      value: s.id,
    }))

    if (filterOptions.value.students.length > 0 && !studentId.value) {
      studentId.value = filterOptions.value.students[0].value
    }
  } catch {
    filterOptions.value.students = []
  }
}

async function generateIndividualReport() {
  if (!studentId.value || !classId.value) {
    errorMessage.value = 'Please select both student and class'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const studentData = await fetchPreschoolStudent(studentId.value)

    const attendanceData = await fetchPreschoolAttendance({
      studentId: studentId.value,
      classId: classId.value,
      perPage: 1000,
    })

    reportData.value = {
      student: studentData,
      attendance: attendanceData,
    }

    reportGenerated.value = true
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to generate report'
  } finally {
    loading.value = false
  }
}

async function generateClassReport() {
  if (!classId.value) {
    errorMessage.value = 'Please select a class'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const studentsData = await fetchPreschoolStudents({ classId: classId.value, perPage: 1000 })
    const students = studentsData.items || []

    const batchSize = 5
    const classStudents = []

    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize)

      const batchResults = await Promise.all(
        batch.map(async (student) => {
          const attendance = await fetchPreschoolAttendance({
            studentId: student.id,
            classId: classId.value,
            perPage: 1000,
          })

          const attendancePercentage = calculateAttendancePercentage(attendance)

          return {
            student,
            attendancePercentage,
          }
        }),
      )

      classStudents.push(...batchResults)
    }

    reportData.value = {
      classStudents,
    }

    reportGenerated.value = true
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to generate class report'
  } finally {
    loading.value = false
  }
}

function calculateAttendancePercentage(attendanceData) {
  if (!attendanceData || attendanceData.total === 0) return 0
  return Math.round(
    ((attendanceData.items?.filter((a) => a.status === 'present').length || 0) /
      attendanceData.total) *
      100,
  )
}

function generateReport() {
  if (scopeType.value === 'individual') {
    generateIndividualReport()
  } else {
    generateClassReport()
  }
}

function resetFilters() {
  scopeType.value = 'individual'
  studentId.value = filterOptions.value.students[0]?.value || ''
  reportGenerated.value = false
  reportData.value = {
    student: null,
    attendance: null,
    classStudents: [],
  }
}

async function exportReport(format) {
  try {
    exportLoading.value = true

    const timestamp = new Date().toISOString().split('T')[0]
    const reportTypeLabel = scopeType.value === 'individual' ? 'Individual' : 'Class'
    const filename = `StudentSummaryReport_${reportTypeLabel}_${timestamp}`

    if (format === 'pdf') {
      await exportToPdf(filename)
    } else if (format === 'excel') {
      exportToExcel(filename)
    } else if (format === 'print') {
      await exportToPrint(filename)
    }
  } catch (error) {
    errorMessage.value = 'Failed to export report'
    console.error('Error exporting report:', error)
  } finally {
    exportLoading.value = false
  }
}

async function exportToPdf(filename) {
  try {
    const file = await downloadStudentSummaryReportPdf({
      mode: scopeType.value,
      academicYearId: academicYearId.value,
      classId: classId.value,
      studentId: studentId.value,
      filename: `${filename}.pdf`,
    })

    if (file?.blob) {
      downloadPdfBlob(file.blob, file.filename || `${filename}.pdf`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown PDF generation error'
    throw new Error(`PDF generation failed: ${message}`, {
      cause: error,
    })
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

async function exportToPrint(filename) {
  const file = await downloadStudentSummaryReportPdf({
    mode: scopeType.value,
    academicYearId: academicYearId.value,
    classId: classId.value,
    studentId: studentId.value,
    filename: `${filename}.pdf`,
  })

  if (!file?.blob) {
    throw new Error('Generated print PDF is empty.')
  }

  openPdfBlobForPrint(file.blob)
}

function openPdfBlobForPrint(pdfBlob) {
  if (!(pdfBlob instanceof Blob) || pdfBlob.size === 0) {
    throw new Error('Generated print PDF is empty.')
  }

  const objectUrl = URL.createObjectURL(pdfBlob)
  const printWindow = window.open(objectUrl, '_blank', 'noopener,noreferrer')

  if (!printWindow) {
    URL.revokeObjectURL(objectUrl)
    throw new Error('Print preview was blocked.')
  }

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 60000)
}

function exportToExcel(filename) {
  const workbook = XLSX.utils.book_new()

  if (scopeType.value === 'individual') {
    appendIndividualProfileSheet(workbook)
  }

  if (scopeType.value === 'class') {
    appendClassProfileSheet(workbook)
  }

  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

function appendIndividualProfileSheet(workbook) {
  const student = reportData.value.student || {}
  const generatedDate = new Date().toISOString().split('T')[0]
  const rows = [
    ['ប្រវត្តិរូបសិស្ស', '', '', ''],
    [`កាលបរិច្ឆេទនាំចេញ៖ ${generatedDate}`, '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['ព័ត៌មានផ្ទាល់ខ្លួនសិស្ស', '', '', ''],
    ['គោត្តនាម-នាម', formatFullName(student), 'ភេទ', formatKhmerGender(student.gender)],
    [
      'ឈ្មោះជាឡាតាំង',
      valueOrDash(student.latinName || student.latin_name),
      'ថ្ងៃខែឆ្នាំកំណើត',
      formatDateValue(student.dateOfBirth || student.date_of_birth),
    ],
    [
      'អត្តលេខសិស្ស',
      asText(student.studentCode || student.student_code || student.publicId),
      'សញ្ជាតិ',
      valueOrDash(student.nationality),
    ],
    [
      'ជនជាតិ',
      valueOrDash(student.ethnicity),
      'កម្រិតសិក្សា',
      valueOrDash(resolveStudentClassName(student)),
    ],
    ['ទីកន្លែងកំណើត', valueOrDash(student.placeOfBirth || student.place_of_birth), '', ''],
    ['អាសយដ្ឋាន', valueOrDash(student.address), '', ''],
    [
      'ឆ្នាំសិក្សា',
      valueOrDash(resolveAcademicYearLabel(student)),
      'កាលបរិច្ឆេទចុះឈ្មោះ',
      formatDateValue(resolveEnrollmentDate(student)),
    ],
    ['ស្ថានភាព', formatKhmerStatus(student.status), '', ''],
    ['', '', '', ''],
    ['ព័ត៌មានអាណាព្យាបាល', '', '', ''],
    ['គោត្តនាម-នាម', valueOrDash(student.guardianName || student.guardian_name), '', ''],
    ['អាសយដ្ឋាន', valueOrDash(student.guardianAddress || student.address), '', ''],
    ['លេខទំនាក់ទំនង', asText(student.guardianPhone || student.guardian_phone), '', ''],
    ['', '', '', ''],
    [`កាលបរិច្ឆេទបង្កើត៖ ${generatedDate}`, '', '', ''],
  ]

  const sheet = XLSX.utils.aoa_to_sheet(rows)
  applyIndividualProfileSheetFormatting(sheet, rows.length)
  setTextCell(sheet, 'B8')
  setTextCell(sheet, 'B18')
  XLSX.utils.book_append_sheet(workbook, sheet, 'ប្រវត្តិរូបសិស្ស')
}

function appendClassProfileSheet(workbook) {
  const className = filterOptions.value.classes.find((c) => c.value === classId.value)?.label || '—'
  const academicYear =
    filterOptions.value.academicYears.find((y) => y.value === academicYearId.value)?.label || '—'
  const generatedDate = new Date().toISOString().split('T')[0]
  const rows = [
    ['បញ្ជីសិស្ស', '', '', '', '', '', '', '', '', '', '', ''],
    [`កម្រិតសិក្សា៖ ${className}`, '', '', `ឆ្នាំសិក្សា៖ ${academicYear}`, '', '', '', '', '', '', '', ''],
    [`កាលបរិច្ឆេទបង្កើត៖ ${generatedDate}`, '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    [
      'ល.រ',
      'អត្តលេខសិស្ស',
      'គោត្តនាម-នាម',
      'ឈ្មោះជាឡាតាំង',
      'ភេទ',
      'ថ្ងៃខែឆ្នាំកំណើត',
      'សញ្ជាតិ',
      'កម្រិតសិក្សា',
      'ឆ្នាំសិក្សា',
      'ស្ថានភាព',
      'ឈ្មោះអាណាព្យាបាល',
      'លេខទំនាក់ទំនង',
    ],
  ]

  reportData.value.classStudents.forEach((item, index) => {
    const student = item.student || item
    rows.push([
      index + 1,
      asText(student.studentCode || student.student_code || student.publicId),
      formatFullName(student),
      valueOrDash(student.latinName || student.latin_name),
      formatKhmerGender(student.gender),
      formatDateValue(student.dateOfBirth || student.date_of_birth),
      valueOrDash(student.nationality),
      valueOrDash(resolveStudentClassName(student)),
      valueOrDash(resolveAcademicYearLabel(student)),
      formatKhmerStatus(student.status),
      valueOrDash(student.guardianName || student.guardian_name),
      asText(student.guardianPhone || student.guardian_phone),
    ])
  })

  const sheet = XLSX.utils.aoa_to_sheet(rows)
  applyClassSheetFormatting(sheet, rows.length)
  for (let row = 5; row <= rows.length; row += 1) {
    setTextCell(sheet, `B${row}`)
    setTextCell(sheet, `L${row}`)
  }
  XLSX.utils.book_append_sheet(workbook, sheet, 'បញ្ជីសិស្ស')
}

function applyIndividualProfileSheetFormatting(sheet, rowCount) {
  sheet['!cols'] = [{ wch: 26 }, { wch: 36 }, { wch: 26 }, { wch: 34 }]
  sheet['!rows'] = Array.from({ length: rowCount }, (_, index) => {
    if (index === 0) return { hpt: 32 }
    if ([4, 14].includes(index)) return { hpt: 25 }
    if ([9, 10, 16].includes(index)) return { hpt: 42 }
    if ([2, 3, 13, 18].includes(index)) return { hpt: 10 }
    return { hpt: 24 }
  })
  sheet['!merges'] = [
    mergeRange('A1:D1'),
    mergeRange('A2:D2'),
    mergeRange('A5:D5'),
    mergeRange('B10:D10'),
    mergeRange('B11:D11'),
    mergeRange('A15:D15'),
    mergeRange('B16:D16'),
    mergeRange('B17:D17'),
    mergeRange('B18:D18'),
    mergeRange('A20:D20'),
  ]
  applyCellStyle(sheet, 'A1', titleStyle())
  applyCellStyle(sheet, 'A2', subtitleStyle())
  applyCellStyle(sheet, 'A5', sectionStyle())
  applyCellStyle(sheet, 'A15', sectionStyle())
  applyCellStyle(sheet, 'A20', footerStyle())
  applyLabelStyles(sheet, ['A6', 'C6', 'A7', 'C7', 'A8', 'C8', 'A9', 'C9', 'A10', 'A11', 'A12', 'C12', 'A13', 'A16', 'A17', 'A18'])
  applyFieldBorders(sheet, ['A6:D13', 'A16:D18'])
  applyWrapText(sheet, rowCount, 4)
}

function applyClassSheetFormatting(sheet, rowCount) {
  sheet['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 24 },
    { wch: 24 },
    { wch: 12 },
    { wch: 18 },
    { wch: 16 },
    { wch: 20 },
    { wch: 18 },
    { wch: 14 },
    { wch: 24 },
    { wch: 18 },
  ]
  sheet['!rows'] = Array.from({ length: rowCount }, (_, index) => {
    if (index === 0) return { hpt: 30 }
    if (index === 4) return { hpt: 26 }
    if (index < 4) return { hpt: 22 }
    return { hpt: 25 }
  })
  sheet['!merges'] = [mergeRange('A1:L1'), mergeRange('A2:C2'), mergeRange('D2:L2'), mergeRange('A3:L3')]
  sheet['!freeze'] = { xSplit: 0, ySplit: 5 }
  sheet['!autofilter'] = { ref: `A5:L${rowCount}` }
  applyCellStyle(sheet, 'A1', titleStyle())
  applyCellStyle(sheet, 'A2', subtitleStyle())
  applyCellStyle(sheet, 'D2', subtitleStyle())
  applyCellStyle(sheet, 'A3', footerStyle())
  applyHeaderStyle(
    sheet,
    Array.from({ length: 12 }, (_, index) => XLSX.utils.encode_cell({ r: 4, c: index })),
  )
  applyFieldBorders(sheet, [`A5:L${rowCount}`])
  applyWrapText(sheet, rowCount, 12)
}

function applyHeaderStyle(sheet, cells) {
  cells.forEach((cellRef) => {
    if (sheet[cellRef]) {
      applyCellStyle(sheet, cellRef, headerStyle())
    }
  })
}

function applyWrapText(sheet, rowCount, columnCount) {
  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: column })
      if (sheet[cellRef]) {
        sheet[cellRef].s = {
          ...sheet[cellRef].s,
          alignment: { wrapText: true, vertical: 'top' },
        }
      }
    }
  }
}

function applyLabelStyles(sheet, cells) {
  cells.forEach((cellRef) => applyCellStyle(sheet, cellRef, labelStyle()))
}

function applyFieldBorders(sheet, ranges) {
  ranges.forEach((rangeRef) => {
    const range = XLSX.utils.decode_range(rangeRef)
    for (let row = range.s.r; row <= range.e.r; row += 1) {
      for (let column = range.s.c; column <= range.e.c; column += 1) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: column })
        ensureCell(sheet, cellRef)
        applyCellStyle(sheet, cellRef, { border: thinBorder() })
      }
    }
  })
}

function applyCellStyle(sheet, cellRef, style) {
  ensureCell(sheet, cellRef)
  sheet[cellRef].s = {
    ...sheet[cellRef].s,
    ...style,
    font: {
      ...sheet[cellRef].s?.font,
      ...style.font,
    },
    alignment: {
      ...sheet[cellRef].s?.alignment,
      ...style.alignment,
    },
    border: style.border || sheet[cellRef].s?.border,
  }
}

function ensureCell(sheet, cellRef) {
  if (!sheet[cellRef]) {
    sheet[cellRef] = { t: 's', v: '' }
  }
}

function setTextCell(sheet, cellRef) {
  if (sheet[cellRef]) {
    sheet[cellRef].t = 's'
    sheet[cellRef].z = '@'
    sheet[cellRef].v = valueOrDash(sheet[cellRef].v)
  }
}

function mergeRange(range) {
  return XLSX.utils.decode_range(range)
}

function titleStyle() {
  return {
    font: { bold: true, sz: 20, name: 'Noto Sans Khmer' },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  }
}

function subtitleStyle() {
  return {
    font: { sz: 11, name: 'Noto Sans Khmer' },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  }
}

function sectionStyle() {
  return {
    font: { bold: true, sz: 14, name: 'Noto Sans Khmer' },
    fill: { fgColor: { rgb: 'F3F4F6' } },
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
    border: {
      bottom: { style: 'thin', color: { rgb: '9CA3AF' } },
    },
  }
}

function headerStyle() {
  return {
    font: { bold: true, name: 'Noto Sans Khmer' },
    fill: { fgColor: { rgb: 'F3F4F6' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: thinBorder(),
  }
}

function labelStyle() {
  return {
    font: { bold: true, name: 'Noto Sans Khmer' },
    fill: { fgColor: { rgb: 'F9FAFB' } },
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
  }
}

function footerStyle() {
  return {
    font: { sz: 11, name: 'Noto Sans Khmer' },
    alignment: { horizontal: 'right', vertical: 'center', wrapText: true },
  }
}

function thinBorder() {
  const line = { style: 'thin', color: { rgb: 'D1D5DB' } }
  return {
    top: line,
    right: line,
    bottom: line,
    left: line,
  }
}

function valueOrDash(value) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

function asText(value) {
  return valueOrDash(value)
}

function formatFullName(student) {
  return valueOrDash(
    student.fullName ||
      student.full_name ||
      [student.firstName || student.first_name, student.lastName || student.last_name]
        .filter(Boolean)
        .join(' '),
  )
}

function formatKhmerGender(value) {
  const normalized = String(value || '').trim().toLowerCase()
  if (normalized === 'male') return 'ប្រុស'
  if (normalized === 'female') return 'ស្រី'
  if (normalized === 'other') return 'ផ្សេងៗ'
  return valueOrDash(value)
}

function formatKhmerStatus(value) {
  const normalized = String(value || '').trim().toLowerCase()
  if (normalized === 'active') return 'សកម្ម'
  if (normalized === 'inactive') return 'អសកម្ម'
  if (normalized === 'archived') return 'បានរក្សាទុក'
  return valueOrDash(value)
}

function formatDateValue(value) {
  if (!value) return '—'
  const text = String(value)
  const isoDate = text.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
  if (isoDate) return isoDate

  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return valueOrDash(value)

  return date.toISOString().split('T')[0]
}

function resolveStudentClassName(student) {
  return (
    student.classes?.[0]?.name ||
    filterOptions.value.classes.find((c) => c.value === classId.value)?.label
  )
}

function resolveAcademicYearLabel(student) {
  return (
    student.classes?.[0]?.academicYear ||
    student.classes?.[0]?.academic_year ||
    filterOptions.value.academicYears.find((y) => y.value === academicYearId.value)?.label
  )
}

function resolveEnrollmentDate(student) {
  return (
    student.classes?.[0]?.enrolledAt ||
    student.classes?.[0]?.enrolled_at ||
    student.classes?.[0]?.pivot?.enrolled_at
  )
}

onMounted(() => {
  loadFilterOptions()
})
</script>

<template>
  <div class="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <!-- Filters -->
    <div class="rounded-xl border border-slate-200 bg-slate-50 p-6">
      <h3 class="mb-6 text-sm font-bold uppercase tracking-wide text-slate-900">
        {{ t('preschoolReportsPage.filters') }}
      </h3>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <label class="block">
          <span class="mb-2 block text-xs font-semibold text-slate-700">
            {{ t('preschoolReportsPage.reportYear') }}
          </span>
          <Select
            v-model="academicYearId"
            :options="filterOptions.academicYears"
            option-label="label"
            option-value="value"
            class="w-full"
            :placeholder="t('preschoolReportsPage.reportYear')"
          />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">
            {{ t('preschoolReportsPage.reportClass') }}
          </span>
          <Select
            v-model="classId"
            :options="filterOptions.classes"
            option-label="label"
            option-value="value"
            class="w-full"
            :placeholder="t('preschoolReportsPage.reportClass')"
            @update:model-value="loadStudents"
          />
        </label>

        <label v-show="scopeType === 'individual'" class="space-y-2">
          <span class="text-sm font-medium text-slate-700">
            {{ t('preschoolReportsPage.individual') }}
          </span>
          <Select
            v-model="studentId"
            :options="filterOptions.students"
            option-label="label"
            option-value="value"
            class="w-full"
            :placeholder="t('preschoolReportsPage.individual')"
          />
        </label>

        <label class="space-y-2 md:col-span-2">
          <span class="text-sm font-medium text-slate-700">
            {{ t('preschoolReportsPage.scope') }}
          </span>
          <div class="flex items-center gap-6 pt-2">
            <label class="flex items-center gap-2">
              <input v-model="scopeType" type="radio" value="individual" class="rounded" />
              <span class="text-sm text-slate-700">{{ t('preschoolReportsPage.individual') }}</span>
            </label>
            <label class="flex items-center gap-2">
              <input v-model="scopeType" type="radio" value="class" class="rounded" />
              <span class="text-sm text-slate-700">{{
                t('preschoolReportsPage.entireClass')
              }}</span>
            </label>
          </div>
        </label>
      </div>
    </div>

    <!-- Generate & Reset Buttons -->
    <div class="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        variant="primary"
        size="md"
        rounded="lg"
        :loading="loading"
        @click="generateReport"
      >
        {{ t('preschoolReportsPage.generateReport') }}
      </Button>
      <Button type="button" variant="ghost" size="md" rounded="lg" @click="resetFilters">
        {{ t('preschoolReportsPage.reset') }}
      </Button>
    </div>

    <!-- Error Message -->
    <div
      v-if="errorMessage"
      class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
    >
      {{ errorMessage }}
    </div>

    <!-- Individual Student Report -->
    <template v-if="reportGenerated && scopeType === 'individual' && reportData.student">
      <div class="preschool-student-summary-report-content">
        <StudentIdentityCard :student="reportData.student" />
        <StudentAttendanceSummary :attendance="reportData.attendance" />
      </div>

      <!-- Export Toolbar -->
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Export</h2>
        <div class="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            rounded="lg"
            :loading="exportLoading"
            @click="exportReport('pdf')"
          >
            <i class="pi pi-file-pdf mr-2" /> PDF
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            rounded="lg"
            :loading="exportLoading"
            @click="exportReport('excel')"
          >
            <i class="pi pi-file-excel mr-2" /> Excel
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            rounded="lg"
            :loading="exportLoading"
            @click="exportReport('print')"
          >
            <i class="pi pi-print mr-2" /> Print
          </Button>
        </div>
      </div>
    </template>

    <!-- Class Report -->
    <template
      v-if="reportGenerated && scopeType === 'class' && reportData.classStudents.length > 0"
    >
      <div class="preschool-student-summary-report-content">
        <ClassSummaryTable :students="reportData.classStudents" />
      </div>

      <!-- Export Toolbar -->
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Export</h2>
        <div class="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            rounded="lg"
            :loading="exportLoading"
            @click="exportReport('pdf')"
          >
            <i class="pi pi-file-pdf mr-2" /> PDF
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            rounded="lg"
            :loading="exportLoading"
            @click="exportReport('excel')"
          >
            <i class="pi pi-file-excel mr-2" /> Excel
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            rounded="lg"
            :loading="exportLoading"
            @click="exportReport('print')"
          >
            <i class="pi pi-print mr-2" /> Print
          </Button>
        </div>
      </div>
    </template>

    <!-- Class Report Empty State -->
    <div
      v-if="reportGenerated && scopeType === 'class' && reportData.classStudents.length === 0"
      class="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center"
    >
      <i class="pi pi-user-minus text-4xl text-slate-300" />
      <p class="mt-4 text-slate-600">No students found in this class.</p>
    </div>

    <!-- Initial Empty State -->
    <div
      v-if="!reportGenerated"
      class="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center"
    >
      <i class="pi pi-inbox text-4xl text-slate-300" />
      <p class="mt-4 text-slate-600">
        {{ t('preschoolReportsPage.emptyState') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
@media print {
  /* Hide all UI elements during print */
  .space-y-5,
  .rounded-xl.border.border-slate-200.bg-slate-50.p-6,
  .rounded-xl.border.border-slate-200.bg-white.p-6,
  .flex.flex-wrap.items-center.gap-3 {
    display: none !important;
  }

  /* Show only the report content */
  .preschool-student-summary-report-content {
    margin: 0;
    padding: 0;
    border: none;
    background: white;
    page-break-inside: avoid;
  }

  /* Ensure content is visible */
  body {
    margin: 0;
    padding: 0;
  }
}
</style>
