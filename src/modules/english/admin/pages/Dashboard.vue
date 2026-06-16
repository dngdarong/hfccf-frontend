<script setup>
import { computed, onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Table from '@/components/data-display/Table.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchEnglishDashboard } from '@/modules/english/services/englishApi'

defineOptions({
  name: 'EnglishAdminDashboardPage',
})

const loading = ref(false)
const errorMessage = ref('')
const summary = ref({})
const { t, te } = useLanguage()

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

function localizedStatus(value) {
  const key = `english.common.status.${normalizeKey(value)}`
  return te(key) ? t(key) : (value || '-')
}

function localizeCard(rawCard) {
  const rawTitle = String(rawCard?.title || '').trim()
  const cardKeyMap = {
    'Total students': 'totalStudents',
    'Total teachers': 'totalTeachers',
    'Active classes': 'activeClasses',
    'Active tasks': 'activeTasks',
    'Pending submissions': 'pendingSubmissions',
    'Reviewed submissions': 'reviewedSubmissions',
  }

  const key = cardKeyMap[rawTitle]
  const titleKey = key ? `english.dashboard.admin.cards.${key}.title` : ''
  const labelKey = key ? `english.dashboard.admin.cards.${key}.label` : ''

  return {
    ...rawCard,
    title: titleKey && te(titleKey) ? t(titleKey) : rawTitle,
    label: labelKey && te(labelKey) ? t(labelKey) : String(rawCard?.label || ''),
  }
}

const cards = computed(() => (summary.value.summaryCards || []).map((card) => localizeCard(card)))

const assignmentColumns = computed(() => [
  { key: 'title', label: t('english.dashboard.admin.tables.assignments.title'), align: 'left' },
  { key: 'className', label: t('english.dashboard.admin.tables.assignments.class'), align: 'left' },
  { key: 'taskStatus', label: t('english.dashboard.admin.tables.assignments.status'), align: 'left' },
  { key: 'dueDate', label: t('english.dashboard.admin.tables.assignments.dueDate'), align: 'left' },
])

const reviewColumns = computed(() => [
  { key: 'taskTitle', label: t('english.dashboard.admin.tables.reviews.taskTitle'), align: 'left' },
  { key: 'studentName', label: t('english.dashboard.admin.tables.reviews.studentName'), align: 'left' },
  { key: 'submissionStatus', label: t('english.dashboard.admin.tables.reviews.status'), align: 'left' },
  { key: 'reviewedAt', label: t('english.dashboard.admin.tables.reviews.reviewedAt'), align: 'left' },
])

const workloadColumns = computed(() => [
  { key: 'name', label: t('english.dashboard.admin.tables.workload.name'), align: 'left' },
  { key: 'classes', label: t('english.dashboard.admin.tables.workload.classes'), align: 'left' },
  { key: 'tasks', label: t('english.dashboard.admin.tables.workload.tasks'), align: 'left' },
])

const recentAssignments = computed(() =>
  (summary.value.recentAssignments || []).map((item) => ({
    ...item,
    className: item.className || '-',
    taskStatusCode: item.taskStatus || '',
    taskStatus: localizedStatus(item.taskStatus),
    dueDate: item.dueDate || '-',
  })),
)

const recentReviews = computed(() =>
  (summary.value.recentReviews || []).map((item) => ({
    ...item,
    taskTitle: item.taskTitle || '-',
    studentName: item.studentName || '-',
    submissionStatusCode: item.submissionStatus || '',
    submissionStatus: localizedStatus(item.submissionStatus),
    reviewedAt: item.reviewedAt || '-',
  })),
)

const teacherWorkload = computed(() =>
  (summary.value.teacherWorkload || []).map((item) => ({
    ...item,
    name: item.name || '-',
    classes: item.classes ?? 0,
    tasks: item.tasks ?? 0,
  })),
)

const pageTitle = computed(() => t('english.dashboard.admin.title'))
const pageSubtitle = computed(() => t('english.dashboard.admin.subtitle'))
const loadingLabel = computed(() => t('english.dashboard.admin.loading'))
const emptyAssignments = computed(() => t('english.dashboard.admin.panels.recentAssignments.empty'))
const emptyReviews = computed(() => t('english.dashboard.admin.panels.recentReviews.empty'))
const emptyWorkload = computed(() => t('english.dashboard.admin.panels.teacherWorkload.empty'))
const recentAssignmentsTitle = computed(() => t('english.dashboard.admin.panels.recentAssignments.title'))
const recentAssignmentsCaption = computed(() => t('english.dashboard.admin.panels.recentAssignments.caption'))
const recentReviewsTitle = computed(() => t('english.dashboard.admin.panels.recentReviews.title'))
const recentReviewsCaption = computed(() => t('english.dashboard.admin.panels.recentReviews.caption'))
const workloadTitle = computed(() => t('english.dashboard.admin.panels.teacherWorkload.title'))
const workloadCaption = computed(() => t('english.dashboard.admin.panels.teacherWorkload.caption'))

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''

  try {
    summary.value = await fetchEnglishDashboard()
  } catch (error) {
    summary.value = {}
    errorMessage.value = error?.message || t('english.dashboard.admin.error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <MainLayout>
    <section class="english-dashboard-page">
      <HeaderSection
        :title="pageTitle"
        :subtitle="pageSubtitle"
      />

      <div class="english-dashboard-page__shell">
        <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
          {{ loadingLabel }}
        </div>

        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {{ errorMessage }}
        </div>

        <div class="english-dashboard-page__cards">
          <article
            v-for="card in cards"
            :key="card.title"
            class="english-dashboard-page__card"
          >
            <p class="english-dashboard-page__card-title">{{ card.title }}</p>
            <p class="english-dashboard-page__card-value">{{ card.value }}</p>
            <p class="english-dashboard-page__card-label">{{ card.label }}</p>
          </article>
        </div>

        <div class="english-dashboard-page__grid">
          <section class="english-dashboard-page__panel">
            <div class="english-dashboard-page__panel-header">
              <h2 class="english-dashboard-page__panel-title">{{ recentAssignmentsTitle }}</h2>
              <span class="english-dashboard-page__panel-caption">{{ recentAssignmentsCaption }}</span>
            </div>

            <Table
              :rows="recentAssignments"
              :columns="assignmentColumns"
              :loading="loading"
              :empty-text="emptyAssignments"
              :show-view-action="false"
              :show-edit-action="false"
              :show-delete-action="false"
            />
          </section>

          <section class="english-dashboard-page__panel">
            <div class="english-dashboard-page__panel-header">
              <h2 class="english-dashboard-page__panel-title">{{ recentReviewsTitle }}</h2>
              <span class="english-dashboard-page__panel-caption">{{ recentReviewsCaption }}</span>
            </div>

            <Table
              :rows="recentReviews"
              :columns="reviewColumns"
              :loading="loading"
              :empty-text="emptyReviews"
              :show-view-action="false"
              :show-edit-action="false"
              :show-delete-action="false"
            />
          </section>
        </div>

        <section class="english-dashboard-page__panel">
          <div class="english-dashboard-page__panel-header">
            <h2 class="english-dashboard-page__panel-title">{{ workloadTitle }}</h2>
            <span class="english-dashboard-page__panel-caption">{{ workloadCaption }}</span>
          </div>

          <Table
            :rows="teacherWorkload"
            :columns="workloadColumns"
            :loading="loading"
            :empty-text="emptyWorkload"
            :show-view-action="false"
            :show-edit-action="false"
            :show-delete-action="false"
          />
        </section>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.english-dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.english-dashboard-page__shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.english-dashboard-page__cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.english-dashboard-page__card {
  border-radius: 1.25rem;
  border: 1px solid #dbe7f5;
  background: #fff;
  padding: 1rem 1.1rem;
}

.english-dashboard-page__card-title {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.english-dashboard-page__card-value {
  margin-top: 0.35rem;
  font-size: 1.7rem;
  font-weight: 800;
  color: #0f172a;
}

.english-dashboard-page__card-label {
  margin-top: 0.2rem;
  font-size: 0.88rem;
  color: #475569;
}

.english-dashboard-page__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.english-dashboard-page__panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-radius: 1.25rem;
  border: 1px solid #dbe7f5;
  background: #fff;
  padding: 1rem;
}

.english-dashboard-page__panel-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.english-dashboard-page__panel-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.english-dashboard-page__panel-caption {
  font-size: 0.85rem;
  color: #64748b;
}

@media (max-width: 1024px) {
  .english-dashboard-page__cards,
  .english-dashboard-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
