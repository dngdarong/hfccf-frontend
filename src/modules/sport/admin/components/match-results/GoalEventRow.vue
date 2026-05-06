<script setup>
/**
 * GoalEventRow
 * Single editable goal event row. It never mutates the event prop directly.
 */
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import AutoComplete from 'primevue/autocomplete'
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

const items = ref([])

function search(event) {
  // Simulated search logic from example: generates 10 dummy items based on query
  const query = String(event.query || '')
  const base = [...Array(10).keys()]
  items.value = query ? base.map((i) => `${query} ${i + 1}`) : base.map((i) => `Player ${i + 1}`)
}

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
      <AutoComplete
        :model-value="event.playerName"
        dropdown
        :suggestions="items"
        :placeholder="placeholders.playerName"
        class="w-full"
        input-class="w-full"
        :disabled="readonly"
        @complete="search"
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
      <div class="flex h-11 flex-wrap items-center gap-4">
        <div v-for="type in ['Red', 'Yellow', 'Green']" :key="type" class="flex items-center gap-2">
          <Checkbox
            :model-value="event.goalTypes"
            :value="type"
            :disabled="readonly"
            @update:model-value="updateField('goalTypes', $event)"
          />
          <span class="text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">{{ type }}</span>
        </div>
      </div>
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
