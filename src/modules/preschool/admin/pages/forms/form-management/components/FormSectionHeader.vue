<script setup>
defineOptions({
  name: 'PreschoolFormSectionHeader',
})

defineProps({
  description: {
    type: String,
    required: true,
  },
  eyebrow: {
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
  <div class="preschool-form-section-header">
    <p class="preschool-form-section-header__eyebrow">
      {{ eyebrow }}
    </p>
    <h3 class="preschool-form-section-header__title">
      {{ title }}
    </h3>
    <p class="preschool-form-section-header__description">
      {{ description }}
    </p>
  </div>
</template>

<style scoped>
.preschool-form-section-header {
  display: grid;
  gap: 0.35rem;
}

.preschool-form-section-header__eyebrow {
  margin: 0;
  color: #2563eb;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.preschool-form-section-header__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1.2;
}

.preschool-form-section-header__description {
  margin: 0;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.55;
  max-width: 56rem;
}
</style>
