<script setup>
import ClassInfoItem from '../components/ClassInfoItem.vue'
import ClassEmptyState from '../components/ClassEmptyState.vue'

defineOptions({
  name: 'ClassScheduleSection',
})

defineProps({
  title: {
    type: String,
    default: '',
  },
  schedule: {
    type: Object,
    default: () => ({}),
  },
  daysLabel: {
    type: String,
    default: '',
  },
  startTimeLabel: {
    type: String,
    default: '',
  },
  endTimeLabel: {
    type: String,
    default: '',
  },
  scheduleStatusLabel: {
    type: String,
    default: '',
  },
  legacyScheduleLabel: {
    type: String,
    default: '',
  },
  scheduleUnavailableLabel: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="class-details-section">
    <header class="class-details-section__header">
      <p class="class-details-section__title">{{ title }}</p>
    </header>

    <div v-if="schedule.mode === 'structured'" class="class-details-section__body">
      <div class="class-details-section__preview">
        {{ schedule.preview }}
      </div>

      <div class="class-details-section__grid">
        <ClassInfoItem
          :label="daysLabel"
          :value="schedule.days.join(', ') || '—'"
        />
        <ClassInfoItem
          :label="startTimeLabel"
          :value="schedule.startTime || '—'"
        />
        <ClassInfoItem
          :label="endTimeLabel"
          :value="schedule.endTime || '—'"
        />
        <ClassInfoItem
          :label="scheduleStatusLabel"
          :value="schedule.label"
        />
      </div>
    </div>

    <ClassEmptyState
      v-else-if="schedule.mode === 'empty'"
      :title="scheduleUnavailableLabel"
      :description="scheduleUnavailableLabel"
    />

    <div v-else class="class-details-section__body">
      <ClassInfoItem
        :label="legacyScheduleLabel"
        :value="schedule.raw || schedule.preview"
      />

      <ClassEmptyState
        :title="legacyScheduleLabel"
        :description="schedule.raw"
      />
    </div>
  </section>
</template>

<style scoped>
.class-details-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem 1.05rem;
  border: 1px solid #dbe5ef;
  border-radius: 1.2rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
}

.class-details-section__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.96rem;
  font-weight: 900;
  letter-spacing: 0.02em;
}

.class-details-section__body {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.class-details-section__preview {
  padding: 0.85rem 0.95rem;
  border-radius: 0.95rem;
  border: 1px solid #dbeafe;
  background: linear-gradient(180deg, rgba(239, 246, 255, 0.98) 0%, rgba(255, 255, 255, 0.99) 100%);
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.class-details-section__grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 680px) {
  .class-details-section__grid {
    grid-template-columns: 1fr;
  }
}
</style>
