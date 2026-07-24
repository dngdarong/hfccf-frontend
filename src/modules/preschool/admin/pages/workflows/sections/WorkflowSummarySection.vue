<script setup>
import WorkflowMetricCard from '../components/WorkflowMetricCard.vue'

defineProps({
  summary: {
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
  <section class="workflow-summary-section">
    <WorkflowMetricCard :title="labels.totalWorkflows || 'Total Workflows'" :value="summary.total || 0" tone="blue" />
    <WorkflowMetricCard :title="labels.pendingApprovals || 'Pending Approvals'" :value="summary.pendingApproval || 0" tone="amber" />
    <WorkflowMetricCard :title="labels.overdueWorkflows || 'Overdue Workflows'" :value="summary.overdue || 0" tone="rose" />
    <WorkflowMetricCard :title="labels.escalatedWorkflows || 'Escalated Workflows'" :value="summary.escalated || 0" tone="amber" />
    <WorkflowMetricCard :title="labels.myAssignments || 'My Assignments'" :value="summary.myAssignments || 0" tone="emerald" />
    <WorkflowMetricCard :title="labels.completedRecently || 'Completed Recently'" :value="summary.completed || 0" tone="slate" />
  </section>
</template>

<style scoped>
.workflow-summary-section {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

@media (max-width: 1024px) {
  .workflow-summary-section {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .workflow-summary-section {
    grid-template-columns: 1fr;
  }
}
</style>
