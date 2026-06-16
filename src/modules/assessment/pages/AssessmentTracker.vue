<script setup>
import { onMounted, ref, computed } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import { assessmentReportApi } from '../services/assessmentReportApi'
import { assessmentSubmissionApi } from '../services/assessmentSubmissionApi'

defineOptions({ name: 'AssessmentTrackerPage' })

const router = useRouter()
const { t } = useLanguage()

const stats = ref({
  totalForms: 0,
  activeSubmissions: 0,
  pendingReview: 0,
  completedThisMonth: 0,
})
const recentSubmissions = ref([])
const isLoading = ref(false)

async function load() {
  isLoading.value = true
  try {
    const [dashRes, subRes] = await Promise.all([
      assessmentReportApi.dashboard(),
      assessmentSubmissionApi.list({ per_page: 5 }),
    ])
    const dashData = dashRes.data.data
    stats.value = dashData.stats ?? stats.value
    recentSubmissions.value = (subRes.data.data || []).slice(0, 4)
  } finally {
    isLoading.value = false
  }
}

const workflowSteps = [
  {
    id: 'forms',
    title: 'Manage Forms',
    description: 'Create and edit assessment form templates',
    icon: '📋',
    action: () => router.push({ name: 'assessment-form-list' }),
    badge: stats.value.totalForms,
  },
  {
    id: 'submissions',
    title: 'Submissions',
    description: 'View and manage student submissions',
    icon: '📥',
    action: () => router.push({ name: 'assessment-submission-list' }),
    badge: stats.value.activeSubmissions,
  },
  {
    id: 'wizard',
    title: 'New Assessment',
    description: 'Create a new assessment for students',
    icon: '✨',
    action: () => router.push({ name: 'assessment-wizard' }),
    badge: null,
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    description: 'View performance metrics and trends',
    icon: '📊',
    action: () => router.push({ name: 'assessment-reports' }),
    badge: null,
  },
]

const recentSubmissionCount = computed(() => recentSubmissions.value.length)

onMounted(load)
</script>

<template>
  <MainLayout>
    <div class="tracker">
      <HeaderSection :title="t('assessmentDashboard.title')" :subtitle="t('assessmentDashboard.subtitle')">
        <template #actions>
          <Button
            label="New Assessment"
            icon="pi pi-plus"
            @click="router.push({ name: 'assessment-wizard' })"
          />
        </template>
      </HeaderSection>

      <div class="tracker__hero">
        <div class="tracker__hero-content">
          <h2 class="tracker__hero-title">🎯 Assessment Tracker</h2>
          <p class="tracker__hero-subtitle">
            Manage assessment forms, submissions, and performance tracking in one place
          </p>
          <div class="tracker__hero-actions">
            <Button
              label="New Assessment"
              icon="pi pi-plus"
              @click="router.push({ name: 'assessment-wizard' })"
            />
            <Button
              label="View Reports"
              icon="pi pi-chart-bar"
              severity="secondary"
              @click="router.push({ name: 'assessment-reports' })"
            />
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="tracker__loading">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
      </div>

      <template v-else>
        <div class="tracker__row">
          <div class="tracker__stat-card">
            <div class="tracker__stat-icon">📋</div>
            <div class="tracker__stat-content">
              <div class="tracker__stat-value">{{ stats.totalForms }}</div>
              <div class="tracker__stat-label">Forms Available</div>
            </div>
          </div>

          <div class="tracker__stat-card">
            <div class="tracker__stat-icon">📥</div>
            <div class="tracker__stat-content">
              <div class="tracker__stat-value">{{ stats.activeSubmissions }}</div>
              <div class="tracker__stat-label">Active Submissions</div>
            </div>
          </div>

          <div class="tracker__stat-card">
            <div class="tracker__stat-icon">⏳</div>
            <div class="tracker__stat-content">
              <div class="tracker__stat-value">{{ stats.pendingReview }}</div>
              <div class="tracker__stat-label">Pending Review</div>
            </div>
          </div>

          <div class="tracker__stat-card">
            <div class="tracker__stat-icon">✅</div>
            <div class="tracker__stat-content">
              <div class="tracker__stat-value">{{ stats.completedThisMonth }}</div>
              <div class="tracker__stat-label">Completed This Month</div>
            </div>
          </div>
        </div>

        <div class="tracker__row tracker__row--full">
          <h2 class="tracker__section-title">📚 Workflow Steps</h2>
          <div class="tracker__workflow-grid">
            <div
              v-for="step in workflowSteps"
              :key="step.id"
              class="tracker__workflow-card"
              @click="step.action"
            >
              <div class="tracker__workflow-header">
                <div class="tracker__workflow-icon">{{ step.icon }}</div>
                <div v-if="step.badge !== null" class="tracker__workflow-badge">{{ step.badge }}</div>
              </div>
              <div class="tracker__workflow-content">
                <h3 class="tracker__workflow-title">{{ step.title }}</h3>
                <p class="tracker__workflow-desc">{{ step.description }}</p>
              </div>
              <div class="tracker__workflow-arrow">→</div>
            </div>
          </div>
        </div>

        <div class="tracker__row tracker__row--full">
          <h2 class="tracker__section-title">📌 Recent Submissions</h2>
          <div class="tracker__card">
            <div v-if="recentSubmissionCount === 0" class="tracker__empty">
              No submissions yet. Start by creating a new assessment.
            </div>
            <div v-else class="tracker__submissions-list">
              <div
                v-for="(submission, idx) in recentSubmissions"
                :key="idx"
                class="tracker__submission-item"
              >
                <div class="tracker__submission-info">
                  <div class="tracker__submission-student">
                    {{ submission.student?.full_name || submission.form_name || 'Unknown' }}
                  </div>
                  <div class="tracker__submission-date">
                    {{ submission.submitted_at || 'No date' }}
                  </div>
                </div>
                <div class="tracker__submission-action">
                  <Button
                    icon="pi pi-eye"
                    severity="secondary"
                    size="sm"
                    text
                    @click.stop="router.push({ name: 'assessment-submission-detail', params: { id: submission.id } })"
                  />
                </div>
              </div>
              <div class="tracker__submissions-footer">
                <Button
                  label="View All Submissions"
                  icon="pi pi-arrow-right"
                  text
                  severity="info"
                  @click="router.push({ name: 'assessment-submission-list' })"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="tracker__row tracker__row--full">
          <h2 class="tracker__section-title">🚀 Quick Start Guide</h2>
          <div class="tracker__guide-grid">
            <div class="tracker__guide-card">
              <div class="tracker__guide-number">1</div>
              <div class="tracker__guide-content">
                <h3 class="tracker__guide-title">Create Assessment Form</h3>
                <p class="tracker__guide-desc">Design your assessment form with custom questions</p>
              </div>
            </div>

            <div class="tracker__guide-card">
              <div class="tracker__guide-number">2</div>
              <div class="tracker__guide-content">
                <h3 class="tracker__guide-title">Configure Scoring</h3>
                <p class="tracker__guide-desc">Set up scoring rules and performance levels</p>
              </div>
            </div>

            <div class="tracker__guide-card">
              <div class="tracker__guide-number">3</div>
              <div class="tracker__guide-content">
                <h3 class="tracker__guide-title">Send to Students</h3>
                <p class="tracker__guide-desc">Start assessment wizard to assign to students</p>
              </div>
            </div>

            <div class="tracker__guide-card">
              <div class="tracker__guide-number">4</div>
              <div class="tracker__guide-content">
                <h3 class="tracker__guide-title">Review & Analyze</h3>
                <p class="tracker__guide-desc">Track submissions and view performance analytics</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>

