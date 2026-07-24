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

defineEmits(['view-workflow'])
</script>

<template>
  <Card class="workflow-section-card">
    <template #title>
      {{ labels.overdueWorkflows || 'Overdue Workflows' }}
    </template>

    <template #content>
      <WorkflowEmptyState
        v-if="workflows.length === 0"
        :title="labels.noWorkflows || 'No Workflows'"
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
          @view-workflow="$emit('view-workflow', $event)"
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
