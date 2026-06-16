<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import FormManagementHero from '@/modules/preschool/admin/components/form-management/FormManagementHero.vue'
import FormManagementSection from '@/modules/preschool/admin/components/form-management/FormManagementSection.vue'
import { groupFormManagementActionCards } from './formManagementData'

defineOptions({
  name: 'PreschoolAdminFormManagementManagePage',
})

const { t, te } = useLanguage()
const router = useRouter()
const { manage } = groupFormManagementActionCards()

function safeText(key, fallback) {
  return te(key) ? t(key) : fallback
}

const heroSummary = computed(() =>
  safeText(
    'preschoolScaffold.formManagement.pages.manage.description',
    'Open the form catalog and review related records.',
  ),
)

const quickLinks = computed(() => [
  {
    label: safeText('breadcrumb.forms', 'Forms'),
    action: () => router.push({ name: 'dashboard-preschool-admin-forms' }),
    icon: 'pi pi-arrow-left',
  },
  {
    label: safeText('preschoolScaffold.formManagement.cards.forms.title', 'Forms'),
    action: () => router.push({ name: 'dashboard-preschool-admin-forms-manage' }),
    icon: 'pi pi-folder-open',
  },
  {
    label: safeText('preschoolScaffold.formManagement.cards.auditLogs.title', 'Audit Logs'),
    action: () => router.push({ name: 'dashboard-preschool-admin-lifecycle-audit' }),
    icon: 'pi pi-history',
  },
])
</script>

<template>
  <MainLayout>
    <section class="preschool-form-management-page">
      <HeaderSection
        :title="safeText('preschoolScaffold.formManagement.pages.manage.title', 'Manage Forms')"
        :subtitle="safeText('preschoolScaffold.formManagement.pages.manage.subtitle', 'Open the form catalog and related records.')"
      />

      <div class="workflow-guidance">
        <p class="workflow-guidance__step">
          <span class="workflow-guidance__icon">📋</span>
          <strong>Browse catalog:</strong> View all active and archived forms
        </p>
        <p class="workflow-guidance__step">
          <span class="workflow-guidance__icon">🔍</span>
          <strong>Review details:</strong> Check form properties and audit history
        </p>
        <p class="workflow-guidance__step">
          <span class="workflow-guidance__icon">📊</span>
          <strong>Organize:</strong> Archive, duplicate, or reorganize forms
        </p>
      </div>

      <FormManagementHero
        :eyebrow="safeText('preschoolScaffold.formManagement.pages.manage.eyebrow', 'Form management')"
        :title="safeText('preschoolScaffold.formManagement.pages.manage.title', 'Manage Forms')"
        :description="safeText('preschoolScaffold.formManagement.pages.manage.description', 'Open the form catalog and related records.')"
        :meta-label="safeText('preschoolScaffold.formManagement.hero.metricForms', 'Workspace')"
        :meta-note="heroSummary"
        :quick-links="quickLinks"
      />

      <FormManagementSection
        :eyebrow="safeText('preschoolScaffold.formManagement.pages.manage.eyebrow', 'Form management')"
        :title="safeText('preschoolScaffold.formManagement.pages.manage.title', 'Manage Forms')"
        :badge="safeText('preschoolScaffold.formManagement.hero.openLabel', 'Open')"
        grid-class="preschool-form-management-section__grid--two"
        card-class="preschool-form-management-card__surface--manage"
        :cards="manage"
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

.workflow-guidance {
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.workflow-guidance__step {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: #475569;
}

.workflow-guidance__icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}
</style>
