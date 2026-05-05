<script setup>
defineProps({
  weekdays: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="calendar-week-header">
    <div v-for="day in weekdays" :key="day" class="calendar-week-header__cell">{{ day }}</div>
  </div>
</template>

<style scoped>
.calendar-week-header {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.75rem;
  min-width: 46rem;
}

.calendar-week-header__cell {
  color: #94a3b8;
  font-size: 0.73rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
</style>
