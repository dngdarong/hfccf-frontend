<script setup>
// Preschool assignment workflow is admin-only. This page is the control hub
// for student-class, teacher-class, and schedule ownership; it does not own
// the underlying CRUD mutations, which remain in the existing admin pages so
// RBAC and teacher-scope restrictions stay intact.
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchAcademicLifecycle } from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'
import { fetchPreschoolClasses, fetchPreschoolStudents } from '@/modules/preschool/services/preschoolApi'
import { fetchSchedules } from '@/modules/preschool/services/api/preschoolScheduleApi'
import {
  normalizeStatus,
  formatDate,
  badgeClasses,
  statusLabel,
  isTermLocked as checkIsTermLocked,
  isReportPeriodLocked as checkIsReportPeriodLocked,
  buildAssignmentLockMessage,
  buildStudentAssignmentRows,
  buildTeacherAssignmentRows,
  buildTeacherAssignmentHistoryRows,
  buildScheduleAssignmentRows,
  buildHistoryRows,
  buildSummaryCards,
} from './utils/preschoolAssignmentsHelpers'

defineOptions({
  name: 'PreschoolAdminAssignmentWorkflowPage',
})

const { t } = useLanguage()
const router = useRouter()

const loading = ref(false)
const errorMessage = ref('')
const lifecycleContext = ref({})
const classRows = ref([])
const studentRows = ref([])
const scheduleRows = ref([])

function goTo(routeName) {
  router.push({ name: routeName })
}

async function loadAssignments() {
  loading.value = true
  errorMessage.value = ''

  try {
    const [classesResponse, studentsResponse, schedulesResponse] = await Promise.all([
      fetchPreschoolClasses({ perPage: 100 }),
      fetchPreschoolStudents({ perPage: 100 }),
      fetchSchedules({ perPage: 100 }),
    ])

    classRows.value = classesResponse.items || []
    studentRows.value = studentsResponse.items || []
    scheduleRows.value = schedulesResponse.items || []
    try {
      const lifecycle = await fetchAcademicLifecycle()
      lifecycleContext.value = lifecycle.currentContext || {}
    } catch (lifecycleError) {
      lifecycleContext.value = {}
      console.warn('Preschool assignment lifecycle snapshot unavailable.', lifecycleError)
    }
  } catch (error) {
    classRows.value = []
    studentRows.value = []
    scheduleRows.value = []
    lifecycleContext.value = {}
    errorMessage.value = error?.message || t('preschoolAssignmentsPage.empty')
  } finally {
    loading.value = false
  }
}

const isTermLocked = computed(() => checkIsTermLocked(lifecycleContext.value.term_status))
const isReportPeriodLocked = computed(() =>
  checkIsReportPeriodLocked(lifecycleContext.value.report_period_status || lifecycleContext.value.reportPeriodStatus),
)
const assignmentLockMessage = computed(() => buildAssignmentLockMessage(lifecycleContext.value, t))

const studentAssignmentRows = computed(() => buildStudentAssignmentRows(studentRows.value))

const teacherAssignmentRows = computed(() => buildTeacherAssignmentRows(classRows.value))

const teacherAssignmentHistoryRows = computed(() => buildTeacherAssignmentHistoryRows(classRows.value))

const scheduleAssignmentRows = computed(() => buildScheduleAssignmentRows(scheduleRows.value))

const historyRows = computed(() =>
  buildHistoryRows(studentAssignmentRows.value, teacherAssignmentHistoryRows.value, scheduleAssignmentRows.value),
)

const summaryCards = computed(() =>
  buildSummaryCards(studentAssignmentRows.value, teacherAssignmentRows.value, scheduleAssignmentRows.value, historyRows.value, t),
)

onMounted(loadAssignments)
</script>

