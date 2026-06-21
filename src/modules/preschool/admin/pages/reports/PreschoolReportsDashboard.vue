<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchReportsDashboard } from '@/modules/preschool/services/api/preschoolReportingApi'
import ReportFilterBar from '@/modules/preschool/shared/components/report/ReportFilterBar.vue'
import ReportSummaryCards from '@/modules/preschool/shared/components/report/ReportSummaryCards.vue'
import EmptyReportState from '@/modules/preschool/shared/components/report/EmptyReportState.vue'

defineOptions({
  name: 'PreschoolReportsDashboardPage',
})

const { t } = useLanguage()
const router = useRouter()

const loading = ref(false)
const errorMessage = ref('')
const filters = ref({
  academicYearId: '',
  termId: '',
  dateFrom: '',
  dateTo: '',
  classId: '',
  teacherId: '',
  status: '',
})
const dashboard = ref({
  kpis: {},
  cards: [],
  modules: {},
  risk: {},
})

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''

  try {
    const payload = await fetchReportsDashboard(filters.value)
    dashboard.value = payload.dashboard || dashboard.value
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolReportsCenterPage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

const kpiCards = computed(() => [
  { title: t('preschoolReportsCenterPage.dashboard.cards.attendanceRate'), value: `${dashboard.value.kpis.attendanceRate || 0}%`, caption: t('preschoolReportsCenterPage.dashboard.summaryCards.totalStudents'), tone: 'success' },
  { title: t('preschoolReportsCenterPage.dashboard.cards.revenue'), value: dashboard.value.kpis.revenue || 0, caption: t('preschoolReportsCenterPage.dashboard.summaryCards.activeStudents'), tone: 'info' },
  { title: t('preschoolReportsCenterPage.dashboard.cards.openHealthAlerts'), value: dashboard.value.kpis.openHealthAlerts || 0, caption: t('preschoolReportsCenterPage.dashboard.summaryCards.atRiskStudents'), tone: 'error' },
  { title: t('preschoolReportsCenterPage.dashboard.cards.assessmentCompletion'), value: `${dashboard.value.kpis.assessmentCompletion || 0}%`, caption: t('preschoolReportsCenterPage.dashboard.summaryCards.newEnrollments'), tone: 'warning' },
])

const moduleCards = computed(() => [
  { title: t('preschoolReportsCenterPage.dashboard.moduleCards.attendance'), value: dashboard.value.modules?.attendance?.attendance_rate || 0, caption: t('preschoolReportsCenterPage.dashboard.actions.attendance') },
  { title: t('preschoolReportsCenterPage.dashboard.moduleCards.assessments'), value: dashboard.value.modules?.assessments?.completion_rate || 0, caption: t('preschoolReportsCenterPage.dashboard.actions.assessments') },
  { title: t('preschoolReportsCenterPage.dashboard.moduleCards.health'), value: dashboard.value.modules?.health?.open_alerts || 0, caption: t('preschoolReportsCenterPage.dashboard.actions.health') },
  { title: t('preschoolReportsCenterPage.dashboard.moduleCards.payments'), value: dashboard.value.modules?.payments?.revenue || 0, caption: t('preschoolReportsCenterPage.dashboard.actions.payments') },
  { title: t('preschoolReportsCenterPage.dashboard.moduleCards.enrollments'), value: dashboard.value.modules?.enrollments?.new_enrollments || 0, caption: t('preschoolReportsCenterPage.dashboard.actions.enrollments') },
  { title: t('preschoolReportsCenterPage.dashboard.moduleCards.guardians'), value: dashboard.value.modules?.guardians?.open_issues || 0, caption: t('preschoolReportsCenterPage.dashboard.actions.guardians') },
])

function goToReport(name) {
  router.push({ name })
}

function openAttendance() {
  goToReport('dashboard-preschool-admin-reports-attendance')
}

function openAssessments() {
  goToReport('dashboard-preschool-admin-reports-assessments')
}

function openHealth() {
  goToReport('dashboard-preschool-admin-reports-health')
}

function openPayments() {
  goToReport('dashboard-preschool-admin-reports-payments')
}

function openEnrollments() {
  goToReport('dashboard-preschool-admin-reports-enrollments')
}

function openGuardians() {
  goToReport('dashboard-preschool-admin-reports-guardians')
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolReportsCenterPage.pageTitle')"
        :subtitle="t('preschoolReportsCenterPage.pageSubtitle')"
      />

      <ReportFilterBar
        v-model="filters"
        :loading="loading"
        :labels="{
          academicYear: t('preschoolReportsCenterPage.filters.academicYear'),
          term: t('preschoolReportsCenterPage.filters.term'),
          dateFrom: t('preschoolReportsCenterPage.filters.dateFrom'),
          dateTo: t('preschoolReportsCenterPage.filters.dateTo'),
          class: t('preschoolReportsCenterPage.filters.class'),
          teacher: t('preschoolReportsCenterPage.filters.teacher'),
          status: t('preschoolReportsCenterPage.filters.status'),
          apply: t('preschoolReportsCenterPage.filters.apply'),
          reset: t('preschoolReportsCenterPage.filters.reset'),
        }"
        @apply="loadDashboard"
        @reset="loadDashboard"
      />

      <ReportSummaryCards :cards="kpiCards" />

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="card in moduleCards"
          :key="card.title"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ card.title }}</p>
          <div class="mt-2 text-3xl font-semibold text-slate-900">{{ card.value }}</div>
          <p class="mt-2 text-sm text-slate-500">{{ card.caption }}</p>
        </article>
      </div>

      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Button type="button" variant="primary" size="md" rounded="xl" @click="openAttendance">
          {{ t('preschoolReportsCenterPage.sections.attendance.title') }}
        </Button>
        <Button type="button" variant="secondary" size="md" rounded="xl" @click="openAssessments">
          {{ t('preschoolReportsCenterPage.sections.assessments.title') }}
        </Button>
        <Button type="button" variant="secondary" size="md" rounded="xl" @click="openHealth">
          {{ t('preschoolReportsCenterPage.sections.health.title') }}
        </Button>
        <Button type="button" variant="ghost" size="md" rounded="xl" @click="openPayments">
          {{ t('preschoolReportsCenterPage.sections.payments.title') }}
        </Button>
        <Button type="button" variant="ghost" size="md" rounded="xl" @click="openEnrollments">
          {{ t('preschoolReportsCenterPage.sections.enrollments.title') }}
        </Button>
        <Button type="button" variant="ghost" size="md" rounded="xl" @click="openGuardians">
          {{ t('preschoolReportsCenterPage.sections.guardians.title') }}
        </Button>
      </div>

      <EmptyReportState
        v-if="!loading && !moduleCards.length"
        :title="t('preschoolReportsCenterPage.emptyStates.dashboard')"
        :subtitle="t('preschoolReportsCenterPage.dashboard.emptyState')"
      />

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>
    </section>
  </MainLayout>
</template>
