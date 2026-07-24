<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppStatusChip from '@/components/ui/AppStatusChip.vue'

defineOptions({
  name: 'PreschoolDashboardSummary',
})

const props = defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
})

function toneClass(status) {
  const normalized = String(status || '').trim().toLowerCase()
  if (normalized === 'success') return 'preschool-dashboard-summary__card--success'
  if (normalized === 'warning') return 'preschool-dashboard-summary__card--warning'
  if (normalized === 'error') return 'preschool-dashboard-summary__card--error'
  return 'preschool-dashboard-summary__card--info'
}

function trendIcon(direction) {
  const normalized = String(direction || 'neutral').trim().toLowerCase()
  if (normalized === 'up') return 'pi pi-arrow-up'
  if (normalized === 'down') return 'pi pi-arrow-down'
  return 'pi pi-minus'
}

const normalizedCards = computed(() =>
  (Array.isArray(props.cards) ? props.cards : []).map((card) => ({
    ...card,
    trend: card?.trend || {
      direction: 'neutral',
      label: card?.comparison || '',
    },
    comparison: String(card?.comparison || '').trim(),
  })),
)
</script>

<template>
  <div class="preschool-dashboard-summary">
    <article
      v-for="card in normalizedCards"
      :key="card.title"
      :class="['preschool-dashboard-summary__card', toneClass(card.status)]"
      :aria-label="card.title"
    >
      <div class="preschool-dashboard-summary__header">
        <span class="preschool-dashboard-summary__icon" aria-hidden="true">
          <i :class="card.icon || 'pi pi-chart-line'" />
        </span>
        <p class="preschool-dashboard-summary__title">{{ card.title }}</p>
      </div>

      <p class="preschool-dashboard-summary__value">{{ card.value }}</p>
      <p class="preschool-dashboard-summary__label">{{ card.label }}</p>
      <RouterLink
        v-if="card.actionTo && card.actionLabel"
        :to="card.actionTo"
        class="preschool-dashboard-summary__action"
      >
        {{ card.actionLabel }}
        <i class="pi pi-arrow-right" aria-hidden="true" />
      </RouterLink>
      <AppStatusChip
        class="preschool-dashboard-summary__trend"
        :data-direction="card.trend.direction || 'neutral'"
        :status="card.trend.direction || 'neutral'"
        :label="card.trend.label || card.comparison || '—'"
        :icon="trendIcon(card.trend.direction)"
        :translate-label="false"
        size="xs"
        :dot="false"
      />
    </article>
  </div>
</template>

<style scoped>
.preschool-dashboard-summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.75rem;
}

.preschool-dashboard-summary__card {
  --kpi-accent: #0284c7;
  padding: 0.9rem 0.95rem;
  border-radius: 1.05rem;
  border: 1px solid #dbe6f2;
  background: #fff;
  box-shadow: inset 0 3px 0 color-mix(in srgb, var(--kpi-accent) 72%, white), 0 14px 32px -30px rgba(15, 23, 42, 0.5);
}

.preschool-dashboard-summary__card--success {
  --kpi-accent: #65a30d;
}

.preschool-dashboard-summary__card--warning {
  --kpi-accent: #d97706;
}

.preschool-dashboard-summary__card--error {
  --kpi-accent: #e11d48;
}

.preschool-dashboard-summary__card--info {
  --kpi-accent: #0284c7;
}

.preschool-dashboard-summary__header {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.preschool-dashboard-summary__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  flex: 0 0 1.9rem;
  border-radius: 0.65rem;
  color: var(--kpi-accent);
  background: color-mix(in srgb, var(--kpi-accent) 10%, white);
  font-size: 0.88rem;
}

.preschool-dashboard-summary__title {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preschool-dashboard-summary__trend {
  margin-top: 0.5rem;
}

.preschool-dashboard-summary__value {
  margin: 0.55rem 0 0;
  font-size: clamp(1.65rem, 2.2vw, 2.1rem);
  font-weight: 800;
  color: #0f172a;
}

.preschool-dashboard-summary__label {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.5;
}

.preschool-dashboard-summary__action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.45rem;
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
  text-decoration: none;
}

.preschool-dashboard-summary__action:hover {
  text-decoration: underline;
}

@media (max-width: 1180px) {
  .preschool-dashboard-summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .preschool-dashboard-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .preschool-dashboard-summary {
    grid-template-columns: 1fr;
  }
}
</style>
