<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="calendar-legend">
    <div v-for="item in items" :key="item.label" class="calendar-legend__item">
      <span class="calendar-legend__dot" :style="{ backgroundColor: item.color }"></span>
      <span class="calendar-legend__label">{{ item.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.calendar-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.calendar-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
}

.calendar-legend__dot {
  width: 0.72rem;
  height: 0.72rem;
  border-radius: 9999px;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.45);
}
</style>
