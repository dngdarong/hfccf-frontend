<script setup>
const emit = defineEmits(['select'])

defineProps({
  event: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <button
    type="button"
    class="calendar-event-pill"
    :class="`calendar-event-pill--${event.type}`"
    @click.stop="emit('select')"
  >
    <span class="calendar-event-pill__time">{{ event.time }}</span>
    <span class="calendar-event-pill__title">{{ event.title }}</span>
  </button>
</template>

<style scoped>
.calendar-event-pill {
  display: flex;
  align-items: center;
  gap: 0.38rem;
  width: 100%;
  border: 0;
  border-radius: 9999px;
  padding: 0.34rem 0.58rem;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition:
    transform 0.18s ease,
    filter 0.18s ease;
}

.calendar-event-pill:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
}

.calendar-event-pill--match {
  background: #00aeef;
}

.calendar-event-pill--training {
  background: #8dc63f;
}

.calendar-event-pill--meeting {
  background: #f4bc10;
  color: #3a2f00;
}

.calendar-event-pill--urgent {
  background: #ed1c24;
}

.calendar-event-pill__time {
  flex: none;
  opacity: 0.9;
}

.calendar-event-pill__title {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
