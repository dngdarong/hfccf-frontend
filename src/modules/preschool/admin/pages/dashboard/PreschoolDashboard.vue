<script setup>
// Keep Preschool dashboard copy in the locale layer so the page stays stable
// across EN/KH switches and does not regress to hardcoded English labels.
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import PreschoolDashboardSummary from '@/modules/preschool/admin/components/dashboard/PreschoolDashboardSummary.vue'
import PreschoolDashboardSpotlight from '@/modules/preschool/admin/components/dashboard/PreschoolDashboardSpotlight.vue'
import PreschoolDashboardActionList from '@/modules/preschool/admin/components/dashboard/PreschoolDashboardActionList.vue'
import PreschoolDashboardActivity from '@/modules/preschool/admin/components/dashboard/PreschoolDashboardActivity.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchPreschoolDashboard } from '@/modules/preschool/services/preschoolApi'

defineOptions({
  name: 'PreschoolDashboardPage',
})

const { t } = useLanguage()
const router = useRouter()

const dashboard = ref({
  summary: {
    students: 0,
    classes: 0,
    teachers: 0,
    attendanceToday: 0,
    pendingPayments: 0,
    overduePayments: 0,
  },
  recentAttendance: [],
  upcomingClasses: [],
  paymentSummary: {
    paid: 0,
    pending: 0,
    overdue: 0,
    cancelled: 0,
  },
})
const loading = ref(false)
const errorMessage = ref('')

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''

  try {
    dashboard.value = await fetchPreschoolDashboard()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolDashboardPage.errors.loadFailed')
  } finally {
    loading.value = false
  }
}

const cards = computed(() => [
  {
    title: t('preschoolDashboardPage.cards.students.title'),
    value: dashboard.value.summary.students || 0,
    label: t('preschoolDashboardPage.cards.students.label'),
    status: 'success',
  },
  {
    title: t('preschoolDashboardPage.cards.classes.title'),
    value: dashboard.value.summary.classes || 0,
    label: t('preschoolDashboardPage.cards.classes.label'),
    status: 'info',
  },
  {
    title: t('preschoolDashboardPage.cards.teachers.title'),
    value: dashboard.value.summary.teachers || 0,
    label: t('preschoolDashboardPage.cards.teachers.label'),
    status: 'warning',
  },
  {
    title: t('preschoolDashboardPage.cards.attendance.title'),
    value: dashboard.value.summary.attendanceToday || 0,
    label: t('preschoolDashboardPage.cards.attendance.label'),
    status: 'error',
  },
])

const actions = computed(() => [
  t('preschoolDashboardPage.actions.pendingPayments', { count: dashboard.value.summary.pendingPayments || 0 }),
  t('preschoolDashboardPage.actions.overduePayments', { count: dashboard.value.summary.overduePayments || 0 }),
  t('preschoolDashboardPage.actions.paidPayments', { count: dashboard.value.paymentSummary?.paid || 0 }),
  t('preschoolDashboardPage.actions.upcomingClasses', { count: dashboard.value.upcomingClasses.length || 0 }),
])

const notes = computed(() =>
  (dashboard.value.recentAttendance || []).slice(0, 5).map((item) => ({
    title: `${item.studentName || t('preschoolDashboardPage.cards.students.title')} - ${item.className || t('preschoolDashboardPage.cards.classes.title')}`,
    text: `${item.attendanceDate || '-'} • ${item.status || '-'}`,
  })),
)

const spotlightTitle = computed(() =>
  dashboard.value.upcomingClasses[0]
    ? `${dashboard.value.upcomingClasses[0].name} ${t('preschoolDashboardPage.nextClassSuffix')}`
    : t('preschoolDashboardPage.noUpcomingClasses'),
)

const spotlightText = computed(() =>
  dashboard.value.upcomingClasses[0]
    ? `${dashboard.value.upcomingClasses[0].teacherDisplayName || t('preschoolDashboardPage.assignedTeacher')} has ${dashboard.value.upcomingClasses[0].studentsCount || 0} enrolled students.`
    : t('preschoolDashboardPage.populateText'),
)

function goToScheduleManagement() {
  // Keep the timetable entry point on the dashboard so Preschool admins can
  // reach schedules without relying on a sidebar structure change.
  router.push({ name: 'dashboard-preschool-admin-schedules' })
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <MainLayout>
    <section class="preschool-dashboard-page">
      <HeaderSection
        :title="t('preschoolDashboardPage.title')"
        :subtitle="t('preschoolDashboardPage.subtitle')"
      />

      <div class="flex flex-wrap items-center gap-2">
        <Button type="button" variant="primary" size="md" rounded="xl" @click="goToScheduleManagement">
          {{ t('preschoolDashboardPage.actions.scheduleManagement') }}
        </Button>
      </div>

      <div
        v-if="errorMessage"
        class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="loading"
        class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500"
      >
        {{ t('preschoolDashboardPage.loading') }}
      </div>

      <PreschoolDashboardSummary :cards="cards" />

      <div class="preschool-dashboard-page__grid">
        <PreschoolDashboardSpotlight
          :title="spotlightTitle"
          :text="spotlightText"
        />
        <PreschoolDashboardActionList :title="t('preschoolDashboardPage.actions.queueTitle')" :items="actions" />
      </div>

      <PreschoolDashboardActivity :items="notes" />
    </section>
  </MainLayout>
</template>

<style scoped>
.preschool-dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.preschool-dashboard-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.9fr);
  gap: 1rem;
  align-items: start;
}

@media (max-width: 980px) {
  .preschool-dashboard-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>

