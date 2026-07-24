<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import * as XLSX from 'xlsx'
import { useLanguage } from '@/composables/useLanguage'
import {
  fetchPreschoolClasses,
  fetchPreschoolStudents,
  fetchMyPreschoolClasses,
  fetchMyPreschoolStudents,
  fetchAcademicLifecycle,
} from '@/modules/preschool/services/preschoolApi'
import { downloadGradeEntryReportPdf } from '@/modules/preschool/services/api/preschoolGradeApi'
import { useGradeData } from '@/modules/preschool/composables/useGradeData'
import { useGradeMutations } from '@/modules/preschool/composables/useGradeMutations'

defineOptions({
  name: 'PreschoolGradeEntryPage',
})

const { t } = useLanguage()
const router = useRouter()
const route = useRoute()
const toast = useToast()

const { errorMessage, loadMonthlyEntry } = useGradeData()
const { isSubmitting, saveBatchGrades } = useGradeMutations()

const academicYearId = ref('')
const classId = ref('')
const month = ref(new Date().getMonth() + 1)
const year = ref(new Date().getFullYear())
const filterOptions = ref({
  classes: [],
})
const students = ref([])
const gradesMap = ref({})
const submissionStatus = ref('')
const submissionContext = ref({
  academicYear: '',
  month: '',
  year: '',
})
const isDetailDialogOpen = ref(false)
const selectedStudent = ref(null)
const editingGrade = reactive({ grade: '', score: '', notes: '' })
const exportLoading = ref(false)
const isTeacherView = computed(() => route.name === 'dashboard-preschool-teacher-grades')
const isEditable = computed(() => {
  const status = String(submissionStatus.value || '').toUpperCase()
  // No draft exists until the first score is saved.
  return !status || ['DRAFT', 'RETURNED'].includes(status)
})

const khmerMonthLabels = [
  '',
  'មករា',
  'កុម្ភៈ',
  'មីនា',
  'មេសា',
  'ឧសភា',
  'មិថុនា',
  'កក្កដា',
  'សីហា',
  'កញ្ញា',
  'តុលា',
  'វិច្ឆិកា',
  'ធ្នូ',
]

function fallback(value) {
  const normalized = String(value ?? '').trim()
  return normalized === '' ? '—' : normalized
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback(value)
  return date.toISOString().slice(0, 10)
}

function mapGenderToKhmer(value) {
  const gender = String(value || '').toLowerCase()
  if (gender === 'male') return 'ប្រុស'
  if (gender === 'female') return 'ស្រី'
  if (gender === 'other') return 'ផ្សេងៗ'
  return fallback(value)
}

function selectedClassLabel() {
  return filterOptions.value.classes.find(c => String(c.value) === String(classId.value))?.label || '—'
}

function selectedMonthLabel() {
  return khmerMonthLabels[Number(month.value)] || fallback(submissionContext.value.month)
}

function scoreValue(value) {
  return value === 0 || value ? value : ''
}

function currentGradeRows() {
  return students.value.map((student, index) => {
    const studentGrade = getStudentGrade(student.id)
    return [
      index + 1,
      String(student.code ?? ''),
      fallback(student.name),
      mapGenderToKhmer(student.gender),
      formatDate(student.dateOfBirth),
      fallback(student.className || selectedClassLabel()),
      scoreValue(studentGrade.score),
      fallback(studentGrade.grade),
    ]
  })
}

