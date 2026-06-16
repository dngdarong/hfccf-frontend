<script setup>
import { onMounted, ref, computed } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useRouter } from 'vue-router'
import { assessmentReportApi } from '../services/assessmentReportApi'

defineOptions({ name: 'AssessmentReportsPage' })

const router = useRouter()
const { t } = useLanguage()

const dashboard = ref(null)
const riskDistribution = ref([])
const submissionTrend = ref([])
const isLoading = ref(false)

async function load() {
  isLoading.value = true
  try {
    const [dRes, rRes, tRes] = await Promise.all([
      assessmentReportApi.dashboard(),
      assessmentReportApi.riskDistribution(),
      assessmentReportApi.submissionTrend(),
    ])
    dashboard.value = dRes.data.data
    riskDistribution.value = rRes.data.data
    submissionTrend.value = tRes.data.data
  } finally {
    isLoading.value = false
  }
}

const maxRiskCount = computed(() =>
  riskDistribution.value.length > 0
    ? Math.max(...riskDistribution.value.map(r => r.count || 0))
    : 1,
)

onMounted(load)
</script>

<template>
  <MainLayout>
    <div class="reports">
      <HeaderSection :title="t('assessmentReports.title')">
        <template #actions>
          <Button :label="t('assessmentReports.exportReport')" icon="pi pi-download" severity="secondary" />
        </template>
      </HeaderSection>

      <div class="reports__hero">
        <div class="reports__hero-content">
          <h2 class="reports__hero-title">📊 Assessment Reports</h2>
          <p class="reports__hero-subtitle">
            Analyze performance metrics, risk distribution, and submission trends
          </p>
          <div class="reports__hero-actions">
            <Button
              :label="t('assessmentReports.exportReport')"
              icon="pi pi-download"
              @click="() => {}"
            />
            <Button
              label="View Dashboard"
              icon="pi pi-chart-line"
              severity="secondary"
              @click="router.push({ name: 'assessment-dashboard' })"
            />
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="reports__loading">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
      </div>

      <template v-else>
        <div v-if="dashboard" class="reports__row">
          <div class="reports__stat-card">
            <div class="reports__stat-icon">📋</div>
            <div class="reports__stat-content">
              <div class="reports__stat-value">{{ dashboard.stats?.total_assessments ?? 0 }}</div>
              <div class="reports__stat-label">Total Assessments</div>
            </div>
          </div>

          <div class="reports__stat-card">
            <div class="reports__stat-icon">📈</div>
            <div class="reports__stat-content">
              <div class="reports__stat-value">{{ dashboard.stats?.average_score ?? '—' }}</div>
              <div class="reports__stat-label">Average Score</div>
            </div>
          </div>

          <div class="reports__stat-card">
            <div class="reports__stat-icon">✅</div>
            <div class="reports__stat-content">
              <div class="reports__stat-value">{{ dashboard.stats?.completion_rate ?? '—' }}%</div>
              <div class="reports__stat-label">Completion Rate</div>
            </div>
          </div>
        </div>

        <div class="reports__row reports__row--two-col">
          <div class="reports__card">
            <div class="reports__card-header">
              <h3 class="reports__card-title">⚠️ Risk Distribution</h3>
              <span class="reports__card-subtitle">Student performance levels</span>
            </div>
            <div class="reports__card-body">
              <div v-if="riskDistribution.length === 0" class="reports__empty">
                No risk data available yet.
              </div>
              <div v-else class="reports__risk-chart">
                <div
                  v-for="risk in riskDistribution"
                  :key="risk.level"
                  class="reports__risk-item"
                >
                  <div class="reports__risk-label">{{ risk.level_name }}</div>
                  <div class="reports__risk-visual">
                    <div
                      class="reports__risk-fill"
                      :style="{
                        width: (risk.count / maxRiskCount) * 100 + '%',
                        backgroundColor: risk.color
                      }"
                    />
                  </div>
                  <div class="reports__risk-value">{{ risk.count }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="reports__card">
            <div class="reports__card-header">
              <h3 class="reports__card-title">📈 Submission Trends</h3>
              <span class="reports__card-subtitle">Historical patterns</span>
            </div>
            <div class="reports__card-body">
              <div v-if="submissionTrend.length === 0" class="reports__empty">
                No trend data available yet.
              </div>
              <div v-else class="reports__trend-list">
                <div
                  v-for="(trend, idx) in submissionTrend.slice(0, 6)"
                  :key="idx"
                  class="reports__trend-item"
                >
                  <div class="reports__trend-date">{{ trend.date || `Period ${idx + 1}` }}</div>
                  <div class="reports__trend-count">{{ trend.count }} submissions</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="reports__row reports__row--full">
          <h2 class="reports__section-title">🎯 Quick Actions</h2>
          <div class="reports__action-grid">
            <div class="reports__action-item" @click="router.push({ name: 'assessment-dashboard' })">
              <div class="reports__action-icon">📊</div>
              <div class="reports__action-info">
                <div class="reports__action-title">View Dashboard</div>
                <div class="reports__action-desc">See overview and recent submissions</div>
              </div>
              <div class="reports__action-arrow">→</div>
            </div>

            <div class="reports__action-item" @click="router.push({ name: 'assessment-submission-list' })">
              <div class="reports__action-icon">📥</div>
              <div class="reports__action-info">
                <div class="reports__action-title">View Submissions</div>
                <div class="reports__action-desc">Track and manage all submissions</div>
              </div>
              <div class="reports__action-arrow">→</div>
            </div>

            <div class="reports__action-item" @click="router.push({ name: 'assessment-form-list' })">
              <div class="reports__action-icon">📋</div>
              <div class="reports__action-info">
                <div class="reports__action-title">Manage Forms</div>
                <div class="reports__action-desc">Create and edit assessment forms</div>
              </div>
              <div class="reports__action-arrow">→</div>
            </div>

            <div class="reports__action-item" @click="router.push({ name: 'assessment-wizard' })">
              <div class="reports__action-icon">✨</div>
              <div class="reports__action-info">
                <div class="reports__action-title">New Assessment</div>
                <div class="reports__action-desc">Begin assessment wizard</div>
              </div>
              <div class="reports__action-arrow">→</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>

<style scoped>
.reports {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.reports__hero {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.reports__hero::before {
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

.reports__hero-content {
  position: relative;
  z-index: 1;
  max-width: 600px;
}

.reports__hero-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 800;
  color: white;
}

.reports__hero-subtitle {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

.reports__hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.reports__loading {
  display: flex;
  justify-content: center;
  padding: 4rem;
}

.reports__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.reports__row--two-col {
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}

.reports__row--full {
  grid-template-columns: 1fr;
}

.reports__stat-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.2s ease;
}

.reports__stat-card:hover {
  border-color: #d8b4fe;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
}

.reports__stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.reports__stat-content {
  flex-grow: 1;
}

.reports__stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #7c3aed;
  margin: 0;
}

.reports__stat-label {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
  margin: 0.25rem 0 0 0;
  font-weight: 500;
}

.reports__card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.reports__card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.reports__card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.reports__card-subtitle {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.reports__card-body {
  padding: 1.5rem;
  flex-grow: 1;
}

.reports__empty {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  text-align: center;
  padding: 2rem 0;
}

.reports__risk-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reports__risk-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.reports__risk-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
  min-width: 80px;
}

.reports__risk-visual {
  flex-grow: 1;
  height: 24px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.reports__risk-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.reports__risk-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
  min-width: 40px;
  text-align: right;
}

.reports__trend-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reports__trend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.reports__trend-item:hover {
  background: #eef2ff;
}

.reports__trend-date {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
}

.reports__trend-count {
  font-size: 0.85rem;
  color: #64748b;
}

.reports__section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.reports__action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.reports__action-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%);
  border: 1px solid #e9d5ff;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reports__action-item:hover {
  border-color: #d8b4fe;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  transform: translateX(4px);
}

.reports__action-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.reports__action-info {
  flex-grow: 1;
}

.reports__action-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.reports__action-desc {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  margin: 0;
}

.reports__action-arrow {
  font-size: 1.25rem;
  color: #a78bfa;
  transition: all 0.2s ease;
}

.reports__action-item:hover .reports__action-arrow {
  color: #7c3aed;
  transform: translateX(4px);
}

@media (max-width: 1024px) {
  .reports__row--two-col {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .reports__hero {
    padding: 2rem;
  }

  .reports__hero-title {
    font-size: 1.5rem;
  }

  .reports__hero-actions {
    flex-direction: column;
  }

  .reports__row {
    grid-template-columns: repeat(2, 1fr);
  }

  .reports__action-grid {
    grid-template-columns: 1fr;
  }

  .reports__stat-icon {
    font-size: 2rem;
  }

  .reports__stat-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .reports__row {
    grid-template-columns: 1fr;
  }
}
</style>
