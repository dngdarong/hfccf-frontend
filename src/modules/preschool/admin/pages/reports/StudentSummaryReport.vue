<script setup>
import { onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import {
  fetchPreschoolClasses,
  fetchPreschoolStudents,
  fetchPreschoolStudent,
  fetchPreschoolAttendance,
} from '@/modules/preschool/services/preschoolApi'
import { fetchAcademicLifecycle } from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'
import StudentProfilePDFDocument from './components/StudentProfilePDFDocument.vue'
import ClassSummaryTable from './components/ClassSummaryTable.vue'
import ReportSwitcher from './components/ReportSwitcher.vue'
import ReportExportToolbar from './components/ReportExportToolbar.vue'

defineOptions({
  name: 'StudentSummaryReportPage',
})

const { t } = useLanguage()

const loading = ref(false)
const reportGenerated = ref(false)
const errorMessage = ref('')
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
  reportType: 'summary',
  scope: 'individual',
  student: null,
  class: null,
  attendance: null,
  classStudents: [],
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
      await loadStudents()
    }
  } catch {
    errorMessage.value = t('preschoolReportsPage.messages.loadFailed') || 'Failed to load filter options'
  }
}

async function loadStudents() {
  if (!classId.value) {
    filterOptions.value.students = []
    return
  }

  try {
    const students = await fetchPreschoolStudents({ classId: classId.value, perPage: 100 })
    filterOptions.value.students = (students.items || []).map(s => ({
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

    const selectedClass = filterOptions.value.classes.find(c => c.value === classId.value)

    reportData.value = {
      reportType: 'summary',
      scope: 'individual',
      student: studentData,
      class: selectedClass ? { id: selectedClass.value, name: selectedClass.label } : null,
      attendance: attendanceData,
      classStudents: [],
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
            ...student,
            attendancePercentage,
          }
        }),
      )

      classStudents.push(...batchResults)
    }

    const selectedClass = filterOptions.value.classes.find(c => c.value === classId.value)

    reportData.value = {
      reportType: 'summary',
      scope: 'class',
      class: selectedClass ? { id: selectedClass.value, name: selectedClass.label } : null,
      classStudents,
      student: null,
      attendance: null,
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
  return Math.round((attendanceData.items?.filter(a => a.status === 'present').length || 0) / attendanceData.total * 100)
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
    reportType: 'summary',
    scope: 'individual',
    student: null,
    class: null,
    attendance: null,
    classStudents: [],
  }
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
    <section class="space-y-6">
      <!-- Header -->
      <HeaderSection
        :title="t('preschoolReportsPage.reportTypes.student-summary')"
        :subtitle="t('preschoolReportsPage.reportTypeDesc.student-summary')"
      />

      <!-- Report Switcher -->
      <ReportSwitcher />

      <!-- Filters -->
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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
                <input
                  v-model="scopeType"
                  type="radio"
                  value="individual"
                  class="rounded"
                />
                <span class="text-sm text-slate-700">{{ t('preschoolReportsPage.individual') }}</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  v-model="scopeType"
                  type="radio"
                  value="class"
                  class="rounded"
                />
                <span class="text-sm text-slate-700">{{ t('preschoolReportsPage.entireClass') }}</span>
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
        <Button
          type="button"
          variant="ghost"
          size="md"
          rounded="lg"
          @click="resetFilters"
        >
          {{ t('preschoolReportsPage.reset') }}
        </Button>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <!-- Individual Student Report -->
      <template v-if="reportGenerated && scopeType === 'individual' && reportData.student">
        <div class="report-export-content print-only-content">
          <StudentProfilePDFDocument :student="reportData.student" :attendance="reportData.attendance" />
        </div>

        <!-- Export Toolbar -->
        <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {{ t('preschoolReportsPage.export') || 'Export' }}
          </h2>
          <ReportExportToolbar
            :report-type="reportData.reportType"
            :report-data="reportData"
            :report-name="reportData.student?.fullName || 'Report'"
            @export:error="handleExportError"
          />
        </div>
      </template>

      <!-- Class Report -->
      <template v-if="reportGenerated && scopeType === 'class' && reportData.classStudents.length > 0">
        <div class="report-export-content">
          <ClassSummaryTable :students="reportData.classStudents" />
        </div>

        <!-- Export Toolbar -->
        <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {{ t('preschoolReportsPage.export') || 'Export' }}
          </h2>
          <ReportExportToolbar
            :report-type="reportData.reportType"
            :report-data="reportData"
            :report-name="reportData.class?.name || 'Class Report'"
            @export:error="handleExportError"
          />
        </div>
      </template>

      <!-- Class Report Empty State -->
      <div v-if="reportGenerated && scopeType === 'class' && reportData.classStudents.length === 0" class="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
        <i class="pi pi-user-minus text-4xl text-slate-300" />
        <p class="mt-4 text-slate-600">No students found in this class.</p>
      </div>

      <!-- Initial Empty State -->
      <div v-if="!reportGenerated" class="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
        <i class="pi pi-inbox text-4xl text-slate-300" />
        <p class="mt-4 text-slate-600">
          {{ t('preschoolReportsPage.emptyState') }}
        </p>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
@media print {
  /* Hide all UI and controls during print */
  :deep(.space-y-6) > * {
    display: none !important;
  }

  /* Show only the report content */
  :deep(.print-only-content) {
    display: block !important;
  }

  /* Print styles for the report document */
  :deep(.pdf-document) {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 20mm !important;
    page-break-after: avoid;
  }

  /* Ensure content is properly sized for printing */
  body {
    margin: 0;
    padding: 0;
  }
}
</style>
