<script setup>
import ClassEmptyState from '../components/ClassEmptyState.vue'

defineOptions({
  name: 'ClassNotesSection',
})

defineProps({
  title: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  recentActivity: {
    type: Array,
    default: () => [],
  },
  emptyLabel: {
    type: String,
    default: '',
  },
  recentActivityLabel: {
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

    <div v-if="notes || recentActivity.length" class="class-notes-section__body">
      <p v-if="notes" class="class-notes-section__notes">
        {{ notes }}
      </p>

      <div v-if="recentActivity.length" class="class-notes-section__activity">
        <p class="class-notes-section__activity-title">{{ recentActivityLabel }}</p>
        <ul class="class-notes-section__activity-list">
          <li v-for="item in recentActivity" :key="item.id" class="class-notes-section__activity-item">
            <span class="class-notes-section__activity-label">{{ item.label }}</span>
            <span class="class-notes-section__activity-value">{{ item.value }}</span>
          </li>
        </ul>
      </div>
    </div>

    <ClassEmptyState
      v-else
      :title="emptyLabel"
      :description="emptyLabel"
    />
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

.class-notes-section__body {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.class-notes-section__notes {
  margin: 0;
  color: #0f172a;
  font-size: 0.92rem;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.class-notes-section__activity {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.class-notes-section__activity-title {
  margin: 0;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.class-notes-section__activity-list {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.class-notes-section__activity-item {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  padding: 0.8rem 0.9rem;
  border-radius: 0.9rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.class-notes-section__activity-label {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.class-notes-section__activity-value {
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.45;
  overflow-wrap: anywhere;
}
</style>
