<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import html2pdf from 'html2pdf.js'
import { useLanguage } from '@/composables/useLanguage'
import {
  fetchPreschoolClasses,
  fetchPreschoolStudents,
  fetchPreschoolAttendance,
} from '@/modules/preschool/services/preschoolApi'
import { fetchAcademicLifecycle } from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'

defineOptions({
  name: 'PreschoolAttendanceRegisterReportPage',
})

const { t } = useLanguage()
const router = useRouter()

const loading = ref(false)
const reportGenerated = ref(false)
const errorMessage = ref('')
const exportLoading = ref(false)

const academicYearId = ref('')
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const classId = ref('')
const teacherName = ref('')

const filterOptions = ref({
  academicYears: [],
  classes: [],
})

const reportData = ref({
  students: [],
  attendance: [],
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

const daysInMonth = computed(() => {
  return new Date(selectedYear.value, selectedMonth.value, 0).getDate()
})

const dayArray = computed(() => {
  const days = []
  for (let i = 1; i <= daysInMonth.value; i++) {
    days.push(i)
  }
  return days
})

const isWeekend = (day) => {
  const date = new Date(selectedYear.value, selectedMonth.value - 1, day)
  const dayOfWeek = date.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6
}

async function loadFilterOptions() {
  try {
    loading.value = true

    const lifecycle = await fetchAcademicLifecycle()
    filterOptions.value.academicYears = (lifecycle.academicYears || []).map(ay => ({
      label: ay.label || ay.code,
      value: ay.id,
    }))

    if (filterOptions.value.academicYears.length > 0 && !academicYearId.value) {
      academicYearId.value = filterOptions.value.academicYears[0].value
    }

    if (academicYearId.value) {
      const classes = await fetchPreschoolClasses({ academicYearId: academicYearId.value })
      filterOptions.value.classes = (classes.items || []).map(c => ({
        label: c.name,
        value: c.id,
      }))
    }
  } catch (error) {
    errorMessage.value = t('preschoolReportsCenterPage.errors.loadFailed') || 'Failed to load filter options'
    console.error('Error loading filter options:', error)
  } finally {
    loading.value = false
  }
}

async function generateReport() {
  try {
    loading.value = true
    errorMessage.value = ''

    if (!classId.value) {
      errorMessage.value = 'Please select a class'
      return
    }

    // Fetch students for the class
    const students = await fetchPreschoolStudents({ classId: classId.value })
    reportData.value.students = students.items || []

    // Fetch attendance for the period
    const attendance = await fetchPreschoolAttendance({
      classId: classId.value,
      month: selectedMonth.value,
      year: selectedYear.value,
    })
    reportData.value.attendance = attendance.items || []

    // Set class info
    const classInfo = filterOptions.value.classes.find(c => c.value === classId.value)
    reportData.value.classInfo = classInfo

    reportGenerated.value = true
  } catch (error) {
    errorMessage.value = t('preschoolReportsCenterPage.errors.generateFailed') || 'Failed to generate report'
    console.error('Error generating report:', error)
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  reportGenerated.value = false
  classId.value = ''
  teacherName.value = ''
  errorMessage.value = ''
}

function getAttendanceCode(studentId, day) {
  const record = reportData.value.attendance.find(
    a => a.studentId === studentId && new Date(a.date).getDate() === day
  )
  return record?.code || ''
}

async function exportToPdf() {
  try {
    exportLoading.value = true

    const element = document.querySelector('.attendance-register-content')
    if (!element) {
      throw new Error('Report content not found')
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `AttendanceRegister_${selectedMonth.value}_${selectedYear.value}_${timestamp}.pdf`

    const options = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    }

    await html2pdf().set(options).from(element).save()
  } catch (error) {
    errorMessage.value = 'Failed to export PDF'
    console.error('Error exporting PDF:', error)
  } finally {
    exportLoading.value = false
  }
}

function calculateAttendanceSummary(studentId) {
  const studentAttendance = reportData.value.attendance.filter(a => a.studentId === studentId)

  const summary = {
    present: studentAttendance.filter(a => a.code === '✓').length,
    absent: studentAttendance.filter(a => a.code === 'A').length,
    late: studentAttendance.filter(a => a.code === 'L').length,
    excused: studentAttendance.filter(a => a.code === 'E').length,
  }

  const total = summary.present + summary.absent + summary.late + summary.excused
  summary.percentage = total > 0 ? Math.round((summary.present / total) * 100) : 0

  return summary
}

onMounted(() => {
  loadFilterOptions()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <HeaderSection
          :title="t('preschoolAttendanceRegisterPage.title') || 'Attendance Register'"
          :subtitle="t('preschoolAttendanceRegisterPage.subtitle') || 'Generate official attendance register for printing and archiving'"
        />
        <Button
          type="button"
          variant="ghost"
          size="md"
          rounded="lg"
          @click="() => router.push({ name: 'dashboard-preschool-admin-reports' })"
          class="flex items-center gap-2"
        >
          <i class="pi pi-chevron-left" />
          {{ t('preschoolReportsPage.backToReports') || 'Back to Reports' }}
        </Button>
      </div>

      <!-- Filters -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {{ t('preschoolAttendanceReportPage.filters') || 'Filters' }}
        </h3>

        <div class="grid gap-4 md:grid-cols-4">
          <!-- Academic Year -->
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-700">
              {{ t('preschoolReportsCenterPage.filters.academicYear') || 'Academic Year' }}
            </span>
            <Select
              v-model="academicYearId"
              :options="filterOptions.academicYears"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </label>

          <!-- Class -->
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-700">
              {{ t('preschoolReportsCenterPage.filters.class') || 'Class' }}
            </span>
            <Select
              v-model="classId"
              :options="filterOptions.classes"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </label>

          <!-- Month -->
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-700">
              {{ t('preschoolAttendanceReportPage.month') || 'Month' }}
            </span>
            <Select
              v-model="selectedMonth"
              :options="months"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </label>

          <!-- Year -->
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-700">
              {{ t('preschoolAttendanceReportPage.year') || 'Year' }}
            </span>
            <DatePicker
              v-model="selectedYear"
              view="year"
              date-format="yy"
              class="w-full"
            />
          </label>
        </div>

        <!-- Teacher Name (optional) -->
        <div class="mt-4">
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-700">
              {{ t('preschoolAttendanceReportPage.teacherName') || 'Teacher Name (Optional)' }}
            </span>
            <input
              v-model="teacherName"
              type="text"
              placeholder="Enter teacher name"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ errorMessage }}
        </div>

        <!-- Generate & Reset Buttons -->
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="lg"
            rounded="xl"
            :loading="loading"
            :disabled="!classId"
            @click="generateReport"
            class="px-8"
          >
            {{ t('preschoolAttendanceReportPage.generateReport') || 'Generate Register' }}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            rounded="xl"
            @click="resetFilters"
          >
            {{ t('preschoolAttendanceReportPage.reset') || 'Reset' }}
          </Button>
        </div>
      </div>

      <!-- Attendance Register -->
      <template v-if="reportGenerated">
        <!-- Export Button -->
        <div class="flex justify-end gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            rounded="lg"
            :loading="exportLoading"
            @click="exportToPdf"
            class="flex items-center gap-2"
          >
            <i class="pi pi-file-pdf" />
            {{ t('preschoolReportsCenterPage.exports.pdf') || 'Download as PDF' }}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            rounded="lg"
            @click="() => window.print()"
            class="flex items-center gap-2"
          >
            <i class="pi pi-print" />
            {{ t('preschoolReportsCenterPage.exports.print') || 'Print' }}
          </Button>
        </div>

        <!-- Attendance Register Content (for PDF) -->
        <div class="attendance-register-content space-y-0 bg-white p-8">
          <!-- PAGE 1: Student Information -->
          <div class="page page-1 mb-12 space-y-4">
            <!-- Header -->
            <div class="mb-6 flex items-start justify-between">
              <div>
                <p class="text-xs font-bold">HOPE for Cambodian Children</p>
                <p class="text-xs">Organization for Children's Hope Foundation Cambodia</p>
              </div>
              <div class="text-center">
                <p class="text-sm font-bold">បង្រាប់ឈ្មោះនិងលម្អិតរបស់សិស្ស</p>
                <p class="text-xs">សម្រាប់រយៈពេលថ្ងៃទី ១-៣១ របៀង {{ selectedMonth }}/{{ selectedYear }}</p>
              </div>
            </div>

            <!-- Report Info Section -->
            <div class="mb-4 grid grid-cols-2 gap-4 border border-slate-400 p-3 text-xs">
              <div><strong>Academic Year / ឆ្នាំសិក្សា:</strong> {{ filterOptions.academicYears.find(y => y.value === academicYearId)?.label }}</div>
              <div><strong>Month / ខែ:</strong> {{ months.find(m => m.value === selectedMonth)?.label }} {{ selectedYear }}</div>
              <div><strong>Class / ថ្នាក់:</strong> {{ reportData.classInfo?.label }}</div>
              <div><strong>Teacher / គ្រូបង្រៀន:</strong> {{ teacherName }}</div>
            </div>

            <!-- Student Information Table -->
            <table class="w-full border-collapse border border-slate-400 text-xs">
              <thead>
                <tr class="bg-slate-100">
                  <th class="border border-slate-400 p-2">No.</th>
                  <th class="border border-slate-400 p-2">Student ID / លេខសម្គាល់</th>
                  <th class="border border-slate-400 p-2">Student Name / ឈ្មោះសិស្ស</th>
                  <th class="border border-slate-400 p-2">Gender / ភេទ</th>
                  <th class="border border-slate-400 p-2">Date of Birth / ថ្ងៃកំណើត</th>
                  <th class="border border-slate-400 p-2">Guardian Phone / លេខទូរស័ព្ទឪពុកម្ដាយ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(student, idx) in reportData.students" :key="student.id">
                  <td class="border border-slate-400 p-2">{{ idx + 1 }}</td>
                  <td class="border border-slate-400 p-2">{{ student.enrollmentNumber || '' }}</td>
                  <td class="border border-slate-400 p-2">{{ student.firstName }} {{ student.lastName }}</td>
                  <td class="border border-slate-400 p-2">{{ student.gender === 'M' ? 'ប្រុស' : 'ស្រី' }}</td>
                  <td class="border border-slate-400 p-2">{{ student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '' }}</td>
                  <td class="border border-slate-400 p-2">{{ student.guardianPhone || '' }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Page 1 Footer -->
            <div class="mt-8 grid grid-cols-3 gap-4 text-center text-xs">
              <div class="border-t border-slate-400 pt-2">
                <p class="text-xs font-semibold">Teacher Signature / ហត្ថលេខាគ្រូ</p>
                <p class="text-xs">_____________________</p>
                <p class="text-xs">Date / ថ្ងៃ: ___/___/______</p>
              </div>
              <div class="border-t border-slate-400 pt-2">
                <p class="text-xs font-semibold">Director Signature / ហត្ថលេខាលេខាធិការ</p>
                <p class="text-xs">_____________________</p>
                <p class="text-xs">Date / ថ្ងៃ: ___/___/______</p>
              </div>
              <div class="border-t border-slate-400 pt-2">
                <p class="text-xs font-semibold">Generated</p>
                <p class="text-xs">{{ new Date().toLocaleDateString() }}</p>
                <p class="text-xs">{{ new Date().toLocaleTimeString() }}</p>
              </div>
            </div>

            <!-- Page Break -->
            <div class="page-break"></div>
          </div>

          <!-- PAGE 2: Attendance Grid -->
          <div class="page page-2 space-y-4">
            <!-- Header -->
            <div class="mb-6 flex items-start justify-between">
              <div>
                <p class="text-xs font-bold">HOPE for Cambodian Children</p>
                <p class="text-xs">Organization for Children's Hope Foundation Cambodia</p>
              </div>
              <div class="text-center">
                <p class="text-sm font-bold">ឋានាការសុខុមាលភាព</p>
                <p class="text-xs">របាយការណ៍ឋានាការសុខុមាលភាព ខែ {{ selectedMonth }}/{{ selectedYear }}</p>
              </div>
            </div>

            <!-- Report Info Section -->
            <div class="mb-4 grid grid-cols-2 gap-4 border border-slate-400 p-3 text-xs">
              <div><strong>Class / ថ្នាក់:</strong> {{ reportData.classInfo?.label }}</div>
              <div><strong>Teacher / គ្រូបង្រៀន:</strong> {{ teacherName }}</div>
              <div><strong>Month / ខែ:</strong> {{ months.find(m => m.value === selectedMonth)?.label }} {{ selectedYear }}</div>
              <div><strong>Academic Year / ឆ្នាំសិក្សា:</strong> {{ filterOptions.academicYears.find(y => y.value === academicYearId)?.label }}</div>
            </div>

            <!-- Attendance Table -->
            <div class="overflow-x-auto">
              <table class="w-full border-collapse border border-slate-400 text-xs">
                <thead>
                  <tr class="bg-slate-100">
                    <th class="border border-slate-400 p-2">No.</th>
                    <th class="border border-slate-400 p-2">Student Name</th>
                    <th class="border border-slate-400 p-2">Gender</th>
                    <th v-for="day in dayArray" :key="day" :class="isWeekend(day) ? 'bg-red-100' : ''" class="border border-slate-400 p-1 text-center">
                      {{ day }}
                    </th>
                    <th class="border border-slate-400 p-2">Present</th>
                    <th class="border border-slate-400 p-2">Absent</th>
                    <th class="border border-slate-400 p-2">Late</th>
                    <th class="border border-slate-400 p-2">Excused</th>
                    <th class="border border-slate-400 p-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(student, idx) in reportData.students" :key="student.id">
                    <td class="border border-slate-400 p-2">{{ idx + 1 }}</td>
                    <td class="border border-slate-400 p-2">{{ student.firstName }} {{ student.lastName }}</td>
                    <td class="border border-slate-400 p-2">{{ student.gender === 'M' ? 'M' : 'F' }}</td>
                    <td v-for="day in dayArray" :key="`${student.id}-${day}`" :class="isWeekend(day) ? 'bg-red-100' : ''" class="border border-slate-400 p-1 text-center">
                      {{ getAttendanceCode(student.id, day) }}
                    </td>
                    <td class="border border-slate-400 p-2 text-center">{{ calculateAttendanceSummary(student.id).present }}</td>
                    <td class="border border-slate-400 p-2 text-center">{{ calculateAttendanceSummary(student.id).absent }}</td>
                    <td class="border border-slate-400 p-2 text-center">{{ calculateAttendanceSummary(student.id).late }}</td>
                    <td class="border border-slate-400 p-2 text-center">{{ calculateAttendanceSummary(student.id).excused }}</td>
                    <td class="border border-slate-400 p-2 text-center">{{ calculateAttendanceSummary(student.id).percentage }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Legend -->
            <div class="mt-6 border border-slate-400 p-3">
              <p class="mb-2 text-xs font-semibold">Legend / ឬាយល័ក្ខណ៍:</p>
              <div class="grid grid-cols-4 gap-4 text-xs">
                <div>✓ = Present / មាន</div>
                <div>A = Absent / គ្មាន</div>
                <div>L = Late / យឺត</div>
                <div>E = Excused / ឯកសារ</div>
              </div>
            </div>

            <!-- Page 2 Footer -->
            <div class="mt-8 grid grid-cols-2 gap-4 text-center text-xs">
              <div class="border-t border-slate-400 pt-2">
                <p class="text-xs font-semibold">Teacher Signature / ហត្ថលេខាគ្រូ</p>
                <p class="text-xs">_____________________</p>
                <p class="text-xs">Date / ថ្ងៃ: ___/___/______</p>
              </div>
              <div class="border-t border-slate-400 pt-2">
                <p class="text-xs font-semibold">Director Signature / ហត្ថលេខាលេខាធិការ</p>
                <p class="text-xs">_____________________</p>
                <p class="text-xs">Date / ថ្ងៃ: ___/___/______</p>
              </div>
            </div>

            <!-- System Info -->
            <div class="mt-4 border-t border-slate-400 pt-2 text-center text-xs text-slate-600">
              <p>HFCCF Preschool Management System</p>
              <p>Generated: {{ new Date().toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty State -->
      <div v-else class="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
        <i class="pi pi-inbox text-4xl text-slate-300" />
        <p class="mt-4 text-slate-600">
          {{ t('preschoolAttendanceReportPage.emptyState') || 'Select filters and click Generate Register to view attendance data' }}
        </p>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.page {
  page-break-after: always;
}

.page-break {
  page-break-after: always;
}

@media print {
  .attendance-register-content {
    display: block !important;
  }

  table {
    font-size: 9pt;
  }

  .page {
    page-break-after: always;
    margin-bottom: 2rem;
  }

  th,
  td {
    padding: 4px 6px !important;
    border: 1px solid #000 !important;
  }

  th {
    background-color: #f0f0f0 !important;
    font-weight: bold;
  }

  .bg-red-100 {
    background-color: #fee2e2 !important;
  }

  /* Hide UI controls when printing */
  header,
  nav,
  aside,
  .flex.justify-end {
    display: none !important;
  }
}
</style>
