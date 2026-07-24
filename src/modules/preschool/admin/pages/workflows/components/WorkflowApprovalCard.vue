<script setup>
import { computed } from 'vue'
import Button from '@/components/buttons/Button.vue'
import WorkflowStatusBadge from './WorkflowStatusBadge.vue'

const props = defineProps({
  approval: {
    type: Object,
    required: true,
  },
  canAct: {
    type: Boolean,
    default: false,
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['approve', 'reject', 'return', 'cancel', 'view-workflow'])

const workflowItem = computed(() => props.approval.instance || props.approval.workflow || {})
</script>

<template>
  <article class="workflow-approval-card">
    <div class="workflow-approval-card__header">
      <div>
        <h4 class="workflow-approval-card__title">
          {{ workflowItem.sourceLabel || workflowItem.workflowDefinitionName || labels.approval || 'Approval' }}
        </h4>
        <p class="workflow-approval-card__meta">
          {{ approval.requestedToRole || approval.requestedTo?.firstName || approval.requestedBy?.firstName || '—' }}
        </p>
      </div>

      <WorkflowStatusBadge
        :status="approval.status"
        :label="approval.status"
      />
    </div>

    <div class="workflow-approval-card__body">
      <div>
        <span class="workflow-approval-card__label">{{ labels.workflowSource || 'Workflow Source' }}</span>
        <div class="workflow-approval-card__value">
          {{ workflowItem.sourceLabel || workflowItem.workflowDefinitionName || labels.sourceUnavailable || 'Source Unavailable' }}
        </div>
      </div>
      <div>
        <span class="workflow-approval-card__label">{{ labels.dueDate || 'Due Date' }}</span>
        <div class="workflow-approval-card__value">
          {{ approval.dueAt || '—' }}
        </div>
      </div>
    </div>

    <p
      v-if="approval.decisionNotes"
      class="workflow-approval-card__notes"
    >
      {{ approval.decisionNotes }}
    </p>

    <div class="workflow-approval-card__actions">
      <Button
        type="button"
        severity="secondary"
        outlined
        size="small"
        @click="$emit('view-workflow', workflowItem)"
      >
        {{ labels.viewWorkflow || 'View Workflow' }}
      </Button>

      <div
        v-if="canAct && approval.status === 'pending'"
        class="workflow-approval-card__action-group"
      >
        <Button type="button" size="small" @click="$emit('approve', approval)">
          {{ labels.approve || 'Approve' }}
        </Button>
        <Button type="button" severity="secondary" size="small" @click="$emit('reject', approval)">
          {{ labels.reject || 'Reject' }}
        </Button>
        <Button type="button" severity="secondary" outlined size="small" @click="$emit('return', approval)">
          {{ labels.return || 'Return' }}
        </Button>
        <Button type="button" severity="secondary" text size="small" @click="$emit('cancel', approval)">
          {{ labels.cancelWorkflow || 'Cancel' }}
        </Button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.workflow-approval-card {
  padding: 0.9rem;
  border-radius: 0.95rem;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.workflow-approval-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.workflow-approval-card__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.workflow-approval-card__meta,
.workflow-approval-card__label,
.workflow-approval-card__notes {
  color: #475569;
  font-size: 0.84rem;
}

.workflow-approval-card__body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.workflow-approval-card__value {
  color: #0f172a;
  font-weight: 600;
  font-size: 0.88rem;
}

.workflow-approval-card__notes {
  margin: 0.75rem 0 0;
}

.workflow-approval-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.9rem;
}

.workflow-approval-card__action-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .workflow-approval-card__body {
    grid-template-columns: 1fr;
  }
}
</style>
