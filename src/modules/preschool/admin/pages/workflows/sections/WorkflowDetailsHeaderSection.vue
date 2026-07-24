<script setup>
import Breadcrumb from '@/components/navigation/Breadcrumb.vue'
import WorkflowStatusBadge from '../components/WorkflowStatusBadge.vue'

defineProps({
  workflow: {
    type: Object,
    required: true,
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<template>
  <section class="workflow-details-header">
    <div>
      <Breadcrumb />
      <div class="workflow-details-header__eyebrow">{{ labels.workflowDetails || 'Workflow Details' }}</div>
      <h2 class="workflow-details-header__title">
        {{ workflow.sourceLabel || workflow.workflowDefinitionName || workflow.workflowDefinitionKey || labels.workflow || 'Workflow' }}
      </h2>
      <p class="workflow-details-header__subtitle">
        {{ workflow.workflowDefinitionDomain || workflow.sourceType || '—' }}
      </p>
    </div>

    <div class="workflow-details-header__meta">
      <WorkflowStatusBadge :status="workflow.status" :label="workflow.status" />
      <div class="workflow-details-header__priority">
        {{ labels.priority || 'Priority' }}: {{ workflow.priority || 'normal' }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.workflow-details-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  border-radius: 1.2rem;
  border: 1px solid #dbeafe;
  background: linear-gradient(135deg, #f8fafc, #eff6ff);
}

.workflow-details-header__eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #1d4ed8;
}

.workflow-details-header__title {
  margin: 0.35rem 0 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.workflow-details-header__subtitle,
.workflow-details-header__priority {
  margin: 0.45rem 0 0;
  color: #475569;
  font-size: 0.88rem;
}

.workflow-details-header__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .workflow-details-header {
    flex-direction: column;
  }

  .workflow-details-header__meta {
    align-items: flex-start;
  }
}
</style>
