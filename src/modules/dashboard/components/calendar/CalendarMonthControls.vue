<script setup>
import IconButton from '@/modules/dashboard/components/calendar/IconButton.vue'

defineEmits(['previous', 'next', 'today'])

defineProps({
  monthLabel: {
    type: String,
    required: true,
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
  eyebrowLabel: {
    type: String,
    default: 'Monthly view',
  },
})
</script>

<template>
  <div class="calendar-month-controls">
    <div>
      <p class="calendar-month-controls__eyebrow">{{ eyebrowLabel }}</p>
      <h2 class="calendar-month-controls__title">{{ monthLabel }}</h2>
    </div>

    <div class="calendar-month-controls__actions">
      <IconButton
        icon="pi pi-angle-left"
        :aria-label="prevLabel"
        variant="soft"
        @click="$emit('previous')"
      />
      <IconButton
        icon="pi pi-angle-right"
        :aria-label="nextLabel"
        variant="soft"
        @click="$emit('next')"
      />
      <button type="button" class="calendar-month-controls__today" @click="$emit('today')">
        {{ todayLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.calendar-month-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.calendar-month-controls__eyebrow {
  margin: 0;
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.calendar-month-controls__title {
  margin: 0.35rem 0 0;
  color: #1d1d1b;
  font-size: 1.45rem;
  font-weight: 900;
}

.calendar-month-controls__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.calendar-month-controls__today {
  border: 1px solid #d8e3ea;
  border-radius: 9999px;
  padding: 0.72rem 1rem;
  background: #fff;
  color: #1d1d1b;
  font-size: 0.84rem;
  font-weight: 800;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.calendar-month-controls__today:hover {
  transform: translateY(-1px);
  border-color: #00aeef;
  color: #0086b6;
}

@media (max-width: 640px) {
  .calendar-month-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .calendar-month-controls__actions {
    justify-content: space-between;
  }

  .calendar-month-controls__today {
    flex: 1;
  }
}
</style>
