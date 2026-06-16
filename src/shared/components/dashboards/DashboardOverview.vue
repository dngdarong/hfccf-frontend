<script setup>
import Card from 'primevue/card'
import Tag from 'primevue/tag'

defineOptions({
  name: 'DashboardOverview',
})

defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
  spotlightTitle: {
    type: String,
    default: '',
  },
  spotlightText: {
    type: String,
    default: '',
  },
  actions: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="dashboard-overview">
    <div
      v-if="cards.length"
      class="dashboard-overview__cards"
    >
      <Card
        v-for="card in cards"
        :key="card.title"
        class="dashboard-overview__metric-card"
      >
        <template #content>
          <div class="dashboard-overview__metric">
            <div class="dashboard-overview__metric-header">
              <span class="dashboard-overview__metric-title">{{ card.title }}</span>
              <Tag
                v-if="card.status"
                :value="card.status"
                :severity="card.status"
                rounded
              />
            </div>

            <div class="dashboard-overview__metric-value">
              {{ card.value }}
            </div>

            <p
              v-if="card.label"
              class="dashboard-overview__metric-label"
            >
              {{ card.label }}
            </p>
          </div>
        </template>
      </Card>
    </div>

    <div
      v-if="spotlightTitle || spotlightText || actions.length"
      class="dashboard-overview__spotlight-wrap"
    >
      <Card class="dashboard-overview__spotlight-card">
        <template #title>
          {{ spotlightTitle || 'Overview' }}
        </template>

        <template #content>
          <div class="dashboard-overview__spotlight">
            <p
              v-if="spotlightText"
              class="dashboard-overview__spotlight-text"
            >
              {{ spotlightText }}
            </p>

            <div
              v-if="actions.length"
              class="dashboard-overview__actions"
            >
              <span
                v-for="action in actions"
                :key="action"
                class="dashboard-overview__action-pill"
              >
                {{ action }}
              </span>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.dashboard-overview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard-overview__cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.dashboard-overview__metric-card,
.dashboard-overview__spotlight-card {
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  background: #ffffff;
  box-shadow: 0 18px 34px -34px rgba(15, 23, 42, 0.25);
}

.dashboard-overview__metric {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.dashboard-overview__metric-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.dashboard-overview__metric-title {
  color: #475569;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dashboard-overview__metric-value {
  color: #0f172a;
  font-size: clamp(1.5rem, 2vw, 2.1rem);
  font-weight: 900;
  line-height: 1;
}

.dashboard-overview__metric-label {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.6;
}

.dashboard-overview__spotlight-text {
  margin: 0;
  color: #334155;
  font-size: 0.92rem;
  line-height: 1.7;
}

.dashboard-overview__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.dashboard-overview__action-pill {
  display: inline-flex;
  align-items: center;
  border: 1px solid #dbeafe;
  border-radius: 9999px;
  background: #eff6ff;
  padding: 0.45rem 0.75rem;
  color: #1d4ed8;
  font-size: 0.76rem;
  font-weight: 700;
}

@media (max-width: 1200px) {
  .dashboard-overview__cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .dashboard-overview__cards {
    grid-template-columns: 1fr;
  }
}
</style>
