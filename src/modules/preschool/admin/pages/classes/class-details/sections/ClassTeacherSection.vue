<script setup>
import Avatar from 'primevue/avatar'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import ClassInfoItem from '../components/ClassInfoItem.vue'
import ClassEmptyState from '../components/ClassEmptyState.vue'

defineOptions({
  name: 'ClassTeacherSection',
})

defineProps({
  title: {
    type: String,
    default: '',
  },
  teacher: {
    type: Object,
    default: () => ({}),
  },
  teacherName: {
    type: String,
    default: '',
  },
  emailLabel: {
    type: String,
    default: '',
  },
  phoneLabel: {
    type: String,
    default: '',
  },
  noTeacherLabel: {
    type: String,
    default: '',
  },
  assignedTeacherLabel: {
    type: String,
    default: '',
  },
  teacherStatusLabel: {
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
      v-if="!teacherName"
      :title="noTeacherLabel"
      :description="noTeacherLabel"
    />

    <div v-else class="class-teacher-section__body">
      <div class="class-teacher-section__profile">
        <Avatar
          :image="teacher.avatar || teacher.avatarUrl || ''"
          :label="teacher.initials || teacherName.slice(0, 2).toUpperCase()"
          shape="circle"
          class="class-teacher-section__avatar"
        />

        <div class="class-teacher-section__identity">
          <p class="class-teacher-section__name">{{ teacherName }}</p>
        <StatusBadge
          :status="teacher.status || 'active'"
          :label="teacher.status || assignedTeacherLabel"
          size="sm"
        />
        </div>
      </div>

      <div class="class-teacher-section__grid">
        <ClassInfoItem
          :label="assignedTeacherLabel"
          :value="teacherName"
        />
        <ClassInfoItem
          :label="emailLabel"
          :value="teacher.email || '—'"
        />
        <ClassInfoItem
          :label="phoneLabel"
          :value="teacher.phone || '—'"
        />
        <ClassInfoItem
          :label="teacherStatusLabel"
          :value="teacher.status || '—'"
        />
      </div>
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

.class-teacher-section__body {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.class-teacher-section__profile {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.class-teacher-section__avatar {
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%);
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 800;
}

.class-teacher-section__identity {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.class-teacher-section__name {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 900;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.class-teacher-section__grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 680px) {
  .class-teacher-section__grid {
    grid-template-columns: 1fr;
  }
}
</style>
