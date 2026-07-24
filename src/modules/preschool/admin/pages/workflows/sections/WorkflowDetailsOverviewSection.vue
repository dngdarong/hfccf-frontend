<script setup>
import Card from 'primevue/card'

defineProps({
  workflow: {
    type: Object,
    required: true,
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
  sourceRouteName: {
    type: String,
    default: '',
  },
  sourceRouteParams: {
    type: Object,
    default: () => ({}),
  },
  sourceExists: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['view-source'])
</script>

<template>
  <Card class="workflow-section-card">
    <template #title>
      {{ labels.sourceEntity || 'Source Entity' }}
    </template>

    <template #content>
      <dl class="workflow-details-overview">
        <div>
          <dt>{{ labels.workflowSource || 'Workflow Source' }}</dt>
          <dd>{{ workflow.sourceLabel || workflow.sourceType || labels.sourceUnavailable || 'Source Unavailable' }}</dd>
        </div>
        <div>
          <dt>{{ labels.sourceId || 'Source ID' }}</dt>
          <dd>{{ workflow.sourceId || '—' }}</dd>
        </div>
        <div>
          <dt>{{ labels.currentStep || 'Current Step' }}</dt>
          <dd>{{ workflow.currentStep?.name || workflow.currentStep?.key || '—' }}</dd>
        </div>
        <div>
          <dt>{{ labels.assignee || 'Assignee' }}</dt>
          <dd>{{ workflow.assignedRole || workflow.assignee?.firstName || '—' }}</dd>
        </div>
        <div>
          <dt>{{ labels.dueDate || 'Due Date' }}</dt>
          <dd>{{ workflow.dueAt || '—' }}</dd>
        </div>
        <div>
          <dt>{{ labels.sla || 'SLA' }}</dt>
          <dd>{{ workflow.currentStep?.slaHours ?? '—' }}</dd>
        </div>
      </dl>

      <button
        v-if="sourceRouteName && sourceExists"
        type="button"
        class="workflow-details-overview__link"
        @click="$emit('view-source', workflow)"
      >
        {{ labels.viewSource || 'View Source' }}
      </button>

      <p
        v-else-if="workflow.sourceExists === false || sourceExists === false"
        class="workflow-details-overview__unavailable"
      >
        {{ labels.sourceUnavailable || 'Source Unavailable' }}
      </p>
    </template>
  </Card>
</template>

<style scoped>
.workflow-section-card {
  border-radius: 1rem;
}

.workflow-details-overview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem 1rem;
}

.workflow-details-overview dt {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
}

.workflow-details-overview dd {
  margin: 0.2rem 0 0;
  color: #0f172a;
  font-weight: 600;
}

.workflow-details-overview__link {
  margin-top: 1rem;
  border: 0;
  background: transparent;
  color: #1d4ed8;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.workflow-details-overview__unavailable {
  margin-top: 1rem;
  color: #64748b;
  font-size: 0.88rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .workflow-details-overview {
    grid-template-columns: 1fr;
  }
}
</style>
