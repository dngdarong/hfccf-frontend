<script setup>
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'PreschoolDashboardActivity',
})

const { t } = useLanguage()

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section class="preschool-dashboard-activity">
    <h3 class="preschool-dashboard-activity__title">{{ t('preschoolDashboardActivity.title') }}</h3>
    <div class="preschool-dashboard-activity__list">
      <article
        v-for="item in items"
        :key="item.title"
        class="preschool-dashboard-activity__item"
      >
        <p class="preschool-dashboard-activity__item-title">{{ item.title }}</p>
        <p class="preschool-dashboard-activity__item-text">{{ item.text }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.preschool-dashboard-activity {
  padding: 1.35rem;
  border-radius: 1.35rem;
  border: 1px solid #dbe6f2;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(255, 255, 255, 1) 100%);
  box-shadow: 0 18px 45px -36px rgba(15, 23, 42, 0.45);
}

.preschool-dashboard-activity__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.preschool-dashboard-activity__list {
  display: grid;
  gap: 0.85rem;
  margin-top: 1rem;
}

.preschool-dashboard-activity__item {
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.preschool-dashboard-activity__item-title {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
}

.preschool-dashboard-activity__item-text {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #475569;
}
</style>
