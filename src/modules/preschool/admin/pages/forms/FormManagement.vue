<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import FormManagementHero from '@/modules/preschool/admin/components/form-management/FormManagementHero.vue'
import FormManagementSection from '@/modules/preschool/admin/components/form-management/FormManagementSection.vue'
import { FORM_MANAGEMENT_PAGE_CARDS } from './formManagementData'

defineOptions({
  name: 'PreschoolAdminFormManagementPage',
})

const { t, te } = useLanguage()
const router = useRouter()

function safeText(key, fallback) {
  return te(key) ? t(key) : fallback
}

const heroSummary = computed(() =>
  safeText(
    'preschoolScaffold.formManagement.pages.overview.summary',
    'Choose a section below to open the forms, build, or review workspace.',
  ),
)

const heroActionLabel = computed(() =>
  safeText('preschoolScaffold.formManagement.hero.openLabel', 'Open'),
)

const pageCards = computed(() =>
  FORM_MANAGEMENT_PAGE_CARDS.map((card) => ({
    ...card,
    description: safeText(card.descriptionKey, card.fallbackDescription),
  })),
)

const quickLinks = computed(() => [
  {
    label: safeText('preschoolScaffold.formManagement.cards.dashboard.title', 'Dashboard'),
    action: () => router.push({ name: 'preschool-assessment-dashboard' }),
    icon: 'pi pi-chart-bar',
  },
  {
    label: safeText('preschoolScaffold.formManagement.cards.forms.title', 'Forms'),
    action: () => router.push({ name: 'dashboard-preschool-admin-forms-manage' }),
    icon: 'pi pi-folder-open',
  },
  {
    label: safeText('preschoolScaffold.formManagement.pages.manage.title', 'Manage'),
    action: () => router.push({ name: 'dashboard-preschool-admin-forms-manage' }),
    icon: 'pi pi-folder-open',
  },
])
</script>

<template>
  <MainLayout>
    <section class="preschool-form-management-page">
      <HeaderSection
        :title="safeText('preschoolScaffold.formManagement.title', 'Form Management')"
        :subtitle="safeText('preschoolScaffold.formManagement.subtitle', 'Create, organize, review, and manage Preschool forms.')"
      />

      <FormManagementHero
        :eyebrow="safeText('preschoolScaffold.formManagement.eyebrow', 'Form overview')"
        :title="safeText('preschoolScaffold.formManagement.title', 'Form Management')"
        :description="safeText('preschoolScaffold.formManagement.description', 'Manage the launch points for form builders, recent forms, submissions, and review tools.')"
        :meta-label="safeText('preschoolScaffold.formManagement.hero.metricForms', 'Launcher ready')"
        :meta-note="heroSummary"
        :quick-links="quickLinks"
      />

      <div class="workflow-overview">
        <div class="workflow-overview__item">
          <span class="workflow-overview__icon">📊</span>
          <strong>Overview</strong>
          <p>Forms Tracker hub and metrics</p>
        </div>
        <div class="workflow-overview__arrow">→</div>
        <div class="workflow-overview__item">
          <span class="workflow-overview__icon">✏️</span>
          <strong>Create</strong>
          <p>Design new assessment forms</p>
        </div>
        <div class="workflow-overview__arrow">→</div>
        <div class="workflow-overview__item">
          <span class="workflow-overview__icon">⚙️</span>
          <strong>Configure</strong>
          <p>Set up scoring & printing</p>
        </div>
        <div class="workflow-overview__arrow">→</div>
        <div class="workflow-overview__item">
          <span class="workflow-overview__icon">📋</span>
          <strong>Manage</strong>
          <p>Organize form library</p>
        </div>
        <div class="workflow-overview__arrow">→</div>
        <div class="workflow-overview__item">
          <span class="workflow-overview__icon">📈</span>
          <strong>Review</strong>
          <p>Track submissions & results</p>
        </div>
      </div>

      <FormManagementSection
        :eyebrow="safeText('preschoolScaffold.formManagement.pages.sections.title', 'Sections')"
        :title="safeText('preschoolScaffold.formManagement.pages.sections.title', 'Sections')"
        :badge="heroActionLabel"
        grid-class="preschool-form-management-section__grid--two"
        :cards="pageCards"
      />
    </section>
  </MainLayout>
</template>

<style scoped>
.preschool-form-management-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.workflow-overview {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  border-radius: 1rem;
  border: 1px solid #86efac;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  padding: 1.5rem;
  justify-content: space-between;
}

.workflow-overview__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  flex: 0 1 auto;
  min-width: 100px;
}

.workflow-overview__item strong {
  font-size: 0.9rem;
  color: #059669;
  font-weight: 700;
}

.workflow-overview__item p {
  margin: 0;
  font-size: 0.75rem;
  color: #475569;
  line-height: 1.3;
}

.workflow-overview__icon {
  font-size: 1.5rem;
  display: block;
}

.workflow-overview__arrow {
  color: #cbd5e1;
  font-size: 1.2rem;
  font-weight: 300;
}

@media (max-width: 768px) {
  .workflow-overview {
    flex-direction: column;
    gap: 0.75rem;
  }

  .workflow-overview__arrow {
    transform: rotate(90deg);
  }
}
</style>