function downloadPdfBlob(pdfBlob, filename) {
  if (!(pdfBlob instanceof Blob) || pdfBlob.size === 0) {
    throw new Error('Generated PDF blob is empty.')
  }

  const objectUrl = URL.createObjectURL(pdfBlob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename || `GradeEntry_${month.value}_${year.value}.pdf`
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
}

function applyExcelLayout(sheet, lastColumnIndex, tableStartRow, tableEndRow) {
  sheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastColumnIndex } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastColumnIndex } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: lastColumnIndex } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } },
    { s: { r: 4, c: 2 }, e: { r: 4, c: 4 } },
    { s: { r: 4, c: 5 }, e: { r: 4, c: lastColumnIndex } },
  ]
  sheet['!cols'] = [
    { wch: 8 },
    { wch: 18 },
    { wch: 28 },
    { wch: 12 },
    { wch: 16 },
    { wch: 22 },
    { wch: 10 },
    { wch: 12 },
  ]
  sheet['!rows'] = [
    { hpt: 24 },
    { hpt: 22 },
    { hpt: 8 },
    { hpt: 26 },
    { hpt: 22 },
    { hpt: 8 },
    ...Array.from({ length: Math.max(tableEndRow - tableStartRow + 1, 1) }, () => ({ hpt: 22 })),
  ]
  sheet['!freeze'] = { xSplit: 0, ySplit: tableStartRow }
}


async function loadFilterOptions() {
  try {
    // Fetch classes
    const classesRes = await (
      isTeacherView.value
        ? fetchMyPreschoolClasses({ page: 1, perPage: 100 })
        : fetchPreschoolClasses({ page: 1, perPage: 100 })
    )

    // Try to fetch academic lifecycle, but handle 403 gracefully
    let lifecycleRes = null
    try {
      lifecycleRes = await fetchAcademicLifecycle()
      const activeAcademicYear = (lifecycleRes.academicYears || []).find(item => item.isCurrent)
        || (lifecycleRes.academicYears || []).find(item => String(item.status || '').toLowerCase() === 'active')
      academicYearId.value = activeAcademicYear?.id || ''
    } catch (lifecycleError) {
      // If fetching academic lifecycle fails (e.g., 403 Forbidden), continue without it
      if (lifecycleError?.response?.status === 403) {
        console.warn('Access denied to academic lifecycle settings, continuing without it')
      } else {
        throw lifecycleError
      }
    }

    filterOptions.value.classes = (classesRes.items || []).map(c => ({
      label: c.name,
      value: c.id,
    }))

    if (isTeacherView.value) {
      if (filterOptions.value.classes.length === 0) {
        errorMessage.value = 'No active classes are assigned to your account.'
      }
    }
  } catch (error) {
    console.error('Failed to load filter options:', error)
    errorMessage.value = error?.message || 'Failed to load classes'
  }
}

async function loadStudents() {
  if (!classId.value) {
    students.value = []
    submissionContext.value = { academicYear: '', month: '', year: '' }
    errorMessage.value = 'Please select a class.'
    return
  }

  try {
    const response = isTeacherView.value
      ? await fetchMyPreschoolStudents({ page: 1, perPage: 500 })
      : await fetchPreschoolStudents({ classId: classId.value, perPage: 500 })
    students.value = (response.items || [])
      .filter(s => {
        if (!isTeacherView.value) return true
        const assignedClasses = [...(s.classes || []), ...(s.classAssignments || [])]
        return assignedClasses.some(c => String(c.id || c.classId || c.class_id) === String(classId.value))
      })
      .map(s => ({
      id: s.id,
      name: s.fullName || s.firstName + ' ' + s.lastName,
      code: s.studentCode || s.publicId,
      }))

    if (students.value.length === 0) {
      errorMessage.value = 'No students are assigned to this class.'
    }

    await refreshGrades()
  } catch (error) {
    console.error('Failed to load students:', error)
    students.value = []
    errorMessage.value = error?.message || 'Failed to load students.'
  }
}

