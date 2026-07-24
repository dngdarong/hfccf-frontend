<script setup>
import { onMounted, ref, computed } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import { fetchAssessmentForms } from '@/modules/preschool/services/api/preschoolAssessmentApi'

defineOptions({ name: 'FormTrackerPage' })

// Legacy launcher retained for compatibility while Preschool assessment forms
// consolidate around the canonical builder and report routes.
const router = useRouter()
const { t } = useLanguage()
const formBuilderRouteName = 'dashboard-preschool-admin-forms-build'

const formStats = ref({
  totalForms: 0,
  activeSubmissions: 0,
  pendingReview: 0,
  completedThisMonth: 0,
})
const recentForms = ref([])
const isLoading = ref(false)

async function load() {
  isLoading.value = true
  try {
    const response = await fetchAssessmentForms({ module: 'preschool', perPage: 8 })
    const items = response.items || []
    formStats.value = {
      totalForms: response.pagination?.total ?? items.length,
      activeSubmissions: items.filter(form => form.status === 'published').length,
      pendingReview: items.filter(form => form.status === 'draft').length,
      completedThisMonth: items.filter(form => form.status === 'archived').length,
    }
    recentForms.value = items.slice(0, 5).map(form => ({
      id: form.id,
      name: form.name,
      description: form.description || 'Preschool assessment template',
      versionNotes: form.versionNotes || form.publishNotes || '',
      status: form.status,
      templateId: form.id,
    }))
  } finally {
    isLoading.value = false
  }
}

const workflowSteps = computed(() => [
  {
    id: 'create',
    title: 'Create Form',
    description: 'Design and build new assessment forms',
    icon: '✏️',
    color: '#10b981',
    action: () => router.push({ name: formBuilderRouteName }),
    badge: null,
  },
  {
    id: 'configure',
    title: 'Configure',
    description: 'Set up scoring and print layouts',
    icon: '⚙️',
    color: '#06b6d4',
    action: () => router.push({ name: formBuilderRouteName }),
    badge: null,
  },
  {
    id: 'manage',
    title: 'Manage Forms',
    description: 'Organize your form library',
    icon: '📋',
    color: '#f59e0b',
    action: () => router.push({ name: 'dashboard-preschool-admin-forms-manage' }),
    badge: null,
  },
  {
    id: 'review',
    title: 'Review & Analyze',
    description: 'Track submissions and performance',
    icon: '📊',
    color: '#8b5cf6',
    action: () => router.push({ name: 'dashboard-preschool-admin-forms-review' }),
    badge: formStats.value.pendingReview,
  },
])

const recentFormCount = computed(() => recentForms.value.length)

onMounted(load)
</script>

