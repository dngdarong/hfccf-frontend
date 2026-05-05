<script setup>
import CalendarDayCell from '@/modules/dashboard/components/calendar/CalendarDayCell.vue'

defineEmits(['select-event', 'add-event'])

defineProps({
  days: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="calendar-grid">
    <CalendarDayCell
      v-for="day in days"
      :key="day.key"
      :day="day"
      @select-event="$emit('select-event', $event)"
      @add-event="$emit('add-event', $event)"
    />
  </div>
</template>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.75rem;
  min-width: 46rem;
}
</style>