async function refreshGrades() {
  if (!classId.value) {
    errorMessage.value = 'Please select a class.'
    submissionContext.value = { academicYear: '', month: '', year: '' }
    students.value = []
    gradesMap.value = {}
    return
  }

  try {
    errorMessage.value = ''
    const response = await loadMonthlyEntry(classId.value, month.value, year.value)

    // Capture submission context
    submissionContext.value = {
      academicYear: response?.academic_year || '',
      month: response?.month || '',
      year: response?.year || '',
    }

    submissionStatus.value = response?.status || ''

    // Handle both old array format and new {status, assessments} format
    const monthlyGrades = response?.assessments || response || []

    // A monthly submission is created when the first score is saved. An empty
    // result is therefore a normal, editable state rather than an error.

    gradesMap.value = (monthlyGrades || []).reduce((grades, row) => {
      if (row.student_id) {
        grades[row.student_id] = {
          score: row.grade ?? '',
          grade: row.rating || '',
          notes: '',
          studentId: row.student_id,
        }

        // Enrich student info with gender, dateOfBirth, and className
        const student = students.value.find(s => s.id === row.student_id)
        if (student) {
          student.gender = row.student_gender || null
          student.dateOfBirth = row.student_date_of_birth || null
          student.className = row.class_name || null
        }
      }
      return grades
    }, {})
  } catch (error) {
    submissionContext.value = { academicYear: '', month: '', year: '' }
    errorMessage.value = error?.message || 'Failed to load grade submission.'
  }
}

function getStudentGrade(studentId) {
  return gradesMap.value[studentId] || { score: '', grade: '', notes: '' }
}

function updateStudentGrade(studentId, score, grade = '', notes = '') {
  gradesMap.value[studentId] = { score, grade, notes, studentId }
}

function openStudentGradeDialog(student) {
  selectedStudent.value = student
  const existing = getStudentGrade(student.id)
  editingGrade.score = existing.score ?? ''
  editingGrade.grade = existing.grade ?? ''
  editingGrade.notes = ''
  isDetailDialogOpen.value = true
}

function closeStudentGradeDialog() {
  isDetailDialogOpen.value = false
  selectedStudent.value = null
  editingGrade.grade = ''
  editingGrade.score = ''
  editingGrade.notes = ''
}

function saveStudentGrade() {
  if (!selectedStudent.value) return
  updateStudentGrade(selectedStudent.value.id, editingGrade.score)
  closeStudentGradeDialog()
}

async function submitAllGrades() {
  const gradesToSubmit = students.value
    .filter(s => gradesMap.value[s.id]?.score !== '' && gradesMap.value[s.id]?.score !== null)
    .map(s => ({
      studentId: s.id,
      classId: classId.value,
      academicYearId: academicYearId.value,
      month: month.value,
      year: year.value,
      score: Number(gradesMap.value[s.id].score),
    }))

  if (gradesToSubmit.length === 0) {
    toast.add({
      severity: 'warn',
      summary: t('common.status.warning'),
      detail: t('preschoolGradeEntry.messages.noGradesToSubmit', 'Please enter at least one grade'),
      life: 3000,
    })
    return
  }

  try {
    await saveBatchGrades(gradesToSubmit, async () => {
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('preschoolGradeEntry.messages.gradesSaved', 'Grades saved successfully'),
        life: 3000,
      })
      await refreshGrades()
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error?.message || t('preschoolGradeEntry.messages.saveFailed', 'Failed to save grades'),
      life: 3000,
    })
  }
}

async function exportToPdf() {
  try {
    exportLoading.value = true
    const file = await downloadGradeEntryReportPdf({
      academicYearId: academicYearId.value,
      classId: classId.value,
      month: month.value,
      year: year.value,
      filename: `GradeEntry_${month.value}_${year.value}.pdf`,
    })
    downloadPdfBlob(file.blob, file.filename || `GradeEntry_${month.value}_${year.value}.pdf`)
  } catch {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('preschoolGradeEntry.messages.exportFailed', 'Failed to export PDF'),
      life: 3000,
    })
  } finally {
    exportLoading.value = false
  }
}

