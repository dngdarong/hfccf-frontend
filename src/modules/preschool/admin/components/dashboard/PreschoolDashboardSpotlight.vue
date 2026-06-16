<script setup>
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'PreschoolDashboardSpotlight',
})

const { t } = useLanguage()

defineProps({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <section class="preschool-dashboard-spotlight">
    <p class="preschool-dashboard-spotlight__eyebrow">{{ t('preschoolDashboardSpotlight.eyebrow') }}</p>
    <h2 class="preschool-dashboard-spotlight__title">{{ title }}</h2>
    <p class="preschool-dashboard-spotlight__text">{{ text }}</p>
  </section>
</template>

<style scoped>
.preschool-dashboard-spotlight {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #cfe4f5;
  background:
    radial-gradient(circle at top right, rgba(125, 211, 252, 0.26), transparent 28%),
    linear-gradient(135deg, #f0f9ff 0%, #ffffff 45%, #eff6ff 100%);
  box-shadow: 0 24px 60px -42px rgba(15, 23, 42, 0.55);
}

.preschool-dashboard-spotlight__eyebrow {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #0369a1;
}

.preschool-dashboard-spotlight__title {
  margin: 0.45rem 0 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
}

.preschool-dashboard-spotlight__text {
  margin: 0.75rem 0 0;
  font-size: 0.96rem;
  line-height: 1.7;
  color: #334155;
  max-width: 58ch;
}
</style>
