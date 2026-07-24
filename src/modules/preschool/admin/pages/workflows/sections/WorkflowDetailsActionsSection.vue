<script setup>
import Button from '@/components/buttons/Button.vue'

defineProps({
  canManageWorkflows: {
    type: Boolean,
    default: false,
  },
  isTerminal: {
    type: Boolean,
    default: false,
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['assign', 'transition', 'complete', 'cancel', 'escalate'])
</script>

<template>
  <section class="workflow-details-actions">
    <Button
      type="button"
      severity="secondary"
      outlined
      :disabled="!canManageWorkflows || isTerminal"
      @click="$emit('assign')"
    >
      {{ labels.assign || 'Assign' }}
    </Button>
    <Button
      type="button"
      severity="secondary"
      outlined
      :disabled="!canManageWorkflows || isTerminal"
      @click="$emit('transition')"
    >
      {{ labels.transition || 'Transition' }}
    </Button>
    <Button
      type="button"
      :disabled="!canManageWorkflows || isTerminal"
      @click="$emit('complete')"
    >
      {{ labels.completeWorkflow || 'Complete Workflow' }}
    </Button>
    <Button
      type="button"
      severity="secondary"
      outlined
      :disabled="!canManageWorkflows || isTerminal"
      @click="$emit('cancel')"
    >
      {{ labels.cancelWorkflow || 'Cancel Workflow' }}
    </Button>
    <Button
      type="button"
      severity="secondary"
      text
      :disabled="!canManageWorkflows || isTerminal"
      @click="$emit('escalate')"
    >
      {{ labels.escalateWorkflow || 'Escalate Workflow' }}
    </Button>
  </section>
</template>

<style scoped>
.workflow-details-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
</style>