function exportToExcel() {
  try {
    exportLoading.value = true
    const workbook = XLSX.utils.book_new()
    const generatedDate = new Date().toISOString().slice(0, 10)
    const tableHeaderRow = 7
    const rows = [
      ['ព្រះរាជាណាចក្រកម្ពុជា'],
      ['ជាតិ សាសនា ព្រះមហាក្សត្រ'],
      [],
      ['បញ្ជីពិន្ទុសិស្សប្រចាំខែ'],
      [
        `ថ្នាក់៖ ${selectedClassLabel()}`,
        '',
        `ឆ្នាំសិក្សា៖ ${fallback(submissionContext.value.academicYear)}`,
        '',
        '',
        `ខែ៖ ${selectedMonthLabel()} ឆ្នាំ៖ ${year.value}`,
        '',
        '',
      ],
      [],
      [
        'ល.រ',
        'អត្តលេខសិស្ស',
        'គោត្តនាម-នាម',
        'ភេទ',
        'ថ្ងៃខែឆ្នាំកំណើត',
        'ថ្នាក់',
        'ពិន្ទុ',
        'និទ្ទេស',
      ],
      ...currentGradeRows(),
      [],
      [`កាលបរិច្ឆេទបង្កើត៖ ${generatedDate}`],
    ]

    const sheet = XLSX.utils.aoa_to_sheet(rows)
    applyExcelLayout(sheet, 7, tableHeaderRow, tableHeaderRow + students.value.length)
    XLSX.utils.book_append_sheet(workbook, sheet, 'បញ្ជីពិន្ទុសិស្ស')
    XLSX.writeFile(workbook, `GradeEntry_${month.value}_${year.value}.xlsx`)
  } catch {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('preschoolGradeEntry.messages.exportFailed', 'Failed to export Excel'),
      life: 3000,
    })
  } finally {
    exportLoading.value = false
  }
}

watch(classId, async () => {
  await refreshGrades()
})

