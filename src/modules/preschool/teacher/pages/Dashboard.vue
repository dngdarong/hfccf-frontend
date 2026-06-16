<script setup>
// Keep the teacher dashboard copy in locale files so the view stays stable and
// EN/KH switching does not rely on inline English strings.
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
  name: 'TeacherPreschoolDashboard',
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
    errorMessage.value = error?.message || t('preschoolTeacherDashboardPage.errors.loadFailed')
  } finally {
    loading.value = false
  }
}

const cards = computed(() => [
  {
    title: t('preschoolTeacherDashboardPage.cards.students.title'),
    value: dashboard.value.summary.students || 0,
    label: t('preschoolTeacherDashboardPage.cards.students.label'),
    status: 'success',
  },
  {
    title: t('preschoolTeacherDashboardPage.cards.classes.title'),
    value: dashboard.value.summary.classes || 0,
    label: t('preschoolTeacherDashboardPage.cards.classes.label'),
    status: 'info',
  },
  {
    title: t('preschoolTeacherDashboardPage.cards.attendance.title'),
    value: dashboard.value.summary.attendanceToday || 0,
    label: t('preschoolTeacherDashboardPage.cards.attendance.label'),
    status: 'warning',
  },
  {
    title: t('preschoolTeacherDashboardPage.cards.payments.title'),
    value: dashboard.value.summary.pendingPayments || 0,
    label: t('preschoolTeacherDashboardPage.cards.payments.label'),
    status: 'error',
  },
])

const actions = computed(() => [
  t('preschoolTeacherDashboardPage.actions.upcomingClasses', { count: dashboard.value.upcomingClasses.length || 0 }),
  t('preschoolTeacherDashboardPage.actions.overduePayments', { count: dashboard.value.summary.overduePayments || 0 }),
  t('preschoolTeacherDashboardPage.actions.paidPayments', { count: dashboard.value.paymentSummary?.paid || 0 }),
])

const notes = computed(() =>
  (dashboard.value.recentAttendance || []).slice(0, 5).map((item) => ({
    title: `${item.studentName || t('preschoolTeacherDashboardPage.cards.students.title')} - ${item.className || t('preschoolTeacherDashboardPage.cards.classes.title')}`,
    text: `${item.attendanceDate || '-'} • ${item.status || '-'}`,
  })),
)

const spotlightTitle = computed(() =>
  dashboard.value.upcomingClasses[0]
    ? `${dashboard.value.upcomingClasses[0].name} ${t('preschoolTeacherDashboardPage.spotlight.nextSuffix')}`
    : t('preschoolTeacherDashboardPage.spotlight.noUpcomingClasses'),
)

const spotlightText = computed(() =>
  dashboard.value.upcomingClasses[0]
    ? `${dashboard.value.upcomingClasses[0].teacherDisplayName || t('preschoolTeacherDashboardPage.spotlight.assignedTeacher')} has ${dashboard.value.upcomingClasses[0].studentsCount || 0} enrolled students.`
    : t('preschoolTeacherDashboardPage.spotlight.fallback'),
)

function goToMySchedule() {
  // Keep the teacher timetable shortcut close to the dashboard so the read-only
  // flow stays discoverable without exposing management screens.
  router.push({ name: 'dashboard-preschool-teacher-schedule' })
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <MainLayout>
    <section class="preschool-dashboard-page">
      <HeaderSection
        :title="t('preschoolTeacherDashboardPage.title')"
        :subtitle="t('preschoolTeacherDashboardPage.subtitle')"
      />

      <div class="flex flex-wrap items-center gap-2">
        <Button type="button" variant="primary" size="md" rounded="xl" @click="goToMySchedule">
          {{ t('preschoolTeacherDashboardPage.actions.mySchedule') }}
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
        {{ t('preschoolTeacherDashboardPage.loading') }}
      </div>

      <PreschoolDashboardSummary :cards="cards" />

      <div class="preschool-dashboard-page__grid">
        <PreschoolDashboardSpotlight
          :title="spotlightTitle"
          :text="spotlightText"
        />
        <PreschoolDashboardActionList :title="t('preschoolTeacherDashboardPage.quickStats')" :items="actions" />
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
