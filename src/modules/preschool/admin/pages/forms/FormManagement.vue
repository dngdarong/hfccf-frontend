<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import Breadcrumb from '@/components/navigation/Breadcrumb.vue'
import FormManagementHeaderSection from './form-management/sections/FormManagementHeaderSection.vue'
import FormOverviewSection from './form-management/sections/FormOverviewSection.vue'
import FormQuickActionsSection from './form-management/sections/FormQuickActionsSection.vue'
import FormResourcesSection from './form-management/sections/FormResourcesSection.vue'
import FormWorkflowSection from './form-management/sections/FormWorkflowSection.vue'
import { useFormManagementData } from './form-management/composables/useFormManagementData'

defineOptions({
  name: 'PreschoolAdminFormManagementPage',
})

const {
  hero,
  overviewMetrics,
  quickActions,
  resourceLinks,
  sectionHeaders,
  workflowSteps,
} = useFormManagementData()
</script>

<template>
  <MainLayout>
    <section class="preschool-form-management-page">
      <Breadcrumb />
      <FormManagementHeaderSection :hero="hero" />

      <FormOverviewSection
        :header="sectionHeaders.overview"
        :cards="overviewMetrics"
      />

      <FormQuickActionsSection
        :header="sectionHeaders.quickActions"
        :actions="quickActions"
      />

      <FormWorkflowSection
        :header="sectionHeaders.workflow"
        :steps="workflowSteps"
      />

      <FormResourcesSection
        :header="sectionHeaders.resources"
        :resources="resourceLinks"
      />
    </section>
  </MainLayout>
</template>

<style scoped>
.preschool-form-management-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
</style>
