<script setup>
import Card from 'primevue/card'
import WorkflowQueueCard from '../components/WorkflowQueueCard.vue'
import WorkflowEmptyState from '../components/WorkflowEmptyState.vue'

defineProps({
  workflows: {
    type: Array,
    default: () => [],
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['view-workflow', 'view-source'])
</script>

<template>
  <Card class="workflow-section-card">
    <template #title>
      {{ labels.workflowQueue || 'Workflow Queue' }}
    </template>

    <template #content>
      <WorkflowEmptyState
        v-if="workflows.length === 0"
        :title="labels.noWorkflows || 'No Workflows'"
        :description="labels.emptyWorkflows || ''"
      />

      <div
        v-else
        class="workflow-section-card__list"
      >
        <WorkflowQueueCard
          v-for="workflow in workflows"
          :key="workflow.id"
          :workflow="workflow"
          :labels="labels"
          :show-source-link="Boolean(workflow.sourceRouteName)"
          :source-route-name="workflow.sourceRouteName || ''"
          :source-route-params="workflow.sourceRouteParams || {}"
          @view-workflow="$emit('view-workflow', $event)"
          @view-source="$emit('view-source', $event)"
        />
      </div>
    </template>
  </Card>
</template>

<style scoped>
.workflow-section-card {
  border-radius: 1rem;
}

.workflow-section-card__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
