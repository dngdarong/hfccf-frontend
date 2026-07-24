<script setup>
import WorkflowStatusBadge from './WorkflowStatusBadge.vue'

defineProps({
  event: {
    type: Object,
    required: true,
  },
  timeLabel: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <article class="workflow-timeline-item">
    <div class="workflow-timeline-item__header">
      <div>
        <h4 class="workflow-timeline-item__title">{{ event.title || '—' }}</h4>
        <p class="workflow-timeline-item__meta">
          {{ event.workflowLabel || event.eventType || '—' }}
        </p>
      </div>

      <WorkflowStatusBadge
        v-if="event.toStatus"
        :status="event.toStatus"
        :label="event.toStatus"
      />
    </div>

    <p
      v-if="event.description"
      class="workflow-timeline-item__description"
    >
      {{ event.description }}
    </p>

    <div class="workflow-timeline-item__footer">
      <span v-if="event.actor">{{ event.actor.firstName || event.actor.username || '—' }}</span>
      <span>{{ timeLabel || event.createdAt || '—' }}</span>
    </div>
  </article>
</template>

<style scoped>
.workflow-timeline-item {
  padding: 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.95rem;
  background: #fff;
}

.workflow-timeline-item__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.workflow-timeline-item__title {
  margin: 0;
  font-size: 0.94rem;
  font-weight: 700;
  color: #0f172a;
}

.workflow-timeline-item__meta,
.workflow-timeline-item__description,
.workflow-timeline-item__footer {
  font-size: 0.84rem;
  color: #475569;
}

.workflow-timeline-item__description {
  margin: 0.5rem 0 0;
}

.workflow-timeline-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.65rem;
}
</style>
