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
  <section class="preschool-dashboard-spotlight" aria-labelledby="preschool-dashboard-focus-title">
    <div class="preschool-dashboard-spotlight__heading">
      <span class="preschool-dashboard-spotlight__icon" aria-hidden="true"><i class="pi pi-bolt" /></span>
      <div>
        <p class="preschool-dashboard-spotlight__eyebrow">{{ t('preschoolDashboardSpotlight.eyebrow') }}</p>
        <h2 id="preschool-dashboard-focus-title" class="preschool-dashboard-spotlight__title">{{ title }}</h2>
      </div>
    </div>
    <p class="preschool-dashboard-spotlight__text">{{ text }}</p>
  </section>
</template>

<style scoped>
.preschool-dashboard-spotlight {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 0.85rem 1rem;
  border-radius: 1.15rem;
  border: 1px solid #cfe4f5;
  background: #f8fcff;
  box-shadow: 0 14px 34px -30px rgba(15, 23, 42, 0.5);
}

.preschool-dashboard-spotlight__heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.preschool-dashboard-spotlight__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  flex: 0 0 2.35rem;
  border-radius: 0.8rem;
  color: #0369a1;
  background: #e0f2fe;
}

.preschool-dashboard-spotlight__eyebrow {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #0369a1;
}

.preschool-dashboard-spotlight__title {
  margin: 0.18rem 0 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
}

.preschool-dashboard-spotlight__text {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.45;
  color: #334155;
  max-width: 52ch;
  text-align: right;
}

@media (max-width: 760px) {
  .preschool-dashboard-spotlight {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.55rem;
  }

  .preschool-dashboard-spotlight__text {
    padding-left: 3.1rem;
    text-align: left;
  }
}

@media (max-width: 480px) {
  .preschool-dashboard-spotlight__text {
    padding-left: 0;
  }
}
</style>
