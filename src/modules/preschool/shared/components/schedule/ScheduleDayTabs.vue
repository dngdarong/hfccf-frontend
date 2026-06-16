<script setup>
// Keep weekday filtering in a tiny component so timetable pages can switch
// between days without copying button layout logic.
import Button from '@/components/buttons/Button.vue'

defineProps({
  days: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

function selectDay(dayValue) {
  emit('update:modelValue', dayValue)
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Button
      v-for="day in days"
      :key="day.value"
      type="button"
      :variant="String(modelValue) === String(day.value) ? 'primary' : 'ghost'"
      size="sm"
      rounded="xl"
      @click="selectDay(day.value)"
    >
      {{ day.label }}
    </Button>
  </div>
</template>
