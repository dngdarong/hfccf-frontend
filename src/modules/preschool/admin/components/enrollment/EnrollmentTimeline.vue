<script setup>
import { useI18n } from 'vue-i18n'
import { formatDatetimeShort } from '@/utils/date'

defineOptions({ name: 'EnrollmentTimeline' })

defineProps({
  logs: { type: Array, default: () => [] },
})

const { t } = useI18n()

function actionLabel(action) {
  const map = {
    created: t('preschoolEnrollmentPage.timeline.actions.created'),
    submitted: t('preschoolEnrollmentPage.timeline.actions.submitted'),
    under_review: t('preschoolEnrollmentPage.timeline.actions.under_review'),
    approved: t('preschoolEnrollmentPage.timeline.actions.approved'),
    rejected: t('preschoolEnrollmentPage.timeline.actions.rejected'),
    waitlisted: t('preschoolEnrollmentPage.timeline.actions.waitlisted'),
    enrolled: t('preschoolEnrollmentPage.timeline.actions.enrolled'),
    cancelled: t('preschoolEnrollmentPage.timeline.actions.cancelled'),
  }
  return map[action] ?? action
}

// Delegate to the shared utility — removes the inline toLocaleString() call
// that was printing raw ISO strings on some locales/browsers.
const formatDate = formatDatetimeShort
</script>

<template>
  <section class="enr-timeline">
    <h3 class="enr-timeline__title">{{ t('preschoolEnrollmentPage.timeline.title') }}</h3>

    <div v-if="logs.length === 0" class="enr-timeline__empty">
      {{ t('preschoolEnrollmentPage.timeline.noHistory') }}
    </div>

    <ol v-else class="enr-timeline__list">
      <li v-for="log in logs" :key="log.id" class="enr-timeline__item">
        <span class="enr-timeline__dot" />
        <div class="enr-timeline__body">
          <p class="enr-timeline__action">{{ actionLabel(log.action) }}</p>
          <p v-if="log.note" class="enr-timeline__note">{{ log.note }}</p>
          <div class="enr-timeline__meta">
            <span v-if="log.actorName">{{ log.actorName }}</span>
            <span>{{ formatDate(log.recordedAt) }}</span>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.enr-timeline {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.25rem;
  background: #fff;
}

.enr-timeline__title {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
}

.enr-timeline__empty {
  color: #94a3b8;
  font-size: 0.85rem;
  padding: 0.5rem 0;
}

.enr-timeline__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.enr-timeline__item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  border-left: 2px solid #e2e8f0;
  margin-left: 0.5rem;
  padding-left: 1.25rem;
  position: relative;
}

.enr-timeline__item:last-child { border-left-color: transparent; }

.enr-timeline__dot {
  position: absolute;
  left: -0.45rem;
  top: 0.9rem;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: #6366f1;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #6366f1;
  flex-shrink: 0;
}

.enr-timeline__body { flex: 1; }

.enr-timeline__action {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.enr-timeline__note {
  margin: 0.25rem 0 0;
  font-size: 0.82rem;
  color: #475569;
}

.enr-timeline__meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #94a3b8;
}
</style>
