<script setup>
import UpcomingEventItem from '@/modules/dashboard/components/calendar/UpcomingEventItem.vue'

defineEmits(['select-event'])

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  events: {
    type: Array,
    default: () => [],
  },
  locale: {
    type: String,
    default: 'en-US',
  },
  targetLabel: {
    type: String,
    default: 'Teams',
  },
  eyebrowLabel: {
    type: String,
    default: 'Timeline',
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
  emptyLabel: {
    type: String,
    default: 'No upcoming events scheduled for this month.',
  },
})
</script>

<template>
  <section class="upcoming-events-card">
    <header class="upcoming-events-card__header">
      <div>
        <p class="upcoming-events-card__eyebrow">{{ eyebrowLabel }}</p>
        <h2 class="upcoming-events-card__title">{{ title }}</h2>
      </div>
      <p class="upcoming-events-card__subtitle">{{ subtitle }}</p>
    </header>

    <div class="upcoming-events-card__list">
      <UpcomingEventItem
        v-for="event in events"
        :key="event.id"
        :event="event"
        :locale="locale"
        :context-icon="contextIcon"
        :context-label="contextLabel"
        :target-icon="targetIcon"
        :target-label="targetLabel"
        @select="$emit('select-event', $event)"
      />

      <div v-if="!events.length" class="upcoming-events-card__empty">
        {{ emptyLabel }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.upcoming-events-card {
  border: 1px solid #dde5ec;
  border-radius: 1.45rem;
  background: #fff;
  box-shadow: 0 24px 40px -34px rgba(15, 23, 42, 0.25);
  padding: 1.25rem;
}

.upcoming-events-card__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.upcoming-events-card__eyebrow {
  margin: 0;
  color: #00aeef;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.upcoming-events-card__title {
  margin: 0.35rem 0 0;
  color: #1d1d1b;
  font-size: 1.25rem;
  font-weight: 900;
}

.upcoming-events-card__subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.86rem;
  line-height: 1.5;
  max-width: 20rem;
  text-align: right;
}

.upcoming-events-card__list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-height: 29.5rem;
  overflow-y: auto;
  padding-right: 0.4rem;
}

.upcoming-events-card__list::-webkit-scrollbar {
  width: 0.45rem;
}

.upcoming-events-card__list::-webkit-scrollbar-track {
  background: transparent;
}

.upcoming-events-card__list::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background: #e2e8f0;
}

.upcoming-events-card__list::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.upcoming-events-card__empty {
  border: 1px dashed #dbe4ea;
  border-radius: 1rem;
  padding: 1.35rem;
  color: #64748b;
  font-size: 0.9rem;
  text-align: center;
  background: #fafcfd;
}

@media (max-width: 768px) {
  .upcoming-events-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .upcoming-events-card__subtitle {
    text-align: left;
  }
}
</style>
