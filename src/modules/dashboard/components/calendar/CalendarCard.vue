<script setup>
import CalendarGrid from '@/modules/dashboard/components/calendar/CalendarGrid.vue'
import CalendarLegend from '@/modules/dashboard/components/calendar/CalendarLegend.vue'
import CalendarMonthControls from '@/modules/dashboard/components/calendar/CalendarMonthControls.vue'
import CalendarWeekHeader from '@/modules/dashboard/components/calendar/CalendarWeekHeader.vue'

defineEmits(['previous', 'next', 'today', 'select-event', 'add-event'])

defineProps({
  monthLabel: {
    type: String,
    required: true,
  },
  weekdays: {
    type: Array,
    default: () => [],
  },
  days: {
    type: Array,
    default: () => [],
  },
  legendItems: {
    type: Array,
    default: () => [],
  },
  todayLabel: {
    type: String,
    default: 'Today',
  },
  prevLabel: {
    type: String,
    default: 'Previous month',
  },
  nextLabel: {
    type: String,
    default: 'Next month',
  },
  monthlyViewLabel: {
    type: String,
    default: 'Monthly view',
  },
})
</script>

<template>
  <section class="calendar-card">
    <CalendarMonthControls
      :month-label="monthLabel"
      :today-label="todayLabel"
      :prev-label="prevLabel"
      :next-label="nextLabel"
      :eyebrow-label="monthlyViewLabel"
      @previous="$emit('previous')"
      @next="$emit('next')"
      @today="$emit('today')"
    />

    <div class="calendar-card__body">
      <CalendarWeekHeader :weekdays="weekdays" />
      <CalendarGrid
        :days="days"
        @select-event="$emit('select-event', $event)"
        @add-event="$emit('add-event', $event)"
      />
    </div>

    <CalendarLegend :items="legendItems" />
  </section>
</template>

<style scoped>
.calendar-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border: 1px solid #dde5ec;
  border-radius: 1.45rem;
  background: #fff;
  box-shadow: 0 24px 40px -34px rgba(15, 23, 42, 0.25);
  padding: 1.25rem;
}

.calendar-card__body {
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 0.25rem;
}

.calendar-card__body::-webkit-scrollbar {
  height: 0.55rem;
}

.calendar-card__body::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background: #d8e5ee;
}
</style>