onMounted(async () => {
  await loadFilterOptions()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-6">
      <!-- Header -->
      <HeaderSection
        :title="t('preschoolGradeEntry.title', 'Grade Entry')"
        :subtitle="t('preschoolGradeEntry.subtitle', 'Enter and manage student grades')"
      />

      <!-- Filters -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {{ t('preschoolGradeEntry.filters') }}
        </h3>

        <div class="grid gap-4 md:grid-cols-1 md:w-64">
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-700">
              {{ t('preschoolGradeEntry.class') }}
            </span>
            <Select
              v-model="classId"
              :options="filterOptions.classes"
              option-label="label"
              option-value="value"
              class="w-full"
              placeholder="Select assigned class"
              @update:model-value="loadStudents"
            />
          </label>
        </div>

        <!-- Read-only Submission Context -->
        <div v-if="classId && submissionContext.academicYear" class="mt-6 space-y-2 border-t border-slate-200 pt-6">
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="block text-xs font-medium uppercase tracking-wide text-slate-500">{{ t('preschoolGradeEntry.academicYear') }}</span>
              <span class="mt-1 block font-medium text-slate-900">{{ submissionContext.academicYear }}</span>
            </div>
            <div>
              <span class="block text-xs font-medium uppercase tracking-wide text-slate-500">{{ t('preschoolGradeEntry.month') }}</span>
              <span class="mt-1 block font-medium text-slate-900">{{ submissionContext.month }}</span>
            </div>
            <div>
              <span class="block text-xs font-medium uppercase tracking-wide text-slate-500">{{ t('preschoolGradeEntry.status') }}</span>
              <span class="mt-1 block font-medium text-slate-900">{{ submissionStatus }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <!-- Grade Entry Table -->
      <div class="grade-entry-content rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3 w-12">{{ t('common.table.number') }}</th>
                <th class="px-4 py-3">{{ t('preschoolGradeEntry.studentName') }}</th>
                <th class="px-4 py-3">{{ t('common.table.gender') }}</th>
                <th class="px-4 py-3">{{ t('common.table.dateOfBirth') }}</th>
                <th class="px-4 py-3">{{ t('preschoolGradeEntry.class') }}</th>
                <th v-if="!isTeacherView" class="px-4 py-3 text-center">{{ t('preschoolGradeEntry.grade') }}</th>
                <th class="px-4 py-3 text-center">{{ t('preschoolGradeEntry.score') }}</th>
                <th class="px-4 py-3">{{ t('common.actions.menu') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr v-for="(student, index) in students" :key="student.id">
                <td class="px-4 py-3 font-medium text-slate-900">{{ index + 1 }}</td>
                <td class="px-4 py-3 font-medium text-slate-900">{{ student.name }}</td>
                <td class="px-4 py-3 text-slate-600">{{ student.gender || '—' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ student.dateOfBirth || '—' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ student.className || '—' }}</td>
                <td v-if="!isTeacherView" class="px-4 py-3 text-center">
                  <span
                    v-if="getStudentGrade(student.id).grade"
                    class="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800"
                  >
                    {{ getStudentGrade(student.id).grade }}
                  </span>
                  <span v-else class="text-slate-400">—</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span v-if="getStudentGrade(student.id).score === 0 || getStudentGrade(student.id).score" class="font-semibold text-slate-800">
                    {{ getStudentGrade(student.id).score }}
                  </span>
                  <span v-else class="text-slate-400">—</span>
                </td>
                <td class="px-4 py-3">
                  <Button
                    v-if="isEditable"
                    type="button"
                    variant="secondary"
                    size="sm"
                    rounded="md"
                    @click="openStudentGradeDialog(student)"
                  >
                    {{
                      getStudentGrade(student.id).score !== ''
                        ? t('common.actions.edit')
                        : t('common.actions.add')
                    }}
                  </Button>
                  <span v-else class="text-sm text-slate-500">{{ t('common.status.locked') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="students.length === 0" class="px-4 py-8 text-center text-sm text-slate-500">
          {{ t('preschoolGradeEntry.noStudents', 'No students found for this class') }}
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="lg"
          rounded="xl"
          :loading="isSubmitting"
          :disabled="!isEditable"
          @click="submitAllGrades"
          class="px-8"
        >
          {{ t('preschoolGradeEntry.saveGrades') }}
        </Button>

        <Button
          v-if="!isTeacherView"
          type="button"
          variant="secondary"
          size="lg"
          rounded="xl"
          :loading="exportLoading"
          @click="exportToPdf"
        >
          <i class="pi pi-file-pdf mr-2" /> PDF
        </Button>

        <Button
          v-if="!isTeacherView"
          type="button"
          variant="secondary"
          size="lg"
          rounded="xl"
          :loading="exportLoading"
          @click="exportToExcel"
        >
          <i class="pi pi-file-excel mr-2" /> Excel
        </Button>

        <Button type="button" variant="ghost" size="lg" rounded="xl" @click="() => router.back()">
          {{ t('common.cancel') }}
        </Button>
      </div>

      <!-- Student Grade Dialog -->
      <Dialog
        v-model:visible="isDetailDialogOpen"
        modal
        :header="`${t('preschoolGradeEntry.gradeFor')} ${selectedStudent?.name}`"
        class="grade-entry-dialog"
      >
        <div class="space-y-4">
          <div class="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {{ t('preschoolGradeEntry.calculatedGrade') }}:
            <span class="font-semibold text-slate-900">
              {{ editingGrade.grade || t('preschoolGradeEntry.calculatedAfterSave') }}
            </span>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">Score</label>
            <input
              v-model.number="editingGrade.score"
              type="number"
              min="0"
              max="100"
              step="0.01"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter score"
            />
          </div>
        </div>

        <template #footer>
          <Button type="button" severity="secondary" outlined @click="closeStudentGradeDialog">
            {{ t('common.cancel') }}
          </Button>
          <Button type="button" @click="saveStudentGrade">
            {{ t('common.save') }}
          </Button>
        </template>
      </Dialog>
    </section>
  </MainLayout>
</template>

<style scoped>
.grade-entry-content {
  display: flex;
  flex-direction: column;
}

.grade-entry-dialog {
  min-width: 400px;
}

@media (max-width: 768px) {
  .grade-entry-dialog {
    min-width: 100%;
  }
}
</style>
