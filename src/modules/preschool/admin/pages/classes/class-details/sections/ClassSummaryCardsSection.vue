<script setup>
defineOptions({
  name: 'ClassSummaryCardsSection',
})

defineProps({
  title: {
    type: String,
    default: '',
  },
  cards: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section class="class-summary-cards">
    <header class="class-summary-cards__header">
      <p class="class-summary-cards__title">{{ title }}</p>
    </header>

    <div class="class-summary-cards__grid">
      <article
        v-for="card in cards"
        :key="card.id"
        class="class-summary-cards__card"
        :class="`class-summary-cards__card--${card.tone}`"
      >
        <div class="class-summary-cards__card-head">
          <div>
            <p class="class-summary-cards__card-label">{{ card.title }}</p>
            <p class="class-summary-cards__card-value">{{ card.value }}</p>
          </div>

          <span class="class-summary-cards__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path :d="card.icon" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </div>

        <p class="class-summary-cards__badge">{{ card.badge }}</p>
        <p class="class-summary-cards__caption">{{ card.caption }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.class-summary-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.class-summary-cards__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.96rem;
  font-weight: 900;
  letter-spacing: 0.02em;
}

.class-summary-cards__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.class-summary-cards__card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 100%;
  padding: 1.3rem;
  border-radius: 1.35rem;
  border: 1px solid #dbe6f4;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.92), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 252, 0.98) 100%);
  box-shadow: 0 24px 48px -38px rgba(15, 23, 42, 0.45);
}

.class-summary-cards__card::after {
  content: '';
  position: absolute;
  inset: auto 1.3rem 0.9rem 1.3rem;
  height: 0.25rem;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.16;
}

.class-summary-cards__card--info {
  color: #0f6f8f;
}

.class-summary-cards__card--success {
  color: #2f7a42;
}

.class-summary-cards__card--warning {
  color: #9a5d09;
}

.class-summary-cards__card--danger {
  color: #b42318;
}

.class-summary-cards__card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
}

.class-summary-cards__card-label {
  margin: 0;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.class-summary-cards__card-value {
  margin: 0.65rem 0 0;
  color: #0f172a;
  font-size: 1.9rem;
  line-height: 1;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.class-summary-cards__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.95rem;
  background: color-mix(in srgb, currentColor 12%, white);
  border: 1px solid color-mix(in srgb, currentColor 18%, white);
}

.class-summary-cards__icon svg {
  width: 1.15rem;
  height: 1.15rem;
}

.class-summary-cards__badge {
  margin: 0;
  display: inline-flex;
  align-self: flex-start;
  padding: 0.38rem 0.72rem;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 10%, white);
  color: color-mix(in srgb, currentColor 85%, black 10%);
  font-size: 0.78rem;
  font-weight: 700;
}

.class-summary-cards__caption {
  margin: 0;
  color: #475569;
  font-size: 0.88rem;
  line-height: 1.55;
}
</style>
