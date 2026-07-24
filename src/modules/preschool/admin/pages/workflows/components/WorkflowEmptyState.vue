<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="workflow-empty-state">
    <h3 class="workflow-empty-state__title">{{ title }}</h3>
    <p
      v-if="description"
      class="workflow-empty-state__description"
    >
      {{ description }}
    </p>
  </div>
</template>

<style scoped>
.workflow-empty-state {
  padding: 1rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
}

.workflow-empty-state__title {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
}

.workflow-empty-state__description {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.85rem;
}
</style>
