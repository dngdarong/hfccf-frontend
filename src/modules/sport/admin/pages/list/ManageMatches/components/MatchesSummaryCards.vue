<script setup>
defineProps({
  cards: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="matches-summary-grid">
    <article
      v-for="card in cards"
      :key="card.id"
      class="matches-summary-card"
      :class="`matches-summary-card--${card.tone}`"
    >
      <div class="matches-summary-header">
        <div>
          <p class="matches-summary-title">{{ card.title }}</p>
          <p class="matches-summary-value">{{ card.value }}</p>
        </div>

        <span class="matches-summary-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path :d="card.icon" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </div>

      <p class="matches-summary-badge">{{ card.badge }}</p>
      <p class="matches-summary-caption">{{ card.caption }}</p>
    </article>
  </div>
</template>

<style scoped>
.matches-summary-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.matches-summary-card {
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

.matches-summary-card::after {
  content: '';
  position: absolute;
  inset: auto 1.35rem 0.9rem 1.35rem;
  height: 0.25rem;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.16;
}

.matches-summary-card--info {
  color: #0f6f8f;
}

.matches-summary-card--success {
  color: #2f7a42;
}

.matches-summary-card--warning {
  color: #9a5d09;
}

.matches-summary-card--danger {
  color: #b42318;
}

.matches-summary-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
}

.matches-summary-title {
  margin: 0;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.matches-summary-value {
  margin: 0.65rem 0 0;
  color: #0f172a;
  font-size: 2rem;
  line-height: 1;
  font-weight: 800;
}

.matches-summary-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.95rem;
  background: color-mix(in srgb, currentColor 12%, white);
  border: 1px solid color-mix(in srgb, currentColor 18%, white);
}

.matches-summary-icon svg {
  width: 1.15rem;
  height: 1.15rem;
}

.matches-summary-badge {
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

.matches-summary-caption {
  margin: 0;
  color: #475569;
  font-size: 0.88rem;
  line-height: 1.55;
}

:deep(.manage-matches-page--kh) .matches-summary-title,
:deep(.manage-matches-page--kh) .matches-summary-badge,
:deep(.manage-matches-page--kh) .matches-summary-caption {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}
</style>
