<script setup>
import { onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import { assessmentReportApi } from '../services/assessmentReportApi'

defineOptions({ name: 'AssessmentDashboardPage' })

const router = useRouter()
const { t } = useLanguage()

const stats = ref({ totalForms: 0, activeSubmissions: 0, pendingReview: 0, completedThisMonth: 0 })
const recentSubmissions = ref([])
const riskDistribution = ref([])
const isLoading = ref(false)

async function load() {
  isLoading.value = true
  try {
    const res = await assessmentReportApi.dashboard()
    const d = res.data.data
    stats.value = d.stats ?? stats.value
    recentSubmissions.value = d.recent_submissions ?? []
    riskDistribution.value = d.risk_distribution ?? []
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <MainLayout>
    <div class="dashboard">
      <HeaderSection :title="t('assessmentDashboard.title')" :subtitle="t('assessmentDashboard.subtitle')">
        <template #actions>
          <Button
            :label="t('assessmentDashboard.quickActions.newAssessment')"
            icon="pi pi-plus"
            @click="router.push({ name: 'assessment-wizard' })"
          />
        </template>
      </HeaderSection>

      <div class="dashboard__hero">
        <div class="dashboard__hero-content">
          <h2 class="dashboard__hero-title">Assessment Hub</h2>
          <p class="dashboard__hero-subtitle">
            Create, collect, and analyze assessments to drive student success
          </p>
          <div class="dashboard__hero-actions">
            <Button
              :label="t('assessmentDashboard.quickActions.newAssessment')"
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

      <div class="dashboard__row">
        <div class="dashboard__stat">
          <div class="dashboard__stat-background">📋</div>
          <div class="dashboard__stat-content">
            <div class="dashboard__stat-value">{{ stats.totalForms }}</div>
            <div class="dashboard__stat-label">Forms Available</div>
          </div>
        </div>

        <div class="dashboard__stat">
          <div class="dashboard__stat-background">📥</div>
          <div class="dashboard__stat-content">
            <div class="dashboard__stat-value">{{ stats.activeSubmissions }}</div>
            <div class="dashboard__stat-label">Active Submissions</div>
          </div>
        </div>

        <div class="dashboard__stat dashboard__stat--warning">
          <div class="dashboard__stat-background">⏳</div>
          <div class="dashboard__stat-content">
            <div class="dashboard__stat-value">{{ stats.pendingReview }}</div>
            <div class="dashboard__stat-label">Pending Review</div>
          </div>
        </div>

        <div class="dashboard__stat dashboard__stat--success">
          <div class="dashboard__stat-background">✅</div>
          <div class="dashboard__stat-content">
            <div class="dashboard__stat-value">{{ stats.completedThisMonth }}</div>
            <div class="dashboard__stat-label">Completed This Month</div>
          </div>
        </div>
      </div>

      <div class="dashboard__row dashboard__row--two-col">
        <div class="dashboard__card">
          <div class="dashboard__card-header">
            <h3 class="dashboard__card-title">📈 Recent Submissions</h3>
            <Button
              :label="t('assessmentDashboard.quickActions.viewReports')"
              icon="pi pi-arrow-right"
              text
              severity="info"
              size="sm"
              @click="router.push({ name: 'assessment-submission-list' })"
            />
          </div>
          <div class="dashboard__card-body">
            <div v-if="recentSubmissions.length === 0" class="dashboard__empty">
              No submissions yet. Start by creating a new assessment.
            </div>
            <div v-else class="dashboard__list">
              <div
                v-for="(submission, idx) in recentSubmissions.slice(0, 4)"
                :key="idx"
                class="dashboard__list-item"
              >
                <div class="dashboard__list-content">
                  <div class="dashboard__list-title">
                    {{ submission.student?.full_name || submission.form_name || 'Unknown' }}
                  </div>
                  <div class="dashboard__list-meta">
                    {{ submission.submitted_at || 'No date' }}
                  </div>
                </div>
                <div class="dashboard__list-badge">📋</div>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard__card">
          <div class="dashboard__card-header">
            <h3 class="dashboard__card-title">⚠️ Risk Analysis</h3>
            <Button
              :label="t('assessmentDashboard.quickActions.viewReports')"
              icon="pi pi-arrow-right"
              text
              severity="info"
              size="sm"
              @click="router.push({ name: 'assessment-reports' })"
            />
          </div>
          <div class="dashboard__card-body">
            <div v-if="riskDistribution.length === 0" class="dashboard__empty">
              No risk data available yet.
            </div>
            <div v-else class="dashboard__risk-chart">
              <div
                v-for="risk in riskDistribution.slice(0, 4)"
                :key="risk.level"
                class="dashboard__risk-bar"
              >
                <div class="dashboard__risk-label">{{ risk.level_name }}</div>
                <div class="dashboard__risk-visual">
                  <div
                    class="dashboard__risk-fill"
                    :style="{
                      width: (risk.count / Math.max(...riskDistribution.map(r => r.count), 1)) * 100 + '%',
                      backgroundColor: risk.color
                    }"
                  />
                </div>
                <div class="dashboard__risk-value">{{ risk.count }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard__row dashboard__row--full">
        <h2 class="dashboard__section-title">🎯 Quick Navigation</h2>
        <div class="dashboard__nav-grid">
          <div
            class="dashboard__nav-item"
            @click="router.push({ name: 'assessment-form-list' })"
          >
            <div class="dashboard__nav-icon">📋</div>
            <div class="dashboard__nav-info">
              <div class="dashboard__nav-title">Manage Forms</div>
              <div class="dashboard__nav-desc">Create and edit assessment forms</div>
            </div>
            <div class="dashboard__nav-arrow">→</div>
          </div>

          <div
            class="dashboard__nav-item"
            @click="router.push({ name: 'assessment-submission-list' })"
          >
            <div class="dashboard__nav-icon">📥</div>
            <div class="dashboard__nav-info">
              <div class="dashboard__nav-title">View Submissions</div>
              <div class="dashboard__nav-desc">Review and track responses</div>
            </div>
            <div class="dashboard__nav-arrow">→</div>
          </div>

          <div
            class="dashboard__nav-item"
            @click="router.push({ name: 'assessment-reports' })"
          >
            <div class="dashboard__nav-icon">📊</div>
            <div class="dashboard__nav-info">
              <div class="dashboard__nav-title">View Reports</div>
              <div class="dashboard__nav-desc">Analyze data and insights</div>
            </div>
            <div class="dashboard__nav-arrow">→</div>
          </div>

          <div
            class="dashboard__nav-item"
            @click="router.push({ name: 'assessment-wizard' })"
          >
            <div class="dashboard__nav-icon">✨</div>
            <div class="dashboard__nav-info">
              <div class="dashboard__nav-title">New Assessment</div>
              <div class="dashboard__nav-desc">Begin assessment wizard</div>
            </div>
            <div class="dashboard__nav-arrow">→</div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard__hero {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.dashboard__hero::before {
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

.dashboard__hero-content {
  position: relative;
  z-index: 1;
  max-width: 600px;
}

.dashboard__hero-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 800;
  color: white;
}

.dashboard__hero-subtitle {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

.dashboard__hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.dashboard__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.dashboard__row--two-col {
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}

.dashboard__row--full {
  grid-template-columns: 1fr;
}

.dashboard__stat {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.2s ease;
}

.dashboard__stat:hover {
  border-color: #bfdbfe;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.dashboard__stat-background {
  font-size: 3rem;
  opacity: 0.8;
  flex-shrink: 0;
}

.dashboard__stat-content {
  flex-grow: 1;
}

.dashboard__stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary-color);
  margin: 0;
}

.dashboard__stat-label {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
  margin: 0.25rem 0 0 0;
  font-weight: 500;
}

.dashboard__stat--warning {
  border-left: 4px solid #f59e0b;
}

.dashboard__stat--success {
  border-left: 4px solid #10b981;
}

.dashboard__card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dashboard__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.dashboard__card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.dashboard__card-body {
  padding: 1.5rem;
  flex-grow: 1;
}

.dashboard__empty {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  text-align: center;
  padding: 2rem 0;
}

.dashboard__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dashboard__list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.dashboard__list-item:hover {
  background: #eef2ff;
}

.dashboard__list-content {
  flex-grow: 1;
}

.dashboard__list-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.dashboard__list-meta {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  margin: 0.25rem 0 0 0;
}

.dashboard__list-badge {
  font-size: 1.25rem;
  margin-left: 0.75rem;
}

.dashboard__risk-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard__risk-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dashboard__risk-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
  min-width: 80px;
}

.dashboard__risk-visual {
  flex-grow: 1;
  height: 24px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.dashboard__risk-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.dashboard__risk-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
  min-width: 40px;
  text-align: right;
}

.dashboard__section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.dashboard__nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.dashboard__nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%);
  border: 1px solid #ddd6fe;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dashboard__nav-item:hover {
  border-color: #a78bfa;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  transform: translateX(4px);
}

.dashboard__nav-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.dashboard__nav-info {
  flex-grow: 1;
}

.dashboard__nav-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.dashboard__nav-desc {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  margin: 0;
}

.dashboard__nav-arrow {
  font-size: 1.25rem;
  color: #a78bfa;
  transition: all 0.2s ease;
}

.dashboard__nav-item:hover .dashboard__nav-arrow {
  color: #7c3aed;
  transform: translateX(4px);
}

@media (max-width: 1024px) {
  .dashboard__row--two-col {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard__hero {
    padding: 2rem;
  }

  .dashboard__hero-title {
    font-size: 1.5rem;
  }

  .dashboard__hero-actions {
    flex-direction: column;
  }

  .dashboard__row {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard__nav-grid {
    grid-template-columns: 1fr;
  }

  .dashboard__stat-background {
    font-size: 2rem;
  }

  .dashboard__stat-value {
    font-size: 1.5rem;
  }
}
</style>
