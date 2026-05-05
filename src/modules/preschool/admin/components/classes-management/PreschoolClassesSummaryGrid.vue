<script setup>
defineOptions({
  name: 'PreschoolClassesSummaryGrid',
})

defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
  isKh: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div :class="isKh ? 'summary-grid summary-grid--kh' : 'summary-grid'">
    <article
      v-for="card in cards"
      :key="card.id"
      class="summary-grid__card"
      :class="`summary-grid__card--${card.tone}`"
    >
      <div class="summary-grid__header">
        <div>
          <p class="summary-grid__title">{{ card.title }}</p>
          <p class="summary-grid__value">{{ card.value }}</p>
        </div>

        <span class="summary-grid__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path :d="card.icon" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </div>

      <p class="summary-grid__badge">{{ card.badge }}</p>
      <p class="summary-grid__caption">{{ card.caption }}</p>
    </article>
  </div>
</template>

<style scoped>
.summary-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.summary-grid__card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 100%;
  padding: 1.35rem;
  border-radius: 1.35rem;
  border: 1px solid #dbe6f4;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.92), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 252, 0.98) 100%);
  box-shadow: 0 24px 48px -38px rgba(15, 23, 42, 0.45);
}

.summary-grid__card::after {
  content: '';
  position: absolute;
  inset: auto 1.35rem 0.9rem 1.35rem;
  height: 0.25rem;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.16;
}

.summary-grid__card--info {
  color: #0f6f8f;
}

.summary-grid__card--success {
  color: #2f7a42;
}

.summary-grid__card--warning {
  color: #9a5d09;
}

.summary-grid__card--danger {
  color: #b42318;
}

.summary-grid__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
}

.summary-grid__title {
  margin: 0;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-grid__value {
  margin: 0.65rem 0 0;
  color: #0f172a;
  font-size: 2rem;
  line-height: 1;
  font-weight: 800;
}

.summary-grid__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.95rem;
  background: color-mix(in srgb, currentColor 12%, white);
  border: 1px solid color-mix(in srgb, currentColor 18%, white);
}

.summary-grid__icon svg {
  width: 1.15rem;
  height: 1.15rem;
}

.summary-grid__badge {
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

.summary-grid__caption {
  margin: 0;
  color: #475569;
  font-size: 0.88rem;
  line-height: 1.55;
}

.summary-grid--kh .summary-grid__title,
.summary-grid--kh .summary-grid__badge,
.summary-grid--kh .summary-grid__caption {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.summary-grid--kh .summary-grid__title {
  text-transform: none;
  letter-spacing: 0.01em;
}

.summary-grid--kh .summary-grid__caption {
  font-size: 0.92rem;
  line-height: 1.65;
}

@media (max-width: 640px) {
  .summary-grid__card {
    padding: 1.1rem;
  }
}
</style>
