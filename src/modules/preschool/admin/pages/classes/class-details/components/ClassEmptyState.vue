<script setup>
defineOptions({
  name: 'ClassEmptyState',
})

defineProps({
  title: {
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
  <div class="class-empty-state">
    <p class="class-empty-state__title">{{ title }}</p>
    <p class="class-empty-state__description">{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.class-empty-state {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem 1.05rem;
  border: 1px dashed #cbd5e1;
  border-radius: 1rem;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%);
}

.class-empty-state__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 800;
}

.class-empty-state__description {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
</style>
