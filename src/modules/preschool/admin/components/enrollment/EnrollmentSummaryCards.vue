<script setup>
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'EnrollmentSummaryCards' })

defineProps({
  summary: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

const { t } = useI18n()

const CARDS = [
  { key: 'total', icon: 'pi pi-inbox', tone: 'neutral' },
  { key: 'submitted', icon: 'pi pi-send', tone: 'info' },
  { key: 'under_review', icon: 'pi pi-eye', tone: 'warning' },
  { key: 'approved', icon: 'pi pi-check-circle', tone: 'success' },
  { key: 'waitlisted', icon: 'pi pi-clock', tone: 'warning' },
  { key: 'rejected', icon: 'pi pi-times-circle', tone: 'danger' },
  { key: 'enrolled', icon: 'pi pi-user-plus', tone: 'success' },
  { key: 'draft', icon: 'pi pi-file-edit', tone: 'neutral' },
]

function cardLabel(key) {
  const map = {
    total: t('preschoolEnrollmentPage.cards.total'),
    submitted: t('preschoolEnrollmentPage.cards.submitted'),
    under_review: t('preschoolEnrollmentPage.cards.underReview'),
    approved: t('preschoolEnrollmentPage.cards.approved'),
    waitlisted: t('preschoolEnrollmentPage.cards.waitlisted'),
    rejected: t('preschoolEnrollmentPage.cards.rejected'),
    enrolled: t('preschoolEnrollmentPage.cards.enrolled'),
    draft: t('preschoolEnrollmentPage.cards.draft'),
  }
  return map[key] ?? key
}
</script>

<template>
  <div class="enr-cards">
    <template v-if="loading">
      <div v-for="i in 8" :key="i" class="enr-cards__skeleton" />
    </template>
    <template v-else>
      <article
        v-for="card in CARDS"
        :key="card.key"
        class="enr-cards__card"
        :class="`enr-cards__card--${card.tone}`"
      >
        <span class="enr-cards__icon" aria-hidden="true">
          <i :class="card.icon" />
        </span>
        <div>
          <p class="enr-cards__label">{{ cardLabel(card.key) }}</p>
          <strong class="enr-cards__value">
            {{ summary[card.key] ?? (card.key === 'total' ? (summary.total ?? 0) : 0) }}
          </strong>
        </div>
      </article>
    </template>
  </div>
</template>

<style scoped>
.enr-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 1rem;
}

.enr-cards__skeleton {
  height: 82px;
  border-radius: 1rem;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.enr-cards__card {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1.1rem;
  border: 1px solid #dce6f2;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 20px 38px -34px rgba(15, 23, 42, 0.48);
}

.enr-cards__card--info { color: #0f6f8f; }
.enr-cards__card--success { color: #2f7a42; }
.enr-cards__card--warning { color: #9a5d09; }
.enr-cards__card--danger { color: #b42318; }
.enr-cards__card--neutral { color: #475569; }

.enr-cards__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.9rem;
  background: color-mix(in srgb, currentColor 11%, white);
  border: 1px solid color-mix(in srgb, currentColor 18%, white);
  flex-shrink: 0;
}

.enr-cards__label {
  margin: 0;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.enr-cards__value {
  display: block;
  margin-top: 0.3rem;
  color: #0f172a;
  font-size: 1.4rem;
  line-height: 1;
  font-weight: 900;
}
</style>
