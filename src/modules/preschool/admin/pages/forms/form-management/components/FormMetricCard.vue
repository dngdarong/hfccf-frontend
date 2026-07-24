<script setup>
defineOptions({
  name: 'PreschoolFormMetricCard',
})

defineProps({
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <article class="preschool-form-metric-card">
    <div class="preschool-form-metric-card__icon">
      <i :class="icon" aria-hidden="true" />
    </div>
    <div class="preschool-form-metric-card__copy">
      <h4>{{ title }}</h4>
      <p>{{ description }}</p>
    </div>
  </article>
</template>

<style scoped>
.preschool-form-metric-card {
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 16px 34px -30px rgba(15, 23, 42, 0.25);
}

.preschool-form-metric-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.875rem;
  background: #eff6ff;
  color: #2563eb;
  flex: none;
}

.preschool-form-metric-card__copy {
  min-width: 0;
}

.preschool-form-metric-card__copy h4 {
  margin: 0 0 0.25rem;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 850;
  line-height: 1.25;
}

.preschool-form-metric-card__copy p {
  margin: 0;
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>
