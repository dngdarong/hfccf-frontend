<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { useLanguage } from '@/composables/useLanguage'
import { assessmentSubmissionApi } from '../services/assessmentSubmissionApi'

defineOptions({ name: 'AssessmentSubmissionListPage' })

const router = useRouter()
const { t } = useLanguage()

const submissions = ref([])
const isLoading = ref(false)
const statusFilter = ref(null)
const allSubmissions = ref([])

const statusSeverity = {
  draft: 'secondary',
  submitted: 'info',
  under_review: 'warn',
  approved: 'success',
  rejected: 'danger',
  archived: 'secondary',
}

const statusIcons = {
  draft: '📝',
  submitted: '📥',
  under_review: '🔍',
  approved: '✅',
  rejected: '❌',
}

const statusCounts = computed(() => {
  const counts = {
    draft: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
  }
  allSubmissions.value.forEach((sub) => {
    if (sub.status in counts) {
      counts[sub.status]++
    }
  })
  return counts
})

async function load() {
  isLoading.value = true
  try {
    const res = await assessmentSubmissionApi.list({})
    allSubmissions.value = res.data.data

    const params = {}
    if (statusFilter.value) params.status = statusFilter.value
    const filteredRes = await assessmentSubmissionApi.list(params)
    submissions.value = filteredRes.data.data
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <MainLayout>
    <div class="submissions">
      <HeaderSection :title="t('submissions.title')">
        <template #actions>
          <Button
            :label="t('assessmentWizard.title')"
            icon="pi pi-plus"
            @click="router.push({ name: 'assessment-wizard' })"
          />
        </template>
      </HeaderSection>

      <div class="submissions__hero">
        <div class="submissions__hero-content">
          <h2 class="submissions__hero-title">📥 Submission Tracker</h2>
          <p class="submissions__hero-subtitle">
            Monitor, review, and manage all form submissions across your assessments
          </p>
          <div class="submissions__hero-actions">
            <Button
              :label="t('assessmentWizard.title')"
              icon="pi pi-plus"
              @click="router.push({ name: 'assessment-wizard' })"
            />
            <Button
              :label="t('assessmentDashboard.quickActions.viewReports')"
              icon="pi pi-chart-bar"
              severity="secondary"
              @click="router.push({ name: 'assessment-reports' })"
            />
          </div>
        </div>
      </div>

      <div class="submissions__row">
        <div
          class="submissions__status-card"
          :class="{ 'submissions__status-card--active': !statusFilter }"
          @click="statusFilter = null; load()"
        >
          <div class="submissions__status-icon">📊</div>
          <div class="submissions__status-count">{{ allSubmissions.length }}</div>
          <div class="submissions__status-label">Total</div>
        </div>

        <div
          class="submissions__status-card submissions__status-card--draft"
          :class="{ 'submissions__status-card--active': statusFilter === 'draft' }"
          @click="statusFilter = 'draft'; load()"
        >
          <div class="submissions__status-icon">{{ statusIcons.draft }}</div>
          <div class="submissions__status-count">{{ statusCounts.draft }}</div>
          <div class="submissions__status-label">Drafts</div>
        </div>

        <div
          class="submissions__status-card submissions__status-card--submitted"
          :class="{ 'submissions__status-card--active': statusFilter === 'submitted' }"
          @click="statusFilter = 'submitted'; load()"
        >
          <div class="submissions__status-icon">{{ statusIcons.submitted }}</div>
          <div class="submissions__status-count">{{ statusCounts.submitted }}</div>
          <div class="submissions__status-label">Submitted</div>
        </div>

        <div
          class="submissions__status-card submissions__status-card--review"
          :class="{ 'submissions__status-card--active': statusFilter === 'under_review' }"
          @click="statusFilter = 'under_review'; load()"
        >
          <div class="submissions__status-icon">{{ statusIcons.under_review }}</div>
          <div class="submissions__status-count">{{ statusCounts.under_review }}</div>
          <div class="submissions__status-label">Under Review</div>
        </div>

        <div
          class="submissions__status-card submissions__status-card--approved"
          :class="{ 'submissions__status-card--active': statusFilter === 'approved' }"
          @click="statusFilter = 'approved'; load()"
        >
          <div class="submissions__status-icon">{{ statusIcons.approved }}</div>
          <div class="submissions__status-count">{{ statusCounts.approved }}</div>
          <div class="submissions__status-label">Approved</div>
        </div>

        <div
          class="submissions__status-card submissions__status-card--rejected"
          :class="{ 'submissions__status-card--active': statusFilter === 'rejected' }"
          @click="statusFilter = 'rejected'; load()"
        >
          <div class="submissions__status-icon">{{ statusIcons.rejected }}</div>
          <div class="submissions__status-count">{{ statusCounts.rejected }}</div>
          <div class="submissions__status-label">Rejected</div>
        </div>
      </div>

      <div class="submissions__section">
        <div class="submissions__section-header">
          <h3 class="submissions__section-title">📋 {{ statusFilter ? 'Filtered Submissions' : 'All Submissions' }}</h3>
          <p class="submissions__section-subtitle">{{ submissions.length }} result{{ submissions.length !== 1 ? 's' : '' }}</p>
        </div>

        <DataTable :value="submissions" :loading="isLoading" class="submissions__table">
          <Column field="id" :header="t('submissions.submissionId')" class="submissions__table-col-id" />
          <Column :header="t('submissions.student')">
            <template #body="{ data }">
              <span class="submissions__student-name">{{ data.student?.full_name ?? '—' }}</span>
            </template>
          </Column>
          <Column :header="t('submissions.form')">
            <template #body="{ data }">
              <span class="submissions__form-name">{{ data.form_template?.name ?? '—' }}</span>
            </template>
          </Column>
          <Column :header="t('submissions.status')">
            <template #body="{ data }">
              <div class="submissions__status-badge">
                <span class="submissions__status-emoji">{{ statusIcons[data.status] }}</span>
                <Tag :severity="statusSeverity[data.status]" :value="t(`submissions.statuses.${data.status}`)" />
              </div>
            </template>
          </Column>
          <Column field="submitted_at" :header="t('submissions.submittedAt')" />
          <Column :header="t('common.table.actions')">
            <template #body="{ data }">
              <Button
                icon="pi pi-eye"
                severity="secondary"
                size="sm"
                @click="router.push({ name: 'assessment-submission-detail', params: { id: data.id } })"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.submissions {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.submissions__hero {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.submissions__hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.submissions__hero-content {
  position: relative;
  z-index: 1;
  max-width: 600px;
}

.submissions__hero-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 800;
  color: white;
}

.submissions__hero-subtitle {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

.submissions__hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.submissions__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.submissions__status-card {
  background: var(--surface-card);
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.submissions__status-card:hover {
  border-color: #94a3b8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submissions__status-card--active {
  border-color: #06b6d4;
  background: linear-gradient(135deg, #ecf4f8 0%, #e0f2fe 100%);
}

.submissions__status-card--draft {
  border-left: 4px solid #64748b;
}

.submissions__status-card--submitted {
  border-left: 4px solid #3b82f6;
}

.submissions__status-card--review {
  border-left: 4px solid #f59e0b;
}

.submissions__status-card--approved {
  border-left: 4px solid #10b981;
}

.submissions__status-card--rejected {
  border-left: 4px solid #ef4444;
}

.submissions__status-icon {
  font-size: 2rem;
}

.submissions__status-count {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
}

.submissions__status-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.submissions__section {
  margin-top: 1rem;
}

.submissions__section-header {
  margin-bottom: 1.5rem;
}

.submissions__section-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
}

.submissions__section-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

.submissions__table {
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  overflow: hidden;
}

.submissions__table-col-id {
  max-width: 100px;
}

.submissions__student-name {
  font-weight: 500;
  color: #0f172a;
}

.submissions__form-name {
  color: #475569;
}

.submissions__status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.submissions__status-emoji {
  font-size: 1.25rem;
}

@media (max-width: 1024px) {
  .submissions__row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .submissions__hero {
    padding: 2rem;
  }

  .submissions__hero-title {
    font-size: 1.5rem;
  }

  .submissions__hero-actions {
    flex-direction: column;
  }

  .submissions__row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .submissions__row {
    grid-template-columns: 1fr;
  }
}
</style>
