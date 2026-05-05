<script setup>
import CalendarEventPill from '@/modules/dashboard/components/calendar/CalendarEventPill.vue'

defineEmits(['select-event', 'add-event'])

const props = defineProps({
  day: {
    type: Object,
    required: true,
  },
})

const MAX_VISIBLE_EVENTS = 3
</script>

<template>
  <article
    class="calendar-day-cell"
    :class="{
      'calendar-day-cell--muted': !day.inCurrentMonth,
      'calendar-day-cell--today': day.isToday,
    }"
    @dblclick="$emit('add-event', props.day.isoDate)"
  >
    <div class="calendar-day-cell__header">
      <span class="calendar-day-cell__date" :class="{ 'calendar-day-cell__date--today': day.isToday }">
        {{ day.dayNumber }}
      </span>

      <button
        type="button"
        class="calendar-day-cell__add"
        aria-label="Add event"
        @click="$emit('add-event', props.day.isoDate)"
      >
        <i class="pi pi-plus" aria-hidden="true" />
      </button>
    </div>

    <div class="calendar-day-cell__events">
      <CalendarEventPill
        v-for="item in day.events.slice(0, MAX_VISIBLE_EVENTS)"
        :key="item.id"
        :event="item"
        @select="$emit('select-event', item)"
      />

      <span v-if="day.events.length > MAX_VISIBLE_EVENTS" class="calendar-day-cell__more">
        +{{ day.events.length - MAX_VISIBLE_EVENTS }} more
      </span>
    </div>
  </article>
</template>

<style scoped>
.calendar-day-cell {
  min-height: 8.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: 1px solid #e4ebf1;
  border-radius: 1rem;
  padding: 0.8rem;
  background: #fff;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.calendar-day-cell:hover {
  transform: translateY(-1px);
  border-color: #cfe9f4;
  box-shadow: 0 24px 30px -30px rgba(15, 23, 42, 0.32);
}

.calendar-day-cell--muted {
  background: #f9fbfc;
}

.calendar-day-cell--today {
  border-color: #bde9fb;
  background: linear-gradient(180deg, #f1fbff 0%, #ffffff 100%);
}

.calendar-day-cell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.calendar-day-cell__date {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  color: #1d1d1b;
  font-size: 0.88rem;
  font-weight: 800;
}

.calendar-day-cell__date--today {
  background: #00aeef;
  color: #fff;
  box-shadow: 0 18px 24px -22px rgba(0, 174, 239, 0.9);
}

.calendar-day-cell--muted .calendar-day-cell__date:not(.calendar-day-cell__date--today) {
  color: #94a3b8;
}

.calendar-day-cell__add {
  width: 1.85rem;
  height: 1.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  color: #94a3b8;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.calendar-day-cell__add:hover {
  background: #f0f9ff;
  color: #00aeef;
}

.calendar-day-cell__events {
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
}

.calendar-day-cell__more {
  padding-left: 0.2rem;
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 700;
}

@media (max-width: 640px) {
  .calendar-day-cell {
    min-height: 7rem;
    padding: 0.65rem;
  }
}
</style>
