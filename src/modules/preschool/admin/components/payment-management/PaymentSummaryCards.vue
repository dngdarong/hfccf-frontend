<script setup>
defineOptions({
  name: 'PaymentSummaryCards',
})

defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="payment-summary">
    <article
      v-for="card in cards"
      :key="card.id"
      class="payment-summary__card"
      :class="`payment-summary__card--${card.tone}`"
    >
      <span class="payment-summary__icon" aria-hidden="true">
        <i :class="card.icon"></i>
      </span>
      <div>
        <p class="payment-summary__label">{{ card.label }}</p>
        <strong class="payment-summary__value">{{ card.value }}</strong>
      </div>
    </article>
  </div>
</template>

<style scoped>
.payment-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1rem;
}

.payment-summary__card {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1.1rem;
  border: 1px solid #dce6f2;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 20px 38px -34px rgba(15, 23, 42, 0.48);
}

.payment-summary__card--info {
  color: #0f6f8f;
}

.payment-summary__card--success {
  color: #2f7a42;
}

.payment-summary__card--warning {
  color: #9a5d09;
}

.payment-summary__card--danger {
  color: #b42318;
}

.payment-summary__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.9rem;
  background: color-mix(in srgb, currentColor 11%, white);
  border: 1px solid color-mix(in srgb, currentColor 18%, white);
}

.payment-summary__label {
  margin: 0;
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.payment-summary__value {
  display: block;
  margin-top: 0.35rem;
  color: #0f172a;
  font-size: 1.45rem;
  line-height: 1;
  font-weight: 900;
}
</style>
