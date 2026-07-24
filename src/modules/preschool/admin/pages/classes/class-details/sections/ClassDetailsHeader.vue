<script setup>
import Button from '@/components/buttons/Button.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'

defineOptions({
  name: 'ClassDetailsHeader',
})

defineProps({
  classDetails: {
    type: Object,
    default: () => ({}),
  },
  teacherName: {
    type: String,
    default: '',
  },
  backLabel: {
    type: String,
    default: '',
  },
  editLabel: {
    type: String,
    default: '',
  },
  attendanceLabel: {
    type: String,
    default: '',
  },
  scheduleLabel: {
    type: String,
    default: '',
  },
})

defineEmits(['back', 'edit', 'attendance', 'schedule'])
</script>

<template>
  <section class="class-details-header">
    <div class="class-details-header__identity">
      <p class="class-details-header__code">{{ classDetails.code || '—' }}</p>
      <h3 class="class-details-header__name">{{ classDetails.name || '—' }}</h3>

      <div class="class-details-header__badges">
        <StatusBadge
          :status="classDetails.status || 'active'"
          :label="classDetails.status || 'active'"
          size="sm"
        />
        <span class="class-details-header__badge">{{ classDetails.level || '—' }}</span>
        <span class="class-details-header__badge">{{ classDetails.room || '—' }}</span>
        <span class="class-details-header__badge">{{ teacherName || '—' }}</span>
      </div>
    </div>

    <div class="class-details-header__actions">
      <Button variant="ghost" rounded="xl" size="md" @click="$emit('back')">
        <template #iconLeft>
          <i class="pi pi-arrow-left" aria-hidden="true" />
        </template>
        {{ backLabel }}
      </Button>

      <Button variant="primary" rounded="xl" size="md" @click="$emit('edit')">
        <template #iconLeft>
          <i class="pi pi-pencil" aria-hidden="true" />
        </template>
        {{ editLabel }}
      </Button>

      <Button variant="outline" rounded="xl" size="md" @click="$emit('attendance')">
        <template #iconLeft>
          <i class="pi pi-calendar-check" aria-hidden="true" />
        </template>
        {{ attendanceLabel }}
      </Button>

      <Button variant="ghost" rounded="xl" size="md" @click="$emit('schedule')">
        <template #iconLeft>
          <i class="pi pi-calendar" aria-hidden="true" />
        </template>
        {{ scheduleLabel }}
      </Button>
    </div>
  </section>
</template>

<style scoped>
.class-details-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.2rem 1.25rem;
  border: 1px solid #dbe5ef;
  border-radius: 1.35rem;
  background:
    radial-gradient(circle at top left, rgba(224, 242, 254, 0.9), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 20px 44px -34px rgba(15, 23, 42, 0.45);
}

.class-details-header__identity {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  min-width: 0;
}

.class-details-header__code {
  margin: 0;
  color: #0f6f8f;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.class-details-header__name {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.45rem, 2.2vw, 2.15rem);
  line-height: 1.1;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.class-details-header__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.class-details-header__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: #eef6ff;
  border: 1px solid #dbeafe;
  color: #0f4c81;
  font-size: 0.8rem;
  font-weight: 700;
}

.class-details-header__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.6rem;
}

@media (max-width: 920px) {
  .class-details-header {
    flex-direction: column;
  }

  .class-details-header__actions {
    justify-content: flex-start;
  }
}
</style>
