<script setup>
import Breadcrumb from '@/components/navigation/Breadcrumb.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  eyebrowLabel: {
    type: String,
    default: 'Planner',
  },
})
</script>

<template>
  <section class="calendar-page-header">
    <Breadcrumb />
    <div class="calendar-page-header__copy">
      <p class="calendar-page-header__eyebrow">{{ eyebrowLabel }}</p>
      <h1 class="calendar-page-header__title">{{ title }}</h1>
      <p class="calendar-page-header__subtitle">{{ subtitle }}</p>
    </div>

  </section>
</template>

<style scoped>
.calendar-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.calendar-page-header__copy {
  max-width: 44rem;
}

.calendar-page-header__eyebrow {
  margin: 0;
  color: #00aeef;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.calendar-page-header__title {
  margin: 0.4rem 0 0;
  color: #1d1d1b;
  font-size: clamp(1.7rem, 3vw, 2.35rem);
  line-height: 1.06;
  font-weight: 900;
}

.calendar-page-header__subtitle {
  margin: 0.65rem 0 0;
  color: #64748b;
  font-size: 0.98rem;
  line-height: 1.65;
}

@media (max-width: 768px) {
  .calendar-page-header {
    flex-direction: column;
    align-items: stretch;
  }

}
</style>
