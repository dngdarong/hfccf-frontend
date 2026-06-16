<script setup>
// A single scaffold shell keeps unfinished Preschool routes explicit and avoids
// scattering ad-hoc placeholder markup across multiple pages.
defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="preschool-placeholder-state">
    <p v-if="eyebrow" class="preschool-placeholder-state__eyebrow">
      {{ eyebrow }}
    </p>
    <h2 class="preschool-placeholder-state__title">
      {{ title }}
    </h2>
    <p v-if="subtitle" class="preschool-placeholder-state__subtitle">
      {{ subtitle }}
    </p>
    <p v-if="description" class="preschool-placeholder-state__description">
      {{ description }}
    </p>
  </div>
</template>

<style scoped>
.preschool-placeholder-state {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 42rem;
  padding: 1.25rem 1.35rem;
  border-radius: 1.25rem;
  border: 1px dashed #cbd5e1;
  background: rgba(248, 250, 252, 0.9);
  color: #0f172a;
}

.preschool-placeholder-state__eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.preschool-placeholder-state__title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.preschool-placeholder-state__subtitle,
.preschool-placeholder-state__description {
  margin: 0;
  line-height: 1.6;
  color: #475569;
}
</style>
