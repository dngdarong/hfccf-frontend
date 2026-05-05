<template>
  <section class="calendar-shell">
    <slot name="header" />
    <div class="calendar-shell__content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.calendar-shell {
  --calendar-cyan: #00aeef;
  --calendar-lime: #8dc63f;
  --calendar-red: #ed1c24;
  --calendar-yellow: #fdc116;
  --calendar-charcoal: #1d1d1b;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: calc(100vh - 7rem);
  padding: 1.5rem;
  border: 1px solid #dde5ec;
  border-radius: 1.6rem;
  background:
    radial-gradient(circle at top right, rgba(0, 174, 239, 0.08), transparent 22%),
    linear-gradient(180deg, #f4f6f8 0%, #eef2f5 100%);
}

.calendar-shell__content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .calendar-shell {
    padding: 1rem;
    border-radius: 1.2rem;
  }
}

@media (max-width: 480px) {
  .calendar-shell {
    padding: 0.8rem;
  }
}
</style>
