<script setup>
defineProps({
  stats: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="att-hero">
    <div class="att-hero__copy">
      <slot name="copy" />
    </div>

    <div class="att-hero__stats">
      <div v-for="stat in stats" :key="stat.key" class="att-stat">
        <p
          class="att-stat__value"
          :class="{ 'att-stat__value--nowrap': stat.nowrap }"
        >
          {{ stat.value }}
        </p>
        <p class="att-stat__label">{{ stat.label }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.att-hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8rem;
  padding: 1rem 1.25rem;
  border-radius: 1.25rem;
  border: 1px solid #dbe7f3;
  background:
    radial-gradient(circle at top right, rgba(125, 211, 252, 0.18), transparent 22%),
    radial-gradient(circle at bottom left, rgba(167, 243, 208, 0.15), transparent 24%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 250, 252, 0.98) 100%);
  box-shadow: 0 20px 50px -40px rgba(15, 23, 42, 0.48);
}

.att-hero__copy {
  min-width: 0;
}

.att-hero__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.65rem;
}

.att-stat {
  padding: 0.7rem 0.8rem;
  border-radius: 0.9rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.88);
  text-align: center;
}

.att-stat__value {
  margin: 0 0 0.12rem;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.1;
  word-break: break-word;
}

.att-stat__value--nowrap {
  white-space: nowrap;
}

.att-stat__label {
  margin: 0;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
