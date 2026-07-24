<script setup>
import ClassInfoItem from '../components/ClassInfoItem.vue'

defineOptions({
  name: 'ClassRoomSection',
})

defineProps({
  title: {
    type: String,
    default: '',
  },
  room: {
    type: String,
    default: '',
  },
  studentCount: {
    type: [String, Number],
    default: '',
  },
  capacity: {
    type: [String, Number],
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  roomLabel: {
    type: String,
    default: '',
  },
  studentCountLabel: {
    type: String,
    default: '',
  },
  capacityLabel: {
    type: String,
    default: '',
  },
  notesLabel: {
    type: String,
    default: '',
  },
  noDataLabel: {
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

    <div class="class-room-section__grid">
      <ClassInfoItem
        :label="roomLabel"
        :value="room || noDataLabel"
      />
      <ClassInfoItem
        :label="studentCountLabel"
        :value="studentCount"
      />
      <ClassInfoItem
        :label="capacityLabel"
        :value="capacity || noDataLabel"
      />
      <ClassInfoItem
        :label="notesLabel"
        :value="notes || noDataLabel"
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

.class-room-section__grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 680px) {
  .class-room-section__grid {
    grid-template-columns: 1fr;
  }
}
</style>
