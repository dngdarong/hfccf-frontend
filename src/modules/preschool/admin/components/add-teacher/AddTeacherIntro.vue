<script setup>
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AddTeacherIntro',
})

const { t } = useLanguage()

defineProps({
  roleLabel: {
    type: String,
    default: '',
  },
  statusLabel: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="add-teacher-intro">
    <div>
      <p class="add-teacher-intro__eyebrow">{{ t('preschoolAddTeacher.introEyebrow') }}</p>
      <p class="add-teacher-intro__summary">{{ t('preschoolAddTeacher.introText') }}</p>
    </div>

    <div class="add-teacher-intro__tags">
      <span class="add-teacher-intro__tag add-teacher-intro__tag--role">
        {{ roleLabel }}
      </span>
      <span class="add-teacher-intro__tag add-teacher-intro__tag--status">
        {{ statusLabel }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.add-teacher-intro {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border: 1px solid #e7eaf3;
  border-radius: 1rem;
  background: linear-gradient(180deg, rgba(248, 251, 255, 1) 0%, rgba(255, 255, 255, 1) 100%);
}

.add-teacher-intro__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.add-teacher-intro__summary {
  margin: 0.25rem 0 0;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.6;
}

.add-teacher-intro__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.add-teacher-intro__tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.74rem;
  font-weight: 600;
}

.add-teacher-intro__tag--role {
  border: 1px solid #bae6fd;
  background: #ecfeff;
  color: #0369a1;
}

.add-teacher-intro__tag--status {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
}
</style>