<template>
  <MainLayout>
    <div class="forms-tracker">
      <HeaderSection :title="t('preschoolScaffold.formManagement.title', 'Form Management')" :subtitle="t('preschoolScaffold.formManagement.subtitle', 'Create, organize, review, and manage Preschool forms.')">
        <template #actions>
          <Button
            label="New Form"
            icon="pi pi-plus"
            @click="router.push({ name: formBuilderRouteName })"
          />
        </template>
      </HeaderSection>

    <div class="forms-tracker__hero">
        <div class="forms-tracker__hero-content">
          <h2 class="forms-tracker__hero-title">📝 Forms Tracker</h2>
          <p class="forms-tracker__hero-subtitle">
            Create, manage, and track assessment forms with complete workflow control
          </p>
          <div class="forms-tracker__hero-actions">
            <Button
              label="New Form"
              icon="pi pi-plus"
              @click="router.push({ name: formBuilderRouteName })"
            />
            <Button
              label="Manage Forms"
              icon="pi pi-folder-open"
              severity="secondary"
              @click="router.push({ name: 'dashboard-preschool-admin-forms-manage' })"
            />
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="forms-tracker__loading">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
      </div>

      <template v-else>
        <div class="forms-tracker__row">
          <div class="forms-tracker__stat-card">
            <div class="forms-tracker__stat-icon">📋</div>
            <div class="forms-tracker__stat-content">
              <div class="forms-tracker__stat-value">{{ formStats.totalForms }}</div>
              <div class="forms-tracker__stat-label">Total Forms</div>
            </div>
          </div>

          <div class="forms-tracker__stat-card">
            <div class="forms-tracker__stat-icon">📥</div>
            <div class="forms-tracker__stat-content">
              <div class="forms-tracker__stat-value">{{ formStats.activeSubmissions }}</div>
              <div class="forms-tracker__stat-label">Active Submissions</div>
            </div>
          </div>

          <div class="forms-tracker__stat-card">
            <div class="forms-tracker__stat-icon">⏳</div>
            <div class="forms-tracker__stat-content">
              <div class="forms-tracker__stat-value">{{ formStats.pendingReview }}</div>
              <div class="forms-tracker__stat-label">Pending Review</div>
            </div>
          </div>

          <div class="forms-tracker__stat-card">
            <div class="forms-tracker__stat-icon">✅</div>
            <div class="forms-tracker__stat-content">
              <div class="forms-tracker__stat-value">{{ formStats.completedThisMonth }}</div>
              <div class="forms-tracker__stat-label">Completed This Month</div>
            </div>
          </div>
        </div>

        <div class="forms-tracker__row forms-tracker__row--full">
          <h2 class="forms-tracker__section-title">🔄 Form Lifecycle Steps</h2>
          <div class="forms-tracker__workflow-grid">
            <div
              v-for="step in workflowSteps"
              :key="step.id"
              class="forms-tracker__workflow-card"
              @click="step.action"
            >
              <div class="forms-tracker__workflow-header">
                <div class="forms-tracker__workflow-icon">{{ step.icon }}</div>
                <div v-if="step.badge !== null" class="forms-tracker__workflow-badge">{{ step.badge }}</div>
              </div>
              <div class="forms-tracker__workflow-content">
                <h3 class="forms-tracker__workflow-title">{{ step.title }}</h3>
                <p class="forms-tracker__workflow-desc">{{ step.description }}</p>
              </div>
              <div class="forms-tracker__workflow-arrow">→</div>
            </div>
          </div>
        </div>

        <div class="forms-tracker__row forms-tracker__row--full">
          <h2 class="forms-tracker__section-title">📌 Recent Forms</h2>
          <div class="forms-tracker__card">
            <div v-if="recentFormCount === 0" class="forms-tracker__empty">
              No forms yet. Create your first form to get started.
            </div>
            <div v-else class="forms-tracker__forms-list">
              <div
                v-for="(form, idx) in recentForms"
                :key="idx"
                class="forms-tracker__form-item"
                @click="router.push({ name: formBuilderRouteName, query: { templateId: form.templateId } })"
              >
                <div class="forms-tracker__form-info">
                  <div class="forms-tracker__form-name">{{ form.name }}</div>
                  <div class="forms-tracker__form-desc">{{ form.description }}</div>
                  <div v-if="form.versionNotes" class="forms-tracker__form-note">
                    {{ form.versionNotes }}
                  </div>
                </div>
                <div class="forms-tracker__form-status">
                  <span class="forms-tracker__status-badge" :data-status="form.status">
                    {{ form.status === 'active' ? '✓ Active' : '⏳ Review' }}
                  </span>
                </div>
              </div>
              <div class="forms-tracker__forms-footer">
                <Button
                  :label="t('assessmentFormBuilder.versionHistory.viewVersion', 'View version')"
                  icon="pi pi-history"
                  text
                  severity="secondary"
                  @click="router.push({ name: formBuilderRouteName, query: { templateId: recentForms[0]?.templateId } })"
                />
                <Button
                  label="View All Forms"
                  icon="pi pi-arrow-right"
                  text
                  severity="info"
                  @click="router.push({ name: 'dashboard-preschool-admin-forms-manage' })"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="forms-tracker__row forms-tracker__row--full">
          <h2 class="forms-tracker__section-title">🚀 Quick Start Guide</h2>
          <div class="forms-tracker__guide-grid">
            <div class="forms-tracker__guide-card" style="--guide-bg: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)">
              <div class="forms-tracker__guide-number">1</div>
              <div class="forms-tracker__guide-content">
                <h3 class="forms-tracker__guide-title">✏️ Create Form</h3>
                <p class="forms-tracker__guide-desc">Design your form with custom fields and sections</p>
              </div>
            </div>

            <div class="forms-tracker__guide-card" style="--guide-bg: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)">
              <div class="forms-tracker__guide-number">2</div>
              <div class="forms-tracker__guide-content">
                <h3 class="forms-tracker__guide-title">⚙️ Configure</h3>
                <p class="forms-tracker__guide-desc">Set up scoring rules and printing layouts</p>
              </div>
            </div>

            <div class="forms-tracker__guide-card" style="--guide-bg: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)">
              <div class="forms-tracker__guide-number">3</div>
              <div class="forms-tracker__guide-content">
                <h3 class="forms-tracker__guide-title">📋 Manage</h3>
                <p class="forms-tracker__guide-desc">Organize and categorize your form library</p>
              </div>
            </div>

            <div class="forms-tracker__guide-card" style="--guide-bg: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)">
              <div class="forms-tracker__guide-number">4</div>
              <div class="forms-tracker__guide-content">
                <h3 class="forms-tracker__guide-title">📊 Review</h3>
                <p class="forms-tracker__guide-desc">Analyze submissions and track performance</p>
              </div>
            </div>
          </div>
        </div>

        <div class="forms-tracker__row forms-tracker__row--full">
          <h2 class="forms-tracker__section-title">🎯 Related Features</h2>
          <div class="forms-tracker__related-grid">
            <div class="forms-tracker__related-card" @click="router.push({ name: 'dashboard-preschool-admin-forms-review' })">
              <div class="forms-tracker__related-icon">📥</div>
              <div class="forms-tracker__related-info">
                <div class="forms-tracker__related-title">Form Review</div>
                <div class="forms-tracker__related-desc">Manage form submissions and responses</div>
              </div>
              <div class="forms-tracker__related-arrow">→</div>
            </div>

            <div class="forms-tracker__related-card" @click="router.push({ name: formBuilderRouteName })">
              <div class="forms-tracker__related-icon">✨</div>
              <div class="forms-tracker__related-info">
                <div class="forms-tracker__related-title">Form Builder</div>
                <div class="forms-tracker__related-desc">Create and design new forms</div>
              </div>
              <div class="forms-tracker__related-arrow">→</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>

