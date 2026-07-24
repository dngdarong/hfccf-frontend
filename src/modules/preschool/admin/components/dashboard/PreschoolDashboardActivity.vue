<script setup>
import { useLanguage } from '@/composables/useLanguage'
import { RouterLink } from 'vue-router'

defineOptions({
  name: 'PreschoolDashboardActivity',
})

const { t } = useLanguage()

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: '',
  },
  maxItems: {
    type: Number,
    default: 4,
  },
  viewAllText: {
    type: String,
    default: '',
  },
  viewAllTo: {
    type: [String, Object],
    default: null,
  },
})
</script>

<template>
  <section class="preschool-dashboard-activity">
    <div class="preschool-dashboard-activity__header">
      <h3 class="preschool-dashboard-activity__title">{{ t('preschoolDashboardActivity.title') }}</h3>
      <RouterLink
        v-if="viewAllTo"
        :to="viewAllTo"
        class="preschool-dashboard-activity__view-all"
      >
        {{ viewAllText || t('preschoolDashboardPage.operations.viewAll') }}
      </RouterLink>
    </div>
    <div v-if="items.length === 0" class="preschool-dashboard-activity__empty">
      {{ emptyText }}
    </div>
    <div v-else class="preschool-dashboard-activity__list">
      <article
        v-for="item in items.slice(0, maxItems)"
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
  padding: 1rem;
  border-radius: 1.15rem;
  border: 1px solid #dbe6f2;
  background: #fff;
  box-shadow: 0 18px 45px -36px rgba(15, 23, 42, 0.45);
}

.preschool-dashboard-activity__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.preschool-dashboard-activity__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.preschool-dashboard-activity__view-all {
  color: #1d4ed8;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.preschool-dashboard-activity__view-all:hover {
  text-decoration: underline;
}

.preschool-dashboard-activity__view-all:focus-visible {
  border-radius: 0.35rem;
  outline: 3px solid rgba(14, 165, 233, 0.28);
  outline-offset: 2px;
}

.preschool-dashboard-activity__list {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.7rem;
}

.preschool-dashboard-activity__item {
  padding: 0.65rem 0.75rem;
  border-radius: 0.8rem;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.preschool-dashboard-activity__item-title {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 700;
  color: #0f172a;
}

.preschool-dashboard-activity__item-text {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  line-height: 1.45;
  color: #475569;
}

.preschool-dashboard-activity__empty {
  margin-top: 0.7rem;
  color: #64748b;
  font-size: 0.92rem;
}
</style>
