<script setup>
import { computed } from 'vue'
import EventTypeBadge from '@/modules/dashboard/components/calendar/EventTypeBadge.vue'

const emit = defineEmits(['select'])

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
  locale: {
    type: String,
    default: 'en-US',
  },
  targetLabel: {
    type: String,
    default: 'Teams',
  },
  targetIcon: {
    type: String,
    default: 'pi pi-users',
  },
  contextLabel: {
    type: String,
    default: 'Tournament',
  },
  contextIcon: {
    type: String,
    default: 'pi pi-trophy',
  },
})

const dateValue = computed(() => new Date(`${props.event.date}T00:00:00`))
const monthLabel = computed(() =>
  new Intl.DateTimeFormat(props.locale, { month: 'short' }).format(dateValue.value),
)
const dayLabel = computed(() => String(dateValue.value.getDate()).padStart(2, '0'))
</script>

<template>
  <button type="button" class="upcoming-event-item" @click="emit('select', event)">
    <div class="upcoming-event-item__date">
      <span class="upcoming-event-item__month">{{ monthLabel }}</span>
      <span class="upcoming-event-item__day">{{ dayLabel }}</span>
    </div>

    <div class="upcoming-event-item__content">
      <div class="upcoming-event-item__topline">
        <h3 class="upcoming-event-item__title">{{ event.title }}</h3>
        <EventTypeBadge :type="event.type" :label="event.typeLabel" />
      </div>

      <p class="upcoming-event-item__meta">
        <i class="pi pi-clock" aria-hidden="true" />
        <span>{{ event.time }}</span>
        <span class="upcoming-event-item__separator">•</span>
        <i :class="targetIcon" aria-hidden="true" />
        <span class="upcoming-event-item__meta-label">{{ targetLabel }}:</span>
        <span>{{ event.teamLabel }}</span>
      </p>

      <p class="upcoming-event-item__meta upcoming-event-item__meta--secondary">
        <i :class="contextIcon" aria-hidden="true" />
        <span class="upcoming-event-item__meta-label">{{ contextLabel }}:</span>
        <span>{{ event.tournament }}</span>
      </p>
    </div>
  </button>
</template>

<style scoped>
.upcoming-event-item {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border: 1px solid #e5ecf2;
  border-radius: 1rem;
  padding: 0.95rem;
  background: #fff;
  text-align: left;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.upcoming-event-item:hover {
  transform: translateY(-1px);
  border-color: #cfe8f3;
  box-shadow: 0 24px 32px -30px rgba(15, 23, 42, 0.25);
}

.upcoming-event-item__date {
  min-width: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #dbe6ed;
  border-radius: 1rem;
  padding: 0.55rem 0.4rem;
  background: linear-gradient(180deg, #fafcfd 0%, #f1f6f9 100%);
}

.upcoming-event-item__month {
  color: #00aeef;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.upcoming-event-item__day {
  margin-top: 0.2rem;
  color: #1d1d1b;
  font-size: 1.2rem;
  font-weight: 900;
}

.upcoming-event-item__content {
  flex: 1;
  min-width: 0;
}

.upcoming-event-item__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
}

.upcoming-event-item__title {
  margin: 0;
  color: #1d1d1b;
  font-size: 0.95rem;
  font-weight: 800;
}

.upcoming-event-item__meta {
  margin: 0.5rem 0 0;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 0.8rem;
}

.upcoming-event-item__meta--secondary {
  margin-top: 0.35rem;
}

.upcoming-event-item__meta-label {
  color: #475569;
  font-weight: 800;
}

.upcoming-event-item__separator {
  color: #c2c9d1;
}

@media (max-width: 640px) {
  .upcoming-event-item__topline {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