<template>
  <MainLayout>
    <section class="preschool-assignment-workflow space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <HeaderSection
        :title="t('preschoolAssignmentsPage.title')"
        :subtitle="t('preschoolAssignmentsPage.subtitle')"
      />

      <div class="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          {{ t('preschoolAssignmentsPage.quickActions.title') }}
        </p>
        <p class="mt-2 text-sm text-slate-600">
          {{ t('preschoolAssignmentsPage.workflowNote') }}
        </p>
        <div
          v-if="(isTermLocked || isReportPeriodLocked) && assignmentLockMessage"
          class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {{ assignmentLockMessage }}
        </div>

        <div class="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            @click="goTo('dashboard-preschool-admin-students')"
          >
            {{ t('preschoolAssignmentsPage.quickActions.manageStudents') }}
          </button>
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            @click="goTo('dashboard-preschool-admin-classes')"
          >
            {{ t('preschoolAssignmentsPage.quickActions.manageClasses') }}
          </button>
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            @click="goTo('dashboard-preschool-admin-users')"
          >
            {{ t('preschoolAssignmentsPage.quickActions.manageTeachers') }}
          </button>
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            @click="goTo('dashboard-preschool-admin-schedules')"
          >
            {{ t('preschoolAssignmentsPage.quickActions.manageSchedules') }}
          </button>
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            @click="goTo('dashboard-preschool-admin-attendance')"
          >
            {{ t('preschoolAssignmentsPage.quickActions.attendance') }}
          </button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            rounded="xl"
            :disabled="loading"
            @click="loadAssignments"
          >
            {{ t('common.actions.refresh') }}
          </Button>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-4">
        <article
          v-for="card in summaryCards"
          :key="card.id"
          class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p class="text-sm font-semibold text-slate-500">{{ card.title }}</p>
          <p class="mt-3 text-3xl font-black tracking-tight text-slate-900">{{ card.value }}</p>
          <p class="mt-2 text-sm text-slate-500">{{ card.caption }}</p>
        </article>
      </div>

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-600">
        {{ t('common.loading') }}
      </div>

      <section class="space-y-6">
        <article class="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <header class="border-b border-slate-200 px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {{ t('preschoolAssignmentsPage.sections.studentAssignments.eyebrow') }}
            </p>
            <h2 class="mt-2 text-lg font-bold text-slate-900">
              {{ t('preschoolAssignmentsPage.sections.studentAssignments.title') }}
            </h2>
            <p class="mt-1 text-sm text-slate-600">
              {{ t('preschoolAssignmentsPage.sections.studentAssignments.subtitle') }}
            </p>
          </header>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead class="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.student') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.class') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.teacher') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.status') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.enrolledAt') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-if="!studentAssignmentRows.length && !loading">
                  <td colspan="6" class="px-5 py-6 text-sm text-slate-500">
                    {{ t('preschoolAssignmentsPage.empty') }}
                  </td>
                </tr>
                <tr v-for="row in studentAssignmentRows" :key="`${row.studentId}-${row.classId}-${row.status}-${row.enrolledAt}`">
                  <td class="px-5 py-4 font-medium text-slate-900">{{ row.studentName }}</td>
                  <td class="px-5 py-4 text-slate-600">
                    <div class="font-medium text-slate-900">{{ row.classCode }}</div>
                    <div class="text-xs text-slate-500">{{ row.className }}</div>
                  </td>
                  <td class="px-5 py-4 text-slate-600">{{ row.teacherDisplayName }}</td>
                  <td class="px-5 py-4">
                    <span
                      class="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                      :class="badgeClasses(row.status)"
                    >
                      {{ statusLabel(row.status, t) }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-slate-600">{{ formatDate(row.enrolledAt) }}</td>
                  <td class="px-5 py-4">
                    <button
                      type="button"
                      class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      @click="goTo('dashboard-preschool-admin-students')"
                    >
                      {{ t('common.actions.view') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <header class="border-b border-slate-200 px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {{ t('preschoolAssignmentsPage.sections.teacherAssignments.eyebrow') }}
            </p>
            <h2 class="mt-2 text-lg font-bold text-slate-900">
              {{ t('preschoolAssignmentsPage.sections.teacherAssignments.title') }}
            </h2>
            <p class="mt-1 text-sm text-slate-600">
              {{ t('preschoolAssignmentsPage.sections.teacherAssignments.subtitle') }}
            </p>
          </header>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead class="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.class') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.teacher') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.status') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.notes') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-if="!teacherAssignmentRows.length && !loading">
                  <td colspan="5" class="px-5 py-6 text-sm text-slate-500">
                    {{ t('preschoolAssignmentsPage.empty') }}
                  </td>
                </tr>
                <tr v-for="row in teacherAssignmentRows" :key="row.classId">
                  <td class="px-5 py-4 text-slate-600">
                    <div class="font-medium text-slate-900">{{ row.classCode }}</div>
                    <div class="text-xs text-slate-500">{{ row.className }}</div>
                  </td>
                  <td class="px-5 py-4 font-medium text-slate-900">{{ row.teacherDisplayName }}</td>
                  <td class="px-5 py-4">
                    <span
                      class="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                      :class="badgeClasses(row.status)"
                    >
                      {{ statusLabel(row.status, t) }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-slate-600">{{ row.studentsCount }}</td>
                  <td class="px-5 py-4">
                    <button
                      type="button"
                      class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      @click="goTo('dashboard-preschool-admin-classes')"
                    >
                      {{ t('common.actions.view') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <header class="border-b border-slate-200 px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {{ t('preschoolAssignmentsPage.sections.scheduleAssignments.eyebrow') }}
            </p>
            <h2 class="mt-2 text-lg font-bold text-slate-900">
              {{ t('preschoolAssignmentsPage.sections.scheduleAssignments.title') }}
            </h2>
            <p class="mt-1 text-sm text-slate-600">
              {{ t('preschoolAssignmentsPage.sections.scheduleAssignments.subtitle') }}
            </p>
          </header>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead class="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.class') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.teacher') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.day') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.status') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.notes') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-if="!scheduleAssignmentRows.length && !loading">
                  <td colspan="6" class="px-5 py-6 text-sm text-slate-500">
                    {{ t('preschoolAssignmentsPage.empty') }}
                  </td>
                </tr>
                <tr v-for="row in scheduleAssignmentRows" :key="row.id">
                  <td class="px-5 py-4 font-medium text-slate-900">{{ row.className }}</td>
                  <td class="px-5 py-4 text-slate-600">{{ row.teacherName }}</td>
                  <td class="px-5 py-4 text-slate-600">{{ row.dayOfWeek }}</td>
                  <td class="px-5 py-4">
                    <span
                      class="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                      :class="badgeClasses(row.status)"
                    >
                      {{ statusLabel(row.status, t) }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-slate-600">{{ row.notes || formatDate(row.effectiveFrom) }}</td>
                  <td class="px-5 py-4">
                    <button
                      type="button"
                      class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      @click="goTo('dashboard-preschool-admin-schedules')"
                    >
                      {{ t('common.actions.view') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <header class="border-b border-slate-200 px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {{ t('preschoolAssignmentsPage.sections.history.eyebrow') }}
            </p>
            <h2 class="mt-2 text-lg font-bold text-slate-900">
              {{ t('preschoolAssignmentsPage.sections.history.title') }}
            </h2>
            <p class="mt-1 text-sm text-slate-600">
              {{ t('preschoolAssignmentsPage.sections.history.subtitle') }}
            </p>
          </header>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead class="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.record') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.type') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.status') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.updatedAt') }}</th>
                  <th class="px-5 py-3">{{ t('preschoolAssignmentsPage.table.notes') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-if="!historyRows.length && !loading">
                  <td colspan="5" class="px-5 py-6 text-sm text-slate-500">
                    {{ t('preschoolAssignmentsPage.empty') }}
                  </td>
                </tr>
                <tr v-for="row in historyRows" :key="`${row.type}-${row.label}-${row.updatedAt}`">
                  <td class="px-5 py-4 font-medium text-slate-900">{{ row.label }}</td>
                  <td class="px-5 py-4 text-slate-600">{{ row.type }}</td>
                  <td class="px-5 py-4">
                    <span
                      class="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                      :class="badgeClasses(row.status)"
                    >
                      {{ t(`preschoolAssignmentsPage.statusLabels.${normalizeStatus(row.status)}`) }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-slate-600">{{ formatDate(row.updatedAt) }}</td>
                  <td class="px-5 py-4 text-slate-600">{{ row.note || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </section>
  </MainLayout>
</template>
