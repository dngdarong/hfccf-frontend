<script setup>
import Card from 'primevue/card'
import WorkflowEmptyState from '../components/WorkflowEmptyState.vue'
import WorkflowTimelineItem from '../components/WorkflowTimelineItem.vue'

defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<template>
  <Card class="workflow-section-card">
    <template #title>
      {{ labels.timeline || 'Timeline' }}
    </template>

    <template #content>
      <WorkflowEmptyState
        v-if="events.length === 0"
        :title="labels.noTimeline || 'No Timeline'"
      />

      <div
        v-else
        class="workflow-section-card__list"
      >
        <WorkflowTimelineItem
          v-for="event in events"
          :key="event.id"
          :event="event"
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
