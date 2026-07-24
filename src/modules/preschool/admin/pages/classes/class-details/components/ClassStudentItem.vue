<script setup>
import Avatar from 'primevue/avatar'
import { RouterLink } from 'vue-router'
import StatusBadge from '@/components/badges/StatusBadge.vue'

defineOptions({
  name: 'ClassStudentItem',
})

defineProps({
  student: {
    type: Object,
    default: () => ({}),
  },
  viewStudentProfileLabel: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <article class="class-student-item">
    <div class="class-student-item__identity">
      <Avatar
        :image="student.avatarUrl || ''"
        :label="student.initials || 'ST'"
        shape="circle"
        class="class-student-item__avatar"
      />

      <div class="class-student-item__copy">
        <p class="class-student-item__name">{{ student.name || '—' }}</p>
        <p class="class-student-item__code">{{ student.code || '—' }}</p>
        <p v-if="student.guardianPhone" class="class-student-item__helper">
          {{ student.guardianPhone }}
        </p>
      </div>
    </div>

    <div class="class-student-item__meta">
      <StatusBadge
        :status="student.status || 'active'"
        :label="student.status || 'active'"
        size="sm"
      />

      <RouterLink
        v-if="student.profileRoute"
        :to="student.profileRoute"
        class="class-student-item__profile-link"
      >
        {{ viewStudentProfileLabel }}
      </RouterLink>
    </div>
  </article>
</template>

<style scoped>
.class-student-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #dbe5ef;
  border-radius: 1rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
}

.class-student-item__identity {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  min-width: 0;
}

.class-student-item__avatar {
  width: 2.6rem;
  height: 2.6rem;
  flex-shrink: 0;
  background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%);
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 800;
}

.class-student-item__copy {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  min-width: 0;
}

.class-student-item__name {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.class-student-item__code,
.class-student-item__helper {
  margin: 0;
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.class-student-item__meta {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 0.55rem;
  flex-shrink: 0;
}

.class-student-item__profile-link {
  color: #0f6f8f;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
}

.class-student-item__profile-link:hover {
  text-decoration: underline;
}
</style>
