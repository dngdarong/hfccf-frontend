<script setup>
/**
 * GoalEventRow
 * Single editable goal event row. It never mutates the event prop directly.
 */
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from '@/components/buttons/Button.vue'

defineOptions({
  name: 'GoalEventRow',
})

const props = defineProps({
  event: {
    type: Object,
    required: true,
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

const emit = defineEmits(['update', 'remove'])

const eventTypeOptions = computed(() => [
  { value: 'goal', label: 'Goal' },
  { value: 'own_goal', label: 'Own Goal' },
  { value: 'yellow_card', label: 'Yellow Card' },
  { value: 'red_card', label: 'Red Card' },
  { value: 'substitution', label: 'Substitution' },
  { value: 'penalty_goal', label: 'Penalty Goal' },
  { value: 'penalty_missed', label: 'Penalty Missed' },
])

function updateField(field, value) {
  emit('update', {
    ...props.event,
    [field]: value,
  })
}

function onMinuteUpdate(val) {
  const sanitized = String(val)
    .replace(/[^0-9]/g, '')
    .slice(0, 3)
  updateField('minute', sanitized)
}
</script>

<template>
  <div class="goal-event-row">
    <div class="goal-event-row__field">
      <span class="goal-event-row__label">{{ labels.playerName }}</span>
      <InputText
        :model-value="event.playerName"
        :placeholder="placeholders.playerName"
        class="w-full"
        :disabled="readonly"
        @update:model-value="updateField('playerName', $event)"
      />
    </div>

    <label class="goal-event-row__field">
      <span class="goal-event-row__label">{{ labels.minute }}</span>
      <InputText
        :model-value="event.minute"
        :placeholder="placeholders.minute"
        class="w-full"
        :disabled="readonly"
        @update:model-value="onMinuteUpdate"
      />
    </label>

    <div class="goal-event-row__field">
      <span class="goal-event-row__label">{{ labels.goalTypes }}</span>
      <Select
        :model-value="event.eventType"
        :options="eventTypeOptions"
        option-label="label"
        option-value="value"
        :disabled="readonly"
        class="w-full"
        @update:model-value="updateField('eventType', $event)"
      />
    </div>

    <Button
      type="button"
      variant="ghost"
      size="sm"
      rounded="xl"
      class="mb-0.5"
      :disabled="readonly"
      @click="emit('remove', event.id)"
    >
      {{ labels.remove }}
    </Button>
  </div>
</template>

<style scoped>
.goal-event-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(80px, 0.3fr) minmax(180px, 1fr) auto;
  gap: 1rem;
  align-items: end;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #ffffff;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.goal-event-row:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px -8px rgba(15, 23, 42, 0.1);
}


.goal-event-row__field {
  display: grid;
  gap: 0.4rem;
}

.goal-event-row__label {
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 720px) {
  .goal-event-row {
    grid-template-columns: 1fr;
  }
}
</style>
