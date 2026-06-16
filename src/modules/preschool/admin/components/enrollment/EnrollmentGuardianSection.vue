<script setup>
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'EnrollmentGuardianSection' })

defineProps({
  application: { type: Object, default: () => ({}) },
})

const { t } = useI18n()
</script>

<template>
  <section class="enr-guardian">
    <h3 class="enr-guardian__title">{{ t('preschoolEnrollmentPage.guardianSection.title') }}</h3>
    <dl class="enr-guardian__grid">
      <div class="enr-guardian__row">
        <dt>{{ t('preschoolEnrollmentPage.guardianSection.name') }}</dt>
        <dd>{{ application.guardianName ?? '—' }}</dd>
      </div>
      <div class="enr-guardian__row">
        <dt>{{ t('preschoolEnrollmentPage.guardianSection.relationship') }}</dt>
        <dd>{{ application.guardianRelationship ?? '—' }}</dd>
      </div>
      <div class="enr-guardian__row">
        <dt>{{ t('preschoolEnrollmentPage.guardianSection.phone') }}</dt>
        <dd>{{ application.guardianPhone ?? '—' }}</dd>
      </div>
      <div class="enr-guardian__row">
        <dt>{{ t('preschoolEnrollmentPage.guardianSection.email') }}</dt>
        <dd>{{ application.guardianEmail ?? '—' }}</dd>
      </div>
      <div class="enr-guardian__row enr-guardian__row--full">
        <dt>{{ t('preschoolEnrollmentPage.guardianSection.address') }}</dt>
        <dd>{{ application.guardianAddress ?? '—' }}</dd>
      </div>
      <div class="enr-guardian__row">
        <dt>{{ t('preschoolEnrollmentPage.guardianSection.canPickup') }}</dt>
        <dd>
          {{ application.guardianCanPickup
            ? t('preschoolEnrollmentPage.guardianSection.yes')
            : t('preschoolEnrollmentPage.guardianSection.no') }}
        </dd>
      </div>
      <div class="enr-guardian__row">
        <dt>{{ t('preschoolEnrollmentPage.guardianSection.isEmergency') }}</dt>
        <dd>
          {{ application.guardianIsEmergency
            ? t('preschoolEnrollmentPage.guardianSection.yes')
            : t('preschoolEnrollmentPage.guardianSection.no') }}
        </dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.enr-guardian {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.25rem;
  background: #fff;
}

.enr-guardian__title {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
}

.enr-guardian__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin: 0;
}

.enr-guardian__row {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.enr-guardian__row--full { grid-column: 1 / -1; }

.enr-guardian__row dt {
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.enr-guardian__row dd {
  margin: 0;
  font-size: 0.875rem;
  color: #0f172a;
  font-weight: 500;
}
</style>
