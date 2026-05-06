<script setup>
/**
 * GoalEventsEditor
 * Renders the goal-event collection and delegates row edits upward.
 */
import Button from '@/components/buttons/Button.vue'
import GoalEventRow from '@/modules/sport/admin/components/match-results/GoalEventRow.vue'

defineOptions({
  name: 'GoalEventsEditor',
})

defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  labels: {
    type: Object,
    required: true,
  },
  placeholders: {
    type: Object,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['add', 'update', 'remove'])
</script>

<template>
  <section class="goal-events-editor">
    <div class="goal-events-editor__header">
      <div>
        <h3 class="goal-events-editor__title">{{ labels.title }}</h3>
        <p class="goal-events-editor__description">{{ labels.description }}</p>
      </div>

      <Button type="button" variant="outline" size="sm" rounded="xl" :disabled="readonly" @click="$emit('add')">
        {{ labels.add }}
      </Button>
    </div>

    <div v-if="events.length" class="goal-events-editor__list">
      <GoalEventRow
        v-for="event in events"
        :key="event.id"
        :event="event"
        :labels="labels"
        :placeholders="placeholders"
        :readonly="readonly"
        @update="$emit('update', $event)"
        @remove="$emit('remove', $event)"
      />
    </div>

    <p v-else class="goal-events-editor__empty">
      {{ labels.empty }}
    </p>
  </section>
</template>

<style scoped>
.goal-events-editor {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #f8fafc;
}

.goal-events-editor__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.goal-events-editor__title {
  margin: 0;
  color: #1d1d1b;
  font-size: 1rem;
  font-weight: 900;
}

.goal-events-editor__description,
.goal-events-editor__empty {
  margin: 0.25rem 0 0;
  color: #64748b;
  font-size: 0.86rem;
  line-height: 1.5;
}

.goal-events-editor__list {
  display: grid;
  gap: 0.75rem;
}

@media (max-width: 720px) {
  .goal-events-editor__header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
