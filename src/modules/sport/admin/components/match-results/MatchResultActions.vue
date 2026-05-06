<script setup>
/**
 * MatchResultActions
 * Keeps footer button layout reusable while the page owns navigation and submit behavior.
 */
import Button from '@/components/buttons/Button.vue'

defineOptions({
  name: 'MatchResultActions',
})

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  cancelText: {
    type: String,
    required: true,
  },
  submitText: {
    type: String,
    required: true,
  },
})

defineEmits(['cancel'])
</script>

<template>
  <div class="match-result-actions">
    <Button type="button" variant="outline" rounded="xl" :disabled="loading" @click="$emit('cancel')">
      {{ cancelText }}
    </Button>
    <Button type="submit" variant="primary" rounded="xl" :loading="loading">
      {{ submitText }}
    </Button>
  </div>
</template>

<style scoped>
.match-result-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

@media (max-width: 720px) {
  .match-result-actions {
    justify-content: stretch;
  }
}
</style>
