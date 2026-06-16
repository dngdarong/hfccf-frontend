<script setup>
import { useI18n } from 'vue-i18n'
import EnrollmentStatusBadge from './EnrollmentStatusBadge.vue'

defineOptions({ name: 'EnrollmentReviewPanel' })

defineProps({
  application: { type: Object, default: () => ({}) },
})

const { t } = useI18n()

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}
</script>

<template>
  <section class="enr-review">
    <h3 class="enr-review__title">{{ t('preschoolEnrollmentPage.reviewPanel.title') }}</h3>
    <dl class="enr-review__grid">
      <div class="enr-review__row">
        <dt>{{ t('preschoolEnrollmentPage.reviewPanel.applicationCode') }}</dt>
        <dd class="enr-review__code">{{ application.applicationCode ?? '—' }}</dd>
      </div>
      <div class="enr-review__row">
        <dt>Status</dt>
        <dd><EnrollmentStatusBadge :status="application.status" /></dd>
      </div>
      <div class="enr-review__row">
        <dt>{{ t('preschoolEnrollmentPage.reviewPanel.appliedDate') }}</dt>
        <dd>{{ application.applicationDate ?? '—' }}</dd>
      </div>
      <div v-if="application.reviewedByName" class="enr-review__row">
        <dt>{{ t('preschoolEnrollmentPage.reviewPanel.reviewedBy') }}</dt>
        <dd>{{ application.reviewedByName }} <span class="enr-review__ts">{{ formatDate(application.reviewedAt) }}</span></dd>
      </div>
      <div v-if="application.approvedByName" class="enr-review__row">
        <dt>{{ t('preschoolEnrollmentPage.reviewPanel.approvedBy') }}</dt>
        <dd>{{ application.approvedByName }} <span class="enr-review__ts">{{ formatDate(application.approvedAt) }}</span></dd>
      </div>
      <div v-if="application.enrolledByName" class="enr-review__row">
        <dt>{{ t('preschoolEnrollmentPage.reviewPanel.enrolledBy') }}</dt>
        <dd>{{ application.enrolledByName }} <span class="enr-review__ts">{{ formatDate(application.enrolledAt) }}</span></dd>
      </div>
      <div class="enr-review__row enr-review__row--full">
        <dt>{{ t('preschoolEnrollmentPage.reviewPanel.adminNotes') }}</dt>
        <dd>{{ application.adminNotes || t('preschoolEnrollmentPage.reviewPanel.noNotes') }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.enr-review {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.25rem;
  background: #fff;
}

.enr-review__title {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
}

.enr-review__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin: 0;
}

.enr-review__row { display: flex; flex-direction: column; gap: 0.1rem; }
.enr-review__row--full { grid-column: 1 / -1; }

.enr-review__row dt {
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.enr-review__row dd {
  margin: 0;
  font-size: 0.875rem;
  color: #0f172a;
  font-weight: 500;
}

.enr-review__code {
  font-family: monospace;
  font-size: 0.85rem;
  color: #6366f1;
}

.enr-review__ts {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-left: 0.4rem;
}
</style>
