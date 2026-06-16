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
        <p class="att-stat__value">{{ stat.value }}</p>
        <p class="att-stat__label">{{ stat.label }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.att-hero {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.2rem 1.25rem;
  border-radius: 1.45rem;
  border: 1px solid #dbe7f3;
  background:
    radial-gradient(circle at top right, rgba(125, 211, 252, 0.18), transparent 22%),
    radial-gradient(circle at bottom left, rgba(167, 243, 208, 0.15), transparent 24%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 250, 252, 0.98) 100%);
  box-shadow: 0 26px 70px -46px rgba(15, 23, 42, 0.52);
}

.att-hero__copy {
  flex: 1 1 300px;
  min-width: 0;
}

.att-hero__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  flex: 0 1 420px;
  width: 100%;
}

.att-stat {
  padding: 0.9rem 0.95rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.84);
}

.att-stat__value {
  margin: 0 0 0.2rem;
  color: #0f172a;
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1.1;
  word-break: break-word;
}

.att-stat__label {
  margin: 0;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
