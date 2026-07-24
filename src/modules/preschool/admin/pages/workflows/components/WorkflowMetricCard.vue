<script setup>
import Card from 'primevue/card'

defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    default: '0',
  },
  tone: {
    type: String,
    default: 'slate',
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <Card class="workflow-metric-card">
    <template #title>
      <div class="workflow-metric-card__title">{{ title }}</div>
    </template>

    <template #content>
      <div :class="['workflow-metric-card__value', `workflow-metric-card__value--${tone}`]">
        {{ value }}
      </div>
      <div
        v-if="subtitle"
        class="workflow-metric-card__subtitle"
      >
        {{ subtitle }}
      </div>
    </template>
  </Card>
</template>

<style scoped>
.workflow-metric-card {
  border-radius: 1rem;
}

.workflow-metric-card__title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
}

.workflow-metric-card__value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
}

.workflow-metric-card__value--rose {
  color: #be123c;
}

.workflow-metric-card__value--amber {
  color: #b45309;
}

.workflow-metric-card__value--emerald {
  color: #047857;
}

.workflow-metric-card__value--blue {
  color: #1d4ed8;
}

.workflow-metric-card__value--slate {
  color: #334155;
}

.workflow-metric-card__subtitle {
  margin-top: 0.25rem;
  color: #64748b;
  font-size: 0.84rem;
}
</style>