<style scoped>
.forms-tracker {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.forms-tracker__hero {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.forms-tracker__hero::before {
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

.forms-tracker__hero-content {
  position: relative;
  z-index: 1;
  max-width: 600px;
}

.forms-tracker__hero-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 800;
  color: white;
}

.forms-tracker__hero-subtitle {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

.forms-tracker__hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.forms-tracker__loading {
  display: flex;
  justify-content: center;
  padding: 4rem;
}

.forms-tracker__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.forms-tracker__row--full {
  grid-template-columns: 1fr;
}

.forms-tracker__stat-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.2s ease;
}

.forms-tracker__stat-card:hover {
  border-color: #86efac;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.forms-tracker__stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.forms-tracker__stat-content {
  flex-grow: 1;
}

.forms-tracker__stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #059669;
  margin: 0;
}

.forms-tracker__stat-label {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
  margin: 0.25rem 0 0 0;
  font-weight: 500;
}

.forms-tracker__section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.forms-tracker__workflow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.forms-tracker__workflow-card {
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

.forms-tracker__workflow-card:hover {
  border-color: #86efac;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
  transform: translateY(-2px);
}

.forms-tracker__workflow-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.forms-tracker__workflow-icon {
  font-size: 2.5rem;
}

.forms-tracker__workflow-badge {
  background: #10b981;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.forms-tracker__workflow-content {
  flex-grow: 1;
}

.forms-tracker__workflow-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.forms-tracker__workflow-desc {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}

.forms-tracker__workflow-arrow {
  font-size: 1.25rem;
  color: #10b981;
  transition: all 0.2s ease;
  align-self: flex-end;
}

.forms-tracker__workflow-card:hover .forms-tracker__workflow-arrow {
  color: #059669;
  transform: translateX(4px);
}

.forms-tracker__card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  overflow: hidden;
}

.forms-tracker__forms-list {
  display: flex;
  flex-direction: column;
}

.forms-tracker__form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--surface-border);
  transition: all 0.2s ease;
}

.forms-tracker__form-item:last-child {
  border-bottom: none;
}

.forms-tracker__form-item:hover {
  background: #f8fafc;
}

.forms-tracker__form-info {
  flex-grow: 1;
}

.forms-tracker__form-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}

.forms-tracker__form-desc {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.forms-tracker__form-note {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: #475569;
  font-style: italic;
}

.forms-tracker__form-status {
  flex-shrink: 0;
}

.forms-tracker__status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.forms-tracker__status-badge[data-status="active"] {
  background: #10b981;
}

.forms-tracker__status-badge[data-status="review"] {
  background: #f59e0b;
}

.forms-tracker__forms-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--surface-border);
  text-align: center;
}

.forms-tracker__empty {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  text-align: center;
  padding: 2rem;
}

.forms-tracker__guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.forms-tracker__guide-card {
  background: var(--guide-bg);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
}

.forms-tracker__guide-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  color: #0f172a;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.forms-tracker__guide-content {
  flex-grow: 1;
}

.forms-tracker__guide-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.forms-tracker__guide-desc {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.4;
}

.forms-tracker__related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.forms-tracker__related-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.forms-tracker__related-card:hover {
  border-color: #7dd3fc;
  background: linear-gradient(135deg, #e0f2fe 0%, #cffafe 100%);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.15);
  transform: translateX(4px);
}

.forms-tracker__related-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.forms-tracker__related-info {
  flex-grow: 1;
}

.forms-tracker__related-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.forms-tracker__related-desc {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.forms-tracker__related-arrow {
  font-size: 1.25rem;
  color: #06b6d4;
  transition: all 0.2s ease;
}

.forms-tracker__related-card:hover .forms-tracker__related-arrow {
  color: #0891b2;
  transform: translateX(4px);
}

@media (max-width: 1024px) {
  .forms-tracker__workflow-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .forms-tracker__guide-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .forms-tracker__hero {
    padding: 2rem;
  }

  .forms-tracker__hero-title {
    font-size: 1.5rem;
  }

  .forms-tracker__hero-actions {
    flex-direction: column;
  }

  .forms-tracker__row {
    grid-template-columns: repeat(2, 1fr);
  }

  .forms-tracker__workflow-grid {
    grid-template-columns: 1fr;
  }

  .forms-tracker__guide-grid {
    grid-template-columns: 1fr;
  }

  .forms-tracker__related-grid {
    grid-template-columns: 1fr;
  }

  .forms-tracker__stat-icon {
    font-size: 2rem;
  }

  .forms-tracker__stat-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .forms-tracker__row {
    grid-template-columns: 1fr;
  }
}
</style>
