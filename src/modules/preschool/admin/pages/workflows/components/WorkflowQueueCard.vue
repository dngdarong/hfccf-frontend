<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/buttons/Button.vue'
import WorkflowStatusBadge from './WorkflowStatusBadge.vue'

const props = defineProps({
  workflow: {
    type: Object,
    required: true,
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
  showSourceLink: {
    type: Boolean,
    default: false,
  },
  sourceRouteName: {
    type: String,
    default: '',
  },
  sourceRouteParams: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['view-workflow', 'view-source'])

const router = useRouter()

const canOpenSource = computed(() => {
  if (!props.sourceRouteName || props.workflow?.sourceExists === false) {
    return false
  }

  return router.hasRoute(props.sourceRouteName)
})
</script>

<template>
  <article class="workflow-queue-card">
    <div class="workflow-queue-card__header">
      <div>
        <h4 class="workflow-queue-card__title">
          {{ workflow.sourceLabel || workflow.workflowDefinitionName || workflow.workflowDefinitionKey || labels.workflow || 'Workflow' }}
        </h4>
        <p class="workflow-queue-card__meta">
          {{ workflow.sourceType || '—' }} · {{ workflow.priority || 'normal' }}
        </p>
      </div>

      <WorkflowStatusBadge
        :status="workflow.status"
        :label="workflow.status"
      />
    </div>

    <div class="workflow-queue-card__body">
      <div>
        <span class="workflow-queue-card__label">{{ labels.currentStep || 'Current Step' }}</span>
        <div class="workflow-queue-card__value">
          {{ workflow.currentStep?.name || workflow.currentStep?.key || '—' }}
        </div>
      </div>
      <div>
        <span class="workflow-queue-card__label">{{ labels.assignee || 'Assignee' }}</span>
        <div class="workflow-queue-card__value">
          {{ workflow.assignedRole || workflow.assignee?.firstName || '—' }}
        </div>
      </div>
      <div>
        <span class="workflow-queue-card__label">{{ labels.workflowSource || 'Workflow Source' }}</span>
        <div class="workflow-queue-card__value">
          {{ workflow.sourceLabel || labels.sourceUnavailable || 'Source Unavailable' }}
        </div>
      </div>
      <div>
        <span class="workflow-queue-card__label">{{ labels.dueDate || 'Due Date' }}</span>
        <div class="workflow-queue-card__value">
          {{ workflow.dueAt || '—' }}
        </div>
      </div>
      <div>
        <span class="workflow-queue-card__label">{{ labels.sla || 'SLA' }}</span>
        <div class="workflow-queue-card__value">
          {{ workflow.currentStep?.slaHours ?? '—' }}
        </div>
      </div>
    </div>

    <div class="workflow-queue-card__actions">
      <Button
        type="button"
        severity="secondary"
        outlined
        size="small"
        @click="$emit('view-workflow', workflow)"
      >
        {{ labels.viewWorkflow || 'View Workflow' }}
      </Button>

      <Button
        v-if="showSourceLink && canOpenSource"
        type="button"
        severity="secondary"
        text
        size="small"
        @click="$emit('view-source', workflow)"
      >
        {{ labels.viewSource || 'View Source' }}
      </Button>
    </div>
  </article>
</template>

<style scoped>
.workflow-queue-card {
  padding: 0.9rem;
  border-radius: 0.95rem;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.workflow-queue-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.workflow-queue-card__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.workflow-queue-card__meta,
.workflow-queue-card__label {
  color: #475569;
  font-size: 0.84rem;
}

.workflow-queue-card__body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.workflow-queue-card__value {
  color: #0f172a;
  font-weight: 600;
  font-size: 0.88rem;
}

.workflow-queue-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.9rem;
}

@media (max-width: 768px) {
  .workflow-queue-card__body {
    grid-template-columns: 1fr;
  }
}
</style>
