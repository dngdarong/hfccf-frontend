<script setup>
import Button from '@/components/buttons/Button.vue'

defineProps({
  title: {
    type: String,
    default: '',
  },
  index: {
    type: Number,
    default: 0,
  },
})

defineEmits(['remove'])
</script>

<template>
  <div class="collection-card">
    <div class="collection-card__header">
      <h4 class="collection-card__title">{{ title || `Item ${index + 1}` }}</h4>
      <Button
        type="button"
        variant="danger"
        size="sm"
        rounded="lg"
        label="Remove"
        @click="$emit('remove')"
      />
    </div>
    <div class="collection-card__body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.collection-card {
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  background: #fff;
  overflow: hidden;
}

.collection-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.collection-card__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}

.collection-card__body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
