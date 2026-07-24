<script setup>
import ClassStudentItem from '../components/ClassStudentItem.vue'
import ClassEmptyState from '../components/ClassEmptyState.vue'

defineOptions({
  name: 'ClassStudentRosterSection',
})

defineProps({
  title: {
    type: String,
    default: '',
  },
  students: {
    type: Array,
    default: () => [],
  },
  emptyTitle: {
    type: String,
    default: '',
  },
  emptyDescription: {
    type: String,
    default: '',
  },
  viewStudentProfileLabel: {
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

    <ClassEmptyState
      v-if="!students.length"
      :title="emptyTitle"
      :description="emptyDescription"
    />

    <div v-else class="class-student-roster-section__grid">
      <ClassStudentItem
        v-for="student in students"
        :key="student.id"
        :student="student"
        :view-student-profile-label="viewStudentProfileLabel"
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

.class-student-roster-section__grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 900px) {
  .class-student-roster-section__grid {
    grid-template-columns: 1fr;
  }
}
</style>
