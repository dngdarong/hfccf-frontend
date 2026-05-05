<script setup>
/**
 * PlayerHighlights Component
 * Displays a list of small highlight cards with labels and values.
 */
import { defineProps } from 'vue'

defineProps({
  /**
   * Array of highlight objects to display.
   * Expected shape: { label, value }
   */
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="player-highlights">
    <div v-for="item in items" :key="item.label" class="player-highlights__item">
      <span class="player-highlights__label">{{ item.label }}</span>
      <strong class="player-highlights__value">{{ item.value }}</strong>
    </div>
  </div>
</template>

<style scoped>
.player-highlights {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.player-highlights__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.82);
}

.player-highlights__label {
  color: #475569;
  font-size: 0.82rem;
  font-weight: 600;
}

.player-highlights__value {
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 800;
}
</style>