<style scoped>
.tracker {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tracker__hero {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.tracker__hero::before {
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

.tracker__hero-content {
  position: relative;
  z-index: 1;
  max-width: 600px;
}

.tracker__hero-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 800;
  color: white;
}

.tracker__hero-subtitle {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

.tracker__hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.tracker__loading {
  display: flex;
  justify-content: center;
  padding: 4rem;
}

.tracker__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.tracker__row--full {
  grid-template-columns: 1fr;
}

.tracker__stat-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.2s ease;
}

.tracker__stat-card:hover {
  border-color: #fed7aa;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
}

.tracker__stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.tracker__stat-content {
  flex-grow: 1;
}

.tracker__stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #d97706;
  margin: 0;
}

.tracker__stat-label {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
  margin: 0.25rem 0 0 0;
  font-weight: 500;
}

.tracker__section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.tracker__workflow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tracker__workflow-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tracker__workflow-card:hover {
  border-color: #fed7aa;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
  transform: translateY(-2px);
}

.tracker__workflow-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tracker__workflow-icon {
  font-size: 2.5rem;
}

.tracker__workflow-badge {
  background: #f59e0b;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.tracker__workflow-content {
  flex-grow: 1;
}

.tracker__workflow-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.tracker__workflow-desc {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}

.tracker__workflow-arrow {
  font-size: 1.25rem;
  color: #f59e0b;
  transition: all 0.2s ease;
  align-self: flex-end;
}

.tracker__workflow-card:hover .tracker__workflow-arrow {
  color: #d97706;
  transform: translateX(4px);
}

.tracker__card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  overflow: hidden;
}

.tracker__submissions-list {
  display: flex;
  flex-direction: column;
}

.tracker__submission-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--surface-border);
  transition: all 0.2s ease;
}

.tracker__submission-item:last-child {
  border-bottom: none;
}

.tracker__submission-item:hover {
  background: #f8fafc;
}

.tracker__submission-info {
  flex-grow: 1;
}

.tracker__submission-student {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}

.tracker__submission-date {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.tracker__submission-action {
  flex-shrink: 0;
}

.tracker__submissions-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--surface-border);
  text-align: center;
}

.tracker__empty {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  text-align: center;
  padding: 2rem;
}

.tracker__guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tracker__guide-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fed7aa;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
}

.tracker__guide-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f59e0b;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.tracker__guide-content {
  flex-grow: 1;
}

.tracker__guide-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.tracker__guide-desc {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.4;
}

@media (max-width: 1024px) {
  .tracker__workflow-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tracker__guide-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .tracker__hero {
    padding: 2rem;
  }

  .tracker__hero-title {
    font-size: 1.5rem;
  }

  .tracker__hero-actions {
    flex-direction: column;
  }

  .tracker__row {
    grid-template-columns: repeat(2, 1fr);
  }

  .tracker__workflow-grid {
    grid-template-columns: 1fr;
  }

  .tracker__guide-grid {
    grid-template-columns: 1fr;
  }

  .tracker__stat-icon {
    font-size: 2rem;
  }

  .tracker__stat-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .tracker__row {
    grid-template-columns: 1fr;
  }
}
</style>
