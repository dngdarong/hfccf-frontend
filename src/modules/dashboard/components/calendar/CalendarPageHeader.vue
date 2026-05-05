<script setup>
defineEmits(['action'])

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  actionLabel: {
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
    <div class="calendar-page-header__copy">
      <p class="calendar-page-header__eyebrow">{{ eyebrowLabel }}</p>
      <h1 class="calendar-page-header__title">{{ title }}</h1>
      <p class="calendar-page-header__subtitle">{{ subtitle }}</p>
    </div>

    <button type="button" class="calendar-page-header__action" @click="$emit('action')">
      <i class="pi pi-plus" aria-hidden="true" />
      <span>{{ actionLabel }}</span>
    </button>
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

.calendar-page-header__action {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  border: 0;
  border-radius: 9999px;
  padding: 0.88rem 1.25rem;
  background: linear-gradient(180deg, #00aeef 0%, #009ad7 100%);
  color: #fff;
  font-size: 0.92rem;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 26px 32px -26px rgba(0, 174, 239, 0.78);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.calendar-page-header__action:hover {
  transform: translateY(-1px);
  box-shadow: 0 30px 38px -26px rgba(0, 174, 239, 0.9);
}

@media (max-width: 768px) {
  .calendar-page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .calendar-page-header__action {
    justify-content: center;
  }
}
</style>
