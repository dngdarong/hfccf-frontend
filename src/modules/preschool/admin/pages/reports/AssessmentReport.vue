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
  fetchPreschoolStudent,
  fetchPreschoolAssessments,
} from '@/modules/preschool/services/preschoolApi'
import { fetchAcademicLifecycle } from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'
import ReportSwitcher from './components/ReportSwitcher.vue'
import ReportExportToolbar from './components/ReportExportToolbar.vue'

defineOptions({
  name: 'AssessmentReportPage',
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
  reportType: 'assessment',
  scope: 'individual',
  student: null,
  class: null,
  assessments: [],
  classAssessments: [],
  summary: {
    averageScore: 0,
    latestRating: '',
    trend: 'stable',
  },
})

const canGenerate = computed(() => {
  return academicYearId.value && classId.value && (
    scopeType.value === 'individual' ? studentId.value : true
  )
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
    errorMessage.value = t('preschoolAssessmentReportPage.messages.loadFailed') || 'Failed to load filter options'
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
    const assessmentData = await fetchPreschoolAssessments({
      studentId: studentId.value,
      classId: classId.value,
      perPage: 1000,
    })

    const assessments = assessmentData.items || []
    const selectedClass = filterOptions.value.classes.find(c => c.value === classId.value)

    // Calculate summary
    let averageScore = 0
    let latestRating = ''
    if (assessments.length > 0) {
      const scores = assessments.filter(a => a.score).map(a => Number(a.score) || 0)
      averageScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : 0
      latestRating = assessments[0]?.rating || ''
    }

    reportData.value = {
      reportType: 'assessment',
      scope: 'individual',
      student: studentData,
      class: selectedClass ? { id: selectedClass.value, name: selectedClass.label } : null,
      assessments,
      classAssessments: [],
      summary: {
        averageScore,
        latestRating,
        trend: 'stable',
      },
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
    const classAssessments = []

    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize)

      const batchResults = await Promise.all(
        batch.map(async (student) => {
          const assessmentData = await fetchPreschoolAssessments({
            studentId: student.id,
            classId: classId.value,
            perPage: 1000,
          })

          const assessments = assessmentData.items || []
          let averageScore = 0
          let latestRating = ''

          if (assessments.length > 0) {
            const scores = assessments.filter(a => a.score).map(a => Number(a.score) || 0)
            averageScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : 0
            latestRating = assessments[0]?.rating || ''
          }

          return {
            ...student,
            averageScore,
            latestRating,
            assessmentCount: assessments.length,
          }
        }),
      )

      classAssessments.push(...batchResults)
    }

    const selectedClass = filterOptions.value.classes.find(c => c.value === classId.value)

    // Calculate class summary
    const classAverageScore = classAssessments.length > 0
      ? Math.round((classAssessments.reduce((sum, s) => sum + s.averageScore, 0) / classAssessments.length) * 100) / 100
      : 0

    reportData.value = {
      reportType: 'assessment',
      scope: 'class',
      class: selectedClass ? { id: selectedClass.value, name: selectedClass.label } : null,
      student: null,
      assessments: [],
      classAssessments,
      summary: {
        averageScore: classAverageScore,
        latestRating: '',
        trend: 'stable',
      },
    }

    reportGenerated.value = true
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to generate class report'
  } finally {
    loading.value = false
  }
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
    reportType: 'assessment',
    scope: 'individual',
    student: null,
    class: null,
    assessments: [],
    classAssessments: [],
    summary: {
      averageScore: 0,
      latestRating: '',
      trend: 'stable',
    },
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
        :title="t('preschoolAssessmentReportPage.title') || 'Assessment Report'"
        :subtitle="t('preschoolAssessmentReportPage.subtitle') || 'Individual and class assessment reports'"
      />

      <!-- Report Switcher -->
      <ReportSwitcher />

      <!-- Filters -->
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="mb-6 text-sm font-bold uppercase tracking-wide text-slate-900">
          {{ t('preschoolAssessmentReportPage.filters') || 'Filters' }}
        </h3>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <label class="block">
            <span class="mb-2 block text-xs font-semibold text-slate-700">
              {{ t('preschoolReportsPage.reportYear') || 'Academic Year' }}
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
              {{ t('preschoolReportsPage.reportClass') || 'Class' }}
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
              {{ t('preschoolAssessmentReportPage.student') || 'Student' }}
            </span>
            <Select
              v-model="studentId"
              :options="filterOptions.students"
              option-label="label"
              option-value="value"
              class="w-full"
              :placeholder="t('preschoolAssessmentReportPage.student')"
            />
          </label>

          <label class="space-y-2 md:col-span-2">
            <span class="text-sm font-medium text-slate-700">
              {{ t('preschoolAssessmentReportPage.scope') || 'Report Scope' }}
            </span>
            <div class="flex items-center gap-6 pt-2">
              <label class="flex items-center gap-2">
                <input
                  v-model="scopeType"
                  type="radio"
                  value="individual"
                  class="rounded"
                />
                <span class="text-sm text-slate-700">{{ t('preschoolAssessmentReportPage.individual') || 'Individual Student' }}</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  v-model="scopeType"
                  type="radio"
                  value="class"
                  class="rounded"
                />
                <span class="text-sm text-slate-700">{{ t('preschoolAssessmentReportPage.class') || 'Entire Class' }}</span>
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
          :disabled="!canGenerate"
          @click="generateReport"
        >
          {{ t('preschoolAssessmentReportPage.generateReport') || 'Generate Report' }}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="md"
          rounded="lg"
          @click="resetFilters"
        >
          {{ t('preschoolAssessmentReportPage.reset') || 'Reset' }}
        </Button>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <!-- Individual Assessment Report -->
      <template v-if="reportGenerated && scopeType === 'individual' && reportData.student">
        <div class="report-export-content space-y-6">
          <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-semibold text-slate-900">{{ reportData.student.fullName }}</h2>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="text-sm">
                <span class="font-medium text-slate-700">Student ID:</span>
                <span class="ml-2 text-slate-600">{{ reportData.student.studentCode || reportData.student.publicId }}</span>
              </div>
              <div class="text-sm">
                <span class="font-medium text-slate-700">Class:</span>
                <span class="ml-2 text-slate-600">{{ reportData.class?.name }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">Assessment Summary</h3>
            <div class="grid gap-4 sm:grid-cols-3">
              <div class="rounded-lg border border-slate-200 p-4">
                <p class="text-xs font-medium uppercase text-slate-600">Average Score</p>
                <p class="mt-2 text-2xl font-bold text-slate-900">{{ reportData.summary.averageScore }}</p>
              </div>
              <div class="rounded-lg border border-slate-200 p-4">
                <p class="text-xs font-medium uppercase text-slate-600">Latest Rating</p>
                <p class="mt-2 text-2xl font-bold text-slate-900">{{ reportData.summary.latestRating || 'N/A' }}</p>
              </div>
              <div class="rounded-lg border border-slate-200 p-4">
                <p class="text-xs font-medium uppercase text-slate-600">Total Assessments</p>
                <p class="mt-2 text-2xl font-bold text-slate-900">{{ reportData.assessments.length }}</p>
              </div>
            </div>
          </div>

          <div v-if="reportData.assessments.length > 0" class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">Assessment History</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b-2 border-slate-200">
                    <th class="px-4 py-2 text-left font-semibold text-slate-700">Date</th>
                    <th class="px-4 py-2 text-left font-semibold text-slate-700">Category</th>
                    <th class="px-4 py-2 text-left font-semibold text-slate-700">Score</th>
                    <th class="px-4 py-2 text-left font-semibold text-slate-700">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(assessment, index) in reportData.assessments" :key="index" class="border-b border-slate-200">
                    <td class="px-4 py-2 text-slate-600">{{ assessment.date }}</td>
                    <td class="px-4 py-2 text-slate-600">{{ assessment.category }}</td>
                    <td class="px-4 py-2 text-slate-600">{{ assessment.score }}</td>
                    <td class="px-4 py-2 text-slate-600">{{ assessment.rating }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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

      <!-- Class Assessment Report -->
      <template v-if="reportGenerated && scopeType === 'class' && reportData.classAssessments.length > 0">
        <div class="report-export-content space-y-6">
          <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-semibold text-slate-900">{{ reportData.class?.name }}</h2>
            <p class="text-sm text-slate-600">Class Assessment Report</p>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">Class Summary</h3>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="rounded-lg border border-slate-200 p-4">
                <p class="text-xs font-medium uppercase text-slate-600">Class Average Score</p>
                <p class="mt-2 text-2xl font-bold text-slate-900">{{ reportData.summary.averageScore }}</p>
              </div>
              <div class="rounded-lg border border-slate-200 p-4">
                <p class="text-xs font-medium uppercase text-slate-600">Total Students</p>
                <p class="mt-2 text-2xl font-bold text-slate-900">{{ reportData.classAssessments.length }}</p>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">Student Assessment Results</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b-2 border-slate-200">
                    <th class="px-4 py-2 text-left font-semibold text-slate-700">Student Name</th>
                    <th class="px-4 py-2 text-left font-semibold text-slate-700">Average Score</th>
                    <th class="px-4 py-2 text-left font-semibold text-slate-700">Latest Rating</th>
                    <th class="px-4 py-2 text-left font-semibold text-slate-700">Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(student, index) in reportData.classAssessments" :key="index" class="border-b border-slate-200">
                    <td class="px-4 py-2 text-slate-600">{{ student.fullName || student.name }}</td>
                    <td class="px-4 py-2 text-slate-600">{{ student.averageScore }}</td>
                    <td class="px-4 py-2 text-slate-600">{{ student.latestRating || 'N/A' }}</td>
                    <td class="px-4 py-2 text-slate-600">{{ student.assessmentCount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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

      <!-- Class Assessment Empty State -->
      <div v-if="reportGenerated && scopeType === 'class' && reportData.classAssessments.length === 0" class="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
        <i class="pi pi-user-minus text-4xl text-slate-300" />
        <p class="mt-4 text-slate-600">No students found in this class.</p>
      </div>

      <!-- Initial Empty State -->
      <div v-if="!reportGenerated" class="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
        <i class="pi pi-inbox text-4xl text-slate-300" />
        <p class="mt-4 text-slate-600">
          {{ t('preschoolAssessmentReportPage.emptyState') || 'Select filters and click "Generate Report" to view assessment data' }}
        </p>
      </div>
    </section>
  </MainLayout>
</template>
